const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatcontentSchema = new mongoose.Schema({
    message :{
        
        type: String
    },

    sender:{
        type: Number
    },
    
   
    ago:{
        type: String
    },
    reciever:{
        type: Number
    },
    chatId:{
        type: Schema.Types.ObjectId,
    },
    dateTimeStamp :{
       
        type: Date
    },
     postId:{
        type: Number
    },
  

   
})

module.exports = mongoose.model('chatcontent',chatcontentSchema)

