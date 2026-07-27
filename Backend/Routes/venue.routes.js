import express from "express";

import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} from "../Controllers/venue.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getVenues);
router.get("/:id", getVenueById);
router.post("/", protect, authorize("admin", "organizer"), createVenue);
router.put("/:id", protect, authorize("admin", "organizer"), updateVenue);
router.delete("/:id", protect, authorize("admin"), deleteVenue);

export default router;
