import express from "express";

import {
  createBooking,
  getBookings,
  getMyBookings,
  getUserBookings,
  getEventBookings,
  cancelBooking,
} from "../Controllers/booking.controller.js";

import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/me", auth, getMyBookings);
router.get("/", auth, getBookings);
router.get("/user/:id", auth, getUserBookings);
router.get("/event/:id", auth, getEventBookings);
router.put("/cancel/:id", auth, cancelBooking);

export default router;
