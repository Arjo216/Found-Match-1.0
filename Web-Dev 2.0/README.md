### 3. The Backend (`backend/README.md`)
*This focuses on your high-performance Python code, Sentry security, AI routing, and the database fortress.*

```markdown
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

3. Install & Run
```Bash
# Install required Python packages
pip install -r requirements.txt

# Start the Uvicorn ASGI server
uvicorn main:app --reload --port 8000
Visit http://localhost:8000/docs to view the interactive Swagger API documentation.