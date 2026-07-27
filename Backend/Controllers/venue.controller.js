import Venue from "../Models/venue.model.js";

export const createVenue = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Venue created successfully.",
      data: venue,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getVenues = async (req, res) => {
  try {
    const filter = {};

    if (req.query.city) {
      filter.city = req.query.city;
    }

    const venues = await Venue.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    return res.status(200).json({ success: true, data: venue });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid venue ID." });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Venue updated successfully.",
      data: venue,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Venue deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
