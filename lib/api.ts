import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  // Use guest token if present, otherwise admin token
  const guestToken = Cookies.get("guest_token");
  const adminToken = Cookies.get("token");
  const token = guestToken || adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isGuest = !!Cookies.get("guest_token");
      Cookies.remove("token");
      Cookies.remove("guest_token");
      window.location.href = isGuest ? "/" : "/admin/login";
    }
    return Promise.reject(err);
  },
);

export default api;
