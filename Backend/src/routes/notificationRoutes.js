// routes/notificationRoutes.js
import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "../controllers/notificationsController.js";
import { userAuth } from "../middlewares/auth.js";

const notificationRouter = express.Router();

notificationRouter.get("/", userAuth, getNotifications);
notificationRouter.put("/:id/read", userAuth, markAsRead);
notificationRouter.put("/read-all", userAuth, markAllAsRead);
notificationRouter.delete("/:id", userAuth, deleteNotification);

export default notificationRouter;