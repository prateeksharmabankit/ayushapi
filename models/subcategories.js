const mongoose = require('mongoose');

const subcategoriesSchema = new mongoose.Schema({
    categoryId :{
        
        type: Number
    },

    subCategoryId:{
        type: Number
    },
   
    subCategoryName:{
        type: String
    },

   
})

module.exports = mongoose.model('subcategories',subcategoriesSchema)

