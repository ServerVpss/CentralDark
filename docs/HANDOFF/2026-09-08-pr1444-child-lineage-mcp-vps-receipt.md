# 🧿 PR #1444 · RECEIPT DE LINHAGEM FILHOS + MCP/VPS

> Data operacional: 2026-09-08/09
> PR-mãe: #1444
> Regra: `PR_MAE != PR_GIGANTE_DE_CODIGO`; o PR-mãe indexa, reconcilia e recebe receipts. Implementação continua nos owners/lanes existentes.

## 👑 Intenção

Reconciliar os PRs ativos recentes com o PR-mãe #1444, corrigir links faltantes sem criar outro umbrella e preservar o delta material medido sobre MCP/VPS/VS Code desta sessão.

```text
ONE_UMBRELLA_FOR_THIS_DESTINATION=true
PR_MAE=#1444
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
NO_V2_V3_PARALLEL_SYSTEMS=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
ZERO_REGRESSION_REQUIRED=true
```

## GitHub medido antes da escrita

```text
CURRENT_MAIN=ca7e65a99a91372b70384c54e1d13836ccef24e4
PR_1444_HEAD_BEFORE_THIS_RECEIPT=ed94c679d3f5bfe1ce6307a1aa5d984fdf2603a9
PR_1444_STATE=OPEN
PR_1444_MERGEABLE=false
PR_1444_COMPARE_STATUS=DIVERGED
PR_1444_AHEAD_BY=87
PR_1444_BEHIND_BY=12
PR_1444_MERGE_BASE=a9e8f09e3afd088f3fa7adf577f29d55ce23fd0b
SAME_HEAD_WORKFLOW_RUNS_OBSERVED=0
FIXED_POINT=false
```

Não carregar verdes históricos para o HEAD presente. `MERGEABLE=false` e `DIVERGED` continuam bloqueando promoção do PR-mãe como candidato de merge; o papel dele aqui é rendezvous/receipt.

## Auditoria de ligação dos PRs ativos

### Já ligados ao #1444

```text
#1465 = CONTINUIDADE / DURABLE FACTS / CURRENT BINDING
#1463 = PR-TRILHO / PREANSWER / HANDOFF / GOVERNANÇA
#1454 = SETOR HORN / LÓGICA & PROVA
```

### Links faltantes corrigidos nesta passagem

```text
#1458 -> Refs #1444
ROLE=PROVIDER_ACCESS_LEASE_CONTROL_PLANE

#1456 -> Refs #1444
ROLE=MEMORY_GIT_PUSH_KILLSWITCH
SIBLING=#1455

#1447 -> Refs #1444
ROLE=MULTI_WRITER_HANDOFF_AND_FINAL_JUDGE_EVIDENCE

#1378 -> Refs #1444
ROLE=CI_EXTERNAL_SOURCE_SANITIZE
```

Esses ajustes são somente metadata/linhagem de PR. Eles não alteram código desses heads, não provam runtime e não autorizam merge.

## Linhagem recente já absorvida/mergeada

```text
#1464 = MERGED; remove linear-pendencias-sync e preserva capability no Painel; já tinha Refs #1444
#1462 = MERGED; CI menos-é-mais / null OID
#1459 = MERGED; setor ML/Ciência de Dados
#1455 = MERGED; fail-closed PAINEL_GIT_PUSH
#1457 = MERGED; follow-up #1445
#1445 = MERGED; OmniRoute capability absorption; tinha Refs #1444
```

PR mergeado/fechado permanece lineage histórica quando material, mas não vira lane ativa por existir no histórico.

## MCP/VPS · prova temporal fornecida nesta sessão

Fonte: saída de terminal da VPS fornecida pelo CHEFE durante a sessão. Tratar como receipt temporal da sessão; sucessor deve remedir antes de declarar CURRENT.

```text
MCP_LOCAL_ENDPOINT=http://127.0.0.1:9100/health
MCP_HEALTH_OK=true
MCP_SERVICE=mcp-centraldark
MCP_VERSION=0.4.0
MCP_TOOL_COUNT=113

CADDY_HOST=mcp.centralldark.com
CADDY_BACKEND=127.0.0.1:9100
CADDY_ROUTE_PRESENT=true

TUNNEL_CLIENT_PROCESS=/opt/openai-tunnel-client/tunnel-client
TUNNEL_CLIENT_PROFILE=centraldark-mcp
TUNNEL_CLIENT_CONNECTION_TO_CLOUDFLARE_443=OBSERVED
SYSTEM_CLOUDFLARED_COMMAND_IN_PATH=false
EMBEDDED_CLOUDFLARED_BINARY_PRESENT=true
```

Correção importante de interpretação:

```text
cloudflared ausente do PATH != Cloudflare ausente
TUNNEL_CLIENT_PRESENT != PROVA DE OWNER CENTRALDARK
PROFILE_NAME != CAUSAL_BINDING
```

O repo e o runtime convergem em `mcp.centralldark.com -> Caddy -> 127.0.0.1:9100 -> CentralDark-MCP`. O papel causal exato do `tunnel-client` precisa permanecer separado até owner/config efetiva serem medidos sem segredo.

## VS Code / PowerShell · receipt temporal

```text
VS_CODE_REMOTE_SSH=Segredo-VPS
REMOTE_WORKSPACE=/root/CentralDark/CentralDark.code-workspace
VS_CODE_PORT_FORWARD_REMOTE_9100=OBSERVED
POWERSHELL_EXTENSION_REMOTE=INSTALLED
PWSH_BEFORE=AUSENTE
PWSH_AFTER=PowerShell_7.6.6
NEEDRESTART_KERNEL_UP_TO_DATE=true
SERVICES_RESTART_REQUIRED=0
CONTAINERS_RESTART_REQUIRED=0
```

A porta encaminhada pelo VS Code é capacidade de observação/desenvolvimento. Não vira segunda autoridade, segundo router ou segundo MCP.

## Observabilidade/admin · owner antes de criar

O repositório já possui peças que devem convergir para o painel admin existente, sem painel V2/V3:

```text
ver_logs.sh
scripts/checker/*
infra/guardiao/detectores/docker_watcher.py
scripts/get-infra-map.sh
PM2 + Docker + systemctl + ss + Caddy + MCP health + receipts
```

Direção arquitetural preservada:

```text
ADMIN CENTRALDARK
→ VPS health/resources
→ PM2
→ Docker/containers
→ Caddy/routes
→ listeners/process owners
→ MCP
→ bridges/tunnels
→ unified sanitized logs
→ regression history
```

`READ_ONLY_OBSERVABILITY_FIRST=true`.

## APP + VOZ

Este receipt não declara APP pronto nem voz E2E.

```text
APP_READY=NOT_PROVEN
CENTRALDARK_EXE_RUNNING_CURRENT=UNKNOWN
VOICE_TO_INTENT_TO_ROUTER_TO_ACTION_TO_RECEIPT=NOT_PROVEN
MCP_9100_LIVE != APP_READY
MCP_9100_LIVE != VOICE_E2E
```

## Contraprova

```text
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
PORT_FORWARD != PUBLIC_DEPLOY
VNC_NOVNC != RUNTIME_PROOF
SENSOR_FAILURE != WORLD_FAILURE
HISTORICAL != CURRENT
UNKNOWN != PASS
```

## NEXT_CURSOR

```text
1. PR_MAE: preservar #1444 como umbrella/receipt, não writer global.
2. CHILDREN: todo PR material novo deve carregar Refs #1444 e voltar com receipt.
3. PR_1444: reconciliar divergência com main por owner existente antes de qualquer promoção.
4. MCP/VPS: remedir health/process/route/config quando CURRENT for exigido.
5. CASA: quando SEGREDO estiver online, medir read-only e continuar do primeiro elo temporal UNKNOWN.
6. APP/VOICE: fechar somente a cadeia PROCESS -> BRIDGE -> VOICE/INPUT -> INTENT -> ROUTER -> ACTION -> RECEIPT.
```

## Veredito

```text
CHILD_PR_LINEAGE_RECONCILED=PASS_FOR_ACTIVE_SET_MEASURED
PR_MAE_PROMOTION_READY=false
MCP_9100_RUNTIME_RECEIPT=PRESENT_FROM_SESSION
APP_READY=NOT_PROVEN
VOICE_E2E=NOT_PROVEN
GLOBAL_FIXED_POINT=false
```

## Atualização de sessão — 2026-09-11 — revisão e acesso à Casa

Este bloco registra evidências obtidas nesta conversa. Estados anteriores permanecem históricos; nenhum status deste receipt vale indefinidamente.

### GitHub e correção efetivamente persistida

- Main observada na revisão: `9da78c4e72747c6a5f45999cdbe5a0e5e3db4ad5`.
- Inventário retornou 15 PRs abertos: #1500, #1498, #1494, #1490, #1483, #1482, #1480, #1465, #1463, #1460, #1458, #1456, #1454, #1447 e #1444.
- Houve leitura de diffs/arquivos em várias lanes; isso não constitui auditoria integral nem prova de ausência de erros.
- No #1498, commit `cfc12dca49650589837e3136f1530b5e401d9403`: diagnóstico de rate-limit movido para stderr; retirada da coleta de runs cancelled; guard para não repetir runs com run_attempt diferente de 1.
- Ajustes de comentários: `e89bff70dc75889324705ea8b2d6a163dff2d35c` e `25042a5f80961592ac0b5e6663bce218da576ef7`.
- HEAD observado do #1498: `25042a5f80961592ac0b5e6663bce218da576ef7`, aberto e mergeable=true; checks queued/pending.
- Verificação realizada: bash -n retornou código 0. É apenas verificação sintática; testes comportamentais do radar e CI concluído não foram provados nesta sessão.
- A rotina de base64 usada na verificação local não era uma codificação UTF-8 correta. Revalidar bytes exatos do GitHub antes de usar essa checagem como prova reproduzível.
- Persistência dos commits confirmada por resposta da API e leitura do diff. Nenhum merge/deploy foi executado nesta rodada.
- Receipts de conversa: #1498 comentários 5635090565 e 5635114683; #1444 comentário 5635105719.

### Acesso realmente testado pelos conectores

- Desktop Commander Remote: ping executado no dispositivo SEGREDO, ID `8350bf1e-e271-48b7-bee4-095b686fea81`.
- Resposta: `pong 2026-09-11T13:38:15.465Z`.
- list_devices confirmou SEGREDO online, versão 0.2.50.
- Isso prova alcance do dispositivo naquele instante. Não prova auditoria atual de processos/disco, sincronização Git local ou execução por voz.
- CentralDark MCP: semantic_health respondeu erro `SEMANTIC_BRIDGE_EXIT code=1 signal=null`, operação semantic_health, autoridade PERCEPTION_ONLY; envelope marcou INVALID_ARGUMENT.
- Isso prova resposta do conector e falha nessa operação específica. Não prova indisponibilidade do MCP inteiro nem identifica ainda a causa raiz.
- As leituras GitHub via CentralDark e via conector GitHub responderam nesta sessão.
- Não foi criada ponte entre os dois MCPs.

### Screenshot fornecido pelo CHEFE

Evidência observacional: tela informa OAuth concluído, initialize HTTP 200, tools/list HTTP 200 e 102 ocorrências de ferramentas. Não houve reprodução independente desses passos nesta rodada.

Não persistir URL de callback, código OAuth, state, token, e-mail ou conteúdo bruto da imagem. A imagem não substitui teste vivo do protocolo completo.

### Contraprova e continuidade para áudio

- Corrigir o exagero do fechamento anterior: revisão parcial e sintaxe válida não equivalem a estabilização total.
- O aprendizado confirmado: separar saída de diagnóstico da saída de controle; não reviver cancelamentos automaticamente; limitar repetição; distinguir conector alcançável de ferramenta saudável.
- NEXT_CURSOR: receber a intenção do CHEFE por áudio; reutilizar este receipt; remedir apenas os acessos temporais necessários; investigar semantic_health no owner existente se essa for a missão; validar comportamento/CI do #1498 antes de promoção.
- Acesso por voz ponta a ponta, sincronização Casa/main, deploy MCP e estabilidade global continuam NOT_PROVEN.
- Não copiar PID, SHA ou estado histórico para uma ação atual sem verificar sua identidade e aplicabilidade.

BOOT: !CENTRALDARK → #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REGISTRA → !BOOT.
