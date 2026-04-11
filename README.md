# 📚 Readsy - Academic Analyzer

Readsy is a web application that analyzes academic documents (such as PDFs) to extract information, evaluate them, and make them easier to understand using automated tools.

---

## 🚀 Technologies Used

### Frontend

* React
* Vite
* TailwindCSS
* Axios

### Backend

* FastAPI (Python)
* Uvicorn
* PDF processing

---

## 📁 Project structure

```
readsy/
│
├── frontend/          # React application (client)
│
├── backend/           # API with FastAPI
│   └── app/
│       ├── main.py    # Entry point
│       ├── api/
│       ├── models/
│       ├── schemas/
│       └── services/
│
└── README.md
```

---

## ⚙️ Installation and Execution

### 1. Clone the repository

```bash
git clone https://github.com/Rafaelgonzales21/readsy-project.git
cd readsy
```

---

## 🖥️ Backend (FastAPI + Uvicorn)

### 2. Create a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux / Mac
venv\Scripts\activate     # Windows
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure environment variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

Then fill in the necessary values in `.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

---

### 5. Run the server

```bash
uvicorn app.main:app --reload
```

📍 Backend available at:
http://localhost:8000

📍 Automatic documentation (Swagger):
http://localhost:8000/docs

---

## 🌐 Frontend (React + Vite)

### 6. Install dependencies and run

```bash
cd frontend
npm install
npm run dev
```

📍 Frontend available at:
http://localhost:5173

---

## 🔗 Frontend-Backend Communication

The frontend consumes the API at:

```
http://localhost:8000
```

Make sure CORS is enabled in FastAPI.

---

## ✨ Key Features

* 📄 PDF file upload and analysis
* 🧠 Academic content processing
* ⚡ Fast and modern interface

---

## 🛠️ Available Scripts (Frontend)

```bash
npm run dev      # Development
npm run build    # Production
npm run preview  # Preview the build
```

---

## 🤝 Contributions

Contributions are welcome. Fork the project and open a pull request 🚀

---
  
## Author

Rafael Gonzales Palacios
