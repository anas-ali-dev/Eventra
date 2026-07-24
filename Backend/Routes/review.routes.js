import express from "express";

import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../Controllers/review.controller.js";

import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getReviews);

// Protected
router.post("/", auth, createReview);
router.put("/:id", auth, updateReview);
router.delete("/:id", auth, deleteReview);

export default router;
