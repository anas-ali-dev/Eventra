import Event from "../Models/event.model.js";
import Category from "../Models/category.model.js";
import User from "../Models/user.model.js";

// ==============================
// Create Event
// ==============================

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      price,
      availableTickets,
      image,
      category,
    } = req.body;

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const organizer = await User.findById(req.user.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found.",
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      price,
      availableTickets,
      image,
      category,
      organizer: organizer._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    console.error(error);

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
// Get All Events
// ==============================

export const getEvents = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.organizer) {
      filter.organizer = req.query.organizer;
    }

    if (req.query.location) {
      filter.location = req.query.location;
    }

    const events = await Event.find(filter)
      .populate("category")
      .populate("organizer");

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Event By Id
// ==============================

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("category")
      .populate("organizer");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Update Event
// ==============================

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    if (req.body.category) {
      const category = await Category.findById(req.body.category);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("category")
      .populate("organizer");

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
// ==============================
// Delete Event
// ==============================

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found.",
            });
        }

        if (
            req.user.role !== "admin" &&
            event.organizer.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action.",
            });
        }

        await event.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// ==============================
// Get Events By Category
// ==============================

export const getEventsByCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        const events = await Event.find({
            category: req.params.categoryId,
        })
            .populate("category")
            .populate("organizer");

        return res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        console.error(error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};

// ==============================
// Get Events By Organizer
// ==============================

export const getEventsByOrganizer = async (req, res) => {
    try {
        const organizer = await User.findById(req.params.organizerId);

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found.",
            });
        }

        const events = await Event.find({
            organizer: req.params.organizerId,
        })
            .populate("category")
            .populate("organizer");

        return res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        console.error(error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid organizer ID.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
};