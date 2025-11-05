import { API } from "./axios";

export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile/edit", data);
export const changePassword = (data) => API.put("/profile/changePassword", data);
export const deleteAccount = () => API.delete("/profile/deleteuser");