## Document Q&A (RAG-lite)

Full-stack Document Q&A app:
- Upload a PDF
- Extract + chunk text
- Create embeddings
- Store/reuse vectors via FAISS
- Ask questions
- Retrieve relevant chunks
- Answer using an LLM **only from retrieved context**
- If context does not contain the answer, respond: **"I don't know based on the document"**

### Tech stack
- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite)
- **Embeddings + Chat**: OpenAI API
- **Vector store**: FAISS

---

## Project structure
```
document-qa-rag/
  backend/
    app/
      core/
      services/
      store/
      utils/
      main.py
      schemas.py
    requirements.txt
    .env.example
  frontend/
    src/
      components/
      api.ts
      App.tsx
      main.tsx
      styles.css
    index.html
    package.json
    vite.config.ts
    tsconfig.json
  docker-compose.yml
  .gitignore
```

---

## Setup

### 1) Backend (FastAPI)
From repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set `OPENAI_API_KEY`.

Run:

```powershell
uvicorn app.main:app --reload --port 8000
```

Backend docs:
- Swagger: `http://localhost:8000/docs`

### 2) Frontend (React)
From repo root:

```powershell
cd frontend
npm install
npm run dev
```

Open:
- `http://localhost:5173`

---

## Usage
1. Upload a PDF
2. Ask questions in the chat

The backend will:
- search top chunks from FAISS
- answer **only** using those chunks
- return the fallback phrase if the answer isn’t supported by the document