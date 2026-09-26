# E2E Forensic Protocol — Screenpipe → Hermes (Casa)

Condensado do protocolo usado em 2026-08-30 para provar (ou refutar) se o Hermes
consome Screenpipe, sem palpite. Aplica-se a qualquer teste de cadeia causal
agente↔ferramenta↔runtime.

## Leis (não negociáveis)
- `CONFIGURED != ACTIVE`
- `ACTIVE != INVOCATION_PROVEN`
- `HEALTH != PROVIDER_INVOCATION_PROOF`
- `CORRELATION != CAUSE`
- `UNKNOWN != PASS`
- `ACTION != PROOF`

## Mapa de portas medido (Windows, máquina do Chefe)
| Porta | Processo | Papel | Estado |
|---|---|---|---|
| 3030 | screenpipe-app.exe | Screenpipe Desktop API | RUNTIME PASS (/health=200, /=403 auth) |
| 8099 | node.exe | CentralDark Omni Router | RUNTIME PASS (/health,/v1/models=200) |
| 8787 | node.exe (sol-gateway-local.mjs) | Gateway Casa / hermes-web-ui local | RUNTIME PASS (/health=200) |
| 8645 | — | Hermes server (CLI) | NOT LISTENING |
| 3100 | — | MCP CentralDark | NOT LISTENING |
| 100.125.83.74 | Tailscale IPv4 | Acesso remoto | MAGICDNS ativo |

## Passos canônicos (READ_ONLY, ZERO_MUTATION)
1. **Portas vivas** — `Get-NetTCPConnection -State Listen` + `Get-CimInstance Win32_Process`.
   Guardar PID/Exe. NÃO imprimir segredo.
2. **Config refs (sem ler segredos)** — `search_files` com `file_glob` estreito
   (yaml/json) + `grep -ivE ".env|token=|credential"`. Evitar grep amplo em
   `node_modules`/dist (estoura 90s/100K capture).
3. **Screenpipe vivo** — `curl 127.0.0.1:3030/health` → 200 = alcançável;
   403 root = auth ok (não é falha).
4. **Omni vivo + invocação** — `POST /v1/chat/completions model=hermes/hermes`.
   Se retornar `hermes_stdio_turn_failed` → OMNI_RUNTIME PASS, OMNI→HERMES FAIL
   (engine não responde; não investigar env para não violar "não mexer").
5. **Tool carregada na sessão?** — listar tools da system prompt. Se não há
   `screenpipe`/MCP → `HERMES_SCREENPIPE_TOOL_LOADED=UNKNOWN`, invocação impossível.
6. **Teste causal (A vs B)** — A: consultar Screenpipe direto (fingerprint).
   B: via Hermes tool (fingerprint). Comparar. Se B não executável (tool ausente)
   → `SCREENPIPE_TO_HERMES_CAUSAL=UNKNOWN`. Não declarar PASS.
7. **Trace E2E** — propagar `TRACE_ID` por Screenpipe→Hermes→Omni→engine;
   buscar o ID nos logs. Mesmo ID + timestamps coerentes = cadeia forte.

## Veredito honesty
- 🟢 = provado por medição (processo/health/porta).
- 🟡 = CONFIGURED_NOT_PROVEN (doc existe, instância não confirmada).
- 🔴 = falha real (invoke deu erro) ou tool ausente na sessão.
- Sempre separar "Screenpipe roda" de "Hermes enxerga Screenpipe". O primeiro
  não prova o segundo.

## Hermex / iPhone (conectividade, não instrumentação)
- `hermex` = app iPhone nativo SwiftUI para hermes-web-ui (App Store id6767006319).
  É cockpit, NÃO controla o PC. Conversa com hermes-webui (8787).
- iPhone precisa de HTTPS: `tailscale serve --bg 8787` (requer Serve habilitado
  no tailnet — clique do usuário em login.tailscale.com/f/serve?node=...).
- URL no Hermex: `https://<maquina>.ts.net` (do `tailscale serve status`) + senha.
- computer_use/browser são nativos do Hermes (cua-driver.exe presente em
  `AppData\Local\hermes\bin\`); habilitar toolsets no config.yaml se necessário.
- Fallback HTTP `http://100.125.83.74:8787` pode ser barrado por App Transport
  Security do iOS — preferir HTTPS do Tailscale Serve.
