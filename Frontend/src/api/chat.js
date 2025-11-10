import { API } from "./axios";

export const getMessages = (userId, targetUserId) => {
  return API.get(`/get?userId=${userId}&targetUserId=${targetUserId}`);
};

export const sendMessage = (messageData) => {
  return API.post("/send", messageData);
};