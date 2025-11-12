// api/notifications.js
import { API } from "./axios";

export const getNotifications = () => {
  return API.get("/api/notifications"); // Add /api
};

export const markAsRead = (notificationId) => {
  return API.put(`/api/notifications/${notificationId}/read`); // Add /api
};

export const markAllAsRead = () => {
  return API.put("/api/notifications/read-all"); // Add /api
};

export const deleteNotification = (notificationId) => {
  return API.delete(`/api/notifications/${notificationId}`); // Add /api
};