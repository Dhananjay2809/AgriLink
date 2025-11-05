import { API } from "./axios";

export const sendFollowRequest = (userId) => API.post(`/follow/send/${userId}`);
export const acceptFollowRequest = (requestId) => API.post(`/accept/request/${requestId}`);
export const rejectFollowRequest = (requestId) => API.post(`/reject/request/${requestId}`);
export const cancelFollowRequest = (requestId) => API.post(`/cancel/request/${requestId}`);
export const getPendingRequests = () => API.get("/requests/pending");
export const getMyFollowers = () => API.get("/followers/me");
export const getMyFollowing = () => API.get("/following/me");

export default {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  getPendingRequests,
  getMyFollowers,
  getMyFollowing
};