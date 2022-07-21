const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dataSchema = new mongoose.Schema({
    name:{
        type: String
    },
    ago:{
        type: String
    },
    


    users:[{
        user:{
           
            type: Schema.Types.ObjectId,
            ref: "users"
        },
        
        
       
    }], 
   

   

    postId: {
       
        type: Number
    },
    isLiked: {
       
        type: Number
    },

 title :{
       
        type: String
    },
    isAnonymous: {
       
        type: Number
    },




 userId :{
        
        type: Number
    },
    postViews: {
       
        type: Number
    },




latitude :{
      
        type: String
    },
    longitude: {
       
        type: String
    },


 postType :{
       
        type: Number
    },
    categoryName : {
       
        type: String
    },

    categoryId : {
       
        type: String
    },



 postViews :{
       
        type: Number
    },

    subCategories :{
       
        type: String
    },
    imageUrl :{
       
        type: String
    },

    dateTimeStamp :{
       
        type: Date
    },
    distance :{
       
        type:mongoose.Types.Decimal128
    },
   
})

module.exports = mongoose.model('NearWePosts',dataSchema)

