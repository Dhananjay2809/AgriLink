import expess from 'express';
import { userAuth } from '../middlewares/auth.js';
import { UserModel } from '../models/user.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const profileRouter = expess.Router();
// Get user profile
profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ user });
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
});

// Update user profile
profileRouter.put('/profile/edit', userAuth, async (req, res) => {
    try{
        const userId = req.user.id;
        // but we cannot edit the email, role and password
        const blockedFields = ['email', 'role', 'password'];
        // ab blocked fields ko req.body se delete krdenge
        blockedFields.forEach(field => delete req.body[field]);
        // ab update krdenge
        //$set operator ka use krke hum specified fields ko update kr skte hai
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: req.body
            },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({
            message: 'Profile updated successfully',
            user: updatedUser
        });
   } catch (err) {
        return res.status(500).send({ error: err.message });
   }
});
// ab passwrd edit ka route bnaenge
profileRouter.put('/profile/changePassword', userAuth, async (req, res) => {
    const { password, newPassword , confirmPassword} = req.body;
    try{
        if(!password){
            return res.status(400).send({message:"Current password is required"});
        }
        const isPasswordValid=await req.user.validatePassword(password);
        if(isPasswordValid){
            if(newPassword.toString()===password.toString()){
                return res.status(400).send({message:"New password cannot be same as current password"});
            }
            if(newPassword.toString()!==confirmPassword.toString()){
                return res.status(400).send({message:"New password and confirm password do not match"});
    }
           if(!validator.isStrongPassword(newPassword)){
            return res.status(400).send({message:"Password shou ld be at least 8 characters long and include uppercase, lowercase, number and symbol"});
           }
              const hashedPassword=await bcrypt.hash(newPassword,8);
              await UserModel.findByIdAndUpdate(req.user.id,{
                password:hashedPassword
                });
        // ab new token store krenge cookie me and old token delete kr denge
        res.clearCookie("token");
        const newToken=await req.user.getJwtToken();
        res.cookie("token",newToken);
        res.status(200).send({message:"Password changed successfully"});
        
} 
    }
catch(err){
        return res.status(500).send({ error: err.message });
    }
});
export default profileRouter;
