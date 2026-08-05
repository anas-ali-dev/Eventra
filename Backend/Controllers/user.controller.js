import User from "../Models/user.model.js";
import Event from "../Models/event.model.js";
import Booking from "../Models/booking.model.js";
import { sanitizeUser, resolveEventQuery } from "../Utils/helpers.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const bookingsCount = await Booking.countDocuments({
      user: user._id,
      status: { $ne: "Cancelled" },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...sanitizeUser(user),
        bookingsCount,
        savedEventsCount: user.savedEvents.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "phone", "city", "favouriteCategory", "profilePicture"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter your password to confirm account deletion.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    await Booking.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully. You can register again with the same email.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password +refreshToken");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedEvents",
      populate: [{ path: "category" }, { path: "venueRef" }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      count: user.savedEvents.length,
      data: user.savedEvents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const saveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const query = resolveEventQuery(Event, eventId);
    const event = query ? await query : null;

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const alreadySaved = user.savedEvents.some(
      (id) => id.toString() === event._id.toString(),
    );

    if (!alreadySaved) {
      user.savedEvents.push(event._id);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Event saved successfully.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const unsaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const query = resolveEventQuery(Event, eventId);
    const event = query ? await query : null;

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.savedEvents = user.savedEvents.filter(
      (id) => id.toString() !== event._id.toString(),
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Event removed from saved list.",
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
