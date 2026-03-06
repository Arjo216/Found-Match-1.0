<div align="center">
  
# 🌐 FoundMatch
**The Zero-Trust, AI-Driven Institutional Capital Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-AI_Engine-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS_Secured-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Encryption](https://img.shields.io/badge/Security-AES--256_%2B_RSA--2048-red?style=for-the-badge)](#)

*FoundMatch is a professional, institutional-grade platform that connects startup founders with venture capital. It combines state-of-the-art Graph Neural Networks for matchmaking with military-grade Zero-Knowledge encryption for secure deal-flow communications.*

</div>

---

## 🚀 Core Platform Architecture

FoundMatch moves beyond traditional directories by operating as a secure **Institutional Operating System**.

### 🧠 The Intelligence Layer (Hybrid AI)
* **Graph Neural Networks (LightGCN):** Predicts high-probability matches based on network interaction history and collaborative filtering.
* **Semantic Analysis (Sentence-BERT):** Reads pitch decks and investor theses to score contextual alignment (0-100% Global Match Index).
* **Ephemeral Executive Co-Pilot:** An in-memory LLM that reads encrypted pitch decks, provides strategic critiques, and instantly destroys the file from server RAM to maintain absolute data privacy.

### 🛡️ The Security Perimeter (Zero-Trust)
* **Zero-Knowledge Deal Rooms:** End-to-End Encrypted (E2EE) WebSockets. Messages and files are encrypted in the browser using hybrid RSA-2048 and AES-256. The backend database only stores cryptographic noise.
* **PostgreSQL Row-Level Security (RLS):** A strict "Default Deny" database posture. Data APIs are completely blacked out to the public internet.
* **The Sentry Autonomous Defense:** Custom ASGI middleware that actively blocks scraping, volumetric API attacks, and unauthorized payload anomalies.

### 📊 The Deal Flow CRM
* **Institutional Dashboards:** Real-time data aggregation displaying profile views, active negotiations, and trajectory algorithms.
* **Kanban Pipeline:** A native HTML5 drag-and-drop board to track relationships from *Sourced* to *Term Sheet* to *Closed*.

---

## 🏗️ Monorepo Structure

```text
Found_Match/
├── frontend/             # Next.js 14 Client (UI, WebCrypto API, WebSockets)
├── backend/              # FastAPI Server (Auth, RLS Admin, Sentry, ML Router)
├── ml_engine/            # PyTorch Pipelines (LightGCN & NLP Models)
├── data/                 # Processed Datasets & Model Weights (.pth)
└── docker-compose.yml    # Full-stack Container Orchestration

⚡ Quick Start (Docker)
Launch the entire ecosystem with a single command:

```Bash
# 1. Clone the repository
git clone [https://github.com/Arjo216/Found-Match-1.0.git](https://github.com/Arjo216/Found-Match-1.0.git)
cd Found-Match-1.0

# 2. Build and launch all microservices
docker-compose up --build
Frontend runs on localhost:3000 | Backend API runs on localhost:8000