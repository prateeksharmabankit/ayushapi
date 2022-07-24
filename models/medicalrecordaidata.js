const mongoose = require('mongoose');

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
   

   
})

module.exports = mongoose.model('medicalrecordaidata',medicalrecordaidataSchema)
