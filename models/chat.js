const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
   

    sender:{
        type: Number
    },
   
    reciever:{
        type: Number
    },
    
    postId:{
        type: Number
    },
    ago:{
        type: String
    },

    

   
})

module.exports = mongoose.model('chat',chatSchema)

