# ⛏️ SEGREDO RELÍQUIA — Addendum iPhone / Casa / Rede

> Continuação do HUD de escavação do PR #998. Este documento registra somente fatos observados, vínculos já comprovados, contexto fornecido por SEGREDO/CHEFE e hipóteses ainda `UNKNOWN`.

```text
MODE=FORENSIC_READ_ONLY_SNAPSHOT
SOURCE_IS_AUTHORITY=false
ZERO_DEPLOY=true
ZERO_VPS_MUTATION=true
ZERO_NETWORK_MUTATION=true
ZERO_SECRET_VALUE=true
HISTORICAL_SCREENSHOT != CURRENT_RUNTIME
UNKNOWN != PASS
```

## 1. Correção de pista: `162.243.60.213 / myvpn`

SEGREDO/CHEFE confirmou que a configuração abaixo é própria:

```text
VPN Super - IKEv2
server=162.243.60.213
account=myvpn
ownership=CONFIRMED_BY_CHEFE
```

Classificação:

```text
SUSPICIOUS_LEAD=REMOVED
KEEP_AS_ARCHITECTURAL_CONTEXT=true
```

Não gastar novas rodadas tentando atribuir essa VPN a terceiro sem evidência nova.

---

## 2. iPhone — duas configurações VPN distintas

Screenshots do iPhone mostram duas superfícies salvas e, naquele instante, desconectadas:

```text
VPN DO DISPOSITIVO
└── 1.1.1.1
    └── server=cloudflare-dns.com

VPN PESSOAL
└── VPN Super - IKEv2
    ├── server=162.243.60.213
    └── account=myvpn
```

Em ambas as telas observadas:

```text
CURRENT_SCREEN_STATE=NOT_CONNECTED
CONNECT_ON_DEMAND=OFF
```

O fato de a configuração existir não prova que estava ativa em outro momento; o fato de estar desligada agora não prova que nunca foi usada.

---

## 3. 💎 WARP selecionado de verdade no app 1.1.1.1

As telas do aplicativo 1.1.1.1 mostram:

```text
MODE_SELECTED=WARP
APP_VERSION=6.31.5 (2606300121.1)
SCREEN_STATE=DISCONNECTED
```

A tela de configurações diferencia explicitamente:

```text
1.1.1.1
→ DNS privado da Cloudflare

WARP
→ inclui 1.1.1.1 + transporte privado por protocolo de Internet
```

A tela principal exibe `WARP` e `Desconectado`.

Classificação:

```text
WARP_CONFIGURED_ON_IPHONE=CONFIRMED_BY_SCREENSHOT
WARP_ACTIVE_AT_SCREENSHOT_TIME=NO
WARP_ACTIVE_HISTORICALLY=UNKNOWN
WARP_IS_CENTRALDARK_TUNNEL=UNPROVEN
```

### Distinção que deve permanecer

```text
ESTRADA A — IPHONE
iphone → WARP → Cloudflare → Internet

ESTRADA B — CENTRALDARK
browser/celular → autorização Cloudflare → VPS → DNS/Caddy → api|mcp|gateway
```

As duas estradas usam Cloudflare, mas não devem ser colapsadas sem prova causal.

---

## 4. 💎 Cloudflare ↔ VPS ↔ CentralDark continua confirmado como arquitetura

Owner já medido na `main`:

```text
docs/INSTALADOR/16-cloudflare-dns.md
blob_sha=1f7817ed76ebfab4754b934da0497534a95447a4
```

O wizard documenta:

```text
Cloudflare API/OAuth
→ zona DNS
→ IP público da VPS
→ Caddy
→ subdomínios @|www|app|api|bot|crm|mcp|gateway|webhook|status|install
```

Também existe fluxo pelo celular/navegador:

```text
SSH inicia sessão
→ URL/QR no celular
→ autorização Cloudflare
→ servidor recebe permissão
→ VPS continua configuração
```

E o checker reconhece `mcp.centralldark.com/health` como MCP existente quando responde corretamente.

Classificação:

```text
CLOUDFLARE_VPS_CENTRALDARK_ARCHITECTURE=CONFIRMED
CURRENT_LIVE_TUNNEL=NOT_MEASURED_IN_THIS_ADDENDUM
IPHONE_WARP_IS_SAME_PATH=UNPROVEN
```

---

## 5. 💎 TV — a pista útil não é “Provedor de TV”, é `Rede Local`

Foi observado um aplicativo de controle remoto de TV pedindo:

```text
Permitir acesso à rede local
```

A própria tela explica que o app precisa da rede Wi‑Fi doméstica para:

```text
detectar TV
→ conectar à TV
→ enviar sinais/comandos
```

Em Ajustes do iPhone, a permissão `Rede Local` desse app aparece desligada naquele momento.

Fluxo físico suportado pelos screenshots:

```text
IPHONE
  ↓
APP CONTROLE REMOTO
  ↓
PERMISSÃO REDE LOCAL
  ↓
WI-FI DA CASA
  ↓
DETECÇÃO/CONEXÃO COM TV
```

Classificação:

```text
IPHONE_TO_LOCAL_NETWORK_TV_CAPABILITY=CONFIRMED
LOCAL_NETWORK_PERMISSION_AT_SCREENSHOT=OFF
TV_TO_CENTRALDARK=UNPROVEN
TV_TO_VPS=UNPROVEN
```

### Falso caminho já separado

A tela iOS `Provedor de TV` é configuração de operadora/SSO e não prova TV física, AirPlay, casting ou CentralDark.

---

## 6. 💎 Windows — Radmin Server como superfície histórica de acesso remoto

Screenshots históricos mostram a interface do `Radmin Server` e componentes como:

```text
Radmin Server 3
Fam64Helper.exe
FamItrf2.exe
rserver3.exe
rsetup64.exe
```

Configuração visível:

```text
DEFAULT_PORT=4899
LOG_FILE≈...\SysWOW64\rserver30\Radmin_log.htm
```

Também aparecem timestamps `07/12/2017` e `08/12/2017` em arquivos do diretório.

Esses timestamps são, por enquanto, apenas metadados visuais dos arquivos e não provam sessão remota naquele dia nem no período de agosto/2026.

Classificação:

```text
RADMIN_SERVER_PRESENT_IN_HISTORICAL_SCREENSHOT=CONFIRMED
REMOTE_CONTROL_CAPABILITY=CONFIRMED_AS_SOFTWARE_CAPABILITY
RADMIN_ACTIVE_IN_AUGUST_2026=UNKNOWN
RADMIN_LINK_TO_CENTRALDARK=UNPROVEN
RADMIN_LOG_CONTENT=NOT_READ
```

O arquivo de log, se existir em cópia preservada, é uma mina futura melhor que o timestamp dos binários.

---

## 7. Duas famílias de controle remoto devem ficar separadas

```text
FAMÍLIA A — TV
iphone
→ app de controle remoto
→ rede local Wi‑Fi
→ TV

FAMÍLIA B — PC
Windows
→ Radmin Server
→ rede
→ acesso remoto ao computador
```

`CONTROLE_REMOTO` é capacidade comum; isso não prova que os dois sistemas estavam integrados.

---

## 8. 💎 Janela temporal 08–11/08/2026 — infraestrutura realmente estava movimentada

GitHub medido nesta investigação:

### PR #724 — convergência OmniRoute → CentralDark

```text
PR=#724
created_activity_start≈2026-08-08
state=CLOSED
merged=false
purpose=convergência + missão Hub/MCP + evidência
```

O review de CodeRabbit foi criado em `2026-08-08T07:25:42Z` e atualizado em `2026-08-09T23:38:27Z`.

O corpo descreve:

```text
Hub Command
→ missão queued
→ MCPMissionConsumer
→ execução administrativa
→ EvidenceStore/receipt
→ finalização da missão
```

### PR #727 — Writer portátil / fallback

```text
PR=#727
head=fix/writer-portavel-fallback-20260808
merged=true
```

Registra Writer substituível por handoff, fallback por capacidade e preservação de HEAD/estado.

### PR #733 — promoção da convergência

```text
PR=#733
head=fix/integracao-hub-hermes-pr-mae-20260809
merged=true
merge_commit_sha=667603fbe1a2577e2845fbec847ee523756dacb4
```

Objetivo explícito: promover snapshot convergido da #724 para `main` e consumir causas de CI da promoção.

### PR #760 — MCP vivo + skills + telemetria

```text
PR=#760
head=fix/mcp-live-boot-skills-observability-20260810
merged=true
```

Fluxo registrado:

```text
GitHub autenticado
→ boot vivo
→ skills canônicas
→ MCP tool call
→ correlation id
→ audit JSONL sanitizado
→ LOG_BUFFER/SSE admin
```

### PR #761 — WebUI / modo quente semântico

```text
PR=#761
head=feat/webui-modo-quente-semantico-20260810
merged=true
merge_commit_sha=d9b079ea8da8f143d887aaa44b42cae9490aa7d5
```

Implementa no WebUI:

```text
gatilho semântico
→ modo operacional interno
→ regra no system prompt
→ maior rigor/evidência
```

### Conclusão temporal permitida

```text
08–11 AGO
Hub/Missões + Hermes + MCP + GitHub + telemetria + WebUI + gatilhos
= ATIVIDADE DE SOFTWARE COMPROVADA
```

Isso não deve ser convertido automaticamente em explicação para experiências pessoais ou eventos externos.

---

## 9. iPhone como superfície de observação

Screenshots do mesmo conjunto mostram no telefone:

- notificações de ChatGPT Task Update;
- mensagens ligadas a PRs/gates da CentralDark;
- notificações de GitHub Actions / CodeRabbit;
- browser com muitas abas e material de pesquisa;
- Obsidian com grafo de conhecimento;
- Cloudflare/WARP;
- app de TV/rede local.

Classificação:

```text
IPHONE_AS_OPERATIONAL_OBSERVATION_SURFACE=SUPPORTED_BY_SCREENSHOTS
IPHONE_AS_CANONICAL_EXECUTOR=UNPROVEN
```

Não registrar endereços pessoais, tokens ou outros valores sensíveis no dossiê.

---

## 10. Contexto pessoal relatado pelo CHEFE — guardar sem converter em causalidade

SEGREDO/CHEFE relaciona esse período a uma experiência pessoal intensa e a um intervalo posterior de descanso/afastamento do PC.

Regra de armazenamento desta nota:

```text
USER_REPORTED_CONTEXT=PRESERVED
TECHNICAL_CAUSE=UNPROVEN
DO_NOT_ERASE_CONTEXT=true
DO_NOT_PROMOTE_TO_CAUSAL_FACT=true
```

A investigação técnica deve se limitar a vincular timestamps, logs, commits, configurações e artefatos quando existirem.

---

## 11. O OURO desta rodada

```text
💎 OURO_WARP
WARP estava selecionado/configurado no iPhone; screenshot atual mostra desconectado.

💎 OURO_CLOUDFLARE_VPS
CentralDark possui fluxo Cloudflare↔VPS, inclusive autorização por navegador/celular.

💎 OURO_TV_REDE_LOCAL
iPhone tinha app cuja capacidade explícita é Rede Local→detectar/conectar TV.

💎 OURO_RADMIN
Windows fotografado possuía Radmin Server, porta 4899 e configuração de arquivo de log.

💎 OURO_TEMPORAL
08–11/08/2026 possui sequência material de PRs Hub/Hermes/MCP/telemetria/WebUI.

💎 OURO_IPHONE_SUPERFICIE
o telefone aparece como superfície de observação de tasks, GitHub, browser, Obsidian, Cloudflare e rede local.
```

---

## 12. Mapa-mãe atualizado SEM trocar arquitetura

```text
                    CENTRALDARK
                         |
            ┌────────────┼────────────┐
            |            |            |
           VPS          CASA        IPHONE
            |            |            |
       Cloudflare      Hermes      Obsidian
            |            |            |
        MCP/API       Windows       WARP
            |            |            |
      Hub/Missões      Radmin     Rede Local
            |            |            |
       Telemetria    acesso PC   Controle Remoto
                                      |
                                     TV
```

Vínculos ainda proibidos de declarar sem nova prova:

```text
WARP ↔ CentralDark private tunnel
TV ↔ CentralDark
Radmin ↔ CentralDark
Radmin ↔ eventos de agosto/2026
experiência pessoal ↔ causa de software
```

---

## 13. Próximas minas de maior valor

Sem executar agora:

```text
A) Radmin/log remoto
B) app Controle Remoto / rede local / identificação de TV
C) Cloudflare/WARP ↔ configuração histórica da VPS
D) logs e receipts da janela 08–11/08
E) screenshots/artefatos já catalogados no PR #979
```

Frase operacional:

```text
ACHOU CAPACIDADE ≠ PROVOU VÍNCULO.
ACHOU VÍNCULO ≠ PROVOU CAUSA.
HASH + HORA + LOG + MESMO CAMINHO = AÍ SIM APERTA A PROVA.
```
