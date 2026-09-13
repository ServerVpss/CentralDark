# Screenpipe Browser Bridge — WebSocket 403

Owner: `.agents/skills/screenpipe-live-observer/SKILL.md`  
Escopo: classificação e contraprova do browser bridge local; não cria API, skill, runtime ou protocolo paralelo.

## Contrato conhecido

O bridge já foi reconciliado com estes campos:

```text
DEFAULT_BASE_URL=http://127.0.0.1:3030
TOKEN_STORAGE_KEY=screenpipe_token
BASE_URL_STORAGE_KEY=screenpipe_base_url
WS_PATH=/connections/browser/ws
HEALTH_PATH=/health
BROWSER_STATUS_PATH=/connections/browser/status
```

Nunca persistir o valor do token em receipt, log ou Git.

## Lei de classificação

```text
HTTP_403_DURING_WEBSOCKET_HANDSHAKE
!= CONNECTION_REFUSED
!= DAEMON_DOWN_PROOF
!= TOKEN_EXPIRED_PROOF
!= ORIGIN_BLOCKED_PROOF
```

Um `403` recebido durante o upgrade WebSocket prova apenas que a tentativa chegou a uma superfície HTTP capaz de rejeitar o handshake naquele instante.

Classificação mínima:

```text
WS_ENDPOINT_REPLIED=true
WS_UPGRADE_ACCEPTED=false
REJECTION_CLASS=AUTH_OR_POLICY_CANDIDATE
ROOT_CAUSE=UNKNOWN
```

As causas abaixo são hipóteses até evidência discriminante do backend/configuração:

```text
TOKEN_INVALID_OR_EXPIRED
ORIGIN_NOT_ALLOWED
SESSION_LIMIT_OR_STALE_SESSION
SERVER_AUTH_POLICY_REJECTION
EXTENSION_CONFIG_STALE
```

## Reconnect storm

Repetir o mesmo handshake `403` sem nova informação não pode gerar falso progresso.

```text
SAME_403_WITH_SAME_CONFIG
→ DEDUPE
→ BACKOFF
→ AUTH_OR_POLICY_BLOCKED
→ REQUEST_DISCRIMINATING_EVIDENCE
```

Não girar loop agressivo para sempre.

Mas também não editar uma cópia de `worker.js` observada em browser/extension sem provar o owner versionado do código.

```text
OBSERVED_WORKER != CANONICAL_SOURCE_OWNER
PATCH_OWNER_UNKNOWN → NO_BLIND_PATCH
```

## Próxima prova segura

Sem mostrar token/cookie/secret:

```text
1. GET http://127.0.0.1:3030/health
2. GET http://127.0.0.1:3030/connections/browser/status
3. medir processo dono da porta 3030
4. ler motivo do 403 no log do backend com redaction
5. medir base URL/origin/config metadata da extensão sem valor de token
6. localizar source owner do worker
```

Depois classificar:

```text
TOKEN_INVALID_OR_EXPIRED=PROVED|REFUTED|UNKNOWN
ORIGIN_NOT_ALLOWED=PROVED|REFUTED|UNKNOWN
SESSION_POLICY=PROVED|REFUTED|UNKNOWN
BACKEND_AUTH_POLICY=PROVED|REFUTED|UNKNOWN
```

Somente a primeira causa discriminada recebe patch.

## Contraprova obrigatória

Após correção no owner real:

```text
HTTP_HEALTH=PASS
BROWSER_STATUS=PASS ou estado esperado documentado
WS_HANDSHAKE=101_SWITCHING_PROTOCOLS ou estado equivalente comprovado
HELLO_FRAME=PROVED quando aplicável
HEARTBEAT=PROVED quando aplicável
REPEATED_403_LOOP=ABSENT
TOKEN_VALUE_EXPOSED=false
```

`FIXED_POINT` permanece falso se o WebSocket apenas parar de logar erro sem prova do canal funcional.
