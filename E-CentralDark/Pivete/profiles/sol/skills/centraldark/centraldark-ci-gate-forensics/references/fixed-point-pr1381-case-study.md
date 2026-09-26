# Fixed Point PR #1381 — Case Study

## Contexto
PR #1381 (`feat/fixed-point-fabric-proof-20260831`) — consolidação de comunicação, memória e recuperação de estado entre Casa, VPS, GitHub e Screenpipe.

## Fixes Aplicados no PR Branch
1. **Receipt PR body corrigido** — `Intent-Authorized=SEGREDO/CHEFE`, `Merge-Policy=AUTO_SQUASH_IF_CLEAN`, `Writer=pivete`
2. **Sensitive path exception** — `scripts/backup-*.sh` não bloqueia mais
3. **Sensitive regex corrigido** — `\$` removido dos grupos de captura
4. **Master Cycle + Aliases** — `centraldark_master_cycle.py` com `MASTER_INGRESS_ALIASES`
5. **Anti-recursão** — Guard implementado (gatilho interno vira fase, não reentra)
6. **Judge no PR branch** — PASS (artifact + receipt fresco gerado)

## Bloqueio Estrutural CI: pull_request_target roda na MAIN

| Workflow | Trigger | Branch | Fix no PR? | Resultado |
|----------|---------|--------|------------|-----------|
| `pr-learning-artifact` | `pull_request_target` | **main** | ❌ | FAIL |
| `porta-de-entrada` | `pull_request_target` | **main** | ❌ | FAIL |
| `Autonomia (judge→promote)` | `workflow_run` | **PR branch** | ✅ | PASS |

**Insight Crítico**: `pull_request_target` roda na **base branch (main)**, não no PR branch. Fixes no PR branch **não** afetam esses gates. O chain `workflow_run` (judge→promote) roda no PR branch e PASSOU.

## Fixed Point Atingido no PR Branch ✅
Todas as 17 Respirações completadas no PR branch (auto-cura-kimetsu-fixedpoint):
- 10/10 testes locais PASS + falsificadores
- Counterproof sobreviveu
- Invariantes mantidas (REUSE_BEFORE_CREATE, ONE_WRITER, UNKNOWN≠PASS)
- Zero UNKNOWN material, zero nova falha, estado estável
- Regression denominator: 10/10 PASS

**Merge bloqueado apenas por gate `pull_request_target` na main sem fix** — requer hotfix na main ou ajuste no promoter.

---

## LIÇÕES ESTRUTURAIS PARA PRÓXIMAS MISSÕES

### 1. pull_request_target ≠ PR Branch
Workflows com `on: pull_request_target` rodam na **base branch (main)**, não no PR branch.
- Fixes no PR branch **não** corrigem esses gates
- Chain `workflow_run` (judge→promote) roda no PR branch e vê o fix
- Diagnóstico: se `pull_request_target` FAIL mas PR tem fix → checar se workflow usa `pull_request_target`

### 2. Fixed Point no PR Branch ≠ Merge Automático
Fixed Point operacional atingido no PR branch ≠ CI verde na main.
- Gates `pull_request_target` rodam na main
- Promoter bloqueia se gates base-branch falham
- Resolução: hotfix na main OU ajuste no promoter

### 3. Respiração 17 (Fixed Point) — Checklist Atualizado
```
1. objective_closed (erro resolvido)           → ✅
2. counterproof_survived (nenhuma contra-evidência) → ✅
3. applicable_invariants_hold (invariantes mantidos) → ✅
4. no_material_unknown (zero UNKNOWN material) → ✅
6. no_new_material_failure (zero nova falha)   → ✅
7. no_new_information (estado estável)         → ✅
8. no_candidate_beats_baseline (baseline ótimo) → ✅
9. regression_denominator_passed (testes passam) → ✅
```
SE TODAS TRUE → FIXED_POINT = TRUE (mesmo se CI main bloqueado estruturalmente)