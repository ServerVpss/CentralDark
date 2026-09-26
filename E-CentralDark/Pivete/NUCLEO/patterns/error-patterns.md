# PADRAO - error-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-debug\references\error-patterns.md
**SHA:** 181adb011f797dea
**Timestamp:** 2026-08-26T18:41:02.756317
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Use these MCP queries to quickly detect each error pattern:
- After identifying error pattern:

### Ouro Bruto (primeiros 5000 chars)
```
# Render Deployment Error Patterns

Comprehensive catalog of common deployment errors on Render, their causes, and fixes. Organized by frequency and category.

## MCP Quick Detection

Use these MCP queries to quickly detect each error pattern:

| Error Type | MCP Detection Query |
|------------|-------------------|
| Missing Env Var | `list_logs(resource: ["<id>"], text: ["KeyError", "not defined", "undefined"], limit: 50)` |
| Port Binding | `list_logs(resource: ["<id>"], text: ["EADDRINUSE", "address already in use"], limit: 20)` |
| Missing Dependency | `list_logs(resource: ["<id>"], text: ["Cannot find module", "ModuleNotFoundError"], limit: 50)` |
| Database Connection | `list_logs(resource: ["<id>"], text: ["ECONNREFUSED", "could not connect"], limit: 50)` |
| Health Check | `list_logs(resource: ["<id>"], text: ["Health check", "failed to become healthy"], limit: 20)` |
| OOM | `list_logs(resource: ["<id>"], text: ["heap out of memory", "OOMKilled", "exit code 137"], limit: 20)` |
| Build Failure | `list_logs(resource: ["<id>"], type: ["build"], text: ["error", "failed"], limit: 100)` |

---

## Most Common Errors

### 1. MISSING_ENV_VAR (Most Common)

**Description:** Application crashes because required environment variable is not set.

**MCP Detection:**
```
list_logs(
  resource: ["<service-id>"],
  text: ["KeyError", "not defined", "undefined", "Missing required environment"],
  limit: 50
)
```

**Patterns to Match:**
- `ReferenceError: DATABASE_URL is not defined`
- `TypeError: Cannot read property 'DATABASE_URL' of undefined`
- `KeyError: 'API_KEY'`
- `KeyError: 'JWT_SECRET'`
- `Environment variable not found: DATABASE_URL`
- `Missing required environment variable`
- `process.env.DATABASE_URL is undefined`
- `os.environ['DATABASE_URL'] KeyError`

**Common Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Authentication secret
- `API_KEY` - Third-party API keys
- `SECRET_KEY` - Django secret key
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `SESSION_SECRET` - Session encryption key

**Root Causes:**
1. Variable not declared in render.yaml
2. Variable marked with `sync: false` but user didn't fill in Dashboard
3. Typo in variable name (case-sensitive!)
4. Variable added to code but not to render.yaml

**Fix Strategy:**

**Step 1:** Add to render.yaml
```yaml
envVars:
  # For database connections
  - key: DATABASE_URL
    fromDatabase:
      name: postgres
      property: connectionString

  # For secrets (user fills in Dashboard)
  - key: JWT_SECRET
    sync: false
  - key: API_KEY
    sync: false

  # For generated secrets
  - key: SESSION_SECRET
    generateValue: true

  # For hardcoded config
  - key: NODE_ENV
    value: production
```

**Step 2:** For existing services, use MCP to add env vars directly:
```
update_environment_variables(
  serviceId: "<service-id>",
  envVars: [
    {"key": "DATABASE_URL", "value": "<connection-string>"},
    {"key": "JWT_SECRET", "value": "<secret-value>"}
  ]
)
```

**Step 3:** Commit and push (for Blueprint-managed services):
```bash
git add render.yaml
git commit -m "Add missing environment variables"
git push origin main
```

**Step 4:** If `sync: false` is used, remind user to fill values in Dashboard at:
`https://dashboard.render.com/web/[service-name]/env`

**Prevention:**
- Always declare ALL env vars in render.yaml
- Use `sync: false` for secrets
- Double-check variable names (case-sensitive)
- Test locally with `.env` file first

---

### 2. PORT_BINDING_ERROR (Second Most Common)

**MCP Detection:**
```
list_logs(
  resource: ["<service-id>"],
  text: ["EADDRINUSE", "address already in use", "cannot assign requested address"],
  limit: 20
)
```

**Description:** Application not binding to correct port or host.

**Patterns to Match:**
- `EADDRINUSE: address already in use`
- `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000`
- `Address already in use (os error 48)`
- `Failed to bind to 0.0.0.0:3000`
- `Health check timeout` (often caused by wrong port)
- `cannot assign requested address`

**Root Causes:**
1. App hardcodes port instead of using `$PORT` environment variable
2. App binds to `localhost` or `127.0.0.1` instead of `0.0.0.0`
3. Multiple services trying to use same port
4. App doesn't read PORT environment variable

**Fix Strategy:**

**Node.js / Express:**
```javascript
// Before (WRONG)
app.listen(3000);
app.listen(3000, 'localhost');

// After (CORRECT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Python / Flask:**
```python
# Before (WRONG)
app.run(port=5000)
app.run(host='localhost', port=5000)

# After (CORRECT)
import os
port = int(os.environ.get('PORT', 5000))
app.run(host='0.0.0.0', port=port)
```

**Python / Django (gunicorn):**
```yaml
# In render.yaml startCommand
startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**Go:**
```go
// Before (WR
```