const mongoose = require ('mongoose');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5
    },
    description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
    }
    });
    const categoryModel = mongoose.model('category', categorySchema);
    module.exports = categoryModel;