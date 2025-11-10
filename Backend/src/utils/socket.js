import { Server } from "socket.io";
import crypto from "crypto";
import { chatModel } from "../models/chatModel.js";

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
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

export default initialiseSocket;
