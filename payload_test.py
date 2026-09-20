import requests
import json

url = "https://unlimited-ai-proxy.sportsmoments97.workers.dev/api/chat"
model = "gateway-gpt-5-5"

payloads = [
    {"message": "hi", "model": model},
    {"messages": [{"role": "user", "content": "hi"}], "model": model},
    {"prompt": "hi", "model": model},
    {"text": "hi", "model": model},
    {"message": "hi", "model": model, "stream": True},
    {"message": "hi", "model": "gpt-4o"}
]

for p in payloads:
    print(f"Testing payload: {p}")
    try:
        r = requests.post(url, json=p, timeout=5)
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 10)
