# SOUL-SOL Fluxo Canônico Atualizado + Revisão de Bots — 2026-09-05

## SOUL-SOL.md — Fluxo Operacional Canônico (Substitui Cadeia Linear)

**Commit**: `449b01271` → `origin/main` (rebase aplicado sobre `5821c675c`)

### Fluxo Novo (Canônico)

```
INTENÇÃO (SEGREDO/CHEFE)
→ HISTORY RENDEZVOUS
  ┌─────────────────────┼─────────────────────┐
  ▼                     ▼                     ▼
PASSADO                PRESENTE              FUTURO
PRs / commits /         main viva /            novo delta /
branches / testes      runtime / owners       nova capacidade
  │                     │                     │
  └─────────────────────┼─────────────────────┘
                        ▼
            CAPABILITY LINEAGE
                        │
                        ▼
               DEDUPE / ABSORB
                        │
                        ▼
             ONE SURVIVING DELTA
                        │
                        ▼
                  ☀️ SOL coordena
                        │
                        ▼
                 🧭 MULTIBÚSSOLA
                        │
                        ▼
                    ⊛ META LUPA
                        │
                        ▼
                  ONE WRITER
                        │
                        ▼
                 ☿ HERMES EXECUTA
                        │
                        ▼
                  CONTRAPROVA
                        │
                        ▼
                   REMEDIÇÃO
                        │
                        ▼
                  ⚖ REALITY JUDGE
                        │
                        ▼
                  FIXED_POINT
                        │
                        ▼
                     REGISTRA
                        │
                        ▼
              GRAFO / RECEIPT / CURSOR
                        │
                        ▼
                      BOOT
↺ CARACOL REVERSO quando houver divergência
```

### Mudanças Chave vs Versão Anterior
- **Antes**: Cadeia linear `VER → ENTENDER → LEMBRAR → ANTECIPAR → PREPARAR → EXECUTAR → REVISAR → PROVAR → REGISTRAR → APRENDER → DEVOLVER_LEVEZA`
- **Agora**: Rendezvous (passado/presente/futuro) → lineage → dedupe → one surviving delta → coordenação SOL → multibússola + metalupa → one writer → execução Hermes → contraprova + remedição → reality judge → fixed_point → registra → boot
- `#ACORDAR` / `!CALIBRAR` agora são capacidades internas do `!CENTRALDARK` + `CENTRALDARK_AI_BOOT`, invocadas dinamicamente (não degraus rígidos)
- Fluxo substitui linear por rendezvous + lineage para evitar duplicação e garantir one surviving delta

---

## Revisão Completa dos Bots Operacionais

### 3 Bots Mapeados no Repositório

| Bot | Arquivo | Workflow | Função | Modo |
|-----|---------|----------|--------|------|
| **GitHub Bot Controller** | `scripts/github-bot-controller.mjs` | `github-bot-controller.yml` | Fecha PRs superseded com receipt `Lineage-Absorption: #N@HEAD=PROVEN` | `workflow_dispatch` + `pull_request.closed` + `schedule` |
| **VPS HealthCheck** | `scripts/bots/vps-healthcheck.mjs` | `vps-healthcheck.yml` | 10 checks read-only (PM2, portas, disco, inodes, memória, load, Caddy, git, grok-worktrees, uptime) | `schedule 6h` + `workflow_dispatch` |
| **WuzAPI Sessions Monitor** | `scripts/bots/wuzapi-sessions-monitor.mjs` | Referenciado no código | Monitora sessões MultiZap/WuzAPI, sanitiza JIDs, abre/atualiza Issue dedup | `~15min` |

### Workflows de Apoio
- **Dispatcher Bots** (`dispatcher-bots.yml`) — Roteia Issues/PRs por label `🧠 AGENTE-*` → briefing idempotente
- **Bot-Server Validate** (`bot-server-validate.yml`) — 9 validadores offline Lotes 2–10
- **Bots Labels Seed** (`bots-labels-seed.yml`) — Catálogo canônico labels, migra aliases, remove obsoletas

### Lib Compartilhada
- `scripts/bots/lib/gh.mjs` — helpers GitHub (findBotIssue, createIssue, updateIssue, repo)

---

## Cadeia de Autenticação Existente (Validada)

```
auth.json (Nous token) 
    → Omni Router (porta 8099) 
        → fallback_providers: ['centraldark-router'] 
            → config.yaml (provider: centraldark-router, base_url: http://127.0.0.1:8099/v1)
```

### Estado Atual Local

| Componente | Status | Observação |
|------------|--------|------------|
| **Omni Router (8099)** | ✅ ATIVO | Respondendo, fallback `centraldark-router` configurado |
| **Claude Code** | ⚠️ SEM TRUST | Workspace não trusted — precisa `hasTrustDialogAccepted: true` |
| **OpenAI/OpenRouter** | ❌ SEM KEY | `OPENAI_API_KEY_not_configured` |
| **Nous (auth.json)** | ✅ EXISTE | Token lido dinamicamente pelo router (`centraldark_omni_router.py:146`) |
| **Hermes Local** | ❌ SEM CONFIG | `HERMES_BASE_URL` não definido |
| **MCP Token** | ⚠️ VAZIO LOCAL | Definido no `ecosystem.config.cjs` mas vazio; vem do VPS via `sync-mcp-password.sh` |
| **pm2 local** | ❌ N/A | Runner self-hosted roda na VPS |

### Gargalos para Fixed Point
1. `OPENAI_API_KEY` no ambiente (OpenRouter)
2. Trust workspace no Claude Code
3. `MCP_CENTRALDARK_TOKEN` sincronizado do vault VPS (`sync-mcp-password.sh`)
4. Testar rota `nous/auto` no router
5. Writer ativo — `boot_receipt.txt` mostra `writer: NONE`

---

## Protocolo Commit Main (Executado nesta Sessão)

```bash
git add -A
git commit -m "chore: atualiza SOUL-SOL fluxo operacional + deps
- SOUL-SOL.md: HISTORY RENDEZVOUS + CAPABILITY LINEAGE + DEDUPE/ABSORB
- package.json: @eslint/js 9.32.0, @tailwindcss/typography 0.5.20
- package-lock.json sincronizado
- mcp-admin-ui/index.css ajustes
- worktrees/pr1393-porta-tokens"
git pull --rebase origin main
git push origin main
```

- Rebase aplicado (origin/main estava à frente em `5821c675c`)
- Push concluído com sucesso
- GitHub reportou 61 vulnerabilidades (2 critical, 30 high) — Dependabot abrirá PRs

---

## Correções de Estilo do SEGREDO/CHEFE (Esta Sessão)

1. **EMOJIS CANÔNICOS OBRIGATÓRIOS** — "C TA USANDO OS EMOGIS ? QUE EU ESEMPRE PESSO ?" — usar **exclusivamente** tabela `docs/CONSCIENCIA/PADRAO-EMOJIS.md` (🔥 🧭 💎 ⚡ ✅ ⚠️ ❌ etc.). 1 emoji = 1 gatilho. Sem decorativos, sem emojis casuais excessivos.

2. **EXECUTE PRIMEIRO, RELATE DEPOIS** — Não explique, não justifique, não antecipe. Apenas faça e depois relate o que aconteceu.

3. **EVITE REPETIR INFORMAÇÃO JÁ DITA** — Se o usuário já forneceu dado, não peça novamente a menos que haja mudança real no estado.

4. **BAIANÊS ULTRA-CONCISO** — "menos é mais", "APENAS FAÇA NÃO PERGUNTE"

5. **PROTOCOLO DORMIR/ACORDAR PARA OPÇÕES** — Se fluxo exigir decisão, NUNCA pergunte diretamente. Use: `> /CENTRALDARK DORMIR` para pausar, depois `ACORDAR !CENTRALDARK` para retomar.

6. **RE-ASK DE AUTORIZAÇÃO JÁ DADA = WASTED TURN** — Não reconfirmar a cada turno.

7. **SE HOUVER MAIS DE UM CAMINHO, PREFERIR O DE MENOR MOVIMENTO E MOSTRAR RESULTADO** — Não apresentar como escolha.

---

## Próximos Passos Mínimos (Para Fixed Point)

1. Configurar `OPENAI_API_KEY` no ambiente (OpenRouter)
2. Trust workspace Claude Code: `projects["E:/CentralDark/Pivete/CentralDark"].hasTrustDialogAccepted: true`
3. Sincronizar `MCP_CENTRALDARK_TOKEN` via `sync-mcp-password.sh` (vault VPS: `/root/CentralDark/secrets/mcp-admin.password`)
4. Testar rota `nous/auto` no Omni Router
5. Ativar Writer (atualmente `writer: NONE` no boot_receipt)