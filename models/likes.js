const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
    userId :{
        
        type: Number
    },

    postId:{
        type: Number
    },
   
   

   
})

module.exports = mongoose.model('likes',likesSchema)

