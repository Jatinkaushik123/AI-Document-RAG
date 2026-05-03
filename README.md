# 📄 AI Document Q&A (RAG System)

> ⚡ A context-aware AI assistant that answers questions strictly from uploaded PDF documents — no hallucinations.

---

## 🎥 Demo Video

👉[ https://YOUR_VIDEO_LINK_HERE](https://youtu.be/29zr5QDyFUk)

---

## ✨ Features

* 📤 Upload PDF documents
* 💬 Ask questions based on document content
* 🧠 Context-aware answers using RAG
* ❌ Rejects irrelevant questions (no hallucination)
* 📍 Source tracking with page numbers
* ⚡ Fast semantic search using FAISS
* 🎨 Clean and modern chat UI

---

## 🧱 Architecture

```
PDF → Text Extraction → Chunking → Embeddings
        ↓
      FAISS (Vector Store)
        ↓
   Query → Similarity Search
        ↓
      LLM (OpenAI)
        ↓
   Context-based Answer
```

---

## 🛠 Tech Stack

| Layer      | Tech                        |
| ---------- | --------------------------- |
| Frontend   | React + Vite + Tailwind CSS |
| Backend    | FastAPI                     |
| Vector DB  | FAISS                       |
| LLM        | OpenAI (gpt-5.4-mini)       |
| Embeddings | Sentence Transformers       |

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Jatinkaushik123/AI-Document-RAG.git
cd AI-Document-RAG
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```env
OPENAI_API_KEY=your_openai_api_key
TOP_K=3
```

---

## 🎯 Example Usage

| Query                        | Result                 |
| ---------------------------- | ---------------------- |
| What is this document about? | ✅ Answer from PDF      |
| Explain the main idea        | ✅ Context-based answer |
| How to play Free Fire?       | ❌ Rejected             |

---

## 🧪 Key Design Decisions

This system is built to **avoid hallucinations** by:

* Filtering low-relevance chunks using similarity score
* Strict prompt instructions (context-only answering)
* Rejecting answers not present in the document

---


## 🚀 Future Improvements

* 🔍 Highlight exact source text
* 📄 PDF preview panel
* 🧠 Multi-document support
* 💾 Chat history & memory
* 📊 Confidence score display

---

## 🧑‍💻 Author

**Jatin Kaushik**

---

## ⭐ If you found this useful, give it a star!
