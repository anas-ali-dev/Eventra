import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../Models/user.model.js";
import generateAccessToken from "../Utils/generateAccessToken.js";
import generateRefreshToken from "../Utils/generateRefreshToken.js";
import generateRandomToken from "../Utils/generateRandomToken.js";
import generateVerificationCode from "../Utils/generateVerificationCode.js";
import {
  sendVerificationEmail,
  queueVerificationEmail,
  queueResetPasswordEmail,
} from "../Services/email.service.js";
import { sanitizeUser, normalizeEmail } from "../Utils/helpers.js";

const isDevEnvironment = () => process.env.NODE_ENV !== "production";

const createAuthSession = async (user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
};

const buildVerificationPayload = (email, code, emailSent) => {
  const payload = {
    email,
    requiresVerification: true,
    emailSent: !!emailSent,
  };

  if (isDevEnvironment() && !emailSent && code) {
    payload.devVerificationCode = code;
  }

  return payload;
};

const assignVerificationCredentials = async (user, targetEmail = user.email) => {
  const { rawToken, hashedToken } = generateRandomToken();
  const { code, hashedCode } = generateVerificationCode();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  const recipient = normalizeEmail(targetEmail) || user.email;

  await user.save();

  const emailSent = queueVerificationEmail(user, rawToken, code, recipient);

  return { rawToken, code, emailSent: !!emailSent, recipient };
};

// ==============================
// Register
// ==============================

export const register = async (req, res) => {
  try {
    const { name, password, phone, role } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const allowedRoles = ["customer", "organizer"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    const { rawToken, hashedToken } = generateRandomToken();
    const { code, hashedCode } = generateVerificationCode();

    const autoVerify = process.env.AUTO_VERIFY_EMAIL === "true";

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
      isVerified: autoVerify,
      emailVerificationToken: autoVerify ? undefined : hashedToken,
      emailVerificationCode: autoVerify ? undefined : hashedCode,
      emailVerificationExpires: autoVerify ? undefined : Date.now() + 24 * 60 * 60 * 1000,
    });

    let emailSent = false;

    if (!autoVerify) {
      emailSent = queueVerificationEmail(user, rawToken, code, email);
    }

    return res.status(201).json({
      success: true,
      message: autoVerify
        ? "Registration successful. You can log in now."
        : emailSent
          ? "Registration successful. Please check your email for a verification code."
          : "Registration successful. Email is not configured — use the verification code shown on screen or in the backend terminal.",
      data: autoVerify
        ? undefined
        : {
            ...buildVerificationPayload(email, code, emailSent),
            requiresVerification: true,
          },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Login
// ==============================

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +emailVerificationToken +emailVerificationCode +emailVerificationExpires",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      let verification = { code: "", emailSent: false, recipient: email };

      try {
        verification = await assignVerificationCredentials(user, email);
      } catch (emailErr) {
        console.error("Verification email resend failed:", emailErr.message);
      }

      const sentTo = verification.recipient || user.email;

      return res.status(403).json({
        success: false,
        message: verification.emailSent
          ? `Please verify your email. A new 6-digit code was sent to ${sentTo}.`
          : `Please verify your email. We could not send to ${sentTo} — check backend logs or use resend.`,
        data: buildVerificationPayload(sentTo, verification.code, verification.emailSent),
      });
    }

    const session = await createAuthSession(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: session,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Refresh Token
// ==============================

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== incomingToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token does not match stored session.",
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Access token generated successfully.",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Logout
// ==============================

export const logout = async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const user = await User.findOne({
      refreshToken: incomingToken,
    });

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
// ==============================
// Verify Email
// ==============================

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired.",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    const session = await createAuthSession(user);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: session,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Resend Verification Email
// ==============================

export const resendVerification = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationCode +emailVerificationExpires",
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a verification email has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified. You can log in.",
      });
    }

    const { code, emailSent, recipient } = await assignVerificationCredentials(user, email);

    return res.status(200).json({
      success: true,
      message: emailSent
        ? `A verification code was sent to ${recipient}.`
        : `Could not send to ${recipient}. Check backend logs.`,
      data: buildVerificationPayload(recipient, code, emailSent),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export const verifyEmailCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").replace(/\D/g, "");

    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and a valid 6-digit verification code.",
      });
    }

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email,
      emailVerificationCode: hashedCode,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationCode +emailVerificationExpires +emailVerificationToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification code is invalid or has expired.",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const session = await createAuthSession(user);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: session,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Forgot Password
// ==============================

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const { rawToken, hashedToken } = generateRandomToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const emailSent = queueResetPasswordEmail(user, rawToken);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";
    const payload = {
      success: true,
      message: emailSent
        ? "If an account with that email exists, a reset link has been sent."
        : "If an account with that email exists, use the reset link shown below or in the backend terminal.",
    };

    if (isDevEnvironment() && !emailSent) {
      payload.data = {
        devResetLink: `${clientUrl}/reset-password/${rawToken}`,
      };
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Reset Password
// ==============================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};