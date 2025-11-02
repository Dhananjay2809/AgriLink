import mongoose from 'mongoose';
 
const postSchema=new mongoose.Schema(
    {
        userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
        },
        role:{
            type:String,
            enum:["farmer","trader"],
            required:true
        },
        quantity:{
            type:Number,
        },
        cropType:{
            type:String,
            enum:["chilli","potato","wheat","rice","maize","cotton","sugarcane","fruits","vegetables","pulses","oilseeds","tea","coffee"],
            required:true
        },
        pricePerUnit:{
            type:Number
        },
        location:{
            type:String
        },
       description:{
        type:String
       },
       images:{
        type:[String],   //to store the multiple images
        required:true
       },
         status:{
        type:String,
        enum:["available","sold"],
        default:"available"
         },
        },
         {
         timestamp:true
         }
    
);
const PostModel=mongoose.model('Post',postSchema);
export default PostModel;