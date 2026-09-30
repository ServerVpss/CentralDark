# Receipt — Bot Telegram / Hermes / Gateway — 2026-09-24

## Escopo

Fix cirúrgico do bot Telegram e da rota de IA, preservando owners existentes e sem reabrir `/mcp-public`.

## GitHub T1

- main antes da rodada do gateway: `722d8456808c3189f2758aece34e02c2a6f46101`
- `43694ab259f222cded577ce56b66464faf4324d6` — restaura `/v1/messages` no ArsenalAdapter.
- `ffd91387b89be05232ac1df434bb20a7b33d00e7` — bot roteia Gateway CentralDark antes do Hermes CLI.
- `c1ab7268a77231d06f57528b8afa1661c6f38b12` — fail-closed de provider + rota MCP canônica.
- CI/status no HEAD observado: sem status reportado. `CI_PENDING_IS_NOT_PASS=true`.

## Runtime VPS T1

Observado em `vmi3256920`.

- VPS git HEAD: `ec52fad88be4e06421ab5ddb075668d2a7c14064`.
- `apps/bot-telegram/unified-bot.cjs`: modificado no runtime.
- `apps/modulos/arsenal-openai-adapter/server.mjs`: modificado no runtime.
- SHA256 runtime bot: `28cb2d7783513f635917267e8e95f3d618417d8c61da2e0b4196f4e60329d02c`.
- SHA256 runtime adapter: `20c8eba4e1b05c6c755dc5f9149020dec94eef9a9a0551d7e9f3e272aba37c75`.
- `node --check` dos dois arquivos: PASS.
- PM2 salvo em `/root/.pm2/dump.pm2`.

### Processos

- `CentralDark-HubBot-Srver1`: ONLINE após restart controlado.
- `CentralDark-HubBot-Guardiao`: ONLINE após restart controlado.
- `CentralDark-ArsenalAdapter`: ONLINE; owner reativado no PM2.
- Bot health local `:9500/bot/health`: HTTP 200 com polling Telegram fresco.
- Adapter local `:8090/health`: HTTP 200.
- Adapter público `/v1/models`: HTTP 200.
- `/v1/messages` local/público sem credencial: HTTP 401, provando rota presente + auth ativa.

## Correções provadas

1. Executor Hermes no bot não usa mais chamada síncrona bloqueante.
2. Saída Telegram sanitiza tags não suportadas, inclusive `details`, `center`, `bot`, `tik-tak`, tags numéricas e wrappers internos.
3. Prompts não pedem exposição de chain-of-thought/rascunho.
4. Health polling trata colisão de porta sem derrubar polling.
5. `/v1/messages` Anthropic-compatible restaurado no owner `CentralDark-ArsenalAdapter`.
6. Bot tenta o Gateway CentralDark local antes do CLI Hermes.
7. Bloqueio de provider 402/429/crédito/assinatura é classificado como `BLOCKED/UNKNOWN`, sem inventar resposta e sem transformar em ETIMEDOUT.
8. Fallback Hermes CLI classifica ausência de provider como `BLOCKED/UNKNOWN`.
9. `call_mcp_tool` deixou de apontar para `/mcp-public` removido e agora usa `/mcp` autenticado.

## Contraprovas

- Nenhum novo erro `Unsupported start tag`, `Unexpected end tag`, `ETIMEDOUT`, `spawnSync` ou `EADDRINUSE` observado nos logs dos HubBots após o restart da rodada.
- Hermes CLI existe, mas execução real retornou: sem provider de IA configurado.
- ArsenalAdapter autenticado chegou ao provider, mas inferência retornou bloqueio 402 de assinatura/crédito.
- Lovable arsenal-proxy não foi utilizável no T1 porque o host Supabase não resolveu na VPS.
- OpenRouter failover não possui `secrets/openrouter.env` no runtime observado.
- `CentralDark-EvolucaoIAs` está ONLINE como processo, porém logs provam `GEMINI_API_KEY`, `GROQ_API_KEY` e `ANTHROPIC_AUTH_TOKEN` ausentes; as mensagens vistas no loop são fallback pré-escrito, não prova de IA real.
- MCP `:9100/health` = HTTP 200, versão 0.4.0, 125 tools. Porém o bot não apresentou `MCP_CENTRALDARK_TOKEN/MCP_TOKEN` nos envs que carrega; tool call autenticado continua BLOCKED até a credencial owner ser ligada.

## Estado

```text
TELEGRAM_POLLING=PASS
BOT_RUNTIME_AFTER_RESTART=PASS
TELEGRAM_OUTPUT_SANITIZER=PASS
ARSENAL_ADAPTER_PROCESS=PASS
ARSENAL_V1_MESSAGES_ROUTE=PASS
GATEWAY_AUTH_PATH=PASS
AI_PROVIDER_INFERENCE=BLOCKED_EXTERNAL_PROVIDER_402
HERMES_CLI_AI_PROVIDER=BLOCKED_UNCONFIGURED
EVOLUCAO_IAS_PROCESS=PASS
EVOLUCAO_IAS_REAL_AI=FAIL_UNCONFIGURED
MCP_RUNTIME=PASS
MCP_BOT_AUTH=BLOCKED_NO_TOKEN_IN_BOT_ENV
CI_HEAD=UNKNOWN_NO_STATUS
VPS_HEAD_EQUALS_MAIN=NO
MERGED_EQUALS_DEPLOYED=FALSE
```

## NEXT_CURSOR

1. Resolver a fronteira humana do provider: crédito/assinatura ou credencial válida de um provider já suportado.
2. Ligar token MCP canônico ao env carregado pelo HubBot sem reabrir `/mcp-public`.
3. Reconciliar os hotpatches da VPS com a main sem apagar deltas locais úteis.
4. Reexecutar inferência real Bot -> Gateway -> modelo e registrar receipt 200 com texto.
5. Só então promover `AI_INFERENCE=PASS`.

## Invariantes

- UNKNOWN != PASS
- PROCESS_ONLINE != AI_INFERENCE_OK
- MERGED != DEPLOYED
- ACTION != PROOF
- PATCHED != ROOT_CAUSE_FIXED
- TOOL_LISTADO != TOOL_ATIVO
- ONE_SYSTEM_ONLY=true
- REUSE_BEFORE_CREATE=true


## Delta posterior — anti-falso-verde e failovers

- `cc6a53a1a0466e5805db5c88284b722e87036068` — `CentralDark-EvolucaoIAs` deixa de publicar fallback sintético como se fosse resposta de Gemini/Groq/Claude.
- Runtime `CentralDark-EvolucaoIAs` reiniciado com `node --check=PASS`, PM2 ONLINE, restart 15.
- Primeiro ciclo pós-restart: `BLOCKED/UNKNOWN: nenhuma API de IA configurada; ciclo encerrado sem publicar conteúdo sintético.`
- OpenRouter já configurado no WebUI foi testado sem expor credencial: HTTP 401 `User not found`.
- Groq já configurado no WebUI: HTTP 401 `Invalid API Key`.
- Gemini já configurado no WebUI: HTTP 401.
- Abacus/RouteLLM: HTTP 402 por crédito/assinatura.
- Lovable arsenal-proxy: host Supabase não resolveu no runtime observado.
- Portanto nenhum provider remoto já configurado entregou inferência válida no T1.
- Hermes CLI oferece seleção interativa de provider via `hermes model`; o comando exige TTY. A tentativa de abrir o fluxo interativo ficou pendente porque o canal Remote Desktop Commander ficou offline antes do teste.
- `HERMES_FREE_NOUS_ACTIVATION` permanece `UNKNOWN`, não PASS nem FAIL.

## Estado adicional

```text
EVOLUCAO_IAS_SYNTHETIC_FALLBACK=DISABLED
EVOLUCAO_IAS_FALSE_GREEN=FIXED
OPENROUTER_EXISTING_CONFIG=FAIL_401
GROQ_EXISTING_CONFIG=FAIL_401
GEMINI_EXISTING_CONFIG=FAIL_401
ABACUS_EXISTING_CONFIG=BLOCKED_402
LOVABLE_PROXY_RUNTIME=BLOCKED_DNS
HERMES_FREE_NOUS_ACTIVATION=UNKNOWN_TTY_NOT_TESTED
RDC_CURRENT_CHANNEL=OFFLINE_AT_LAST_OBSERVATION
RDC_OFFLINE_DOES_NOT_MEAN_VPS_DOWN=true
```
