# COMANDO - services.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\catalyst-by-zoho\skills\catalyst-by-zoho\references\services.md
**SHA:** 9c52ee2704e39970
**Timestamp:** 2026-08-26T18:31:14.311476
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm install
- - run: npm test
- - run: catalyst deploy --only functions

### Ouro Bruto (primeiros 5000 chars)
```
# Catalyst Services Reference

## Table of Contents
1. [AppSail (PaaS Compute)](#appsail)
2. [Circuits (Workflow Orchestration)](#circuits)
3. [SmartBrowz (Headless Browser)](#smartbrowz)
4. [ConvoKraft (Conversational Bots)](#convokraft)
5. [Slate (Frontend Deployment)](#slate)
6. [Pipelines (CI/CD)](#pipelines)
7. [QuickML (Machine Learning)](#quickml)
8. [Signals (Event Bus)](#signals)
9. [Job Scheduling](#job-scheduling)
10. [Zia Services (AI/ML)](#zia-services)
11. [DevOps (Monitoring & Logs)](#devops)
12. [CodeLib (Pre-built Solutions)](#codelib)
13. [Tunneling (Local Dev Exposure)](#tunneling)
14. [Catalyst Tools (VS Code Extension)](#catalyst-tools)
15. [Zia AI Assistant (In-Console AI)](#zia-ai-assistant)

---

## AppSail

AppSail is Catalyst's PaaS (Platform-as-a-Service) for deploying full applications, as opposed to individual functions.

### When to use AppSail vs Functions
- **Functions**: Stateless, event-driven, auto-scaling, pay-per-execution. Best for APIs, webhooks, scheduled tasks.
- **AppSail**: Persistent server process with managed runtimes or custom Docker. Best for full web apps, long-running processes, WebSockets.

### Catalyst-Managed Runtimes
Pre-configured environments:
- **Node.js**: Express, Hapi, Koa, Fastify, Restify
- **Java**: Embedded Jetty, Spring MVC, Spring Boot
- **Python**: Flask, Django, Bottle, CherryPy, Tornado

### Custom Runtimes (Docker)
Deploy any language/framework as OCI container images:
- Go, Kotlin, Dart, Ruby, PHP, Deno, Bun, Rust — anything with a Dockerfile
- Push to Catalyst's Container Registry or pull from external registries

### AppSail project structure (Node.js + Express example)
```
appsail/
├── app.js                    # Main application file
├── package.json
├── catalyst-config.json      # AppSail configuration
└── node_modules/
```

### catalyst-config.json for AppSail
```json
{
  "name": "my-app",
  "stack": "node20",
  "command": "node app.js",
  "memory": 512,
  "port": 9000
}
```

The `port` must match what your app listens on. Catalyst routes traffic to this port.

### AppSail with Express.js
```javascript
// appsail/app.js
const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from AppSail!' });
});

app.get('/api/users', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const zcql = catalystApp.zcql();
    const users = await zcql.executeZCQLQuery('SELECT * FROM Users LIMIT 50');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Important: In AppSail, always use `process.env.X_ZOHO_CATALYST_LISTEN_PORT` as the port, with a fallback
for local development.

### AppSail with Docker (Custom Runtime)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 9000
CMD ["node", "app.js"]
```

### Deployment
```bash
# Deploy AppSail from CLI
catalyst deploy --only appsail

# For Docker-based deployment
catalyst appsail:deploy --docker
```

### AppSail Configurations
- **Instances**: 1-5 instances for auto-scaling
- **Memory**: 256MB to 2048MB per instance
- **Health checks**: Configure health check endpoints
- **Environment variables**: Set via console (see warning below)
- **Custom domains**: Map via Domain Mappings

### AppSail environment variables — Console only

**`app.yaml` environment variables are NOT applied at deploy time.** AppSail ignores them entirely.

The **only** way to set environment variables for AppSail is through the Catalyst Console:

> Catalyst Console → AppSail → \<service\> → Configuration → Environment Variables

This applies to all env vars including secrets, API keys, and table names. Do not rely on
`app.yaml`, `.env` files, or `catalyst-config.json` `env_variables` for AppSail services.

Note: For serverless Functions, `env_variables` in `catalyst-config.json` DO work and are
deployed with the function. This limitation is specific to AppSail.

### Slate + AppSail cross-origin issue

A Slate-hosted frontend calling AppSail APIs may get `"Unable to Fetch"` or `"Failed to fetch"`
errors due to Catalyst's auth layer on AppSail.

**Solution — serve the frontend from AppSail itself (same-origin):**

```javascript
const path = require('path');
const express = require('express');
const app = express();

// API routes first
app.get('/api/data', async (req, res) => { /* ... */ });

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

Copy your frontend build output into `public/` inside the AppSail
```