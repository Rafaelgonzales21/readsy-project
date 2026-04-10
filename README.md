# 📚 Readsy – Academic Analyzer

Aplicación fullstack para analizar documentos PDF con IA (Groq).
Subís un paper y obtenés automáticamente resumen, ideas clave, insights, preguntas y conclusiones.

---

## 🚀 Quick Start 

```bash
# 1. Clonar
https://github.com/Rafaelgonzales21/readsy-project.git
cd readsy

# ======================
# BACKEND
# ======================
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno
# Mac / Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear variables de entorno
cp .env.example .env

# Ejecutar API
uvicorn app.main:app --reload --port 3000

# ======================
# FRONTEND (nueva terminal)
# ======================
cd frontend
npm install
npm run dev
```

👉 Frontend: [http://localhost:5173](http://localhost:5173)
👉 Backend: [http://localhost:3000](http://localhost:3000)
👉 Docs API: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🔐 Variables de entorno

Archivo: `backend/.env`

```env
GROQ_API_KEY=tu_api_key_de_groq
```

Archivo: `backend/.env.example`

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🧠 Cómo funciona

```text
1. Subís un PDF desde el frontend
2. FastAPI recibe el archivo
3. Se extrae el texto
4. Se envía a Groq (LLM)
5. Se devuelve análisis estructurado
```
---

## 💡 Recomendación importante

Si no estás usando ambos:

* `PyPDF2`
* `pdfplumber`

podés dejar solo uno para evitar peso innecesario.

---

## 🔮 Mejoras futuras

* Auth (JWT)
* Guardado de documentos
* Historial
* Mejor parsing de IA
* Streaming responses

---

## 👨‍💻 Autor

Rafael Gonzales Palacios

