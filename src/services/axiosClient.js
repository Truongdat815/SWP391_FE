import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://103.188.243.122:8888",
  headers: {
    "Content-Type": "application/json",
  },
});

// Nếu có token, tự động gắn vào request (hỗ trợ cả access_token và accessToken)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;


