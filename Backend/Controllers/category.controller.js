import Category from "../Models/category.model.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get Category By Id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
