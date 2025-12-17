# FoundMatch: AI-Powered Startup-Investor Matchmaking Platform

FoundMatch is a professional recommendation platform connecting startup founders with investors. Unlike traditional directories, it utilizes a **Hybrid AI Engine** (Graph Neural Networks + NLP) to predict compatibility based on pitch semantics and investment history.

![Project Banner](https://via.placeholder.com/1000x300?text=FoundMatch+Dashboard+Preview)

## 🚀 Features
* **Smart Matching:** Hybrid AI scoring (LightGCN + Sentence-BERT) ranks matches by compatibility (0-100%).
* **Role-Based Access:** Dedicated interfaces for Founders and Investors.
* **Swipe Interface:** Tinder-style matching for quick discovery.
* **Real-time Scoring:** Instant analysis of new pitch decks against investor theses.

## 🛠 Tech Stack
* **Frontend:** Next.js, Tailwind CSS, React Query, React.js, TypeScript
* **Backend:** FastAPI (Python), SQLAlchemy, Pydantic
* **AI/ML:** PyTorch, PyTorch Geometric, HuggingFace Transformers
* **Database:** PostgreSQL (Supabase)
* **DevOps:** Docker, Vercel, Render

## 🏗 Architecture
The project follows a Monorepo structure:
/ ├── backend/ # FastAPI REST API ├── frontend/ # Next.js User Interface ├── ml_engine/ # AI Logic (LightGCN & NLP Models) ├── data/ # Processed Datasets & Model Weights (.pth) └── docker-compose.yml