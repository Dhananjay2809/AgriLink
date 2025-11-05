import { API } from "./axios";

export const createPost = (formData) => {
  console.log("📤 Creating post with formData...");
  return API.post("/user/posts/create", formData, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true // Explicitly set for file uploads
  });
};

export const getMyPosts = () => API.get("/user/posts/myposts");
export const getFeed = () => API.get("/user/posts/feed");
export const deletePost = (postId) => API.delete(`/user/post/deletepost/${postId}`);