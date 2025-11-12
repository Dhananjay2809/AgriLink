import { API } from "./axios";

export const getMessages = (userId, targetUserId) => {
  return API.get(`/get?userId=${userId}&targetUserId=${targetUserId}`);
};
export const getUserChats = (userId) => {
  return API.get(`/chats?userId=${userId}`);
};
export const searchUsers = (searchTerm) => {
  return API.get(`/users/search?q=${searchTerm}`);
};
export const sendMessage = (messageData) => {
  return API.post("/send", messageData);
};