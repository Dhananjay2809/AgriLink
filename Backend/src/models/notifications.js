// models/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    type: { 
      type: String, 
      enum: ['friend_request', 'message', 'like', 'comment', 'follow'],
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityModel'
    },
    entityModel: {
      type: String,
      enum: ['User', 'Post', 'Message']
    },
    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export const notificationModel = mongoose.model("Notification", notificationSchema);