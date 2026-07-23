const express = require('express');
const router = express.Router();

const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { categoryValidationRules, validate } = require('../validators/category.validator')

router.post('/',categoryValidationRules, validate, createCategory);
router.get('/'. getCategories);
router.get('/:id', getCategory);
router.patch('/:id', categoryValidationRules, validate, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;