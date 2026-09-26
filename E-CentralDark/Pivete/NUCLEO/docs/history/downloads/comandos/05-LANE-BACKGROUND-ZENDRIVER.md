# Lane Background — Zendriver

## Código existente

```text
apps/modulos/elite-gateway/scripts/elite_ws_gateway.py
apps/modulos/elite-gateway/scripts/send_and_dump.py
```

## O que já existe

`elite_ws_gateway.py`:

- FastAPI;
- WebSocket;
- token via env;
- perfil Zendriver via env;
- Chrome via env;
- abre `chatgpt.com`;
- inicia browser headless.

Porém o loop atual é `echo`.

`send_and_dump.py`:

- inicia Zendriver;
- abre ChatGPT;
- acha `div[contenteditable=true]`;
- digita prompt;
- pressiona Enter;
- lê elementos `[data-message-author-role]`;
- persiste mensagem observada.

Logo:

```text
BACKGROUND_BROWSER_MECHANISM=REAL_CODE
CANONICAL_PROTOCOL=ABSENT
CURRENT_UI_SELECTORS_STABLE=UNPROVEN
```

## Evolução correta

Não criar `send_and_dump_v4`.

Convergir o legado para:

```text
elite-gateway
→ provider zendriver
→ Browser Bridge V1
```

## Provider interface

```yaml
provider: zendriver
methods:
  - status
  - observe
  - context
  - navigate
  - click
  - type
  - submit
  - console_if_available
  - network_if_available
```

Cada método retorna dados brutos ao Browser Bridge.

O provider não cria evento canônico sozinho.

## Sessão

Perfil/login ficam no browser profile já autorizado.

Não transportar cookies ou token de sessão para Hermes.

```text
BROWSER_PROFILE_STAYS_WITH_PROVIDER=true
SESSION_SECRET_TO_HERMES=false
```

## Robustez

Selectors específicos de uma página ficam em adapters por site, não no core do bridge.

```text
Browser Bridge
  └── providers/zendriver
        └── site-adapters/chatgpt
```

Se o selector falhar:

```text
UI_CONTRACT_DRIFT
→ FAIL
→ evidence
→ sem fallback silencioso
```
