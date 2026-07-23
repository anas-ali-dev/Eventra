const Category = require('../models/category.model');

exports.createCategory = (req, res) => {
    const { name, description } = req.body;
    const category = new Category({ name, description });

    category
    .save()
    .then((savedCategory) => {
        res.status(201).json({success: true, data: savedCategory});
    })
    .catch((err) => {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message});
        }
        if(err.code === 11000) {
            return res.status(409).json({ success: false, message: "category already exist"});
        }
        res.status(500).json({ success: false, message: "server error"});
    });
};
exports.getCategories = (req, res) => {
    Category.find()
    .then((categories) => {
        res.status(200).json({ success: true, count: categories.length, data: categories});
    })
    .catch((err) => {
        res.status(500).json({success: false, message: "server error"});
    });
};
exports.getCategory = (req, res) => {
  Category.findById(req.params.id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({success: false, message: 'Category not found'});
      }
      res.status(200).json({success: true, data: category});
    })
    .catch((err) => {
        if (err.name ==='CastError') {
            return res.status(400).json({success: false, message:'Invalid category id'});
        }
        res.status(500).json({success: false, message:'server error'});
    });
};
exports.updateCategory = (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  .then((category) => {
      if (!category) {
        return res.status(404).json({success: false, message: 'Category not found'});
      }
      res.status(200).json({success: true, data: category});
    })
    .catch((err) => {
        if (err.name === 'ValidationError') {
        return res.status(400).json({success: false, message: err.message});
    }
      if (err.name === 'CastError') {
        return res.status(400).json({success: false, message: 'Invalid category id'});
      }
      res.status(500).json({success: false,message: 'Server error'});
    });
};
exports.deleteCategory = (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({success: false, message: 'Category not found'});
      }
      res.status(200).json({success: true, message: 'Category deleted successfully'});
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).json({success: false, message: 'Invalid category id'});
      }
      res.status(500).json({success: false, message: 'Server error'});
    });
};
