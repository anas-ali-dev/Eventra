import Booking from "../Models/booking.model.js";

// ==============================
// Create Booking
// ==============================

export const createBooking = async (req, res) =>
{
    try
    {
        const booking = await Booking.create(req.body);

        res.status(201).json(
        {
            success: true,
            message: "Booking created successfully.",
            booking
        });
    }
    catch(error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// ==============================
// Get All Bookings
// ==============================

export const getBookings = async (req, res) =>
{
    try
    {
        const bookings = await Booking.find()
            .populate("user")
            .populate("event");

        res.status(200).json(
        {
            success: true,
            bookings
        });
    }
    catch(error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// ==============================
// Get Bookings For One User
// ==============================

export const getUserBookings = async (req, res) =>
{
    try
    {
        const bookings = await Booking.find(
        {
            user: req.params.id
        })
        .populate("event");

        res.status(200).json(
        {
            success: true,
            bookings
        });
    }
    catch(error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// ==============================
// Get Bookings For One Event
// ==============================

export const getEventBookings = async (req, res) =>
{
    try
    {
        const bookings = await Booking.find(
        {
            event: req.params.id
        })
        .populate("user");

        res.status(200).json(
        {
            success: true,
            bookings
        });
    }
    catch(error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// ==============================
// Cancel Booking
// ==============================

export const cancelBooking = async (req, res) =>
{
    try
    {
        const booking = await Booking.findById(req.params.id);

        if(!booking)
        {
            return res.status(404).json(
            {
                success: false,
                message: "Booking not found."
            });
        }

        booking.status = "Cancelled";

        await booking.save();

        res.status(200).json(
        {
            success: true,
            message: "Booking cancelled successfully.",
            booking
        });
    }
    catch(error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};