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
├── frontend/             # Next.js 14 Client (UI, WebCrypto API, WebSockets)
├── backend/              # FastAPI Server (Auth, RLS Admin, Sentry, ML Router)
├── ml_engine/            # PyTorch Pipelines (LightGCN & NLP Models)
├── data/                 # Processed Datasets & Model Weights (.pth)
└── docker-compose.yml    # Full-stack Container Orchestration
```

### ⚡ Quick Start (Docker)
Launch the entire ecosystem with a single command:

```Bash
# 1. Clone the repository
git clone [https://github.com/Arjo216/Found-Match-1.0.git](https://github.com/Arjo216/Found-Match-1.0.git)
cd Found-Match-1.0

# 2. Build and launch all microservices
docker-compose up --build
```
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
DATABASE_URL=postgresql://user:password@localhost/foundmatch
SECRET_KEY=your_jwt_secret
GROQ_API_KEY=gsk_your_api_key_here
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
