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
    age: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true, // ✅ Correct placement (outside the field definitions)
  }
);
 userSchema.methods.getJwtToken=function(){
    const user=this;
    const token=jwt.sign({id:user._id}, process.env.JWT_SECRET,{
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
