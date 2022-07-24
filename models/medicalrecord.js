const mongoose = require('mongoose');

const medicalrecordSchema = new mongoose.Schema({
    recordId :{
        
        type: Number
    },

    fileUrl:{
        type: String
    },
    fileType:{
        type: Number
    },
   
    dateTimeStamp :{
       
        type: Date
    },
    userId :{
        
        type: Number
    },
    smartReport:{
        type: Number
    },
    ago:{
        type: String
    },
    

   
})

module.exports = mongoose.model('medicalrecord',medicalrecordSchema)
