# --- Stage 1: Builder (Compiling & Installing) ---
FROM python:3.11-slim AS builder

# 1. System dependencies (for building Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install Python Dependencies
# We copy requirements first to use Docker caching
COPY ["Web-Dev 2.0/requirements.txt", "."] 

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    # Install Torch CPU version specifically to keep image size small
    && /opt/venv/bin/pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# --- Stage 2: Runtime (Lightweight & Secure) ---
FROM python:3.11-slim

# 3. Create non-root user for security
RUN useradd --create-home appuser
WORKDIR /app

# 4. Copy Virtual Environment from Builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 5. MONOREPO SETUP (The Critical Part)
# We copy all three necessary folders from the project root
# NOTE: This works because docker-compose builds from the Root Context
# CRITICAL FIX: Use quotes because your folder has spaces
COPY --chown=appuser:appuser ["Web-Dev 2.0/", "/app/backend/"]
COPY --chown=appuser:appuser ml_engine/ /app/ml_engine/
COPY --chown=appuser:appuser data/ /app/data/

# 6. Configure Python Path
# This tells Python: "Look in /app folder to find ml_engine imports"
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Switch to secure user
USER appuser

EXPOSE 8000

# 7. Start Command
# Note: We run "backend.main:app" because we are sitting in the root /app folder
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]