import cookieParser from 'cookie-parser';

import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';

export const userAuth = async (req, res, next) => {
    //token ko cookie se le rhe hai
    try {
          const token = req.cookies.token;

    //if token nhi hai to unauthorized
    if (!token) {
        return res.status(401).send("Unauthorized: No token provided");
     }
        //token verify kr rhe hai
        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
         const { id } = decodedMessage;
         const user = { id }; // You can fetch more user details from DB if needed
         if(!user){
            throw new Error("User not found");
         }
         req.user=user;
         next();
    } catch (err) {
        console.error("Error:", err.message);
        return res.status(401).send("Unauthorized: Invalid token");
    }
};
