import { Server } from "socket.io";
import crypto from "crypto";
import { chatModel } from "../models/chatModel.js";
import { notificationModel } from "../models/notifications.js";

const getRoomId = (user1, user2) => {
  return crypto.createHash("sha256").update([user1, user2].sort().join("_")).digest("hex");
};

const initialiseSocket = (server) => {
  const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://agrilink-7zio.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});


  const callRooms = new Map();

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

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
          senderProfilePicture: user.profilePicture 
        });

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

    socket.on("initiateCall", async ({ fromUserId, toUserId, callType, offer, roomId, callerName }) => {
      try {
        console.log(`📞 Call initiated from ${fromUserId} to ${toUserId}`);
        
        callRooms.set(roomId, { 
          fromUserId, 
          toUserId, 
          callType,
          offer 
        });
        
        io.to(toUserId).emit("incomingCall", {
          fromUserId,
          toUserId,
          callType,
          offer,
          roomId,
          callerName
        });
        
        console.log(`✅ Incoming call sent to ${toUserId} from ${callerName}`);
      } catch (error) {
        console.error("Error initiating call:", error);
      }
    });

    socket.on("acceptCall", ({ roomId, signal }) => {
      const call = callRooms.get(roomId);
      if (call) {
        io.to(call.fromUserId).emit("callAccepted", {
          signal,
          roomId
        });
      }
    });

    socket.on("rejectCall", ({ roomId }) => {
      const call = callRooms.get(roomId);
      if (call) {
        io.to(call.fromUserId).emit("callRejected", {
          reason: "User busy"
        });
        callRooms.delete(roomId);
      }
    });

    socket.on("endCall", ({ roomId }) => {
      const call = callRooms.get(roomId);
      if (call) {
        io.to(call.fromUserId).emit("callEnded");
        io.to(call.toUserId).emit("callEnded");
        callRooms.delete(roomId);
        console.log(`📞 Call ended in room ${roomId}`);
      }
    });

    socket.on("webrtcSignal", ({ roomId, signal }) => {
      socket.to(roomId).emit("webrtcSignal", signal);
    });

    socket.on("disconnect", () => {
      for (const [roomId, call] of callRooms.entries()) {
        if (call.fromUserId === socket.userId || call.toUserId === socket.userId) {
          callRooms.delete(roomId);
          io.to(roomId).emit("callEnded", { reason: "User disconnected" });
        }
      }
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

const createNotification = async (notificationData, io) => {
  try {
    const notification = await notificationModel.create(notificationData);
    
    const populatedNotification = await notificationModel.findById(notification._id)
      .populate('sender', 'firstname lastname name username profilePicture');
    
    io.to(notificationData.recipient.toString()).emit('newNotification', populatedNotification);
    
    console.log(`📢 Notification sent to user ${notificationData.recipient}`);
    
    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default initialiseSocket;