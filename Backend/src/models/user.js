import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 20,
    },
    lastname: {
      type: String,
    },
    username:{
      type:String,
      minlength:4,
      maxlength:10
    },
    age:{
        type:Number,
        min:18,
        max:120
    },
    gender:{
        type:String,
        enum:["male","female","other"]
    },
    email: {
      type: String,
      required: true,
      unique: true,   // to prevent duplicate emails
      lowercase: true, // ensures consistency
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // good practice
    },
    role: {
    type: String,
    required: true,
    enum: ["farmer", "trader"],
    
  },
   crops:{
    type:[String],
    enum:["chilli","potato","wheat","rice","maize","cotton","sugarcane","fruits","vegetables","pulses","oilseeds","tea","coffee"]
  },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
  },
  phoneNumber: {
    type: String,
    minlength: 10
  },
   profilePicture: {
      type: String,
      default: null
    },
  
},
  {
    timestamps: true, // ✅ Correct placement (outside the field definitions)
  }
);
 userSchema.methods.getJwtToken=function(){
    const user=this;
    const token=jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET,{
        expiresIn:"1d"
         });
    return token;
   
 };

 userSchema.methods.validatePassword=async function(inputPassword){
    const user=this;
    const match=await bcrypt.compare(inputPassword,user.password);
    return match;
 }


export const UserModel=mongoose.model("User", userSchema);
