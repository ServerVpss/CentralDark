# 🔒 CRISTAL — HERMES HARNESS / 2026-09-14

## Intenção do CHEFE
Consolidar a CentralDark como um único organismo, reduzindo complexidade inútil e preservando Hermes como corpo agente central.

## Cânone
- `ONE_SYSTEM_ONLY=true`
- `ONE_GATEWAY=true`
- `ONE_TOOL_CATALOG=true`
- `HERMES_IS_AGENT_BODY=true`
- `MODELS_ARE_ENGINES=true`
- `REUSE_BEFORE_CREATE=true`
- `NO_PARALLEL_MARKETPLACE=true`
- `UNKNOWN_IS_NOT_PASS=true`
- `REALITY_IS_JUDGE=true`

## Topologia
`CHEFE → SOL → HERMES → MCP/TOOLS + Gateway/Models → REALIDADE`

Hermes mantém memória, workspace, tools, skills, loops, execução e continuidade. Modelos como Grok, GPT, Claude, Gemini, Nous e Abacus são motores substituíveis.

Claude/VS Code/Codex/Gemini/Antigravity são cabines ou instrumentos; não são novo cérebro da Casa.
## Superfícies canônicas
Três superfícies normais públicas:
1. `https://centralldark.com`
2. `https://api.centralldark.com`
3. `https://mcp.centralldark.com/mcp`

Superfície administrativa privada, fora da contagem normal:
- `https://admin.centralldark.com`

`hub.centralldark.com` fica como compatibilidade até redirect/aposentadoria; não vira quinta superfície canônica.

Proteção do admin: edge gate, sessão/OAuth CentralDark, reautenticação para ação crítica, auditoria e rate limit; credencial root da VPS no navegador é proibida.

## Fluxo único permanente
Toda ferramenta/ação converge pelo MCP CentralDark:
- discovery: `tools/list`
- execução: `tools/call`
- admin/destrutivo: `mcp_admin_call`

Hermes, Zendrive, Elite, OAuth Broker, Arsenal, Artifacts, DarkAI, GitHub, VPS, Files, Logs, Deploy, Browser, Skills e Memory são capacidades internas consumidas pelo adaptador canônico, sem marketplace paralelo.
## Estados e fallback
- opcional OFF = `AVAILABLE_OFF` / non-blocking
- fallback equivalente saudável = `DEGRADED_NON_BLOCKING`
- obrigatório sem fallback = `REQUIRED_UNAVAILABLE`
- `QUEUED/PENDING/IN_PROGRESS = WAIT`
- `MERGED != DEPLOYED`

## Credenciais e clientes
Clientes devem preferir a rota oficial `https://api.centralldark.com/v1` e uma credencial CentralDark única por finalidade, sem espalhar secrets no repo. OAuth/session tokens continuam separados de API keys por natureza.

Casa e VPS podem consumir o mesmo Gateway e o mesmo catálogo MCP. O alias `Segredo-VPS` é a entrada humana simplificada; SSH funcional precisa ser provado por sessão, não apenas porta aberta.

## Gates do Hermes → Gateway
Antes de promover o Gateway como backend final do Hermes, provar end-to-end: `tools`, `tool_choice`, `tool_calls`, `tool_call_id`, argumentos, tool result, continuação, streaming, timeout/error e fallback sem recursão `Hermes → Gateway → Hermes`.

## Regra de cristal
`usar pode, redesenhar não`.
Toda informação de outro agente é `DELTA_UTIL` até ser reconciliada com arquivo/processo/runtime/teste/log.

## Fixed point
Só declarar verde quando CI do HEAD exato, runtime e contraprova concordarem. Falha ou estado desconhecido impede promoção para `main`.

## 🔒 Cristal adicional — ChatGPT ↔ Casa do SEGREDO

`CHATGPT_CAN_OPERATE_CASA_SEGREDO=true`.

Prova viva em 2026-09-14: o Remote Desktop Commander listou `SEGREDO` como `online`, com autenticação válida, respondeu `pong` e aceitou execução remota no Windows da Casa. A mesma sessão mediu GitHub `200`, MCP `200` e Tailscale direto Casa ↔ VPS.

Fluxo cristalizado:

`ChatGPT → Remote Desktop Commander → SEGREDO/Casa → arquivos/processos/terminal → GitHub/MCP/VPS conforme a rota disponível → REALIDADE`.

A capacidade é oficial; o estado de cada transporte continua temporal e deve ser remedido antes de alegar saúde atual.
