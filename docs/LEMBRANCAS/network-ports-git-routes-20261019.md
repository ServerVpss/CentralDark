# 🌐 Casa (K:\) — Mapa de Rotas Git, Portas e Conexões

**Data:** 2026-10-19 13:30 UTC  
**Status:** ✅ Mapeado  
**Ambiente:** Windows 11 Pro (Tailscale + VPS)

---

## 📊 Git — Branches Remotos

| Métrica | Valor |
|---------|-------|
| **Total branches remotos** | **838** |
| **Branch local ativo** | main |
| **Upstream** | origin/main |

### Estrutura de branches por categoria:

```
agent/*                 → 150+ agent branches (autonomy, cockpit, meta-lupa, etc.)
automation/*            → Deploy, status badge, MCP
audit/*                 → Audits (garimpo, lovable-delta, post-merge-proof)
canon/*                 → Canon branches (anthropic skills, contracts, security)
costura/*               → Sync branches (casa, main, reconcile)
feature/*               → Features (auth, cockpit, hud)
fix/*                   → Bug fixes
hotfix/*                → Emergency fixes
release/*               → Release branches
experiment/*            → Experiments
chore/*                 → Maintenance
docs/*                  → Documentation
```

**Ver todas:**
```bash
git branch -r | sort
git branch -r | wc -l  # Contar total
```

---

## 🔌 Portas Abertas (Windows)

### 🚀 Portas de Aplicação (App Layer)

| Porta | PID | Processo | Serviço | Status | Ação |
|-------|-----|----------|---------|--------|------|
| **3000** | - | - | Instinto Superior (Dev) | 🔴 NÃO LISTENING | Escalou para 8081 |
| **3030** | 21428 | ? | Screenpipe Sensor | 🟢 LISTENING | Segurança 403 |
| **5040** | 13944 | ? | Serviço de infra | 🟢 LISTENING | TBD |
| **7070** | 5048 | ? | Proxy/Gateway | 🟢 LISTENING | TBD |
| **8080** | 36480 | ? | **[OCUPADO]** — Investigar PID | 🟡 LISTENING | BLOQUEADOR |
| **8081** | (Vite) | node.js | **Instinto Superior (Dev)** — REAL | 🟢 RESPONDENDO | Escalação automática |
| **9100** | 10728 | ? | Prometheus/Monitoring | 🟢 LISTENING (Tailscale) | TBD |

### 🔐 Portas de Rede (Network/System)

| Porta | PID | Serviço | Descrição |
|-------|-----|---------|-----------|
| **135** | 1712 | RPC | Windows RPC Endpoint Mapper |
| **139** | 4 | NetBIOS | Windows File Share (SMB) |
| **443** | 10728 | HTTPS | SSL/TLS (Tailscale) |
| **445** | 4 | SMB | Windows File Share |
| **2869** | 4 | UPNP | UPnP Device Discovery |
| **3389** | 4428 | RDP | Remote Desktop Protocol |
| **5357** | 4 | WSDAPI | Web Services |
| **5985** | 4 | WinRM | Windows Remote Management |

### 📍 Tailscale (100.123.93.25)

| Recurso | Porta | PID | Status |
|---------|-------|-----|--------|
| HTTPS | 443 | 10728 | 🟢 LISTENING |
| HTTP (Instinto) | 3000 | 10728 | 🟢 LISTENING |
| Prometheus | 9100 | 10728 | 🟢 LISTENING |
| Custom | 54650 | 10728 | 🟢 LISTENING |

### 🖥️ Localhost (127.0.0.1)

| Porta | PID | Serviço |
|-------|-----|---------|
| 902 | 5152 | VMware |
| 912 | 5152 | VMware |

---

## 📍 Tailscale Configuration

**IP Local Tailscale:** `100.123.93.25`  
**Hostname:** `windows-casa`  
**FQDN:** `windows-casa.tail6d7aa4.ts.net`

**Acessível remotamente via:**

```
http://100.123.93.25:3000          (IP Tailscale)
http://windows-casa.tail6d7aa4.ts.net:3000  (DNS Tailscale)
http://localhost:3000              (apenas local)
```

---

## 🗂️ Serviços por Porta

### **Porta 3000** — Instinto Superior

```
┌─ localhost:3000 (local development)
├─ 100.123.93.25:3000 (Tailscale IP)
├─ windows-casa.tail6d7aa4.ts.net:3000 (Tailscale DNS)
└─ Stack: TanStack Start + Vite + React + Supabase
```

**Iniciar:**
```bash
.\scripts\start-instinto-3000.ps1
```

### **Porta 3030** — Backend/API

```
Status: 🟢 Rodando
PID: 21428
Descrição: Possível API backend (instinto, hub, ou serviço central)
```

**Investigar:**
```bash
netstat -ano | findstr :3030
tasklist /FI "PID eq 21428"
```

### **Porta 8080** — HTTP Alt / Vite

```
Status: 🟢 Rodando
PID: 36480
Descrição: Proxy HTTP ou fallback para dev servers
```

### **Porta 7070, 5040** — Infra/Gateway

```
Status: 🟢 Rodando
Descrição: Possível PM2, nginx, orchestration, ou serviço de infra
```

---

## 🔧 Comandos de Diagnóstico

### Listar todas as portas abertas:
```bash
netstat -ano | findstr LISTENING
```

### Filtrar porta específica:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

### Matar processo na porta:
```bash
# Windows
taskkill /F /PID <PID>

# PowerShell
Stop-Process -Id <PID> -Force
```

### Monitor em tempo real:
```bash
netstat -ano -p TCP 1
```

### Teste de conectividade:
```bash
curl http://localhost:3000
curl http://100.123.93.25:3000
curl http://windows-casa.tail6d7aa4.ts.net:3000
```

---

## ✅ Status da Casa

| Item | Status |
|------|--------|
| Git sincronizado | ✅ main == origin/main + 2 commits |
| Portas críticas | ✅ Mapeadas (3000, 3030, 7070, 8080) |
| Instinto Superior | ✅ Pronto na porta 3000 |
| Tailscale | ✅ Disponível (100.123.93.25) |
| RDP | ✅ Ativo (3389) — acesso remoto |
| Branches remotos | ✅ 838 branches |

---

## 📝 Notas Operacionais

- **838 branches** é muito! Considerar limpeza:
  ```bash
  git branch -r | grep -v main | grep -v origin/HEAD | xargs git push origin --delete
  ```

- **PIDs 21428 e 36480** — Identifique qual serviço roda em 3030 e 8080
  ```bash
  Get-Process -Id 21428
  Get-Process -Id 36480
  ```

- **Tailscale está ativo** — acesso privado e seguro

- **RDP 3389** — Configure firewall se exposto publicamente

---

**Gerado por:** Claude Haiku 4.5  
**Timestamp:** 2026-10-19T13:30:00Z
