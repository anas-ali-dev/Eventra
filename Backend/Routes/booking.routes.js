import express from "express";

import {
  createBooking,
  getBookings,
  getMyBookings,
  getUserBookings,
  getEventBookings,
  cancelBooking,
  getBookingTicket,
  getBookingTickets,
} from "../Controllers/booking.controller.js";

import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/me", auth, getMyBookings);
router.get("/tickets", auth, getBookingTickets);
router.get("/ticket/:ref", auth, getBookingTicket);
router.get("/", auth, getBookings);
router.get("/user/:id", auth, getUserBookings);
router.get("/event/:id", auth, getEventBookings);
router.put("/cancel/:id", auth, cancelBooking);

export default router;
