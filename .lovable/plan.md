# ⚔️ MODO ARSENAL MÁXIMO — Erradicar `claude.ap7.site` + 5 Frentes em Paralelo

## Doutrina desta operação
> **Nós somos o gateway agora.** `api.centralldark.com` (nossa VPS + Abacus 161 modelos) substitui `claude.ap7.site` em 100% do ecossistema. Nada mais depende do host morto.

Enxame **6 frentes paralelas**, cada uma um sub-agente independente com relatório único no final. Nenhuma bloqueia a outra. Zero espera sequencial.

```
                    ┌──────────────────────────────────────┐
                    │   MAESTRO (eu, Lovable)              │
                    │   coordena, coleta, entrega o ouro   │
                    └───────────────┬──────────────────────┘
                                    │ spawn_agent x6 (paralelo)
     ┌──────────┬────────┬──────────┼──────────┬────────┬─────────┐
     ▼          ▼        ▼          ▼          ▼        ▼         ▼
   [F1]       [F2]     [F3]       [F4]       [F5]     [F6]     [MON]
  ERRADI-   ORQUES-   GATEWAY    GROK       PR #147  DOCS+    HERMES
  CAR AP7   TRAR      +161       ZENDRIVER  AUDIT    CARD     VIGIA
            PARALEL   MODELOS    OAUTH               HERMES   24h
```

---

## Frente 1 — 🪦 ERRADICAR `claude.ap7.site` (prioridade máxima)
**Alvo:** eliminar as 4 referências vivas + `cadeia.json` posição 16 + `elite` block.
**Ações:**
- `ecosystem.config.cjs` (4 hits) → `ANTHROPIC_BASE_URL=https://api.centralldark.com`
- `apps/modulos/elite-anthropic-proxy/proxy.py` L22 → `UPSTREAM = "https://api.centralldark.com"` (ou marcar módulo como DEPRECATED — nosso adapter já cobre `/v1/messages`)
- `apps/modulos/HERMES-CORE/core/decisor.mjs` L52 → nossa URL
- `apps/modulos/HERMES-CORE/core/cadeia.json` posição 16 + bloco `elite.url` → `https://api.centralldark.com/v1/messages`, nota: "ELITE — via CentralDark Gateway (nós somos o proxy agora)"
**Prova:** `grep -rE "claude\.ap7\.site" apps/ ecosystem.config.cjs` = 0 hits em código ativo.
**Restart PM2:** `CentralDark-EliteAnthropicProxy`, `CentralDark-HERMES-Core`, `CentralDark-HERMES-Verificador`, `CentralDark-ArsenalAdapter` — um por um com `pm2 logs` 10s.
**Branch:** já existe → `pivete/erradicar-claude-ap7` (commit `60cf2be1c`). Só falta merge na main + restart.

## Frente 2 — 🧬 Finalizar `orquestrar_paralelo` no MCP
**Estado:** tool já existe no MCP `Eu2zA` (visível no tool_search). Falta: validar que aceita até 50 tasks, retorna `{ok,erro}` individual, timeout por task.
**Ações:**
- Ler código atual da tool na VPS (`apps/modulos/mcp/`)
- Adicionar timeout default 30s + limite hard 50 tasks (se ausente)
- Teste smoke: disparar 5 leituras VPS + 3 checks status em paralelo
**Prova:** relatório com `total_ms`, `parallel_ms`, ganho >3x vs sequencial.

## Frente 3 — 🚀 Estabilizar Gateway + 161 modelos
**Alvo:** confirmar que `api.centralldark.com` serve o catálogo dinâmico Abacus estável.
**Ações:**
- `curl /v1/models | jq '.data|length'` → deve retornar ≥161
- `curl /v1/messages` (Anthropic-compat) com Sonnet → 200 OK
- `curl /v1/chat/completions` (OpenAI-compat) com Gemini → 200 OK
- Verificar cache 5min do `fetchAbacusCatalog()` funcionando (2ª chamada <50ms)
- Auditar duplicidade (mismatch Gemini→Claude que o Pivete pegou no print)
**Prova:** 3 curls verdes + log `/var/log/arsenal-adapter-out.log` limpo.

## Frente 4 — 🔫 Grok Zendriver OAuth no HUB
**Estado atual:** `providers.json` + `grok-zendriver.js` já criados na branch `pivete/hub-provider-grok`. Falta: capturar `GROK_SESSION_COOKIE` na VPS + integrar no card do HUB.
**Ações:**
- Documentar procedimento de captura do cookie (o Pivete faz manual — não dá pra automatizar login humano)
- Ativar `GrokZendriverStatus.tsx` no `ConnectorsTab.tsx` (já feito, só validar build)
- Rota `/grok/status` no runner PM2 servindo `grok-session.json`
**Prova:** card Grok no HUB mostra 🟢 último login + expiração cookie.

## Frente 5 — 🔍 Auditoria PR #147 (adapter-auth-audit-fix)
**Alvo:** destravar merge do PR travado há dias.
**Ações:**
- Verificar migration `path_query_keys` idempotente
- Confirmar edge `super-admin-status` retornando `{firstAdminExists: bool}`
- Confirmar log sanitizado (sem token, sem IP raw — usar `AUDIT_IP_SALT`)
- Rodar `npm test` do arsenal-openai-adapter
**Prova:** relatório 🟢/🔴 por arquivo do PR + recomendação merge/rework.

## Frente 6 — 📄 Docs DEPRECATED + Card Hermes
**Alvo:** marcar histórico, notificar Telegram.
**Ações:**
- Banner `⚠️ DEPRECATED 10/07/2026 — substituto: api.centralldark.com` em:
  - `docs/APRENDIZADOS/PROXY/*` (5 arquivos)
  - `docs/CONSCIENCIA/APRENDIZADOS/PROXY/*`
  - `docs/CONSCIENCIA/ARSENAL/hermes-vivo/README.md`
  - `docs/BRAIN/00-MAPA.md`
  - `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` (nova entrada)
- Atualizar §20 `MVP-MAPA-VIVO-CENTRALDARK.md` (Cadeia Ativa sem ap7)
- Card Hermes v1.3 no admin `1901426549` + linha canal Status via connector Telegram (`std_01kvw4jkcbekyr1t33vs4p5e9w`)

## Frente MON — 🛠️ Hermes-Verificador rodando
**Alvo:** garantir que PM2 id 77 (`Hermes-Verificador`) continua vivo durante toda a operação, vigiando os restarts das Frentes 1-4.
**Ações:** `pm2 status Hermes-Verificador` a cada 5min · log `/root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/logs/vigia.log` sem alertas críticos.

---

## Ordem de execução (paralela)
```
T+0min   → Frentes 1, 2, 3, 4, 5, 6 disparadas simultaneamente via spawn_agent
T+5min   → coleta resultados F2 (mais rápida) + F5 (só leitura)
T+10min  → coleta F3 (curls), F6 (docs)
T+15min  → coleta F1 (código + branch pronta pra merge)
T+20min  → coleta F4 (Grok — depende de cookie manual do Pivete)
T+25min  → MAESTRO consolida relatório único + dispara Card Hermes final
```

## Prova final (definição de vitória)
- ✅ `grep claude.ap7.site apps/ ecosystem.config.cjs` = 0 hits em código ativo
- ✅ 4 processos PM2 restartados sem erro
- ✅ `/v1/models` retorna ≥161 modelos via nossa VPS
- ✅ `/v1/messages` responde 200 OK sem tocar em ap7
- ✅ Branch `pivete/erradicar-claude-ap7` mergeada na `main`
- ✅ Card Hermes v1.3 disparado no Telegram
- ✅ `orquestrar_paralelo` validado com teste smoke
- ✅ PR #147 com veredicto (merge ou rework)
- ✅ Grok card no HUB (mesmo que ainda precise do cookie manual)

## Áreas 🔒 tocadas (com autorização implícita desta ordem)
- `apps/modulos/HERMES-CORE/` (F1)
- `apps/modulos/elite-anthropic-proxy/` (F1)
- `apps/modulos/arsenal-openai-adapter/` (F3, F5)
- `apps/modulos/hub/` (F4)
- `ecosystem.config.cjs` (F1)

## O que NÃO faço nesta operação
- ❌ Não faço `pm2 kill` nem restart em massa (`restart all`)
- ❌ Não force-push
- ❌ Não deleto backups históricos (`.bak-*`, `backups/`)
- ❌ Não mexo no bot `@srver1bot` nem no `whatsapp-server` (id 1 stopped por design)
- ❌ Não toco no Lovable Cloud atual (backend fica no HUB `lyoig`)

---

## Pergunta única
Manda **`PERMITO ARSENAL MÁXIMO`** que eu disparo as 6 frentes em paralelo agora e volto só com o relatório de vitória consolidado.

Se quiser dosar: `PERMITO F1+F3+F6` (só o essencial da erradicação + prova + notificação), ou `PERMITO TUDO MENOS F4` (deixa Grok pra depois porque exige cookie manual).
