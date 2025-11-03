
import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    //jo follow kr rhe hai
    follower: { 
         type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, 
    following: { 
        // jinhe follow kr rhe hai
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    } 
  },
  { timestamps: true }
);
followerSchema.index({ follower: 1, following: 1 }, { unique: true });

const FollowerModel = mongoose.model("Follower", followerSchema);
export default FollowerModel;