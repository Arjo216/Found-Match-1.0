import requests
import time

# Target the root or health endpoint
URL = "http://127.0.0.1:8000/health"

print("🚀 Initiating Volumetric Attack Simulation...")

for i in range(1, 160):
    try:
        response = requests.get(URL)
        print(f"Request {i}: Status {response.status_code}")
        
        if response.status_code == 429:
            print("⚠️  [THROTTLE] Sentry deployed Rate Limiting (429).")
        elif response.status_code == 403:
            print("🛑 [LOCKDOWN] Sentry permanently blacklisted the IP (403)!")
            break # The test is complete
            
    except requests.exceptions.ConnectionError:
        print("Connection severed by host.")
        break
        
    time.sleep(0.01) # Fire rapidly