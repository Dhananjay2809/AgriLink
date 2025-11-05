import { API } from "./axios";

export const createPost = (formData) => API.post("/user/posts/create", formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getMyPosts = () => API.get("/user/posts/myposts");

export const getFeed = () => API.get("/user/posts/feed");

export const deletePost = (postId) => API.delete(`/user/post/deletepost/${postId}`);

// Export all functions as named exports
export default {
  createPost,
  getMyPosts,
  getFeed,
  deletePost
};