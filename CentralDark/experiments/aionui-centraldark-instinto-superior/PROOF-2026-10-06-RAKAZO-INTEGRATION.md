# PROOF — AionUi / Instinto Superior + Bots/Agentes + Rakazo — 2026-10-06

## Escopo

Integrar Rakazo como **capability subordinada** ao cockpit CentralDark / AionUi v2.2.2, sem criar segundo cérebro, segundo Hermes, segundo router ou segundo owner.

```text
CentralDark
  ↓
Instinto Superior / AionUi
  ↓
Bots / Agentes
  ↓
Rakazo
```

## Git / PR

- PR: #1748
- branch: `prototype/aionui-centraldark-instinto-superior-20261003`
- HEAD medido antes deste receipt: `959eca070f28100c3903610e74c49c5e1b1e8e3d`
- mergeable: `true`
- arquivos alterados no PR antes deste receipt: `7`

Commits do delta Rakazo:

- `a4dc2b8c5d005a331237955c1a85ad959a225b2a` — página Bots / Agentes
- `e5d96c5a1d9b433f22c7c4c95733d0ad3e22ad30` — instalador reproduzível Rakazo
- `8955cd8a6b8706fde2962b5c219b111e5fbb33f8` — wiring overlay/sidebar/router
- `aed57312ec54533fc46ca937942e3da3a622c671` — documentação da capability
- `959eca070f28100c3903610e74c49c5e1b1e8e3d` — binding adaptativo do modelo local CentralDark

## AionUi — prova de build e rota

Overlay aplicado na árvore viva AionUi v2.2.2:

```text
AIONUI_UPSTREAM_VERSION=2.2.2
CENTRALDARK_OVERLAY=APPLIED
CENTRALDARK_BOTS_RAKAZO=WIRED
BUNX_BUILD_COMPAT=PATCHED
PRODUCT=CentralDark — Instinto Superior
```

`bun run package`:

```text
MAIN_BUILD=PASS
PRELOAD_BUILD=PASS
RENDERER_BUILD=PASS
EXIT_CODE=0
RENDERER_BUILD_TIME=3m11s
TOTAL_PROCESS_RUNTIME=276.43s
```

Readback:

- `/settings/bots` existe em `Router.tsx`;
- `Bots / Agentes` existe em `SettingsSider.tsx`;
- `Bots / Agentes` existe em `SettingsPageWrapper.tsx`;
- `CentralDarkBotsSettings/index.tsx` existe;
- bundle gerado contém `Bots / Agentes`;
- WebUI AionUi `:25808` permaneceu `HTTP 200`.

## Rakazo — runtime vivo

Runtime root:

```text
/opt/centraldark/rakazo
```

Docker instalado/provado no openKylin:

```text
Docker 24.0.7
Docker Compose 2.24.6
SANDBOX_PROVIDER=docker
```

Containers observados:

```text
rakazo-api-1        = UP / HEALTHY
rakazo-supervisor-1 = UP / HEALTHY
rakazo-postgres-1   = UP / HEALTHY
rakazo-web-1        = UP
rakazo-worker-1     = UP
rakazo-data-init-1  = EXITED(0)
rakazo-computer-1   = EXITED(0)
```

API health:

```json
{"ok":true,"runtime":"pi","sandbox":"docker","composio":false,"pipedream":false,"messaging":false,"email":null,"jobs":"graphile","realtime":"postgres","revision":"4cdf3e23315c2633b6b3fde8977f197b986f06fa"}
```

## Portas / superfície

```text
25808 = AionUi / Instinto Superior WebUI
25810 = Rakazo web capability
3100  = Rakazo API / loopback
18435 = CentralDark Kylin OpenAI-compatible bridge
8899  = CentralDark Instinto/Hermes runtime
9119  = Hermes service
```

Provas:

- `127.0.0.1:25810` → `HTTP 200`, title `Rakazo`;
- `0.0.0.0:25810` está LISTEN;
- `127.0.0.1:3100/internal/health` → `HTTP 200`;
- headers da raiz Rakazo não retornaram `X-Frame-Options` nem `Content-Security-Policy: frame-ancestors`;
- portanto nenhum blocker HTTP de iframe foi observado na probe atual.

## Reuso da IA local CentralDark

Binding aplicado ao Rakazo:

```text
RAKAZO_LOCAL_MODELS=kylin-qwen-plus
RAKAZO_LOCAL_MODELS_URL=http://<TAILSCALE_CURRENT>:18435/v1
RAKAZO_LOCAL_CONTEXT_WINDOW=32768
RAKAZO_LOCAL_MAX_TOKENS=4096
```

O valor vivo do IP Tailscale permanece binding de ambiente, não é cristalizado como identidade fixa pelo instalador. O script resolve o binding em runtime quando disponível.

Prova discriminante a partir de dentro de `rakazo-api-1`:

1. `GET /v1/models` no bridge CentralDark retornou `kylin-qwen-plus`;
2. `POST /v1/chat/completions` com `model=kylin-qwen-plus` retornou:

```text
assistant.content=OK
finish_reason=stop
model=kylin-qwen-plus
```

Logo:

```text
RAKAZO_CONTAINER_TO_CENTRALDARK_MODEL_BRIDGE=PASS
CENTRALDARK_LOCAL_MODEL_REUSE=PASS
SECOND_MODEL_STACK_CREATED=false
```

## Veredito

```text
AIONUI_BUILD=PASS
BOTS_AGENTS_ROUTE=PASS
RAKAZO_RUNTIME=PASS
RAKAZO_WEB_25810=PASS
RAKAZO_API_HEALTH=PASS
IFRAME_HTTP_BLOCKER=NOT_OBSERVED
CENTRALDARK_LOCAL_MODEL_BINDING=PASS
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
RAKAZO=CAPABILITY_NOT_SECOND_BRAIN
ACTION_NE_PROOF=true
REALITY_IS_JUDGE=true
```

### Fronteira

Este receipt prova o módulo, sua superfície, runtime, sandbox Docker, API e binding do modelo local. Conectores externos opcionais do Rakazo (`Composio`, `Pipedream`, mensageria, e-mail) permanecem desabilitados conforme o health atual e **não são necessários** para provar este delta.
