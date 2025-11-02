import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';


//multer is used to handle file uploads in express applications
// multer-storage-cloudinary integrates multer with Cloudinary for storing files directly in the cloud
// Here, we are configuring multer to use Cloudinary as the storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "AgriConnect_crops", // folder name inside Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
// ab upload middleware ko use krke hum file upload kr skte hain
// ye middleware hum routes me use krenge jaha hume file upload krni hai
export const upload = multer({ storage });
