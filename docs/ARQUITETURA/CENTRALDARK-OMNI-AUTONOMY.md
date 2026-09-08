# CentralDark.exe + Bridge + Omni — ONE BLOOD

Status: `CRYSTALLIZED_CONTRACT / RUNTIME_REQUIRES_REMEASUREMENT`
PR-mãe/rendezvous: `#1444`

## Regra

A CentralDark mantém um único sangue operacional. O app, a CLI, o Bridge e os agentes não escolhem provedores por conta própria. Todos entram pelo Omni Router local e consultam o mesmo estado vivo.

```text
ONE_SYSTEM_ONLY=true
ONE_ROUTER_PROCESS=true
ONE_ENTRYPOINT=http://127.0.0.1:8099
CENTRALDARK_EXE_ENTRYPOINT=OMNI
BRIDGE_ENTRYPOINT=OMNI
LOCAL_FIRST=true
DEFAULT_ENGINE=hermes
THIRD_PARTY_REQUIRED_FOR_CORE=false
REMOTE_DESKTOP_REQUIRED_FOR_CORE=false
EXTERNAL_PROVIDERS=OPTIONAL_ADAPTERS
REUSE_BEFORE_CREATE=true
NO_SECOND_ROUTER=true
NO_SECOND_EVENT_BUS=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

## Geometria viva

```text
                   CENTRALDARK.EXE
                        │
                        │ IPC / HUD
                        ▼
                 CENTRALDARK BRIDGE
                        │
                        ├── state JSON consultável pelo .exe
                        ├── Screenpipe sidecar
                        └── Remote Desktop Commander (opcional)
                        │
                        ▼
              127.0.0.1:8099 OMNI ROUTER
                        │
                SAME FASTAPI PROCESS
                        │
          ┌─────────────┼──────────────┐
          │             │              │
   /v1/chat        /v1/responses   /v1/messages
          │             │              │
          └─────────────┴──────┬───────┘
                               ▼
                      execute_with_failover
                               │
                         HERMES LOCAL
                         127.0.0.1:8645
                               │
                    MCP / tools / filesystem
                    ledger / receipts / state
                               │
                               ▼
                         REALITY JUDGE

Opcional sob habilitação explícita:
Nous / Google / Claude Code / XAI / Abacus / OpenAI
```

## Ferida fechada: `claude-code` 404 em `/v1/messages`

A superfície observada chamava `http://127.0.0.1:8099/v1/messages` com `model=claude-code` e recebia HTTP 404. A extensão `centraldark_omni_compat.py` adiciona o wire Anthropic ao MESMO `core.app`.

Com `CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS=0`, aliases externos pedidos pela UI são normalizados para Hermes local. Assim `claude-code` não vira requisito para o core estar vivo.

## Bridge como cordão umbilical, não segundo cérebro

`CentralDark-Remote-Bridge.ps1` agora mantém simultaneamente:

1. Omni Router local 8099;
2. sidecar de contexto/Screenpipe;
3. Remote Desktop Commander como conector opcional;
4. `context/centraldark-live-state.json` como projeção sanitizada de estado.

Falha ou refresh-token inválido no Remote Desktop Commander NÃO desliga o Omni e NÃO transforma o core em offline. O estado fica `AUTH_STALE`/`RETRYING` e o Bridge continua preservando o sangue local.

## CentralDark.exe

O Electron já usa `OMNI_ROUTER_BASE_URL` como cérebro único. Nesta cristalização ele também ganha:

```text
centraldark:bridge:state
```

que lê `CENTRALDARK_BRIDGE_STATE_FILE` e entrega ao HUD a mesma projeção produzida pelo Bridge.

O canal legado `centraldark:hermes:health` continua por compatibilidade, mas mede o Omni em vez de criar acesso paralelo ao Hermes.

## Terceiros

Por padrão:

```text
CENTRALDARK_DEFAULT_ENGINE=hermes
CENTRALDARK_FALLBACK_CHAIN=hermes
CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS=0
```

Terceiros podem ser habilitados como fallback, nunca como requisito de boot:

```text
CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS=1
```

## 24/7

`scripts/launch_omni_router.py` é o supervisor de processo do Omni. Ele remove os hardcodes antigos de caminho do Pivete, resolve o repo relativo ao próprio script e reinicia o mesmo processo com backoff.

O Bridge chama esse owner em vez de criar um segundo launcher. A persistência após reboot do Windows/VPS deve reutilizar o owner de boot já existente do ambiente. Esta mudança não cria tarefa agendada nem serviço novo automaticamente.

## Prova exigida antes de chamar FIXED_POINT

```text
1. CentralDark.exe -> centraldark:omni:health = ONLINE
2. CentralDark.exe -> centraldark:bridge:state = MEASURED
3. GET 8099/health = PASS
4. POST 8099/v1/messages model=claude-code = resposta via Hermes quando externos OFF
5. Remote Desktop offline não derruba 8099
6. tool ledger/receipt mantém GOAL_ID + NEXT_CURSOR após reconnect/truncation
7. mesmo HEAD passa CI
```

Até isso ocorrer em runtime:

```text
CODE_COMMITTED != EXECUTED
DOCUMENTED != DEPLOYED
UNKNOWN != PASS
FIXED_POINT=false
```
