const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const vitalDetailsSchema = new mongoose.Schema({
    vitalId :{
        
        type: Number
    },
    majorVitalId :{
        
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

    medicalrecordaidatas:[{
        medicalrecord:{
           
            type: Schema.Types.ObjectId,
            ref: "medicalrecordaidatas"
        },
        
        
       
    }], 
   
   
})

module.exports = mongoose.model('vitalDetailsSchema',vitalDetailsSchema)
