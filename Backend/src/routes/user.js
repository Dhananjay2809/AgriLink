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

// to get my all the post 
userRouter.get("/user/posts/myposts", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🔍 Fetching posts for user ID:", userId);
    console.log("🔍 User ID type:", typeof userId);

    const myPosts = await PostModel.find({ userID: userId })
      .sort({ createdAt: -1 })
      .populate("userID", "name email role"); 

    console.log("✅ Found posts:", myPosts.length);
    
    // Log each post to see what's being returned
    myPosts.forEach((post, index) => {
      console.log(`📦 Post ${index + 1}:`, {
        id: post._id,
        userID: post.userID,
        cropType: post.cropType,
        images: post.images,
        createdAt: post.createdAt
      });
    });

    res.status(200).send({
      success: true,
      totalPosts: myPosts.length,
      myPosts
    });

  } catch (err) {
    console.error("💥 Error fetching posts:", err);
    return res.status(500).send({ error: err.message });
  }
});

//delete the post of the user who created and post anything
//i created this delete post api but in the image is not deleted from the cloudinary
userRouter.delete('/user/post/deletepost/:id', userAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    if (post.userID.toString() !== userId) {
      return res.status(403).send({ message: "Unauthorized to delete this post" });
    }

    await PostModel.findByIdAndDelete(postId);

    return res.status(200).send({ message: "Post deleted successfully" });

  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

// to check the feed , to see all the post of the farmer/ traders

userRouter.get('/user/posts/feed', userAuth, async(req,res)=>{
     try{
      const posts = await PostModel.find()
      .populate("userID", "name email role")  // show basic user info
      .sort({ createdAt: -1 });      // show the latest post 
        res.status(200).send({
      success: true,
      totalPosts: posts.length,
      posts
    });
     }catch(err){
      return res.status(500).send({ error: err.message });
     }

});


export default userRouter;

