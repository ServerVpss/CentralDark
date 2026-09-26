
# Δ2 — Issue → Delta → PR → Main (Lineage Canônica)

## Essência
Transformar issues, artifacts, branches, commits e trabalho de múltiplos agentes em UMA LINHAGEM CANÔNICA por capability.

**NÃO:** operar por número de issue cegamente. operar por artifact isolado. criar PR eterno. usar main como stream de telemetria.

## Trackers / Umbrella
UMBRELLA/TRACKER CONTÍNUO → permanece aberto enquanto a missão/capacidade continuar viva.

Exemplo CentralDark: #604 = tracker-raiz contínuo.

Uma umbrella:
→ recebe estado material
→ aponta famílias/filhos
→ preserva histórico
→ NÃO executa código
→ NÃO vira PR gigante
→ NÃO fecha a cada merge filho.

PR específico:
- Refs #UMBRELLA
- Closes #ISSUE_FILHA

Resultado:
- MERGE → fecha trabalho específico → umbrella continua viva.

Só fechar umbrella quando:
- MISSION_COMPLETE_PROVEN
- OU SUPERSEDED_BY_SUCCESSOR_PROVEN
- OU SCOPE_DISABLED_BY_AUTHORITY

`CLOSED != RESOLVED automaticamente.`

## Denominador real
NÃO considerar apenas issues abertas.

SCAN:
- OPEN_ISSUES + CLOSED_RELEVANT_ISSUES + OPEN_PRS + MERGED_PRS
- + CLOSED_UNMERGED_PRS + COMMITS + BRANCHES + ARTIFACTS + CURRENT_MAIN

Mas somente quando semanticamente/materialmente relacionados à capability atual.

## Unidade principal: CAPABILITY_LINEAGE
```
CAPABILITY_FINGERPRINT = 
  OWNER + FILES + BEHAVIOR + PROOF_TARGET + DEPENDENCIES + CAUSE_SIGNATURE
```

## Family reconciliation
ANTES DE IMPLEMENTAR UMA ISSUE:
→ buscar outras issues/PRs/commits/artifacts com o mesmo fingerprint.

Classificar:
- OWNER | DUPLICATE | COMPLEMENTARY | SUPERSEDED | ABSORBED | CONFLICTING | UNIQUE | UNKNOWN

Se duas issues forem a mesma causa:
→ NÃO implementar duas vezes
→ escolher/confirmar uma ISSUE OWNER
→ transferir ouro único
→ preservar referências das demais
→ fechar/supersede somente após prova.

## Seleção do PR — Correção do Chef
REGRA:
- `ONE_PROMOTION_PR_PER_SCOPE=true`
- `ONE_WRITER_PER_SCOPE=true`

Isso NÃO significa `ONE_PR_FOR_WHOLE_REPOSITORY=true`.

Escopos comprovadamente independentes podem trabalhar em paralelo.
MESMO OWNER/CAPABILITY → um único Writer/PR sobrevivente.
PR existente adequado → reutilizar.
PR conflitante/duplicado → reconciliar.
Criar PR novo SOMENTE quando não houver lineage adequada.

## Fluxo de promoção
```
CAPABILITY FAMILY → ISSUE OWNER → branch curta → delta mínimo → testes 
→ contraprova → PR de promoção → checks → merge main → remedição 
→ fecha filhos absorvidos → atualiza umbrella → NEXT_CURSOR
```

Não manter branch/PR eternamente acumulando escopos desconexos.

## Main
MAIN = estado versionado canônico promovido.

CÓDIGO, CONFIG, CONTRATOS, DOCS CANÔNICOS → PR + prova + merge.

NÃO escrever diretamente na main como fluxo operacional normal.

Se houver histórico de commit direto:
→ tratar como provenance
→ reconciliar
→ não usar como justificativa para continuar bypassando promoção.

## Telemetria
NÃO commitar continuamente em main:
- status de agents, heartbeat, contadores, fila viva, latência,
- checks momentâneos, logs, painel runtime, telemetria transitória.

Usar owner já existente apropriado: Supabase, Evidence Envelope, artifact de CI, cache/storage, runtime state.

`TELEMETRY != SOURCE_CODE`

## Artifacts do Claude
CLAUDE_ARTIFACT = WORKING_ARTIFACT ≠ CANONICAL_OWNER

Todo artifact:
→ procurar owner no repo
→ procurar lineage
→ dedupe
→ extrair ouro único
→ incorporar ao owner
→ preservar link como provenance
→ NÃO gerar outro artifact final-final-v2.

Se já houver arquivo/PR/issue apropriado → atualizar aquele.

## Multi-agente
Claude, Hermes, ChatGPT, Copilot, Codex ou outro executor:
→ sempre começar descobrindo estado canônico.

SESSION_MEMORY != CURRENT_STATE

GitHub/MCP + Casa + receipts → recuperar continuidade.

`PARALLELIZE_PERCEPTION=true`
`SERIALIZE_MUTATION_PER_SCOPE=true`

Agente novo NÃO cria missão nova só porque perdeu contexto do agente anterior.

## Se um agente parar
STOP/CRASH/CONTEXT_LOSS/RATE_LIMIT:
→ preservar HEAD
→ preservar Writer scope
→ preservar receipt
→ NEXT_CURSOR
→ próximo agente executa !CENTRALDARK → continua mesma lineage.

## Promotion Slot — Correção do Chef
NÃO usar: `GLOBAL_PROMOTION_SLOT=1`
Usar: `PROMOTION_SLOT_PER_CONFLICT_SCOPE=1`

Se dois deltas não tocam mesmo owner, não compartilham dependência crítica e passaram collision check → podem avançar paralelamente.
Se colidem → RENDEZVOUS → ONE_WRITER.

## Update branch ≠ Update main
Update branch apenas: MAIN_ATUAL → entra na branch do PR
Só merge promove: PR → MAIN
Não confundir sincronização com promoção.

## Política de fechamento
- ISSUE filha → fechar quando delta absorvido/provado.
- ISSUE duplicada → fechar apontando owner/sucessor.
- ISSUE umbrella → permanece aberta enquanto organismo ativo.
- PR → nasce → prova → merge/fecha → morre.
- MAIN → recebe somente estado promovido.

`CLOSED != USELESS` — histórico fechado pertence à lineage quando mesma capability.

## REALITY JUDGE
ISSUES_ABERTAS, PRS_ABERTOS, MAIN_SHA, PROMOTION_SLOT, CHECKS:
→ medir novamente antes de usar para decisão.

STATUS_ANTIGO != STATUS_ATUAL.

## Fórmula final
```
MUITAS FONTES + MUITAS ISSUES + MUITOS AGENTES + MUITOS MOTORES
MAS:
  UMA CAPACIDADE → UMA LINHAGEM
  UM ESCOPO MUTÁVEL → UM WRITER
  UM DELTA → UM PR DE PROMOÇÃO
  UMA VERDADE VERSIONADA → MAIN
  UM TRACKER → CONTINUIDADE
  ZERO DUPLICAÇÃO
  ZERO REGRESSÃO
  REUSE_BEFORE_CREATE
```

## Regra cristalizada
```
DELTA_ID=2 | NOME=Issue→Delta→PR→Main (Lineage Canônica)
OBJETIVO=transformar múltiplas fontes em uma linhagem por capability
CLASSE=LINEAGE_CANONICA | MATERIALIDADE=ALTA
```

### Technical proof
Fingerprint único por capability + política de fechamento + promoção por escopo em vez de PR global.
