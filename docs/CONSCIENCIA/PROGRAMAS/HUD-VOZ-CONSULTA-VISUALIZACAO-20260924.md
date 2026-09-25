# HUD VOZ → CONSULTA → VISUALIZAÇÃO — 2026-09-24

PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
WRITER=SOL
WRITER_SCOPE=hud/voz-consulta-visualizacao-20260924
MAIN_BASE=2f3ef85b9ef415a610e58f7ace1ae9bd37ff5e0a
REALITY_IS_JUDGE=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN != PASS

## Rumo

CHEFE fala → CentralDark consulta/executa pelos owners existentes → CHEFE ouve e visualiza o resultado.

## Owners reconciliados no main

- coração/saúde: `GET https://api.centralldark.com/heartbeat` em `apps/modulos/mcp/src/index.js`
- roteamento: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
- trigger/receipt: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- entrada de artefatos Telegram/Hub/Drive: `apps/bot-telegram/skills/externas/artifact-ingest.cjs`
- cockpit: `src/paginas/admin-cockpit/PainelOps.tsx`
- status legado: `apps/modulos/status/painel-data.json`

## Delta desta caneta

### Cockpit fail-closed

O hero do `PainelOps` não pode mais afirmar `SISTEMA Rodando` por mock.
Ele mede `/heartbeat` a cada 15 s e classifica:

- `PASS`: HTTP OK + `self` explicitamente `alive|healthy|ok|pass`
- `FAIL`: `self` explicitamente `lost|down|failed|fail|error`
- `UNKNOWN`: timeout, erro, CORS, payload sem estado vivo explícito, `stale` ou qualquer ausência de prova suficiente

Isso preserva `UI_TRUNCATED != CONFIG_INVALID`, `UNKNOWN != PASS` e `REALITY_IS_JUDGE`.

## HUD consolidado da missão

1. Cabine de voz — conversa observada; integração canônica completa ainda UNKNOWN.
2. VPS — leitura/comando observado em sessão; saúde atual precisa remedição.
3. GitHub — main e contrato reconciliados.
4. Lovable — inventário total ainda pendente.
5. Instinto Superior — ligação real API/Hub/Telegram ainda pendente.
6. Rotinas determinísticas — converter apenas trechos provados.
7. Sentinela/S-beat — reutilizar Trigger Fabric + heartbeat; nenhum novo núcleo.
8. Provas/cadeados — receipts + hash + SAME_HEAD quando aplicável.
9. Status/notificações — verde apenas enquanto saúde atual estiver provada.
10. Builder — permanece dentro de admin/casca única.
11. Telegram + Hub MCP — reutilizar artifact-ingest e owners existentes.
12. VPS limpeza — somente após medição atual.
13. Cache/migração Lovable — preservar origem/dependências.
14. Dispositivo local — indisponível != desligado.
15. Voz Windows 11 — investigação permanece UNKNOWN.
16. Gravação — arquivo ainda não provado/localizado.
17. Registro definitivo — receipt volta ao PR-mãe #1562; PR-mãe não mergeia.

## Anti-regressão

DOCUMENTED != EXECUTED
ACTION != PROOF
MERGED != DEPLOYED
EXISTS != RUNNING
CURRENT > HISTORY
NO_NEW_SENTINEL_CORE=true
NO_SECOND_HEARTBEAT=true
NO_SECOND_ROUTER=true

## NEXT_CURSOR

1. validar build/lint do cockpit no mesmo HEAD
2. observar CI do filho
3. medir runtime atual de heartbeat/VPS
4. somente depois atualizar PASS/UNKNOWN no ledger #1562


## Registro durável — CASA / GARIMPO / Remote Desktop — 2026-09-25

EVIDENCE_SOURCE=CHEFE_UPLOADS+REPO_MAIN
EVIDENCE_CLASS=RECEIPT+SOURCE_CODE+SCREENSHOT
CURRENT_ROUTE_PROOF=PARTIAL_STRONG

### Cadeia provada

```text
E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
→ CentralDark Remote Tray / Remote Bridge
→ npx @wonderwhy-er/desktop-commander remote
→ https://mcp.desktopcommander.app/mcp
→ autorização por device code
→ Device ID atribuído
→ Channel subscribed
→ Device marked as online
→ Device ready
→ Device Name = SEGREDO
```

### Evidências locais recebidas do CHEFE

- receipts de `remote-bridge` registram repetidamente `device_label/device = SEGREDO`;
- os mesmos receipts registram `workdir = E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE`;
- logs `centraldark-remote-tray-*.log` registram `WORKDIR=...GARIMPO-CHEFE`, `REMOTE_MCP_CONNECT=https://mcp.desktopcommander.app/mcp` e inicialização do owner Remote MCP para `SEGREDO`;
- logs `desktop-commander-*.log` registram conexão ao Remote MCP e `Device Name: SEGREDO`;
- receipt antigo preserva um Device ID estável em múltiplas sessões antes das recriações posteriores;
- screenshot de nova autorização mostra explicitamente `Device Name: SEGREDO` após `Device ID assigned`, `Channel subscribed`, `Device marked as online` e `Device ready`.

### Fonte canônica já existente

- `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` usa `GARIMPO-CHEFE` como `Workdir` padrão e executa dali o owner Remote MCP;
- `scripts/remote-bridge/CentralDark-Remote-One.go` usa o mesmo `defaultWorkdir`, grava receipts em `GARIMPO-CHEFE\\receipts\\remote-bridge` e registra `Device: SEGREDO`;
- `docs/RELATORIOS/2026-09-16-casa-garimpo-reconciliation.md` já registra que o pacote Remote Tray/NPX do GARIMPO foi absorvido pelo contrato canônico.

### Conclusão

```text
GARIMPO_CHEFE_WAS_REMOTE_BRIDGE_WORKDIR = PROVEN
REMOTE_MCP_ROUTE_FROM_GARIMPO = PROVEN
DEVICE_NAME_SEGREDO_OBSERVED_AFTER_AUTH = PROVEN
GARIMPO_PATH_ITSELF_GENERATES_DEVICE_NAME = NOT_PROVEN
EXACT_DEVICE_NAME_SOURCE = UNKNOWN
```

Não inferir que o caminho da pasta cria o nome do device. O próximo teste discriminante deve localizar se `SEGREDO` vem de hostname Windows, estado local do Desktop Commander, wrapper/bridge, variável/configuração ou registro persistente de autenticação.

### Invariantes cristalizadas

```text
UI_CONNECTED != REMOTE_COMMANDER_ROUTABLE
DEVICE_REGISTERED != DEVICE_ONLINE
WORKDIR != DEVICE_IDENTITY
HISTORICAL_DEVICE != CURRENT_ROUTABLE_DEVICE
TOOL_FAILURE != WORLD_FAILURE
```
