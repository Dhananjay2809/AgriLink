import expess from 'express';
import { userAuth } from '../middlewares/auth.js';
import { UserModel } from '../models/user.js';
import FollowerModel from '../models/follower.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { upload } from '../middlewares/multer.js';
const profileRouter = expess.Router();
// Get user profile
 profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const followers = await FollowerModel.find({ following: userId })
      .populate('follower', 'name email') // show follower name & email
      .select('follower');

    // Fetch following (people the user follows)
    const following = await FollowerModel.find({ follower: userId })
      .populate('following', 'name email')
      .select('following');
        res.status(200).send({ user,
              followersCount: followers.length,
            followingCount: following.length,
            followers: followers.map(f => f.follower),
            following: following.map(f => f.following)
        });
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
        const user=await UserModel.findById(req.user.id);
        if(!user){
            return res.status(404).send({message:"User not found"});
        }
        const isPasswordValid=await user.validatePassword(password);
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
        const newToken=await user.getJwtToken();
        res.cookie("token",newToken,{
            httpOnly:true,
            secure:false
        });
        res.status(200).send({message:"Password changed successfully"});
        
} 
    }
catch(err){
        return res.status(500).send({ error: err.message });
    }
});
profileRouter.delete('/profile/deleteuser',userAuth, async(req,res)=>{
     try{
        const userId=req.user.id;
       
        await UserModel.findByIdAndDelete(userId);
        if(!userId){
           return res.status(404).send({message:"User not found"});
        }
        res.clearCookie("token");

        res.status(200).send({message:"User deleted successfully"});
     } catch(err){
        return res.status(500).send({ error: err.message });
     }
});
profileRouter.put(
  "/profile/upload-image",
  userAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = req.user.id;
      const imageUrl = req.file.path; // Cloudinary gives file path directly

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { profilePicture: imageUrl },
        { new: true }
      ).select("-password");

      res.json({
        message: "Profile picture uploaded successfully",
        imageUrl,
        user: updatedUser
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Delete Profile Picture
// ❌ Remove Profile Picture (only from DB, not Cloudinary)
profileRouter.delete('/profile/remove-image', userAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePic: null },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile picture removed successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Remove image error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default profileRouter;
