import { API } from "./axios";

export const searchUsers = (query) => API.get(`/search/users?query=${encodeURIComponent(query)}`);