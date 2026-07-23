import express from "express";

import
{
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword
}
from "../Controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

export default router;