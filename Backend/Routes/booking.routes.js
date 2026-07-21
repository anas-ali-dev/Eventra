import express from "express";

import
{
    createBooking,
    getBookings,
    getUserBookings,
    getEventBookings,
    cancelBooking
}
from "../Controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);

router.get("/", getBookings);

router.get("/user/:id", getUserBookings);

router.get("/event/:id", getEventBookings);

router.put("/cancel/:id", cancelBooking);

export default router;