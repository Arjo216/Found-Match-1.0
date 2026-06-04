<div align="center">

# 🌌 FoundMatch
**The AI-Orchestrated Institutional Capital Allocation OS (v3.0)**

[![Next.js 14](https://img.shields.io/badge/Next.js_14-050314?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph_Swarms-D946EF?style=for-the-badge&logo=langchain&logoColor=white)](#)
[![PyTorch](https://img.shields.io/badge/PyTorch_GNN-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/pgvector_RLS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Security](https://img.shields.io/badge/Security-AES_256_%2B_RSA_2048-10B981?style=for-the-badge)](#)

*FoundMatch replaces legacy VC deal flow with a localized multi-agent swarm. We semantically match founders, autonomously negotiate term sheets, and instantly engineer Day-1 cloud infrastructure.*

[Explore Platform](#-the-institutional-arsenal) • [System Architecture](#%EF%B8%8F-system-architecture) • [Security Posture](#%EF%B8%8F-the-security-perimeter) • [Quick Start](#-quick-start-deployment)

</div>

---

## 🚀 Overview

FoundMatch is an elite, zero-trust platform designed to eliminate friction in venture capital. By combining state-of-the-art **Graph Neural Networks (GNNs)** for matchmaking, **LangGraph Multi-Agent Swarms** for autonomous financial negotiation, and **Military-Grade E2E Encryption** for data privacy, FoundMatch operates as a complete end-to-end Institutional Operating System.

---

## ⚡ The Institutional Arsenal

### 1. Deal Galaxy Vector Engine 🌌
Stop reading pitch decks. Our 384-dimensional `pgvector` Graph Neural Network (custom LightGCN architecture) maps investor theses directly to founder realities. 
* **Semantic Analysis:** Sentence-BERT reads encrypted pitch decks to score contextual alignment, generating a 0-100% Global Match Index in milliseconds.
* **Orbital UI:** Visualizes deal flow in an interactive, 3D spatial interface.

### 2. Autonomous LangGraph Swarms 🤖
When a deal enters the "War Room," human input is locked, and AI proxies take over.
* **The Investor Agent:** Conducts brutal financial due diligence and fights for optimal equity.
* **The Founder Agent:** Defends valuation and negotiates capital requirements dynamically.
* **The Legal Drafter:** Upon reaching a mathematical consensus, an M&A Counsel AI instantly mints a beautifully formatted, Markdown-based Official Term Sheet with Post-Money calculations.

### 3. CodeOps-ULTRA (Post-Funding Execution) 💻
Once the Term Sheet is sealed, the capital is unlocked directly to our DevSecOps swarm.
* **Instant Engineering:** The Architect and Developer agents instantly build the startup's minimal viable product (MVP). From Next.js frontends to Post-Quantum Rust blockchains (implementing Kyber, FrodoKEM, and NewHope).
* **Automated Audits:** A DevSecOps agent scans the generated codebase for hardcoded secrets and injection vulnerabilities, providing a PASS/FAIL deployment verdict before rendering the code in the browser IDE.

---

## 🛡️ The Security Perimeter

FoundMatch operates on a strict **Default Deny / Zero-Knowledge** posture.

| Security Layer | Description |
| :--- | :--- |
| **Hybrid E2EE Vault** | Native Web Crypto API generates RSA-2048 key pairs locally. Files (PDFs/Cap Tables) are encrypted via AES-GCM, and keys are wrapped in RSA. The backend server acts as a blind courier storing only cryptographic noise. |
| **Database Fortress** | PostgreSQL Row-Level Security (RLS) policies completely blackout public API access. Data is only exposed to strictly authenticated backend SQLAlchemy connections. |
| **Sentry Autonomous Defense** | Custom ASGI middleware actively blocks scraping, volumetric API attacks, and unauthorized payload anomalies before they reach the routing layer. |
| **Ephemeral RAM Execution** | Pitch decks parsed by the Executive Co-Pilot are held strictly in system memory, fed to the LLM, and instantly destroyed. |
| **Regulatory KYC "Soft Gate"** | A built-in identity verification sandbox that blocks unverified participants from initiating secure Deal Rooms. |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    %% ==========================================
    %% 🎨 CUSTOM THEME & STYLING (Dark Mode FinTech)
    %% ==========================================
    classDef user fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff,rx:10px,ry:10px
    classDef frontend fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef security fill:#4c0519,stroke:#f43f5e,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef backend fill:#020617,stroke:#6366f1,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef ml fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef db fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef external fill:#171717,stroke:#a3a3a3,stroke-width:2px,color:#fff,stroke-dasharray: 5 5,rx:8px,ry:8px
    classDef gate fill:#000000,stroke:#eab308,stroke-width:3px,color:#fef08a,rx:12px,ry:12px

    %% ==========================================
    %% 🧑‍💼 ACTORS
    %% ==========================================
    U1((🧑‍💼 Founder)):::user
    U2((💼 Investor)):::user

    %% ==========================================
    %% 🌐 FRONTEND / CLIENT TIER (Zero-Knowledge)
    %% ==========================================
    subgraph Client_Tier ["🌐 ZERO-KNOWLEDGE CLIENT (Next.js / React)"]
        direction TB
        UI["🖥️ FoundMatch UI<br/>(Kanban Pipeline & Match Grid)"]:::frontend
        Crypto["🔐 WebCrypto Engine<br/>(RSA-OAEP & AES-GCM Key Gen)"]:::security
        Copilot["🤖 Executive Co-Pilot<br/>(Floating Document Analyzer)"]:::frontend
        Ghost["👻 Chat Ghostwriter<br/>(Contextual Reply Generator)"]:::frontend

        UI <--> Crypto
        UI <--> Copilot
        UI <--> Ghost
    end

    U1 <-->|Client-Side Encryption| UI
    U2 <-->|Client-Side Decryption| UI

    %% ==========================================
    %% 🛡️ REGULATORY GATEWAY
    %% ==========================================
    KYC{"🛡️ KYC / AML Sandbox Gate<br/>(Identity Verification)"}:::gate

    Client_Tier ==>|Authenticated JWT Requests| KYC

    %% ==========================================
    %% ⚙️ BACKEND TIER (FastAPI Microservice)
    %% ==========================================
    subgraph Backend_Tier ["⚙️ FASTAPI MICROSERVICE (Python)"]
        direction TB
        REST["🔄 Core REST API<br/>(Profiles, Projects, Filtering)"]:::backend
        WS["⚡ WebSocket Manager<br/>(Real-Time Deal Rooms)"]:::backend
        Vault["🏦 E2EE Vault Router<br/>(Blind Ciphertext & File Transit)"]:::security
        AgentRouter["🧠 AI Agent Router<br/>(Prompt Sanitization & Safety)"]:::backend
    end

    KYC ==>|Auth Pass| REST
    KYC ==>|Auth Pass| WS
    KYC ==>|Auth Pass| Vault
    KYC ==>|Auth Pass| AgentRouter

    %% ==========================================
    %% 🧬 ML ENGINE TIER (PyTorch Microservice)
    %% ==========================================
    subgraph ML_Tier ["🧬 RECOMMENDATION ENGINE (PyTorch)"]
        direction TB
        InferAPI["🎯 Inference API Gateway"]:::ml
        SBERT["📝 Sentence-BERT<br/>(Semantic NLP Pitch Parsing)"]:::ml
        LightGCN["🕸️ LightGCN<br/>(User-Item Graph Connectivity)"]:::ml
        Hyb["⚖️ Hybrid Scorer<br/>(+ Premium Priority Multipliers)"]:::ml

        InferAPI --> SBERT
        InferAPI --> LightGCN
        SBERT --> Hyb
        LightGCN --> Hyb
    end

    REST <==>|Predict Request / JSON Response| InferAPI

    %% ==========================================
    %% 🗄️ PERSISTENCE TIER (Supabase)
    %% ==========================================
    subgraph Data_Tier ["🗄️ PERSISTENCE LAYER (Supabase / PostgreSQL)"]
        direction TB
        RLS{"🔒 Row Level Security<br/>(Cryptographic Query Isolation)"}:::security
        DB[("🐘 Relational Database<br/>(Users, Projects, Interactions)")]:::db
        CipherDB[("🗃️ Ciphertext Storage<br/>(Unreadable Encrypted Blobs)")]:::db
        
        RLS --> DB
        RLS --> CipherDB
    end

    REST <==> RLS
    Vault ==>|Blind Write| RLS
    WS ==>|Asynchronous Save| RLS

    %% ==========================================
    %% 🌩️ EXTERNAL APIs
    %% ==========================================
    subgraph Ext_Tier ["🌩️ EXTERNAL CLOUD COMPUTE"]
        Llama["🦙 Groq API (Llama-3-70b)<br/>(Ultra-Low Latency Inference)"]:::external
    end

    AgentRouter <==>|Sanitized System Prompts| Llama
    Copilot -.->|Diligence Queries| AgentRouter
    Ghost -.->|Encrypted Context| AgentRouter
```
---

### 🖥️ Frontend Stack (Next.js 14)
* **Framework:** React / Next.js (TypeScript).
* **UI/UX:** Premium Glassmorphism design system utilizing `backdrop-blur`, complex gradient meshes, Framer Motion transitions, and responsive Tailwind CSS grids.
* **Phase-Shift Routing:** Seamless transitions from casual secure messaging (The Lobby) to full-screen autonomous negotiation terminals (The War Room).

### ⚙️ Backend Stack (FastAPI + Python 3.10+)
* **Asynchronous Concurrency:** Built on Starlette/Uvicorn for non-blocking WebSocket E2EE chat relays.
* **Dual-Engine AI Fallback:** Primary inference routed through Groq (Llama-3-70b) for ultra-low latency, with an automatic failsafe cascade to Google Gemini (1.5-Flash) to prevent rate-limit crashes.
* **Database:** SQLAlchemy ORM interfacing with Supabase/PostgreSQL.

---

## 🏁 Quick Start Deployment

Launch the entire FoundMatch ecosystem with a single command.

### 1. Prerequisites
* Node.js (>= 18.x) & pnpm
* Python 3.10+
* Docker & Docker Compose
* PostgreSQL Database (Local or Supabase)

### 2. Environment Variables
Create a `.env` file in both the `frontend` and `backend` directories.

```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost/foundmatch
SECRET_KEY=your_highly_secure_jwt_secret
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=AIzaSy_your_gemini_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```
# FoundMatch: Institutional Capital Allocation Platform

FoundMatch is an elite, AI-driven networking and deal-flow platform designed to connect high-growth startup founders with institutional investors, venture capitalists, and private equity firms. 

## 🚀 Core Platform Features

* **PyTorch Graph Neural Network (GNN):** Utilizes a custom LightGCN architecture to calculate hyper-accurate "Global Match Indexes" between founders and investors based on domain, stage, and historical interaction data.
* **Zero-Knowledge End-to-End Encryption (E2EE):** All Deal Room communications and file transfers (Pitch Decks, Cap Tables) are secured client-side using a Hybrid AES-GCM + RSA-OAEP cryptographic vault. The backend server cannot read message contents or decrypt files.
* **Dual AI Engines (Groq/Llama-3):** * *Executive Co-Pilot:* A globally available, context-aware AI widget that analyzes uploaded documents and provides strategic platform guidance.
  * *Chat Ghostwriter:* An in-chat M&A advisor that reads recent encrypted context and suggests highly professional, tactical responses to drive deal flow.
* **Regulatory KYC "Soft Gate":** A built-in identity verification sandbox that blocks unverified participants from initiating secure Deal Rooms, simulating institutional AML compliance.
* **Interactive Deal Flow Pipeline:** A drag-and-drop Kanban board for investors to seamlessly manage their pipeline from "Sourced" to "Closed".

## 🏗️ Monorepo Architecture
* `/Frontend`: Next.js 14, React, TailwindCSS, Framer Motion, WebCrypto API.
* `/Web-Dev 2.0` (Backend): FastAPI, PostgreSQL, SQLAlchemy, WebSockets.
* `/ml_engine`: PyTorch, PyTorch Geometric, Scikit-learn.

---

## 🏗️ Monorepo Structure

```text
Found_Match/
├── frontend/             # Next.js 14 Client (Glassmorphism UI, WebCrypto API, CodeOps IDE)
├── backend/              # FastAPI Server (LangGraph Orchestrator, Sentry, WebSockets)
├── ml_engine/            # PyTorch Pipelines (LightGCN, NLP Semantic Matching)
├── data/                 # Processed Datasets & Model Weights (.pth)
├── quantum_vault/        # Post-Quantum Rust Blockchain Architectures (CodeOps Generated)
└── docker-compose.yml    # Full-stack Container Orchestration
```

### ⚡ Quick Start (Docker)
Launch the entire ecosystem with a single command:

### 3. Build and Launch

```bash
# Clone the repository
git clone [https://github.com/Arjo216/Found-Match-1.0.git](https://github.com/Arjo216/Found-Match-1.0.git)
cd Found-Match-1.0

# Launch via Docker Compose (Recommended)
docker-compose up --build
```

* **Frontend UI:** `http://localhost:3000`
* **FastAPI Swagger Docs:** `http://localhost:8000/docs`
### Frontend runs on localhost:3000 | Backend API runs on localhost:8000

---

### 2. The Frontend (`Frontend/Frontend/README.md`)
*This focuses on your stunning glassmorphism UI, client-side encryption logic, and responsive design.*

*Updated frontend README to highlight the complex WebCrypto logic and stunning Glassmorphism UI components.*
<div align="center">

  
# 🎨 FoundMatch - Frontend Application

**Next.js 14 • Tailwind CSS • Framer Motion • Web Crypto API**

*The user-facing command center for FoundMatch. Engineered for absolute privacy, real-time communication, and a frictionless, high-fidelity user experience.*

</div>

## ✨ Key Features

- **Institutional Glassmorphism UI:** A premium, dark-mode design system utilizing `backdrop-blur`, complex gradient meshes, and responsive CSS grids.
- **Zero-Knowledge Client (E2EE):** Integrates the native browser Web Crypto API. Generates and stores RSA public/private key pairs locally to encrypt chat streams and binary file buffers before they ever touch the network.
- **Real-Time Deal Rooms:** Seamless WebSocket integration for instant, encrypted founder-investor communications.
- **Interactive Kanban CRM:** Native HTML5 Drag-and-Drop deal flow management (Sourced ➡️ Term Sheet ➡️ Closed).
- **Executive AI Co-Pilot:** A stunning, centralized modal interface for interacting with the platform's AI, complete with context-aware smart suggestions and file staging.

# FoundMatch Frontend: Next.js & Client-Side Crypto

A high-performance, institutional-grade user interface built with React, Next.js, and TailwindCSS. It acts as a "Zero-Knowledge Client," handling all data decryption and AI formatting locally.

## 🛡️ Security & Cryptography (`/lib/crypto.ts`)
* **Key Generation:** Generates RSA-OAEP public/private key pairs locally in the browser upon registration.
* **Message Encryption:** Uses the recipient's Public Key to encrypt message text before it ever touches the network.
* **File Encryption:** Converts PDFs and documents into ArrayBuffers, encrypts them with a dynamic AES-GCM key, and encrypts *that* key with the recipient's RSA Public Key (Hybrid Encryption).
* **Fallback Safety:** Built-in `try...catch` protocols to gracefully display "Legacy Unencrypted Messages" without crashing the React application.

## 🎨 Advanced UI/UX Components
* **`KYCModal.tsx`:** A Glassmorphism soft-gate that intercepts users before they enter a Deal Room, forcing simulated identity verification.
* **`AICoPilot.tsx`:** A persistent, floating AI widget with document-upload capabilities, utilizing `<AnimatePresence>` for smooth, state-driven transitions.
* **`ChatWindow.tsx`:** A secure messaging interface featuring dynamic AI suggestions (The Ghostwriter), file-attachment indicators, and offline PDF dossier exporting.
* **`network.tsx`:** An interactive, drag-and-drop Kanban board for visual Deal Flow management, integrated directly with the Deal Room chat.

## 🛠️ Run Locally
```bash
npm run dev
# Note: Ensure the FastAPI backend is running on port 8000, 
# and the Groq API key is valid on the server-side.
```

## 🏗️ The "Pro" Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for strict type safety.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for fluid layout transitions and modal orchestration.
- **Data Visualization:** [Recharts](https://recharts.org/) for dynamic metric rendering.
- **Icons:** [Lucide React](https://lucide.dev/)

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
Ensure you have **Node.js (>= 18.x)** and **pnpm** installed.
```bash
npm install -g pnpm
```
### 2. Installation & Execution
```Bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```
***Navigate to http://localhost:3000 to view the application.***

### 3. 🧹 Cache Management
If you make significant UI architectural changes, clear the Next.js cache to force a Tailwind recompilation:

```Bash
rm -rf .next
pnpm run dev
```
---

### 3. The Backend (`backend/README.md`)
*This focuses on your high-performance Python code, Sentry security, AI routing, and the database fortress.*

<div align="center">
  
# ⚙️ FoundMatch - Backend & AI Core

**FastAPI • PyTorch • SQLAlchemy • PostgreSQL (RLS)**

*The high-performance, highly-secured nervous system of FoundMatch. Responsible for asymmetric data routing, zero-trust storage, and serving the PyTorch ML pipelines.*

</div>

## 🚀 Core Infrastructure

- **Asynchronous FastAPI:** Built on Starlette and Uvicorn for non-blocking, high-throughput execution (WebSockets & REST).
- **The Sentry Perimeter:** A custom ASGI middleware layer that autonomously detects and throttles volumetric attacks, unauthorized scrapers, and malformed payload injections.
- **Database Fortress (Row-Level Security):** Integrates with Supabase/PostgreSQL using strict RLS policies. The public API is entirely blacked out; all data is accessed securely via backend SQLAlchemy admin connections.
- **Zero-Knowledge Vault Router:** The backend cannot read user messages or files. It acts as a blind courier, routing AES/RSA encrypted binary blobs (`VAULT_META`) between authorized UUIDs.

## 🧠 The Intelligence Pipeline

- **Live Analytics Engine:** Dynamically calculates Global Match Indexes, active deal flows, and profile trajectory metrics via complex SQL joins.
- **Ephemeral Document AI:** Utilizes `PyPDF2` to read uploaded Pitch Decks entirely in system RAM, feeds the text to an LLM context window for strategic analysis, and instantly purges the file to maintain institutional privacy.
- **Hybrid AI Scoring:** Hosts the endpoints that trigger the backend `ml_engine` (LightGCN and Sentence-BERT) for matchmaking.

# FoundMatch Backend: FastAPI & AI Engine

This is the central nervous system of FoundMatch, built for high concurrency, real-time WebSocket communication, and heavy Machine Learning inference.

## 🧠 Recent Architectural Upgrades

* **AI Agent Router (`/routers/agent.py`):** * Integrates the Groq API (Llama-3-70b) for ultra-low latency AI inference.
  * Powers the `generate-question`, `chat-assist`, and `analyze-document` endpoints.
  * Features aggressive server-side JSON cleaning and DB rollback protection against AI hallucinations.
* **KYC Sandbox Router (`/routers/kyc.py`):**
  * Simulates third-party identity verification (e.g., Setu/Digilocker).
  * Accepts "Magic Numbers" (e.g., `ABCDE1234F`) to auto-verify accounts in development.
  * Masks sensitive data (e.g., `XXXXX1234X`) before writing to PostgreSQL.
* **Institutional Vault (`/routers/vault.py`):**
  * Handles the secure transit of encrypted `.bin` files. 
  * The backend stores the files but does *not* possess the cryptographic keys to read them.
* **Real-Time Deal Rooms (`/routers/chat.py`):**
  * Manages active WebSocket connections for instant messaging.
  * Stores ciphertext and initialization vectors in the DB for asynchronous retrieval.

## 🔑 Environment Requirements
Make sure your `.env` includes:
```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost/foundmatch
SECRET_KEY=your_highly_secure_jwt_secret
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=AIzaSy_your_gemini_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
ENV=development
```

## 🛠️ Tech Stack

- **Language:** Python 3.10+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Document Processing:** PyPDF2
- **Authentication:** JWT (Stateless) + Bcrypt

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- Python 3.10+ installed
- Access to a PostgreSQL instance (e.g., Supabase)

### 2. Environment Setup
```bash
# Navigate to the backend folder
cd backend

# Create the virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate
```
### 3. Install & Run
```Bash
# Install required Python packages
pip install -r requirements.txt

# Start the Uvicorn ASGI server
uvicorn main:app --reload --port 8000
```

***Visit http://localhost:8000/docs to view the interactive Swagger API documentation.***

---
## 📜 License & Legal

**FoundMatch Institutional Capital Allocation OS** Copyright © 2026. All Rights Reserved.

*Disclaimer: FoundMatch utilizes generative AI and experimental cryptographic protocols. Do not use for the deployment of real-world capital without comprehensive legal and human financial due diligence.*
