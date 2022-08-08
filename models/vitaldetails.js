const mongoose = require('mongoose');

const vitalDetailsSchema = new mongoose.Schema({
    vitalId :{
        
        type: Number
    },
    normalizedText :{
        
        type: String
    },
    normalvalues:{
        type: String
    },
    description:{
        type: String
    },
   
   
})

module.exports = mongoose.model('vitalDetailsSchema',vitalDetailsSchema)
