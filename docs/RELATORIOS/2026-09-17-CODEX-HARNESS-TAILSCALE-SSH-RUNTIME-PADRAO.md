# 👑🪬 RELATÓRIO · PADRÃO REPETÍVEL CODEX HARNESS + SSH + TAILSCALE

Data: 2026-09-17
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_CRYSTALLIZED`
Tipo: `RECEIPT_OPERACIONAL_REPETÍVEL`

## Intenção

Preservar o padrão da sessão para que próximas IAs/agentes repitam a façanha sem reaprender do zero:

```text
CHATGPT / SOL
→ Remote Desktop Commander no SEGREDO
→ Codex harness medido
→ fallback SSH alias quando sandbox falhar
→ VPS vmi3256920
→ Tailscale / portas / WebUI
→ RESULT_ONLY
```

## Gate antes do commit

```text
PDF_GATE_BEFORE_COMMIT_REQUIRED=true
TLC23_READ_BEFORE_MUTATION=true
NO_AFTER_THE_FACT_PDF_PROOF=true
```

Aplicação Horn operacional:

```text
SE CHEFE_ENTREGA_DELTA=true
E DELTA_TOCANDO_REGIME_OPERACIONAL=true
E TLC23_GATE_LIDO_ANTES=true
E OWNER_EXISTENTE=true
ENTÃO COMMIT_RECEIPT_OPERACIONAL=true
```

Contradição ou prova ausente não vira verde; vira `UNKNOWN`, `BLOCKED` ou `FAIL_CLOSED`.

## Fatos medidos nesta sessão

### Remote Desktop Commander

```text
REMOTE_DESKTOP_COMMANDER=PASS
DEVICE=SEGREDO
DEVICE_STATUS=online
PING_CHATGPT_TO_SEGREDO=PASS
PONG_UTC=2026-09-17T07:16:40Z
```

### Tailscale no Windows/SEGREDO

```text
TAILSCALE_WINDOWS=RUNNING
TAILSCALE_SELF=100.118.223.100 segredo sonasmarcas@ windows
TAILSCALE_STATUS_VISIBLE_PEERS=somente_SEGREDO
PING_TO_VPS_100.121.152.119=FAIL
ERROR=no_matching_peer
DNS_vmi3256920.tail6d7aa4.ts.net=NXDOMAIN_no_windows
```

Leitura: o Remote Commander estava conectado, mas o Windows estava em outra identidade/tailnet Tailscale em relação à VPS observada.

### VPS via terminal humano/SSH

```text
HOST=vmi3256920
CWD=/root/CentralDark
TAILSCALE_SELF=100.121.152.119 vmi3256920 segredounlock@ linux
TAILSCALE_SERVE_BEFORE=/ -> http://127.0.0.1:8787
TAILSCALE_SERVE_AFTER=/ -> http://127.0.0.1:3000
PUBLIC_FUNNEL_USED=false
CADDY_CHANGED=false
FIREWALL_CHANGED=false
```

### Porta 3000

```text
PORT_3000_LISTENING=PASS
PORT_3000_OWNER=docker-proxy
PORT_3000_BIND=0.0.0.0:3000
HTTP_3000=200
BODY_HEAD=OpenWebUI-like HTML assets (/static/favicon.png)
```

Conclusão: a `3000` estava viva, mas o owner observado foi `docker-proxy`; não promover como `CentralDark-UI` puro sem contraprova adicional. O mapa de source diz `centralldark.com -> UI :3000`, mas runtime vivo tem prioridade quando medido no alvo correto.

### Porta 8787

```text
SOURCE_CANONICO=HERMES_WEBUI_PORT=8787
DESKTOP_CONTRACT=http://127.0.0.1:8787
TAILSCALE_SERVE_BEFORE=/ -> 8787
TAILSCALE_SERVE_AFTER=/ -> 3000
```

Conclusão: `8787` é a porteira Hermes/WebUI canônica/histórica. Se o Serve foi mudado para `3000`, registrar que a raiz `https://vmi3256920.tail6d7aa4.ts.net/` passou a apontar para `3000` até ser restaurada.

### Codex harness

```text
CODEX_PROCESS_FOUND=PASS
CODEX_BIN=C:\Users\Administrador\AppData\Local\OpenAI\Codex\bin\eab8377aebac6c07\codex.exe
CODEX_PLUGIN_BIN=C:\Users\Administrador\.codex\plugins\.plugin-appserver\codex.exe
CODEX_COMPUTER_USE_FOUND=PASS
CODEX_VERSION=codex-cli 0.155.0-alpha.2.6
CODEX_DOCTOR_AUTH=PASS
CODEX_WEBSOCKET=PASS
CODEX_SANDBOX_PROVISIONING=PASS
CODEX_SANDBOX_EXEC=FAIL
SANDBOX_ERROR=CreateProcessWithLogonW failed: 267
```

Leitura: usar o Codex como harness mental/orquestrador e fonte de capacidades autenticadas é válido, mas o `codex sandbox` local falhou nesta sessão. Não declarar execução dentro do sandbox quando o backend retorna erro 267.

### SSH alias

```text
SSH_CONFIG_PATH=C:\Users\Administrador\.ssh\config
ALIAS=segredo-vpss
HOSTNAME=89.117.78.124
USER=root
IDENTITY_FILE=C:/Users/Administrador/.ssh/segredo_vps_ed25519
BATCH_SSH_COMMAND_RETURNED_EXIT_0_BUT_EMPTY_OUTPUT=true
SSH_ALIAS_RUNTIME_PROOF=PARTIAL
```

Leitura: o alias existe e aponta para a VPS pública, mas a medição automática pela ponte retornou saída vazia. Quando houver terminal humano ou shell confiável, executar pelo alias e exigir output de `hostname`/`date`/`whoami` antes de operação.

## Regra repetível

```text
1. Medir Remote Commander.
2. Medir Tailscale local.
3. Se Windows não enxerga a VPS na tailnet, não culpar WebUI.
4. Usar SSH alias `segredo-vpss` ou terminal humano já autenticado.
5. Na VPS, medir `hostname`, `date -Is`, `tailscale status --self`.
6. Medir owner das portas antes de qualquer serve/restart.
7. Se `tailscale serve status` já aponta `/` para 8787, registrar antes de trocar.
8. Se temporariamente trocar `/` para 3000, registrar que 8787 deixou de ser raiz do Serve.
9. Não usar Funnel para esse caso; apenas tailnet-only.
10. Devolver `RESULT_ONLY`.
```

## Comando seguro para repetir na VPS

```bash
set -Eeuo pipefail

echo "RESULT_BEGIN"
echo "HOST=$(hostname)"
echo "TIME=$(date -Is)"
echo "TAILSCALE_SELF=$(tailscale status --self 2>/dev/null || true)"
echo "SERVE_STATUS_BEFORE<<EOF"
tailscale serve status 2>/dev/null || true
echo "EOF"
echo "PORTS<<EOF"
ss -ltnp 2>/dev/null | grep -E ':(3000|8787|9100|8098|8090|3030)\b' || true
echo "EOF"
for port in 3000 8787 9100 8098 8090 3030; do
  code=$(curl -sS -w '\n%{http_code}' --max-time 5 "http://127.0.0.1:$port/" 2>/dev/null | tail -n1 || echo FAIL)
  echo "HTTP_$port=$code"
done
echo "MUTATION_PERFORMED=false"
echo "RESULT_END"
```

## Comando para expor 3000 somente na tailnet

Somente depois de `HTTP_3000=200` e owner medido:

```bash
tailscale serve --bg 3000
tailscale serve status
```

## Comando para restaurar a raiz para 8787

Somente depois de provar que 8787 responde ou que este é o alvo pretendido:

```bash
tailscale serve --bg 8787
tailscale serve status
```

## Critério de verde real

```text
REMOTE_COMMANDER=PASS
TAILSCALE_SAME_TAILNET=PASS
SSH_ALIAS_OUTPUT=PASS
VPS_HOST_PROVEN=PASS
PORT_OWNER_PROVEN=PASS
HTTP_TARGET=PASS
TAILSCALE_SERVE_STATUS_MATCHES_TARGET=PASS
NO_FUNNEL=true
NO_CADDY_CHANGE=true
NO_FIREWALL_CHANGE=true
```

Enquanto qualquer item faltar:

```text
RUNTIME_ACCESS_STATUS=PARTIAL|UNKNOWN
```

## Frase de Casa

> Oxe, meu rei: quando a estrada Tailscale cai em outra freguesia, não acusa a WebUI; mede a ponte, pega o alias SSH, confere a porteira da porta, e só depois mostra a janela na tailnet.
