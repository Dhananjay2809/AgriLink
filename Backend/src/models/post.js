import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ["farmer", "trader"],
            required: true
        },
        quantity: {
            type: Number,
        },
        cropType: {
            type: String,
            enum: ["chilli", "potato", "wheat", "rice", "maize", "cotton", "sugarcane", "fruits", "vegetables", "pulses", "oilseeds", "tea", "coffee"],
            required: true
        },
        pricePerUnit: {
            type: Number
        },
        location: {
            type: String
        },
        // Add coordinates for geospatial queries
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        description: {
            type: String
        },
        images: {
            type: [String],
            required: true
        },
        status: {
            type: String,
            enum: ["available", "sold"],
            default: "available"
        },
    },
    {
        timestamps: true
    }
);

// Create index for better performance on location-based queries
postSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

const PostModel = mongoose.model('Post', postSchema);
export default PostModel;