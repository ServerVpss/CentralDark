
# 🗺️ ENXAME TOTAL — Erradicar `claude.ap7.site` do CentralDark

## Motivo
Gateway `claude.ap7.site` devolveu **Cloudflare 524 (origin timeout, 120s)**. Origem instável / possivelmente morta. Ordem do Pivete: **"NAO PODE TER AI MAIS"**.

## Mapa do envolvimento (varredura no repo)

### 🔴 Código ativo que ainda usa `claude.ap7.site` (produção)
| # | Arquivo | Uso |
|---|--------|-----|
| 1 | `ecosystem.config.cjs` (linhas 638, 1156, 1220, 1279) | `ANTHROPIC_BASE_URL=https://claude.ap7.site` em 4 processos PM2 |
| 2 | `apps/modulos/elite-anthropic-proxy/proxy.py` L22 | `UPSTREAM = "https://claude.ap7.site"` |
| 3 | `apps/modulos/HERMES-CORE/core/decisor.mjs` L52 | rota `https://claude.ap7.site/v1/messages` |
| 4 | `apps/modulos/HERMES-CORE/core/cadeia.json` L20-23 | posição 16 da cadeia (elite última bala) |

### 🟡 Documentação que ainda referencia (precisa marcar como DEPRECATED)
- `docs/APRENDIZADOS/PROXY/*` (5 arquivos)
- `docs/CONSCIENCIA/APRENDIZADOS/PROXY/*` (espelho)
- `docs/CONSCIENCIA/ARSENAL/hermes-vivo/{README.md,models-map.json,decisor.mjs}`
- `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/{decisor.mjs,models-map.json}`
- `docs/CONSCIENCIA/CONSCIENCIA/08-HISTORICO-DECISOES.md` + `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
- `docs/BRAIN/00-MAPA.md` + `docs/CONSCIENCIA/BRAIN/00-MAPA.md`
- `docs/PENDENCIAS.md` + `docs/CONSCIENCIA/PENDENCIAS.md`
- `docs/CONSCIENCIA/APRENDIZADOS.md` (L1961, L1970)
- `apps/modulos/mcp/README.md`, `apps/modulos/elite-gateway/RELATORIO-ECOSSISTEMA.txt`
- `docs/GOVERNANCA/{PADRAO-DE-TRABALHO-PIVETE,FLUXO-DE-OURO-GATEWAY-CENTRALDARK}.md`

### 🟢 Já corretos (referência oficial `api.centralldark.com`) — não mexer
- `docs/GATEWAY/TUTORIAL-WINDOWS-CLAUDE-DESKTOP.md`
- `apps/modulos/hub/src/components/gateway/GatewayTab.tsx`
- `apps/modulos/hub/src/components/dashboard/AbacusApiCard.tsx`

### ⚪ Backups históricos — deixar como estão (evidência do passado)
- `ecosystem.config.js.bak-*`
- `backups/2026-07-03-hermes-darkai/decisor.mjs`
- `busca_profunda.sh` (script de auditoria — o pattern é útil pra caçar restos)

## Plano de erradicação (após "PERMITO PIVETE")

**Substituto oficial:** `https://api.centralldark.com/` (Gateway CentralDark já em pé, 161 modelos dinâmicos + aliases Anthropic via `/v1/messages`).

### Fase 1 — VPS (produção viva) 🚨
1. `ecosystem.config.cjs`: trocar as 4 ocorrências de `ANTHROPIC_BASE_URL` para `https://api.centralldark.com`. **Não fazer PM2 restart automático** — listar processos afetados e pedir confirmação individual.
2. `apps/modulos/elite-anthropic-proxy/proxy.py`: trocar `UPSTREAM` OU marcar módulo como deprecated (o gateway novo já cobre `/v1/messages`).
3. `apps/modulos/HERMES-CORE/core/decisor.mjs`: substituir URL da posição elite pelo gateway oficial.
4. `apps/modulos/HERMES-CORE/core/cadeia.json`: reescrever posição 16 (`via: centraldark-gateway`, url `https://api.centralldark.com/v1/messages`, nota atualizada).

### Fase 2 — Documentação viva (sinalizar histórico, não apagar)
- Marcar cada doc de `APRENDIZADOS/PROXY/*` com banner `⚠️ DEPRECATED — proxy claude.ap7.site desativado em 10/07/2026 por instabilidade (Cloudflare 524). Substituto: api.centralldark.com`.
- Atualizar `08-HISTORICO-DECISOES.md`, `BRAIN/00-MAPA.md`, `PENDENCIAS.md`, `APRENDIZADOS.md` (L1961/L1970) refletindo o novo estado.
- Atualizar `docs/GOVERNANCA/PADRAO-DE-TRABALHO-PIVETE.md` §13 e `FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md` §18 (missão concluída — sem `claude.ap7.site`).
- `apps/modulos/elite-gateway/RELATORIO-ECOSSISTEMA.txt` + `apps/modulos/mcp/README.md`: remover a linha "última bala claude.ap7.site".

### Fase 3 — Registro do Ouro (Card Hermes v1.3 + Git)
- Commit único na `main` do repo `ServerVpss/CentralDark`, título:
  `refactor(gateway): erradica claude.ap7.site — tudo via api.centralldark.com`
- Card Hermes v1.3 no privado admin + linha no canal Status via connector Telegram.
- Aprendizado registrado em `docs/CONSCIENCIA/APRENDIZADOS.md`.

### Fase 4 — Prova
- `grep -rE "claude\.ap7\.site" apps/ ecosystem.config.cjs docs/GOVERNANCA` deve retornar **0 hits em código ativo** (só backups e docs marcados DEPRECATED).
- `curl -sS https://api.centralldark.com/v1/models | jq '.data|length'` deve continuar retornando ≥ 161.
- PM2 `Hermes-Core`, `elite-anthropic-proxy` (se mantido) reportando 🟢 depois do restart autorizado.

## Áreas protegidas envolvidas (exigem "PERMITO PIVETE" explícito)
🔒 `apps/modulos/HERMES-CORE/` · 🔒 `apps/modulos/elite-anthropic-proxy/` (via seção 9 do CLAUDE.md — `arsenal-openai-adapter` cobre esse território) · `ecosystem.config.cjs` (afeta PM2 vivo) · `docs/GOVERNANCA/*`.

## Escopo do que NÃO faço nesta rodada
- Não deleto backups históricos.
- Não faço `pm2 restart` sem confirmação nominal por processo.
- Não removo o módulo `elite-anthropic-proxy` inteiro sem sua ordem — só reaponto ou marco deprecated.
- Nada é feito no Lovable atual (backend/edge/migration) — trabalho vai pra VPS + GitHub, como manda o escopo padrão.

## Próximo comando esperado
> `PERMITO PIVETE — ERRADICAR claude.ap7.site (Fases 1-4)`
> ou parcial: `PERMITO PIVETE — SÓ FASE 1` / `SÓ DOCS`.
