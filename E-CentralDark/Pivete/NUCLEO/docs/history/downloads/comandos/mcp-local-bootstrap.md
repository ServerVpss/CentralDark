# MCP LOCAL BOOTSTRAP PROCEDURE
*Sessão 2026-08-22 — Procedimento validado para subir MCP CentralDark localmente*

---

## Contexto
O MCP CentralDark (`apps/modulos/mcp/`) é um servidor Node.js/TypeScript (MCP SDK v1.29) que expõe 110+ ferramentas via HTTP/SSE em `localhost:9100`. Necessário para dar ao Hermes capacidades nativas (GitHub, VPS, PM2, Supabase, Telegram, etc.).

---

## Pré-requisitos Verificados
- Node.js ≥20 (testado com v26.5.1)
- `package.json` com scripts `build` (tsc) e `start` (node dist/index.js)
- `dist/` já existente no repo (commitado) — build opcional se TS não mudou
- Variáveis de ambiente obrigatórias: `CENTRALDARK_ADMIN_KEY`, `MCP_SESSION_SECRET`

---

## Passo a Passo Validado

### 1. Instalar dependências (se `node_modules` ausente ou `package-lock.json` mudou)
```bash
cd /c/CentralDark/apps/modulos/mcp
npm install
```

### 2. Build TypeScript (se `src/` mudou ou `dist/` ausente)
```bash
npm run build
# ou: npx tsc -p tsconfig.json --noResolve
```

### 3. Criar `.env.local` com mínimas obrigatórias
```bash
cat > .env.local << 'EOF'
MCP_PORT=9100
MCP_PUBLIC_URL=http://localhost:9100
CENTRALDARK_ADMIN_KEY=local-dev-key-123
MCP_SESSION_SECRET=[REDIGIDO-PRESERVACAO]
LOG_LEVEL=debug
LOG_DIR=./logs
VPS_REPO_PATH=/c/CentralDark
PM2_ALLOWED_RESTART=CentralDark-MCP
GITHUB_OWNER=ServerVpss
GITHUB_REPO=CentralDark
EOF
```

> **Nota:** Em produção (VPS), o `ecosystem.config.cjs` injeta 100+ env vars (Supabase, GitHub OAuth, tokens, etc.). Localmente, só as obrigatórias bastam para `/health`, `/status.json`, catálogo de tools.

### 4. Subir servidor (background)
```bash
# Foreground para ver logs de boot:
MCP_PORT=9100 MCP_PUBLIC_URL=http://localhost:9100 \
CENTRALDARK_ADMIN_KEY=local-dev-key-123 \
MCP_SESSION_SECRET=[REDIGIDO-PRESERVACAO] \
LOG_LEVEL=debug LOG_DIR=./logs \
VPS_REPO_PATH=/c/CentralDark \
PM2_ALLOWED_RESTART=CentralDark-MCP \
GITHUB_OWNER=ServerVpss GITHUB_REPO=CentralDark \
node dist/index.js
```

### 5. Validar saúde
```bash
curl -s http://localhost:9100/health
# Esperado: {"ok":true,"service":"mcp-centraldark","version":"0.4.0","catalogVersion":"...","toolCount":110,...}

curl -s http://localhost:9100/status.json
# Catálogo completo: 110 tools, 12 grupos, conectores GitHub/Supabase/VPS
```

---

## Conectores no status.json (o que esperar localmente)

| Conector | Status Local | Produção (VPS) |
|----------|--------------|----------------|
| GitHub API | **OK** (227ms) | OK |
| OAuth GitHub | **WARN** — `GITHUB_CLIENT_SECRET` ausente | OK (secrets no cofre) |
| Supabase | **WARN** — sem env | OK |
| VPS SSH | **WARN** — sem `VPS_SSH_KEY_LOVABLE` | OK |
| Persistência | **OK** — `./logs/mcp-state.json` | OK — `/root/CentralDark/secrets/mcp-state.json` |

> Tools que dependem de secrets (GitHub write, Supabase, VPS SSH) **retornarão erro em runtime** se chamadas sem secrets configurados. O catálogo e `/health` funcionam sem eles.

---

## Encerramento Limpo
```bash
# Se rodou em background via Hermes process tool:
process(action='kill', session_id='<proc_id>')

# Ou Ctrl+C no terminal foreground
```

---

## Troubleshooting Comum

| Erro | Causa | Fix |
|------|-------|-----|
| `ERR_MODULE_NOT_FOUND: express` | `node_modules` ausente | `npm install` |
| `Cannot find package '@modelcontextprotocol/sdk'` | Build não feito ou deps faltando | `npm install && npm run build` |
| `process.exit(2)` no boot | `CENTRALDARK_ADMIN_KEY` ou `MCP_SESSION_SECRET` vazios | Preencher no `.env.local` ou exportar antes |
| Porta 9100 em uso | Outro processo | `lsof -i :9100` → kill ou mudar `MCP_PORT` |
| `/health` retorna mas `/status.json` vazio | Server ainda inicializando | Aguardar 2-3s após boot log "Todas envs obrigatórias presentes" |

---

## Integração com Hermes
Uma vez rodando localmente, o Hermes pode consumir via MCP client apontando para:
- **HTTP/SSE:** `http://localhost:9100/mcp`
- **Tools disponíveis:** 110 (ver `status.json` → `catalog.toolNames`)

---

## Referência Rápida — Variáveis Mínimas vs Completas

| Variável | Mínima Local | Completa VPS (ecosystem.config.cjs) |
|----------|--------------|-------------------------------------|
| `MCP_PORT` | 9100 | 9100 |
| `MCP_PUBLIC_URL` | http://localhost:9100 | https://mcp.centralldark.com |
| `CENTRALDARK_ADMIN_KEY` | local-dev-key-123 | do cofre |
| `MCP_SESSION_SECRET` | local-dev-session-secret-456 | do cofre |
| `LOG_LEVEL` | debug | info |
| `LOG_DIR` | ./logs | /root/CentralDark/logs |
| `VPS_REPO_PATH` | /c/CentralDark | /root/CentralDark |
| `GITHUB_OWNER` | ServerVpss | ServerVpss |
| `GITHUB_REPO` | CentralDark | CentralDark |
| `GITHUB_CLIENT_ID` | — | Ov23li1y2mZ3qbjVB4mC |
| `GITHUB_CLIENT_SECRET` | — | **do cofre** |
| `GITHUB_OAUTH_CALLBACK` | — | do cofre |
| `SUPABASE_SERVICE_KEY` | — | do cofre |
| `SUPABASE_DB_URL` | — | do cofre |
| `MCP_GITHUB_TOKEN` | — | do cofre |
| `VPS_SSH_KEY_LOVABLE` | — | do cofre |
| `VPS_HOST_LOVABLE` | — | do cofre |

---

## Lição de Ouro
**O MCP local sobe em <30s com 3 comandos** (`npm install` + `npm run build` + `node dist/index.js` com envs mínimas). O catálogo de 110 tools fica disponível imediatamente para o Hermes. Secrets só são necessários para *executar* tools destrutivas/escritas — leitura e catálogo funcionam sem eles.