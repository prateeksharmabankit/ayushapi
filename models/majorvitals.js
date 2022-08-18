const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const majorVitalsSchema = new mongoose.Schema({
    majorVitalId :{
        
        type: Number
    },
    normalizedText :{
        
        type: String
    },
    image:{
        type: String
    },
    vitaldetailsschemas:[{
        vitaldetails:{
           
            type: Schema.Types.ObjectId,
            ref: "vitaldetailsschemas"
        },
        
        
       
    }], 
   
   
})

module.exports = mongoose.model('majorVitalsSchema',majorVitalsSchema)
