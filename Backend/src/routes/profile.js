import expess from 'express';
import { userAuth } from '../middlewares/auth.js';
import { UserModel } from '../models/user.js';
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
export default profileRouter;
