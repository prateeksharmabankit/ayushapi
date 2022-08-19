const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const medicalrecordaidataSchema = new mongoose.Schema({
    mraiId :{
        
        type: Number
    },
    recordId :{
        
        type: Number
    },
    testname:{
        type: String
    },
    testvalue:{
        type: String
    },
   
    testunit :{
       
        type: String
    },
    normalizedText :{
       
        type: String
    },
    vitalId :{
        
        type: Number
    },
    vitaldetailsschemas:[{
        vitaldetails:{
           
            type: Schema.Types.ObjectId,
            ref: "vitaldetailsschemas"
        },
        
        
       
    }], 
    dated :{
       
        type: String
    },
   
    userId :{
        
        type: Number
    },

    status :{
        
        type: Boolean
    },

   
})

module.exports = mongoose.model('medicalrecordaidata',medicalrecordaidataSchema)
