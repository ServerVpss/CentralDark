# CENTRALDARK CAS CLOUD — VPS Runtime

status: ATIVO_2026-10-06
owner: CENTRALDARK
capability: REMOTE_AGENT_ORCHESTRATION

## O que é

CAS Cloud (`@codeagentswarm/cas-cloud`) é o runtime remoto do CodeAgentSwarm.
Permite que a Casa controle sessões de agentes na VPS CENTRALDARK-OS via relay,
como se fossem agentes locais no desktop.

## Instalação provada

```text
HOST=CENTRALDARK-OS (89.117.78.124)
PACKAGE=@codeagentswarm/cas-cloud@0.0.21
NODE=v22.22.1
INSTALL_PATH=/var/opt/node-v22.22.1-linux-x64/lib/node_modules/@codeagentswarm/cas-cloud
BIN_PATH=/var/opt/node-v22.22.1-linux-x64/bin/cas
LOCAL_BIN=/root/.local/bin (claude, codex)
```

## Agentes instalados via `cas setup`

| Agente | Status | Versão | Path |
|--------|--------|--------|------|
| Claude Code | ✅ | 2.1.291 | /root/.local/bin/claude |
| Codex | ✅ | 0.160.1 | /var/opt/.../bin/codex |
| Antigravity | ✅ | 1.3.0 | /root/.local/bin/agy |
| Opencode | ✅ | 1.18.34 | /var/opt/.../bin/opencode |
| Kimi | ✅ | 2.1.1 | /root/.kimi-code/bin/kimi |
| Grok | ✅ | 1.0.24 | /root/.grok/bin/grok |
| Cursor | ❌ | — | not found |
| Pi | ❌ | — | not found |

## Comandos operacionais

```bash
# PATH necessário (já no .bashrc)
export PATH=/var/opt/node-v22.22.1-linux-x64/bin:/root/.local/bin:$PATH

# Diagnóstico
cas doctor

# Iniciar servidor CAS Cloud
cas serve --project /root/CentralDark

# Parear com cliente desktop
cas link <PAIRING_CODE>

# Status da conexão remota
cas remote-status

# Atualizar
cas update
```

## Topologia

```text
Casa (CodeAgentSwarm Desktop)
  ↕ relay (WebSocket)
VPS CENTRALDARK-OS
  ↕ cas serve
  → claude (agente local)
  → codex (agente local)
  → grok (agente local)
  → /root/CentralDark (projeto)
```

## Integração com CentralDark

```text
CAS_CLOUD_IS_CAPABILITY=true
CAS_CLOUD_IS_NOT_NEW_AUTHORITY=true
CAS_CLOUD_INHERITS_SOUL=true
VPS_AGENTS_INHERIT_CENTRALDARK_CORE=true
REMOTE_AGENT_IS_BODY_NOT_IDENTITY=true
```

CAS Cloud é um braço do mesmo organismo — agentes remotos herdam SOUL, RULES e
o contrato canônico via CLAUDE.md no projeto. Nenhum agente remoto cria governance
paralela.

## Bindings

```text
RELAY=CodeAgentSwarm relay (cloud)
VPS_HOST=89.117.78.124
SSH_ALIAS=Segredo-VPS
PROJECT_ROOT=/root/CentralDark
TAILSCALE_IP=100.118.223.100 (Casa)
GIT_SYNC=cron */5 * * * * auto-sync-main.sh
```

## Cadeados

```text
CAS_INSTALLED != CAS_CONNECTED
CAS_CONNECTED != AGENT_AVAILABLE
AGENT_INSTALLED != AGENT_AUTHENTICATED
cas serve != RELAY_PAIRED
UNKNOWN != PASS
```

## Self-healing

```text
CAS_DOWN → restart cas serve
AGENT_NOT_FOUND → cas setup (reinstala)
RELAY_LOST → cas connect (reconecta)
PATH_BROKEN → source ~/.bashrc
GIT_DRIFT → auto-sync-main.sh (cron)
```

## Proveniência

Instalado pelo CHEFE, verificado e catalogado 2026-10-06.
Commit de prova: (este commit)
