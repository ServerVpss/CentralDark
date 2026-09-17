# REMOTE-TRAY-STATUS-CANONICO

**Schema:** `centraldark.remote-tray.status.v1`  
**Owner:** `CENTRALDARK`  
**Estado do contrato:** `CRISTALIZADO`  
**Destino lógico Windows:** `%LOCALAPPDATA%\CentralDark\Remote-Tray`  
**Destino lógico VPS:** `/root/CentralDark/runtime/remote-tray`

---

## 🎯 MISSÃO

Unificar o estado do CentralDark Remote Tray em um padrão mensurável, preservando autenticação viva de cada componente e impedindo falso-verde.

```text
CURRENT > HISTORICAL
REALITY = JUDGE
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
PROCESS_ALIVE != DEVICE_ONLINE
ONLINE_CLAIM != ONLINE_PROVED
ONE_REMOTE_PROCESS_PER_PROFILE=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
```

---

## 📊 PLACAR CANÔNICO

```text
ARTEFATO / ESTRUTURA         [██████████] 100%  quando todos os checks estáticos passam
HARNESS / PARSER             [██████████] 100%  quando harness=PASS
SUPERVISOR                   [??????????] medir runtime
AUTH REAL                    [??????????] medir runtime
ONLINE REAL                  [??????????] medir runtime
PERSISTÊNCIA VPS             [??????????] medir systemd/runtime
```

Porcentagem só é usada com denominador fechado.

---

## 🧠 ESTADOS

### wrapper_state

```text
INICIANDO
PROCESSO_ATIVO
AUTH_REQUIRED
RECONEXAO
ONLINE_CLAIM
ENCERRANDO
FALHA
```

### sensor_state

```text
UNKNOWN
LOCAL_MCP_OK
REMOTE_MCP_OK
DEVICE_CODE_READY
AUTHORIZED
ONLINE_PROVED
PROCESS_EXIT_NONZERO
STALE_SESSION
SUPERVISOR_CONTAINED
```

### verdict

```text
PROVADO
QUEBRADO
EVIDENCIA_FALTANTE
```

---

## 🔐 AUTENTICAÇÃO

O Tray é **porta de entrada e supervisor**, não cofre único de tokens.

```text
1_TRAY=true
N_AUTH_SESSIONS_ISOLATED=true
SHARED_CONTROL_PLANE=true
SHARED_CREDENTIAL_STORE=false
OVERWRITE_LIVE_AUTH=false
```

### Remote Desktop Commander

```text
sessão válida       -> PRESERVAR
stale refresh token -> reautenticar somente o perfil
processo existente  -> NÃO iniciar concorrente
```

### Hermes

```text
Hermes -> CentralDark MCP OAuth
Tray pode abrir/conduzir o fluxo
Token continua pertencendo ao perfil Hermes
```

### Screenpipe

```text
Sensor da Casa permanece na Casa quando a intenção é observar Windows/tela/navegador.
Token não entra em Git, receipt ou log sanitizado.
```

---

## 🧾 CÓDIGOS DE RAZÃO

```text
RZ-001 REMOTE_PROCESS_EXIT_NONZERO
RZ-002 CURRENT_LOG_PATH_EMPTY
RZ-003 PROCESS_ALIVE_IS_NOT_DEVICE_ONLINE
RZ-004 AUTH_CODE_NOT_GENERATED
RZ-005 SENSOR_STATE_UNKNOWN
RZ-006 STALE_REFRESH_TOKEN_DETECTED
RZ-007 VERIFICATION_URL_CAPTURED
RZ-008 AUTH_SUCCESS_OBSERVED
RZ-009 ONLINE_CLAIM_ONLY
RZ-010 ONLINE_PROVED_BY_EXTERNAL_JUDGE
RZ-011 SUPERVISOR_CONTAINED_EXCEPTION
RZ-012 SIDECAR_REUSED
RZ-013 CALLBACK_PORT_IN_USE
RZ-014 OWNER_TOKEN_MISSING
RZ-015 SOCKET_RECONNECT
```

---

## ✅ CRITÉRIO DE PASS

`PROVADO` somente se:

```text
local_mcp_connected=true
remote_mcp_connected=true
sensor_state != UNKNOWN
online_proved=true
last_exit=null OU last_exit=0
```

Caso contrário:

```text
falha observada        -> QUEBRADO
prova insuficiente     -> EVIDENCIA_FALTANTE
```

---

## 🔁 SUPERVISÃO

```text
retry_with_backoff=true
backoff=5,10,20,40,60
infinite_restart=false
watchdog_is_not_second_writer=true
```

Fluxo:

```text
MEDIR
→ DETECTAR
→ MENOR REMEDIAÇÃO
→ REMEDIR
→ CONTRAPROVAR
→ REALITY_JUDGE
→ FIXED_POINT ou BLOCKED
```

---

## 🖥️ MENU OPERACIONAL

```text
[1] Estado geral
[2] Abrir login Remote
[3] Copiar código Remote
[4] Abrir log atual
[5] Abrir receipt JSON
[6] Reconectar Remote
[7] Rodar testes do pacote
[8] Abrir runtime local
[9] Ver regra/contrato canônico
[0] Sair

[!] Confirmar ação crítica
```

`!` significa **confirmação de ação**, nunca PASS.

---

## 🏠 CASA ↔ VPS

```text
CASA / Windows
  Tray + Screenpipe + interface humana
         │
         │ bridge
         ▼
VPS / Linux
  Remote + Hermes + CentralDark MCP + systemd/watchdog
```

```text
PC_OFF != REMOTE_OFF
SAME_LOGICAL_LAYOUT=true
SAME_ABSOLUTE_PATH=false
```

---

## 📌 FIXED POINT DESEJADO

```text
REMOTE_AUTH=PRESERVED
SCREENPIPE_AUTH=PRESERVED
HERMES_AUTH=PRESERVED
VPS_SYSTEMD_PERSISTENT=true
ONE_REMOTE_PROCESS_PER_PROFILE=true
DEVICE_ONLINE=PROVED
PC_REQUIRED_FOR_VPS_RUNTIME=false
```
