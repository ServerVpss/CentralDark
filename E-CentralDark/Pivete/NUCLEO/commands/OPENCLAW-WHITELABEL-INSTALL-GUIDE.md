# COMANDO - OPENCLAW-WHITELABEL-INSTALL-GUIDE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\squads\autoclaw\data\OPENCLAW-WHITELABEL-INSTALL-GUIDE.md
**SHA:** c6d8d3a2ecc58868
**Timestamp:** 2026-08-28T02:19:22.698065
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ExecStart=/usr/bin/node /opt/openclaw/dist/index.js
- Restart=always
- --restart=always \

### Ouro Bruto (primeiros 5000 chars)
```
# Guia de Instalação Whitelabel — OpenClaw + AIOS

> **Versão:** 1.0 | **Data:** 2026-02-14 | **Autor:** @architect (Aria)
> **Pré-requisito:** AIOS-Core instalado | **Tempo estimado:** 2-4h
> **Referência:** [OPENCLAW-ARCHITECTURE-ANALYSIS.md](./OPENCLAW-ARCHITECTURE-ANALYSIS.md)

---

## Índice

1. [Pré-Requisitos](#1-pré-requisitos)
2. [Fase 1 — Instalar OpenClaw Gateway](#2-fase-1--instalar-openclaw-gateway)
3. [Fase 2 — Configurar VPS Hetzner + Tailscale](#3-fase-2--configurar-vps-hetzner--tailscale)
4. [Fase 3 — Customizar Identidade Whitelabel](#4-fase-3--customizar-identidade-whitelabel)
5. [Fase 4 — Configurar LLM Router](#5-fase-4--configurar-llm-router)
6. [Fase 5 — Instalar Skills AIOS](#6-fase-5--instalar-skills-aios)
7. [Fase 6 — Segurança (3 Layers)](#7-fase-6--segurança-3-layers)
8. [Fase 7 — Integrar com Claude Code (Hooks + Bridge)](#8-fase-7--integrar-com-claude-code-hooks--bridge)
9. [Fase 8 — Configurar N8N + Portainer](#9-fase-8--configurar-n8n--portainer)
10. [Fase 9 — Conectar Canais](#10-fase-9--conectar-canais)
11. [Fase 10 — Validação Final](#11-fase-10--validação-final)
12. [Workflow de Agentes AIOS](#12-workflow-de-agentes-aios)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Pré-Requisitos

### Software Local
- **Node.js** ≥ 22 (exigido pelo OpenClaw)
- **pnpm** (package manager do OpenClaw)
- **Git**
- **Claude Code** CLI instalado e autenticado
- **Tailscale** client instalado no desktop
- **AIOS-Core** clonado e configurado

### Contas Necessárias
- [Hetzner Cloud](https://console.hetzner.cloud/) — VPS
- [Tailscale](https://tailscale.com/) — VPN mesh
- [OpenRouter](https://openrouter.ai/) — LLM routing
- [Anthropic](https://console.anthropic.com/) — API fallback
- [Supabase](https://supabase.com/) — Database
- [ClickUp](https://clickup.com/) — Project management (opcional)
- [Cloudflare](https://dash.cloudflare.com/) — DNS + SSL (opcional)

### API Keys para preparar
```env
# Obter ANTES de iniciar
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLICKUP_API_KEY=           # Se usar ClickUp
SLACK_ALERTS_WEBHOOK_URL=  # Se usar Slack alerts
```

---

## 2. Fase 1 — Instalar OpenClaw Gateway

### 2.1 Clonar e Buildar

```bash
# Clonar repositório oficial
git clone https://github.com/nicepkg/openclaw.git
cd openclaw

# Instalar dependências
pnpm install

# Buildar UI e core
pnpm ui:build
pnpm build

# Testar localmente
pnpm openclaw onboard --install-daemon
pnpm openclaw gateway --port 18789 --verbose
```

### 2.2 Verificar Instalação Local

```bash
# Verificar que o gateway está rodando
openclaw doctor

# Enviar mensagem de teste
openclaw agent --message "Olá! Teste de instalação." --thinking high
```

> **Checkpoint:** O gateway deve responder na porta 18789 localmente.

---

## 3. Fase 2 — Configurar VPS Hetzner + Tailscale

### 3.1 Criar VPS no Hetzner

1. Acessar [Hetzner Console](https://console.hetzner.cloud/)
2. Criar servidor:
   - **Localização:** Helsinki (ou mais próximo do seu público)
   - **Imagem:** Ubuntu 22.04
   - **Tipo:** CX22 ou superior (2 vCPU, 4GB RAM)
   - **SSH Key:** Adicionar sua chave pública

```bash
# Conectar via SSH
ssh root@<IP_DO_SERVIDOR>

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar ferramentas essenciais
apt install -y git docker.io docker-compose-plugin
```

### 3.2 Instalar Tailscale no VPS

```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Autenticar (abre link no browser)
tailscale up --hostname=meu-gateway

# Habilitar Funnel para HTTPS público (opcional)
tailscale funnel 18789

# Verificar
tailscale status
```

### 3.3 Instalar Tailscale no Desktop

```powershell
# Windows — baixar de https://tailscale.com/download
# Após instalar, autenticar com a mesma conta

# Verificar conectividade
tailscale ping meu-gateway
```

### 3.4 Deploy OpenClaw no VPS

```bash
# No VPS
cd /opt
git clone https://github.com/nicepkg/openclaw.git
cd openclaw

pnpm install
pnpm ui:build
pnpm build

# Configurar daemon
pnpm openclaw onboard --install-daemon

# Iniciar gateway
pnpm openclaw gateway --port 18789 --verbose
```

### 3.5 Configurar como Serviço (systemd)

```bash
cat > /etc/systemd/system/openclaw.service << 'EOF'
[Unit]
Description=OpenClaw AI Agent Gateway
Documentation=https://github.com/nicepkg/openclaw
After=network.target docker.service tailscaled.service
Wants=docker.service tailscaled.service

[Service]
Type=simple
User=openclaw
Group=openclaw
WorkingDirectory=/opt/openclaw
ExecStart=/usr/bin/node /opt/openclaw/dist/index.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/openclaw/.env

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/openclaw/data /opt/openclaw/logs

# Resource limits
MemoryMax=3G
CPUQuota=80%

# L
```