import { chatModel } from "../models/chatModel.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { userId, targetUserId, text } = req.body;

    let chat = await chatModel.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!chat) {
      chat = new chatModel({ participants: [userId, targetUserId], messages: [] });
    }

    chat.messages.push({ senderId: userId, text });
    await chat.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId, targetUserId } = req.query;

    const chat = await chatModel.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!chat) return res.status(200).json({ success: true, messages: [] });

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
