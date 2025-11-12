import express from 'express';
import { upload } from '../middlewares/multer.js';
import { UserModel } from '../models/user.js';
import { userAuth } from '../middlewares/auth.js';
import PostModel from '../models/post.js';

const userRouter=express.Router();

// Route to upload user profile picture
userRouter.post('/user/posts/create', userAuth, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, cropType, quantity, pricePerUnit, location, description, coordinates } = req.body;
        
        console.log("Create post request body:", req.body);
        console.log("Coordinates received:", coordinates);

        if (!req.file || !req.file.path) {
            return res.status(400).send({ message: "Image is required" });
        }

        const imageUrl = req.file.path;
        
        // Parse coordinates if they exist
        let parsedCoordinates = null;
        if (coordinates) {
            try {
                // If coordinates is a string (JSON), parse it
                if (typeof coordinates === 'string') {
                    parsedCoordinates = JSON.parse(coordinates);
                } else {
                    parsedCoordinates = coordinates;
                }
                
                // Validate coordinates
                if (parsedCoordinates.latitude && parsedCoordinates.longitude) {
                    parsedCoordinates = {
                        latitude: parseFloat(parsedCoordinates.latitude),
                        longitude: parseFloat(parsedCoordinates.longitude)
                    };
                    console.log("Parsed coordinates:", parsedCoordinates);
                } else {
                    parsedCoordinates = null;
                }
            } catch (parseError) {
                console.log("Error parsing coordinates:", parseError);
                parsedCoordinates = null;
            }
        }

        const newPost = new PostModel({
            userID: userId,
            role,
            cropType,
            quantity,
            pricePerUnit,
            location,
            description,
            images: [imageUrl],
            coordinates: parsedCoordinates // Add coordinates to the post
        });

        await newPost.save();
        
        console.log("Post created successfully with ID:", newPost._id);
        if (parsedCoordinates) {
            console.log("Post includes coordinates:", parsedCoordinates);
        }

        res.status(201).send({
            message: 'Post created successfully',
            post: newPost
        });
    } catch (err) {
        console.error("Create post error:", err);
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

// routes/userRouter.js
userRouter.get('/user/posts/feed', userAuth, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { latitude, longitude, maxDistance = 50 } = req.query;

        console.log("Feed request from user ID:", userId);
        console.log("Location params:", { latitude, longitude, maxDistance });

        let query = {};
        let useLocationFilter = false;

        // If location coordinates are provided
        if (latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLng = parseFloat(longitude);
            useLocationFilter = true;

            query = {
                $or: [
                    // Posts that have coordinates
                    { 
                        $and: [
                            { "coordinates.latitude": { $exists: true, $ne: null } },
                            { "coordinates.longitude": { $exists: true, $ne: null } }
                        ]
                    },
                    // OR recent posts without coordinates (fallback)
                    { 
                        createdAt: { 
                            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        }
                    }
                ]
            };
        } else {
            // If no location, show all recent posts
            query = {};
        }
        let posts = await PostModel.find(query)
            .populate("userID", "name firstname lastname email role profilePicture")
            .sort({ createdAt: -1 })
            .limit(100);

        // If location is provided, prioritize nearby posts but don't exclude others
        if (useLocationFilter && posts.length > 0) {
            const userLat = parseFloat(latitude);
            const userLng = parseFloat(longitude);
            
            // Add distance to each post and sort by distance
            posts = posts.map(post => {
                let distance = null;
                
                if (post.coordinates && 
                    post.coordinates.latitude && 
                    post.coordinates.longitude &&
                    !isNaN(post.coordinates.latitude) && 
                    !isNaN(post.coordinates.longitude)) {
                    
                    distance = calculateDistance(
                        userLat,
                        userLng,
                        post.coordinates.latitude,
                        post.coordinates.longitude
                    );
                }
                
                return {
                    ...post.toObject(),
                    distance: distance
                };
            }).sort((a, b) => {
                // Posts with distance (nearby) come first, then others by date
                if (a.distance !== null && b.distance !== null) {
                    return a.distance - b.distance;
                } else if (a.distance !== null) {
                    return -1;
                } else if (b.distance !== null) {
                    return 1;
                } else {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
        }


        res.status(200).send({
            success: true,
            totalPosts: posts.length,
            posts: posts.slice(0, 50) // Limit to 50 posts for performance
        });
    } catch (err) {
        return res.status(500).send({ 
            success: false,
            error: err.message
        });
    }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
export default userRouter;

