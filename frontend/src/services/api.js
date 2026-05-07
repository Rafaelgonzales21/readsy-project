import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("readsy_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ← Eliminamos la redirección automática al 401
// porque interfiere con el flujo de registro/login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";
      if (!isAuthRoute) {
        localStorage.removeItem("readsy_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const analyzePDF = (file, depth) => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("depth", String(depth));
  formData.append("questions", String(5));

  return api.post("/api/analyze", formData, { 
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;