import jwt from 'jsonwebtoken';

export const userAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send("❌ Unauthorized: No token provided");
    }
    try {
        const decodedMessage = jwt.verify(token, "Atul@123#213");
         const { id } = decodedMessage;
         const user = { id }; // You can fetch more user details from DB if needed
         if(!user){
            throw new Error("User not found");
         }
         req.user=user;
         next();
    } catch (err) {
        console.error("Error:", err.message);
        return res.status(401).send("❌ Unauthorized: Invalid token");
    }
};
