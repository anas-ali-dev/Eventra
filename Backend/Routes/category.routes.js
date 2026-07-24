import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controllers/category.controller.js";

import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin Routes
router.post("/", auth, authorize("admin"), createCategory);
router.put("/:id", auth, authorize("admin"), updateCategory);
router.delete("/:id", auth, authorize("admin"), deleteCategory);

export default router;
