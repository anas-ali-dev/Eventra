import Review from "../Models/review.model.js";

// ==============================
// Create Review
// ==============================

export const createReview = async (req, res) =>
{
    try
    {
        const review = await Review.create(req.body);

        res.status(201).json(
        {
            success: true,
            message: "Review created successfully.",
            review
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
// Get Reviews
// ==============================

export const getReviews = async (req, res) =>
{
    try
    {
        const reviews = await Review.find()
            .populate("user")
            .populate("event");

        res.status(200).json(
        {
            success: true,
            reviews
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
// Update Review
// ==============================

export const updateReview = async (req, res) =>
{
    try
    {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        if(!review)
        {
            return res.status(404).json(
            {
                success: false,
                message: "Review not found."
            });
        }

        res.status(200).json(
        {
            success: true,
            review
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
// Delete Review
// ==============================

export const deleteReview = async (req, res) =>
{
    try
    {
        const review = await Review.findById(req.params.id);

        if(!review)
        {
            return res.status(404).json(
            {
                success: false,
                message: "Review not found."
            });
        }

        await review.deleteOne();

        res.status(200).json(
        {
            success: true,
            message: "Review deleted successfully."
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