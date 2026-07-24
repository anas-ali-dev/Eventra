import Review from "../Models/review.model.js";

// ==============================
// Create Review
// ==============================

export const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Reviews
// ==============================

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user").populate("event");

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
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
// Update Review
// ==============================

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid review id.",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Delete Review
// ==============================

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid review id.",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
