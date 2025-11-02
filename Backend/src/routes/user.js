import express from 'express';
import { upload } from '../middlewares/multer.js';
import { UserModel } from '../models/user.js';
import { userAuth } from '../middlewares/auth.js';
import PostModel from '../models/post.js';

const userRouter=express.Router();

// Route to upload user profile picture
userRouter.post('/user/posts/create',userAuth, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, cropType, quantity, pricePerUnit, location, description } = req.body;
        if(!req.file || !req.file.path){
            return res.status(400).send({message:"Image is required"});
        }
        const imageUrl = req.file.path;
        const newPost = new PostModel({
            userID: userId,
            role,
            cropType,
            quantity,
            pricePerUnit,
            location,
            description,
            images: [imageUrl] // Storing the uploaded image URL in an array

        });
        await newPost.save();
        res.status(201).send({
            message: 'Post created successfully',
            post: newPost
        });
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
});
export default userRouter;

