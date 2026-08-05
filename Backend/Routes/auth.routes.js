import express from "express";

import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  verifyEmailCode,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../Controllers/auth.controller.js";

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Email Verification
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-email-code", verifyEmailCode);
router.post("/resend-verification", resendVerification);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
