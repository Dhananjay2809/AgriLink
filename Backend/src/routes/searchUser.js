
import express from 'express';
import { userAuth } from '../middlewares/auth.js';
import { UserModel } from '../models/user.js';

const searchRouter = express.Router();

// Search users by name or email
searchRouter.get('/search/users', userAuth, async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).send({ message: "Search query is required" });
        }
        // Search users by name or email (case insensitive)
        const users = await UserModel.find({
            $or: [
                { firstname: { $regex: query, $options: 'i' } },
                { lastname: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user.id } // Exclude current user from results
        }).select('-password').limit(20); // Limit results to 20 users

        res.status(200).send({
            success: true,
            count: users.length,
            users: users
        });

    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
});

export default searchRouter;