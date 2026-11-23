# Revisão crítica — Writer Boundary + Dream Cycle

## Veredito

**COERENTE COM A CENTRALDARK: SIM, com correções de encaixe para evitar duplicação.**

| Peça | Veredito | Encaixe canônico |
|---|---|---|
| Canonical main limpa | PASS | checkout canônico vira espelho/verificação, não bancada normal de mutação |
| Worktree por missão mutável | PASS | isolamento de branch/scope/writer |
| MetaLupa BEGIN antes de write | P0 / GAP TÉCNICO | regra existe; precisa bloquear write tecnicamente |
| Sentinel como alarme, não faxineiro | PASS | reutilizar Guardião/Sentinela existentes |
| Dream candidate-only | PASS | Dream Review != Writer |
| SESSION_END/HANDOFF → Dream | PASS | preferência existente |
| Scheduler como fallback | PASS | reutilizar scheduler da Casa e acordar só se houver delta |
| 3x ao dia fixo | NÃO CANÔNICO | event-first + fallback condicional |
| Deep Dream 03:30 | CANDIDATO | só como backstop no scheduler existente |
| Re-emergence detection | DELTA ÚTIL | Pattern Discovery / Memory-Linker |
| Delta-write memory | DELTA ÚTIL | DELTAUTIL / Knowledge Compiler / Semantic Fabric |
| Grill-me em todo sonho | NÃO | só decisão cara/ambígua/irreversível |
| Fable | PASS | disciplina/metodologia; não Writer |
| Forja | PASS | gate antes de cristalizar |
| Reality Judge | PASS | veredito independente |
| Git = verdade do software | PASS | código/docs/skills/tests/config segura |
| Logs/vetores/telemetria no Git | NÃO | persistir nos stores apropriados |
| 3 PRs fixos | NÃO FIXAR | lanes; quantidade depende de owner/writer/collision real |
| Worktree “morre” | PASS COM GATE | só após receipt, zero delta único e promoção/quarentena provada |

## Correção arterial

Não criar por default:

```text
scripts/git/vps-cleanroom-sentinel.mjs
```

Primeiro procurar/reusar:

```text
Guardião
sentinela-divergencias
gh-pull
deploy_status
writer boundary
git guardrails
```

O histórico mostra `sentinela-divergencias` e health checks já existentes.
O comparativo exato `GitHub main ↔ VPS HEAD / commits behind` apareceu como capability sob demanda.
O delta útil é agendar/reusar essa comparação, não criar outro sentinela.

## Fluxo reconciliado

```text
CHEFE_INTENT
→ TOOL PREFLIGHT
→ T0 / CURRENT STATE
→ MISSION
→ WRITER BOUNDARY
   ├─ mission_id
   ├─ owner
   ├─ writer lock
   ├─ head pin
   ├─ MetaLupa BEGIN
   ├─ secret gate
   └─ isolated mutation root
→ EXECUTE
→ TEST
→ COUNTERPROOF
→ CLASSIFY ALL DELTA
→ FORJA
→ REALITY JUDGE
→ CRYSTALLIZE
→ COMMIT / PR / MAIN
→ CLEAN MISSION CLOSE
→ EVENT STREAM
→ DREAM REVIEW
→ PATTERN DISCOVERY
→ DELTAUTIL
→ CANDIDATE
→ META-LUPA / GRILL-ME quando material
→ PROMOTION GATE
→ LAST_GOOD_STATE
→ FIXED POINT
```
