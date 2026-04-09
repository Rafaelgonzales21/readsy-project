// Cliente Axios para conectar con FastAPI

import axios from "axios";

export const analyzePDF = (file, depth) => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("depth", String(depth));
  formData.append("questions", String(5));

  return axios.post("http://localhost:8000/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};