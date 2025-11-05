import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';

export const userAuth = async (req, res, next) => {
    //token ko cookie se le rhe hai
    try {
        console.log("🔐 Auth checking for:", req.url); // ADD THIS LINE
        const token = req.cookies.token;

        //if token nhi hai to unauthorized
        if (!token) {
            console.log("❌ No token found"); // ADD THIS LINE
            return res.status(401).send("Unauthorized: No token provided");
        }
        
        //token verify kr rhe hai
        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
        const { id } = decodedMessage;
        
        // COMPULSORY FIX: Check if user exists in database
        const user = await UserModel.findById(id); // CHANGED THIS LINE
        if(!user){
            console.log("❌ User not found in DB:", id); // ADD THIS LINE
            return res.status(401).send("Unauthorized: User not found");
        }
        
        req.user = { id: user._id }; // CHANGED THIS LINE (use user._id)
        console.log("✅ User authenticated:", user._id); // ADD THIS LINE
        next();
        
    } catch (err) {
        console.error("Auth Error:", err.message); // CHANGED THIS LINE
        return res.status(401).send("Unauthorized: Invalid token");
    }
};