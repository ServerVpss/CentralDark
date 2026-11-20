# CENTRALDARK - MAPA DAS ROTAS TELEGRAM

<!-- #OBSERVACOES# | CENTRALDARK.TELEGRAM.ROUTE.MAP -->
<!-- @owner: docs/ARQUITETURA/CENTRALDARK-TELEGRAM-MAPA.md -->
<!-- @doc_ref: docs/PADRAO-NOMENCLATURA-CENTRALDARK.md -->
<!-- @last_updated: 2026-11-04T03:20:00.000Z -->

> Projecao de revisao. Medicao direta no `main @ 7f799d3` em 2026-11-04.
> `SOURCE_ONLY` - sem VPS, sem deploy, sem teste de runtime.
> Nao altera nos nem setas de diagramas canonicos.

## 1. Estado atual - 4 rotas, 3 identidades bot + 1 conta

| Gatilho | Emissor | Token | Cofre | Destino |
|---|---|---|---|---|
| hook `on-stop.sh` (fim de sessao) | `notify-telegram.sh` | `SRVER1_BOT_TOKEN` \| `TELEGRAM_BOT_TOKEN` | `secrets/.env`, `secrets/telegram-alerts.env`, `secrets/mcp.env` | `ADMIN_CHAT_ID` + `TELEGRAM_CHANNEL_ID` (`NOTIFY_CHAT_ID` tem prioridade) |
| cron guarda | `guarda-telegram.sh` | `GUARDA_TELEGRAM_BOT_TOKEN` \| `TELEGRAM_BOT_TOKEN` | `/root/Multizap/secrets/wabot.env` **fora de `secrets/`** | `GUARDA_TELEGRAM_CHAT_ID` \| `TELEGRAM_CHAT_ID` \| `ADMIN` \| `USER_ID` |
| cron 6h workflow | `vps-healthcheck.mjs` | `SRVER1_BOT_TOKEN` \| `TELEGRAM_BOT_TOKEN` | env do workflow (GitHub Secrets) | `TELEGRAM_CHANNEL_ID`, com dedup `shouldNotify()` |
| nao-bot (conta de usuario) | `telegram-mtproto/server.js` | sessao MTProto | propria | qualquer chat do usuario |

## 2. Problema medido

- **[A]** 4 cofres, e `wabot.env` e o unico **fora** de `/root/CentralDark/secrets/`.
- **[B]** `health-deep.js` testa 3 chaves em cadeia (`SRVER1_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN`, `GUARDA_TELEGRAM_BOT_TOKEN`) - sinal de que o sistema nao sabe qual token e o certo.
- **[C]** Dois emissores para a mesma API, com donos diferentes.
- **[D]** Dedup existe so no `vps-healthcheck.mjs`; os outros dois nao tem - ruido assimetrico.
- **[E]** `notify-telegram.sh` **morre calado**: `if [ -z "$TOKEN" ] || [ -z "$ADMIN_ID" ]; then exit 0; fi` - sem erro e sem log. Causa provavel da ausencia de notificacao por resposta via hook `on-stop.sh`.

## 3. Estado alvo

1 emissor unico, 1 token canonico, 3 gatilhos. `telegram-mtproto` fica **intacto** - e outra identidade e outro caso de uso.

## 4. Migracao - 5 passos, zero remocao

| Passo | Tipo | Acao |
|---|---|---|
| P1 | DECISAO | Declarar o owner canonico |
| P2 | CODIGO | Emissor unico **reusando** `notify-telegram.sh` (nao criar quarto) |
| P3 | CODIGO | Os 3 gatilhos chamam o emissor; corpos antigos viram wrapper |
| P4 | CODIGO | Cadeia de fallback marcada `LEGACY_FALLBACK` com data |
| P5 | SEGURANCA | `wabot.env` passa para `secrets/` canonico |

## 5. Prova exigida antes de aplicar

`ACTION != PROOF` - `TOOL_LISTADO != TOOL_ATIVO` - `HISTORY != CURRENT_STATE`

- [ ] contagem de emissores antes/depois
- [ ] qual `chat_id` responde a cada token
- [ ] readback do envio pelo emissor unico
- [ ] `RUNTIME = NOT_TESTED_BY_SCOPE`

## 6. Projecoes geradas

`CENTRALDARK-TELEGRAM-MAPA.mmd` (fonte) - `.svg` - `.png` - `.txt` (ASCII para agente).

O sandbox **nao possui** `mermaid-cli` nem `pretty-mermaid`; o SVG foi desenhado
diretamente e o PNG renderizado a partir do mesmo conteudo. Nao sao renderizacao Mermaid.
