import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../Models/user.model.js";
import generateAccessToken from "../Utils/generateAccessToken.js";
import generateRefreshToken from "../Utils/generateRefreshToken.js";
import generateRandomToken from "../Utils/generateRandomToken.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../Services/email.service.js";

// ==============================
// Register
// ==============================

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await sendVerificationEmail(user, rawToken);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
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
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

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
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
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
    const { email } = req.body;

    const user = await User.findOne({ email });

    // منع Email Enumeration
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

    await sendResetPasswordEmail(user, rawToken);

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
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