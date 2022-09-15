const mongoose = require('mongoose');
const laborderdetailsSchema = new mongoose.Schema({
    orderId :{
        
        type: String
    },
    userId :{
        
        type: Number
    },
    rate :{
        
        type: String
    },
    address:{
        type: String
    },
    paymentType:{
        type: String
    },
    serviceType:{
        type: String
    },
   
    bookedOn:{
        type: Date
    },
    appointmentDate:{
        type: String
    },
    
    providerId:{
        type: Number
    },
   

    product:{
        type: String
    },
    
    
    status:{
        type: String
    },
    
   
   
   
})

module.exports = mongoose.model('laborderdetailsSchema',laborderdetailsSchema)
