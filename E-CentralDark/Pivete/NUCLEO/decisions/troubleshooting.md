# DECISAO - troubleshooting.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-debug\references\troubleshooting.md
**SHA:** e7e1076db7c50d62
**Timestamp:** 2026-08-26T18:41:02.988811
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Move slow operations after server start:

### Ouro Bruto (primeiros 5000 chars)
```
# Render Troubleshooting Guide

Systematic debugging procedures and fix strategies for common Render deployment issues.

## General Debugging Process

### The 5-Step Debugging Method

1. **Identify** - What's failing? (Build, deploy, runtime?)
2. **Locate** - Where's the error? (Logs, error messages)
3. **Diagnose** - Why is it failing? (Root cause)
4. **Fix** - Apply appropriate solution
5. **Verify** - Test the fix works

### Debug Priority Checklist

When facing deployment issues, check in this order:

- [ ] Environment variables (Most common)
- [ ] Port binding (Second most common)
- [ ] Dependencies installed correctly
- [ ] Database connections configured
- [ ] Build command successful
- [ ] Start command correct
- [ ] Health check endpoint exists
- [ ] Resource limits (memory, CPU)

## Issue Category 1: Environment Variables

### Problem: Missing Environment Variable

**Symptoms:**
- `ReferenceError: DATABASE_URL is not defined`
- `KeyError: 'API_KEY'`
- Service crashes immediately after start

**Diagnosis Steps:**

1. Check logs for variable name:
```bash
render logs -r <service-id> --level error -o json | grep "not defined"
```

2. List current environment variables:
```bash
# In Dashboard or render.yaml
```

3. Identify which variable is missing

**Fix Procedure:**

**Step 1:** Add to render.yaml

For database connections:
```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: postgres
      property: connectionString
```

For secrets (user provides):
```yaml
envVars:
  - key: JWT_SECRET
    sync: false
  - key: API_KEY
    sync: false
```

For generated values:
```yaml
envVars:
  - key: SESSION_SECRET
    generateValue: true
```

For hardcoded config:
```yaml
envVars:
  - key: NODE_ENV
    value: production
```

**Step 2:** Commit and push
```bash
git add render.yaml
git commit -m "Add missing environment variable: DATABASE_URL"
git push origin main
```

**Step 3:** If using `sync: false`, instruct user:
1. Go to Dashboard: `https://dashboard.render.com/web/[service]/env`
2. Fill in the secret value
3. Click "Save Changes"

**Step 4:** Redeploy
```bash
render deploys create <service-id> --wait
```

**Verification:**
```bash
render logs -r <service-id> --tail -o text
# Should see successful startup
```

---

## Issue Category 2: Port Binding

### Problem: Port Binding Error

**Symptoms:**
- `EADDRINUSE: address already in use`
- `Health check timeout`
- Service starts but doesn't receive traffic

**Diagnosis Steps:**

1. Check if app hardcodes port:
```bash
# Look for hardcoded ports in code
grep -r "listen(3000" .
grep -r "port.*=" . | grep -v "process.env"
```

2. Check if binding to localhost:
```bash
grep -r "localhost" .
grep -r "127.0.0.1" .
```

**Fix Procedure by Language:**

**Node.js / Express:**

Before (WRONG):
```javascript
app.listen(3000);
// or
app.listen(3000, 'localhost');
```

After (CORRECT):
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Python / Flask:**

Before (WRONG):
```python
app.run(port=5000)
```

After (CORRECT):
```python
import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

**Python / Django:**

Ensure gunicorn uses $PORT:
```yaml
# In render.yaml
startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**Go:**

Before (WRONG):
```go
http.ListenAndServe(":3000", handler)
```

After (CORRECT):
```go
port := os.Getenv("PORT")
if port == "" {
    port = "3000"
}
http.ListenAndServe(":"+port, handler)
```

**Verification:**
```bash
# Should see message like "Server running on port 10000"
render logs -r <service-id> --tail -o text
```

---

## Issue Category 3: Database Connection

### Problem: Cannot Connect to Database

**Symptoms:**
- `ECONNREFUSED 127.0.0.1:5432`
- `could not connect to server`
- `Connection refused`

**Diagnosis Steps:**

1. Check if DATABASE_URL is set:
```bash
# Look in render.yaml
grep "DATABASE_URL" render.yaml
```

2. Verify database is provisioned:
```bash
render services -o json
# Look for database service
```

3. Check connection code

**Fix Procedure:**

**Step 1:** Ensure DATABASE_URL in render.yaml
```yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: postgres
      property: connectionString

databases:
  - name: postgres
    databaseName: myapp_prod
    plan: free
```

**Step 2:** Configure SSL if needed

**Node.js / pg:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

**Python / psycopg2:**
```python
import psycopg2

conn = psycopg2.connect(
    os.environ['DATABASE_URL'],
    sslmode='require'
)
```

**Step 3:** Add connection pooling

**Node.js:**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  # Maximum
```