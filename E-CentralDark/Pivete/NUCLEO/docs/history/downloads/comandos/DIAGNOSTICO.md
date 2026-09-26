# Diagnóstico — evidência VPS 2026-08-01

## Fonte

- `/root/centraldark-evidence/vps-security-20260801T012504Z`
- `/root/centraldark-evidence/port-map-20260801T013449Z/report.txt`
- Placar Hermes-Verificador (sessão anterior)
- Leitura repo `ServerVpss/CentralDark` (workflows, ecosystem, doutrina)

---

## 1. Controlo de acesso SSH

| Item | Valor | Avaliação |
|------|--------|-----------|
| fail2ban | active, jail sshd | OK |
| Currently banned | 123 | OK (sob ataque constante, típico Contabo) |
| Total banned | 709 | Esperado em IP público |
| Total failed | 2009 | Esperado |
| SSH port | 22 | Aceitável; opcional mudar depois |
| Auth | (hardening não trocou) | Não quebrar login sem plano |

**Não mexer em autenticação SSH nesta rodada.** Já está com ban ativo.

---

## 2. UFW — problemas reais

### Regras problemáticas

```
[2] 3000/tcp  DENY IN  Anywhere
[3] 3000      ALLOW IN Anywhere   ← conflito com [2]
[4] 9000/tcp  ALLOW IN Anywhere   ← webhook sistema exposto
[8] 80/tcp    ALLOW IN            ← OK
[9] 443/tcp   ALLOW IN            ← OK
[1] 22/tcp    ALLOW IN            ← OK
[12] 8080/tcp DENY IN             ← OK se só interno
```

Regra **ALLOW 3000** sem `/tcp` e **DENY 3000/tcp** ao mesmo tempo = bagunça.  
Default incoming = deny. Qualquer porta **não listada** deveria estar fechada — mas processos escutando em `0.0.0.0` ainda são alcançáveis se UFW permitir ou se houver bypass.

### Portas escutando publicamente (ss)

| Porta | Processo | Bind | Deveria ser |
|-------|----------|------|-------------|
| 3000 | docker-proxy → Open WebUI | 0.0.0.0 | Preferir só via 80/443 (Caddy) ou DENY direto + proxy |
| 3090 | artifacts-builder orchestrator | 0.0.0.0 | **127.0.0.1** |
| 8082 | elite-anthropic-proxy (uvicorn) | 0.0.0.0 | **127.0.0.1** (sai por api.centralldark.com) |
| 8083 | apps/modulos/proxy (uvicorn) | 0.0.0.0 | **127.0.0.1** |
| 8090 | arsenal-openai-adapter | 0.0.0.0 | **127.0.0.1** |
| 8899 | HERMES-CORE orchestrator | 0.0.0.0 | **127.0.0.1** |
| 9000 | /usr/bin/webhook (systemd) | * | **127.0.0.1** ou fechar; não confundir com WebhookDeploy PM2 |
| 9077 | uvicorn em container Docker | 0.0.0.0 | Mapear só 127.0.0.1 no publish |

### Docker (sanitizado)

- Open WebUI: `0.0.0.0:3000->8080` — exposição direta
- Builder / HermesThinker / Portainer / Wuzapi: já em 127.0.0.1 em vários casos — bom
- Portainer: 127.0.0.1:9443 — correto

---

## 3. PM2 — alinhamento com placar

Online e relevantes:

- MCP, Hermes, GraphPanel, ArsenalProxy, EliteHTTP (via start-fallback), ArsenalAdapter, HubBot, Guardioes, etc.
- **WebhookDeploy: stopped** — alinhado com deploy self-hosted canônico. Manter stopped.
- AiDiag: stopped — ok se intencional

Histórico de restarts (placar): ArsenalProxy ~5576, EliteHTTP ~5308, MCP ~843 → **não é normal**.  
Bind público + crash-loop = atacável e instável.

---

## 4. O que o hardening já aplicou

```
STATUS=APPLIED
FAIL2BAN=ACTIVE
SSH_CONFIG=VALID
UFW_ACTIVE=active
UFW_NOT_CHANGED=true   ← importante
UNEXPECTED_TCP=3000 3090 8082 8083 8090 8899 9000 9077
PM2_CHANGED=false
REPOSITORY_CHANGED=false
```

O script foi **prudente**: não fechou UFW às cegas porque as portas não estavam no mapa de allow.  
Agora o mapa existe → dá para fechar com precisão.

---

## 5. Prioridade de risco

| Prioridade | Item | Por quê |
|------------|------|---------|
| P0 | Secrets no ecosystem/Git | Compromisso total se vazar |
| P0 | 8082/8083/8090/8899 em 0.0.0.0 | Gateways e núcleo Hermes na internet crua |
| P1 | Conflito UFW 3000 + 9000 público | Superfície e regras mentindo |
| P1 | Crash-loop proxies | Disponibilidade e possível abuse |
| P2 | Open WebUI só por 3000 | Preferir Caddy + auth |
| P3 | SSH porta 22 | Cosmético se fail2ban ok |

---

## 6. Modelo alvo (simples)

```
Internet
   │
   ▼
UFW: 22, 80, 443 (somente)
   │
   ▼
Caddy (TLS, roteamento)
   │
   ├── 127.0.0.1:8082  elite-anthropic
   ├── 127.0.0.1:8083  proxy
   ├── 127.0.0.1:8090  arsenal adapter
   ├── 127.0.0.1:8899  hermes
   ├── 127.0.0.1:9100  MCP (já deve ser interno + edge)
   ├── 127.0.0.1:3090  artifacts
   └── docker 127.0.0.1:xxxx
```

Nada de gateway de IA ou orchestrator escutando o mundo.