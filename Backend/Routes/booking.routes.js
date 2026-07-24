import express from "express";

import {
  createBooking,
  getBookings,
  getUserBookings,
  getEventBookings,
  cancelBooking,
} from "../Controllers/booking.controller.js";

import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Create Booking
router.post("/", auth, createBooking);

// Get All Bookings (Admin)
router.get("/", auth, getBookings);

// Get User Bookings
router.get("/user/:id", auth, getUserBookings);

// Get Event Bookings
router.get("/event/:id", auth, getEventBookings);

// Cancel Booking
router.put("/cancel/:id", auth, cancelBooking);

export default router;
