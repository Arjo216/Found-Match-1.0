# utils/sentry.py
import time
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# In-memory tracking (For massive scaling later, we will migrate this to Redis)
REQUEST_HISTORY = {}
BLACKLIST = set()

# Security Parameters
TIME_WINDOW_SEC = 60      # 1 minute rolling window
MAX_REQUESTS_PER_MIN = 60 # Strict limit: 1 request per second average
ANOMALY_THRESHOLD = 150   # Instant ban threshold (Scraper detection)

class AutonomousSentryMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Identify the actor
        client_ip = request.client.host
        
        # 2. Check the Blacklist First (Zero-Trust)
        if client_ip in BLACKLIST:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Security Protocol: IP blacklisted for anomalous reconnaissance behavior."}
            )
            
        # 3. Volumetric Traffic Analysis
        current_time = time.time()
        if client_ip not in REQUEST_HISTORY:
            REQUEST_HISTORY[client_ip] = []
            
        # Prune old request timestamps outside the 60-second window
        REQUEST_HISTORY[client_ip] = [t for t in REQUEST_HISTORY[client_ip] if current_time - t < TIME_WINDOW_SEC]
        
        request_count = len(REQUEST_HISTORY[client_ip])
        
        # 4. Autonomous Threat Response
        if request_count >= ANOMALY_THRESHOLD:
            BLACKLIST.add(client_ip)
            print(f"[🛡️ SENTRY] THREAT DETECTED: IP {client_ip} permanently blacklisted for data scraping.")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Security Protocol: Network breach averted. IP Locked."}
            )
            
        if request_count >= MAX_REQUESTS_PER_MIN:
            print(f"[🛡️ SENTRY] RATE LIMIT: IP {client_ip} is moving too fast.")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Network Latency limit exceeded. Please slow your requests."}
            )
            
        # Log the legitimate request
        REQUEST_HISTORY[client_ip].append(current_time)
        
        # 5. Process the Request
        response = await call_next(request)
        
        # 6. Inject Hardened Security Headers (Preventing XSS, Clickjacking, and Sniffing)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response