const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const benificiariesSchema = new mongoose.Schema({
    baniid :{
        
        type: Number
    },
    beniUserId :{
        
        type: Number
    },

    
    beniname :{
        
        type: String
    },
    age:{
        type: Number
    },
    gender:{
        type: String
    },

   
   
})

module.exports = mongoose.model('benificiariesSchema',benificiariesSchema)
