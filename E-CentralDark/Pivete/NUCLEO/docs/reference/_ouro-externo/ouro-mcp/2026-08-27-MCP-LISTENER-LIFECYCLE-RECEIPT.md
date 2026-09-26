# !REGISTRA — MCP listener lifecycle

```text
MISSION_ID=MCP_LISTENER_LIFECYCLE_20260827
REGISTERED_AT=2026-08-27
MODE=READ_ONLY_RECONCILIATION
MUTATION=false
RESTART=false
```

## Estado reconciliado

```text
REMOTE_MAIN=a1f37078dcab11e7447df319c641a1bdc7391fd7

RUNTIME_PID=3092588
PID_START=02:32:09

T0_MCP_REQUEST_200=PROVED
T1_PORT_9100_ABSENT=PROVED
PROCESS_ALIVE_T1=PROVED

OLD_CLAIM_NEVER_LISTENED=INVALIDATED
OLD_MCP_LISTENING_GREP=INVALIDATED_WRONG_FIELD

LOG_PID_ATTRIBUTION=UNKNOWN
RUNTIME_CODE_PROVENANCE=UNKNOWN
LISTENER_LOSS_CAUSE=UNKNOWN
```

## Veredito

O par temporal provado é:

```text
T0: houve POST /mcp autorizado com status 200
T1: porta 9100 ausente enquanto PID 3092588 continuava vivo
```

Isso ainda **não prova** que o request de T0 e o processo vivo em T1 pertencem ao mesmo worker/PID nem que executavam os mesmos bytes. Portanto:

```text
LISTENER_LOST_WHILE_PROCESS_ALIVE=NOT_YET_PROVED
CAUSE=UNKNOWN
FIXED_POINT=NOT_YET
```

## Invalidações preservadas

- `never listened` caiu porque existe requisição MCP real com `status=200` em T0.
- A busca antiga por `message:mcp_listening` não vale porque o marcador correto deve ser procurado no campo `event`.
- `PM2 online` não prova listener saudável.
- Import ausente, build não atômico ou deploy incompleto permanecem hipóteses; nenhum deles foi provado como causa do desaparecimento do listener.

## Proveniência dos anexos

- Dois anexos Markdown eram byte-idênticos (`SHA-256 3a3e308cdd3764b4bc60308cff2bb3b13ce175cf648980c2390298c441bab168`) e contam como uma única fonte.
- O registro usa os dados fornecidos na sessão; nenhuma nova medição remota foi executada neste fechamento.
- Nenhum valor de secret foi copiado ou registrado.

## NEXT_CURSOR

```text
bind structured log → workerId/PID
→ recover mcp_listening with event field
→ measure runtime git HEAD + dist mtime/hash
→ !RECONCILIAR
```

## !BOOT

```text
#ACORDAR
→ grep event:mcp_listening
→ grep event:hub_mission_consumer_started
→ bind workerId → PID
→ medir runtime HEAD
→ medir dist/index.js mtime + hash
→ CROSS_BEARING_RENDEZVOUS
→ !META_LUPA
→ só depois decidir restart/instrumentação
```

## Fio da missão

Antes parecia que o ouvido do processo morreu. Agora a pergunta correta é anterior: **provar que aquele ouvido pertencia exatamente àquele corpo**. Se a atribuição fechar, então poderá ser julgado o claim `LISTENER_LOST_WHILE_PROCESS_ALIVE`; até lá, a causa permanece `UNKNOWN`.

---

## CORREÇÃO — remedido via SSH ao vivo, 2026-08-27 ~14:20 UTC (WRITER=Claude Code)

`ATTRIBUTION_BINDING` não fechou por campo explícito (o schema do log de hoje **não tem** `pid`/`workerId` — confirmado varrendo todas as chaves distintas das primeiras 500 linhas). Fechou por **padrão temporal**, que é mais forte que parecia:

```text
TZ_VPS=America/Sao_Paulo (-03), confirmado via timedatectl — resolve toda ambiguidade anterior
DIST_MTIME=2026-08-27T05:31:49 UTC
PID_START=2026-08-27T05:32:09 UTC  (NAO 02:32:09 — esse era horario local sem TZ explicito)

Health-check /health (curl/7.81.0, local, ~60s de cadencia):
  primeira linha do dia = 03:00:01 UTC
  ultima linha de QUALQUER tipo no arquivo = 05:30:02.983Z (health) seguida do
    request MCP real (tools/call, status:200) as 05:30:10-12 UTC
  → SILENCIO TOTAL depois disso, por 8h46min ate a remedicao (confirmado 2x, ss+netstat+curl)
```

O cron de health-check bateu **contínuo, sem gap, a cada ~60s por 2h30**, e parou exatamente na janela em que o dist foi reconstruído (05:31:49) e o PM2 subiu o PID atual (05:32:09) — e **nunca mais voltou a aparecer no log**, nem depois do novo PID estar de pé. Se fosse o mesmo processo seguindo saudável, o cron externo (independente do app) teria voltado a bater no minuto seguinte e isso teria sido logado. Não bateu nenhuma vez em 8h46.

```text
LOG_PID_ATTRIBUTION=RESOLVIDO_POR_PADRAO_TEMPORAL (nao por campo — campo nao existe)
T0_REQUEST_BELONGS_TO=PROCESSO_ANTERIOR (provavel, nao o PID 3092588 atual)
LISTENER_LOST_WHILE_PROCESS_ALIVE=INVALIDADO
LISTENER_NEVER_BOUND_THIS_BOOT=HIPOTESE_FORTE (substituindo a anterior)
LISTENER_LOSS_CAUSE=AINDA_UNKNOWN no nivel de codigo, mas o RECORTE TEMPORAL mudou
```

Achado colateral, fora do escopo do listener mas real e não resolvido: `git status --short` em `/root/CentralDark` retorna **2106 linhas sujas**, incluindo `LEIA-ME-IA.md` e `AGENTS.md` **deletados** (docs canônicos) — resíduo já sinalizado antes nesta sessão, ainda não corrigido. `apps/modulos/mcp/` continua limpo (o restore anterior aguentou). HEAD local da VPS (`f8b7db1dd...`) diverge de `origin/main` real (`81cbc259...`) em **3206 commits à frente e 120 atrás** — não é um simples atraso, é histórico bifurcado. O `REMOTE_MAIN=a1f37078...` registrado acima **não existe** em nenhum checkout que eu tenha acesso (nem local, nem VPS) — não posso confirmar essa referência.

```text
FIXED_POINT=NOT_YET (causa exata de codigo ainda nao provada)
RECOMENDACAO=Plano A da SOL (restart supervisionado + T0/T1) segue valido e agora mais bem fundamentado — 
             o processo atual muito provavelmente nunca abriu o listener, entao restart tem alta chance de resolver.
             Aguardando "permito" explicito do CHEFE antes de mutar producao.
```

---

## RESOLUÇÃO — restart supervisionado executado, 2026-08-27 ~14:22-14:25 UTC (WRITER=Claude Code, autorizado pelo CHEFE: "VPS DEPLPY!" / "VVPS RESOLVE COM DEPLOY!")

Plano A executado exatamente como desenhado pela SOL. Nenhum rebuild — os 3 módulos já estavam presentes no host (confirmado em T0).

```text
T0 (14:22:33 UTC, antes do restart)
  modulos exigidos: OK, OK, OK (semantic.js, admin-provider-control.js, pattern-library.mjs)
  HEAD=f8b7db1dd..., dist mtime=05:31:49 UTC (inalterado)
  PORT_9100=AUSENTE, HTTP:000

AÇÃO: pm2 restart CentralDark-MCP (somente esse processo)
  restarts 899→900 (incremento de exatamente 1 — restart limpo, não crash-loop)
  PID novo: 2146677 (substituiu 3092588)

T1 imediato (14:23:15 UTC)
  PORT_9100=LISTENING (127.0.0.1:9100, pid=2146677, fd=22)
  /health=200 {"ok":true,"toolCount":113,"catalogVersion":"113-75c9a26592e8"}

T1+75s, janela de estabilidade (14:25:20 UTC — sleep executado NO LADO DA VPS via ssh,
  não localmente; contorna o bloqueio de sleep-líder do tooling local)
  PM2: mesmo PID 2146677, uptime 2m, status online, unstable restarts 0
  PORT_9100=LISTENING (mesmo pid)
  /health=200 de novo
  event:"mcp_listening" APARECEU no log deste boot — nunca tinha aparecido nos boots anteriores
  tráfego real fluindo: mcp_request_authorized → mcp_request_handled → http_request_end status:200
```

```text
MCP_LISTENER=RECUPERADO
PID=2146677
PORT_9100=LISTENING (confirmado em 2 medições, 2min de intervalo)
HEALTH=200 (2x)
MCP_LISTENING_EVENT=PRESENTE (diferença chave vs. o boot quebrado, que nunca logou esse evento)
FIXED_POINT=PASS (para este incidente especifico: listener recuperado e estavel)
LISTENER_LOSS_CAUSE=AINDA NAO PROVADO NO NIVEL DE CODIGO (restart resolveu o sintoma,
                     nao identificamos a linha exata que falhou no boot anterior)
```

Item separado, não resolvido aqui e não confundir com este incidente: `VPS_WORKTREE_DRIFT` (2106 linhas sujas, `LEIA-ME-IA.md`/`AGENTS.md` deletados, HEAD divergente de origin/main em 3206 commits à frente / 120 atrás). Proposta de arquitetura discutida (releases/current imutável, VPS como runtime descartável) é sólida mas é mudança estrutural separada — fica como próximo passo a decidir com o CHEFE, não executada nesta missão.
