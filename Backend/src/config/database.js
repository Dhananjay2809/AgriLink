import mongoose from 'mongoose';

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Dhananjay9211:BNZB1iemhCM7D8Yx@cluster0.4zxxfa3.mongodb.net/newuser");
};

export default connectDB;