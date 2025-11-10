import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const chatRouter = express.Router();

chatRouter.post("/send", sendMessage);
chatRouter.get("/get", getMessages);

export default chatRouter;
