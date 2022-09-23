const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId :{
        
        type: Number
    },

    emailAddress:{
        type: String
    },
    token: { 
       
        type: String
    },

    name :{
       
        type: String
    },
    token :{
       
        type: String
    },
    image :{
       
        type: String
    },
    
    referedBy :{
        
        type: Number
    },
    mobile :{
        
        type: String
    },
   
})

module.exports = mongoose.model('user',userSchema)

