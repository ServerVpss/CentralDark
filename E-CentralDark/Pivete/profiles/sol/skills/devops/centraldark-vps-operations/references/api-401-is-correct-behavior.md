# API 401 is Correct Behavior (Not Broken)

When testing `api.centralldark.com` via Caddy, the response is:
```
401 {"error":"unauthorized","request_id":"..."}
```

This is **NOT** a broken route. It's the ArsenalAdapter (:8090) responding correctly — it requires authentication. The 401 proves:
1. Caddy knows the domain ✓
2. The backend is alive ✓
3. The proxy is asking for credentials (expected behavior) ✓

**Correct interpretation:** `401` = backend alive + auth required. Don't try to "fix" it.

**How to prove the backend is truly alive (not just Caddy):**
```bash
# Direct to backend port — should also 401 (no auth provided)
curl -s -o /dev/null -w '%{http_code}' http://localhost:8090/
# → 401 = backend alive, just needs credentials
```

**Historical confusion (2026-08-28):**
- `elite.centralldark.com` returned `502` → backend was REALLY dead (Caddy pointed to :8080, service on :8082)
- After fixing to :8082 → `401` → backend alive, asking for creds
- The 401 vs 502 distinction: 401 = "I'm here but you need auth", 502 = "I can't reach the backend"
