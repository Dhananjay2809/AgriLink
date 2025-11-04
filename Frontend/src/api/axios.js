import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3000",  // backend URL
  withCredentials: true,             // IMPORTANT for cookies
});
