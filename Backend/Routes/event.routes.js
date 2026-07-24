import express from "express";

import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getEventsByOrganizer,
} from "../Controllers/event.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", getEvents);
router.get("/category/:categoryId", getEventsByCategory);
router.get("/organizer/:organizerId", getEventsByOrganizer);
router.get("/:id", getEventById);

// Protected Routes
router.post("/", protect, authorize("organizer", "admin"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

export default router;
