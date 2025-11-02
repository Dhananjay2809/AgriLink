import { v2 as cloudinary } from "cloudinary"; // v2 is the new verson of the cloudinary
import dotenv from "dotenv";

dotenv.config();
//  now we connect our noode.js server to the cloudinary by using the .config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
