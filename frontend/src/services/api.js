import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const analyzePDF = (file, depth) => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("depth", String(depth));
  formData.append("questions", String(5));

  return axios.post(`${API}/api/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};