import { Server } from "socket.io";
import crypto from "crypto";
import { chatModel } from "../models/chatModel.js";
import { notificationModel } from "../models/notifications.js"; // Add this import

const getRoomId = (user1, user2) => {
  return crypto.createHash("sha256").update([user1, user2].sort().join("_")).digest("hex");
};

const initialiseSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // User joins their personal room for notifications
    socket.on("joinUser", (userId) => {
      socket.join(userId);
      console.log(`🔔 User ${userId} joined notification room`);
    });

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`👥 User joined room: ${roomId}`);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, firstName, text }) => {
      const roomId = getRoomId(userId, targetUserId);

      try {
        let chat = await chatModel.findOne({ participants: { $all: [userId, targetUserId] } });

        if (!chat) {
          chat = new chatModel({ participants: [userId, targetUserId], messages: [] });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();

        const newMessage = chat.messages[chat.messages.length - 1];

        io.to(roomId).emit("messageReceived", {
          senderId: newMessage.senderId,
          firstName,
          text: newMessage.text,
          timestamp: newMessage.createdAt,
        });

        // Create notification for the message receiver
        await createNotification({
          recipient: targetUserId,
          sender: userId,
          type: 'message',
          message: `${firstName} sent you a message: ${text}`,
          relatedEntity: chat._id,
          entityModel: 'Message'
        }, io);

      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    // Handle friend request notifications
    socket.on("sendFriendRequest", async ({ fromUserId, toUserId, fromUserName }) => {
      try {
        await createNotification({
          recipient: toUserId,
          sender: fromUserId,
          type: 'friend_request',
          message: `${fromUserName} sent you a friend request`,
          relatedEntity: fromUserId,
          entityModel: 'User'
        }, io);
      } catch (err) {
        console.error("Error creating friend request notification:", err.message);
      }
    });

    // Handle like notifications
    socket.on("sendLikeNotification", async ({ fromUserId, toUserId, fromUserName, postId }) => {
      try {
        await createNotification({
          recipient: toUserId,
          sender: fromUserId,
          type: 'like',
          message: `${fromUserName} liked your post`,
          relatedEntity: postId,
          entityModel: 'Post'
        }, io);
      } catch (err) {
        console.error("Error creating like notification:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

// Helper function to create and send notifications
const createNotification = async (notificationData, io) => {
  try {
    const notification = await notificationModel.create(notificationData);
    
    // Populate the notification with sender info
    const populatedNotification = await notificationModel.findById(notification._id)
      .populate('sender', 'firstname lastname name username profilePicture');
    
    // Emit the notification to the recipient
    io.to(notificationData.recipient.toString()).emit('newNotification', populatedNotification);
    
    console.log(`📢 Notification sent to user ${notificationData.recipient}`);
    
    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default initialiseSocket;