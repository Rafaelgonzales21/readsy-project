import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/*para añadir el token jwt automaticamente */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("readsy_token");
  if (token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
});

/* Si el back devuelve 401, hace que borre el token y redirige al login */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response?.status === 401){
      localStorage.removeItem("readsy_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
)

export const analyzePDF = (file, depth) => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("depth", String(depth));
  formData.append("questions", String(5));

  return axios.post(`${API}/api/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export default api;