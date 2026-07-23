import express from "express";

import
{
    getProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
}
from "../Controllers/user.controller.js";

import protect from "../Middlewares/auth.middleware.js";
import authorize from "../Middlewares/role.middleware.js";

const router = express.Router();

// Self-service routes

router.get("/me", protect, getProfile);

router.put("/me", protect, updateUser);

router.delete("/me", protect, deleteUser);

router.put("/change-password", protect, changePassword);

// Admin-only routes

router.get("/", protect, authorize("admin"), getUsers);

router.get("/:id", protect, authorize("admin"), getUserById);

export default router;