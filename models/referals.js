const mongoose = require('mongoose');

const referalsSchema = new mongoose.Schema({
    referedBy :{
        
        type: Number
    },
    referedTo :{
        
        type: Number
    },
    referedAmount :{
        
        type: Number
    },
    status :{
        
        type: Boolean
    },

   
})

module.exports = mongoose.model('referalsSchema',referalsSchema)
