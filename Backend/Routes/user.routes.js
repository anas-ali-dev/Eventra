import express from "express";

import {
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getSavedEvents,
  saveEvent,
  unsaveEvent,
} from "../Controllers/user.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateUser);
router.delete("/me", protect, deleteUser);
router.put("/change-password", protect, changePassword);
router.get("/me/saved-events", protect, getSavedEvents);
router.post("/me/saved-events/:eventId", protect, saveEvent);
router.delete("/me/saved-events/:eventId", protect, unsaveEvent);

router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", protect, authorize("admin"), getUserById);

export default router;
