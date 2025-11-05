import { API } from "./axios";

export const sendFollowRequest = (userId) => API.post(`/follow/send/${userId}`);
export const acceptFollowRequest = (requestId) => API.post(`/accept/request/${requestId}`);
export const rejectFollowRequest = (requestId) => API.post(`/reject/request/${requestId}`);
export const cancelFollowRequest = (requestId) => API.post(`/cancel/request/${requestId}`);
export const getPendingRequestsReceived = () => API.get("/requests/pending/received");
export const getPendingRequestsSent = () => API.get("/requests/pending/sent");
export const getMyFollowers = () => API.get("/followers/me");
export const getMyFollowing = () => API.get("/following/me");

// ADD THE MISSING FUNCTION
export const getPendingRequests = () => {
  return Promise.all([
    API.get("/requests/pending/received"),
    API.get("/requests/pending/sent")
  ]).then(([receivedResponse, sentResponse]) => ({
    received: receivedResponse.data,
    sent: sentResponse.data
  }));
};
