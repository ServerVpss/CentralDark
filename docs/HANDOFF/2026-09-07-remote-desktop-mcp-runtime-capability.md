# 🛰️ Handoff — Caneta Remote Desktop/MCP para inspeção de runtime

`MISSION_ID=REMOTE_DESKTOP_MCP_RUNTIME_CAPABILITY_20260907`

## Intenção

Registrar no PR-mãe #1444 que a CentralDark possui uma caneta remota autorizável para observar e operar o runtime por MCP/Desktop Commander, sem confundir capacidade disponível com runtime atualmente conectado.

## Medição desta sessão

```text
CONNECTOR=Remote Desktop Commander / MCP
DEVICE_NAME=SEGREDO
APP_VERSION=0.2.48
TRANSPORT_BROADCAST_V1=true
AUTH_STATE=VALID_CONNECTION_RECORD
DEVICE_STATUS=OFFLINE
PING=FAIL_NO_DEVICE_AVAILABLE
```

## Capacidade disponível quando o device estiver ONLINE

```text
REMOTE_RUNTIME_INSPECTION=true
REMOTE_PROCESS_LIST=true
REMOTE_TERMINAL_EXECUTION=true
REMOTE_FILE_READ=true
REMOTE_FILE_SEARCH=true
REMOTE_DIRECTORY_INSPECTION=true
REMOTE_PROCESS_OUTPUT_READ=true
REMOTE_RUNTIME_HEALTH_PROBE=true
REMOTE_RECEIPT_COLLECTION=true
```

Isso permite medir remotamente, quando conectado e autorizado:

```text
processos
portas/serviços via comandos permitidos
logs
arquivos/configs
estado de build/runtime
outputs de processos
paths da Casa/repo
health probes
receipts locais
```

## Limite importante

As ações expostas nesta sessão NÃO incluem captura direta da tela/GUI do desktop.

```text
REMOTE_GUI_SCREEN_CAPTURE=NOT_SURFACED_IN_CURRENT_CONNECTOR
REMOTE_RUNTIME_INSPECTION != REMOTE_VISUAL_SCREEN_PROOF
```

A visualização gráfica continua dependendo de outra superfície que prove pixels/tela, por exemplo Screenpipe/Browser Bridge ou outro conector explicitamente capaz.

## Regra de prova

```text
CONNECTOR_EXISTS != DEVICE_ONLINE
AUTH_RECORD_VALID != RUNTIME_PROVEN
DEVICE_OFFLINE != SYSTEM_BROKEN
REMOTE_COMMAND_AVAILABLE_WHEN_ONLINE != COMMAND_ALREADY_EXECUTED
UNKNOWN != PASS
```

## Rota canônica

```text
CHEFE
→ CentralDark
→ MCP / Remote Desktop Commander
→ device autorizado ONLINE
→ medir processo/log/arquivo/runtime
→ contraprova
→ Reality Judge
→ receipt no PR-mãe
```

## Estado atual

```text
REMOTE_DESKTOP_MCP_CAPABILITY=PROVADO
REMOTE_DEVICE_REGISTERED=PROVADO
REMOTE_DEVICE_ONLINE=NAO
REMOTE_RUNTIME_INSPECTED_NOW=NAO
REMOTE_GUI_SCREEN_CAPTURE=NAO_PROVADO/NAO_EXPOSTO
```

> 🧼🧽 A caneta existe e está no estojo; hoje ela não encostou no pergaminho porque o device está offline. Quando SEGREDO voltar ONLINE, ela pode medir runtime de verdade e devolver receipt ao #1444. 📜⚖️
