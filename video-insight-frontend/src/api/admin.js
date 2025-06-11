import axios from "axios";

const API_URL = "https://video-insight-jyba.onrender.com/api/admin";

export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        "x-auth-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all users:",
      error.response?.data || error.message
    );
    throw error;
  }
};
