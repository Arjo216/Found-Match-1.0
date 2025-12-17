# 🧠 FoundMatch - Backend API & AI Engine

The **FoundMatch Backend** is a high-performance REST API built with **FastAPI**. It serves as the core logic layer for the platform, handling user authentication, data management, and hosting the **Hybrid AI Recommendation Engine**.

## 🚀 Features

- **Hybrid AI Engine:**
  - **Collaborative Filtering:** Uses **LightGCN** (Graph Neural Networks) to learn from user interaction history.
  - **Content-Based Filtering:** Uses **Sentence-BERT** (SBERT) to analyze the semantic meaning of pitch decks and investor theses.
- **High-Performance API:** Built on **FastAPI** for asynchronous, non-blocking execution.
- **Secure Authentication:** Statless **JWT** authentication with **Bcrypt** password hashing.
- **PostgreSQL Integration:** Robust relational data storage using **SQLAlchemy** ORM.
- **Swagger Documentation:** Automatic, interactive API documentation.

## 🛠️ Tech Stack

- **Language:** Python 3.10+
- **Framework:** FastAPI
- **ML Libraries:** PyTorch, PyTorch Geometric, Sentence-Transformers
- **Database:** PostgreSQL (Supabase)
- **ORM:** SQLAlchemy
- **Containerization:** Docker

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- Python 3.10 or higher
- PostgreSQL database (or Supabase URL)

### 2. Setup Virtual Environment
```bash
# Navigate to the backend folder
cd "Web-Dev 2.0"

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate