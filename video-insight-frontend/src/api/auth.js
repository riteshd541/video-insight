import axios from "axios";
const API = "https://video-insight-jyba.onrender.com/api/auth";

export const loginUser = async (email, password) =>
  await axios.post(`${API}/login`, { email, password });

export const registerUser = async (email, password) =>
  await axios.post(`${API}/register`, { email, password });
