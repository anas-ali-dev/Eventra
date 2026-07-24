import Booking from "../Models/booking.model.js";

// ==============================
// Create Booking
// ==============================

export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: booking,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get All Bookings
// ==============================

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user").populate("event");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Bookings For One User
// ==============================

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.params.id,
    }).populate("event");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Bookings For One Event
// ==============================

export const getEventBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      event: req.params.id,
    }).populate("user");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Cancel Booking
// ==============================

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
