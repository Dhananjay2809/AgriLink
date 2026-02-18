import express from 'express';
import {userAuth} from '../middlewares/auth.js';
import {UserModel} from '../models/user.js';
import { validateSignupData } from '../utils/validation.js';
import bcrypt from 'bcryptjs';

const authRouter=express.Router();

//signup router ye new useer ko db me store krane ka route hai
 
authRouter.post('/signup', async(req,res)=>{
    try{
        await validateSignupData(req);
        const {firstname,email, password,role} =req.body;
        const hashedPassword=await bcrypt.hash(password,8);
       const newUser=new UserModel({firstname,email,password:hashedPassword,role});
        await newUser.save();
        res.send({
            message:"User registered successfully"
        });

    }
    catch(err){
        return res.status(400).send({error:err.message});
    }
});

authRouter.post('/login' , async(req,res)=>{
    const {email, password}=req.body;
    // pahle user ke email checck krenge db me hai ye nhi then password match krenge
    try{
       const user=await UserModel.findOne({email});
       if(!user){
        return res.status(404).send({message:"Invalid credentials"});
       }
       const isPasswordValid=await bcrypt.compare(password,user.password);

       //agar password match ho jata hai to token generate krenge or use cookie me store krdenge
       if(isPasswordValid){
        const token=await user.getJwtToken();
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge:24*60*60*1000 //1 day
        });
        res.status(200).send({
            message: "Login Successful",
      user: {
        id: user._id,
        name: user.firstname,
        email: user.email,
        role: user.role, 
        profilePicture: user.profilePicture,
      } 
        });
       }
       else{
        return res.status(404).send({message:"Invalid credentials"});
       }


    }catch(err){
        return res.status(400).send({error:err.message});
    }
});

// ab logout krenge uske liye direct cookie clear kr denge
authRouter.post('/logout',userAuth, (req,res)=>{
    res.clearCookie("token");
    res.send({message:"Logged out successfully"});
});

export default authRouter;

