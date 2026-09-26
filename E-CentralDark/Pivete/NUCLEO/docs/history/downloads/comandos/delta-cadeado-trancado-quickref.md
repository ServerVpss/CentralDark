# Delta CADEADO TRANCADO — Referência de Integração Rápida

## Visão Geral
Delta cirúrgico aplicado a 6 owners canônicos, derivado da mineração do acervo `CADEADO TRANCADO SO COM PERMITO SEGREDO`.

---

## Mapeamento Rápido: Componente → Owner → Mudança

| Componente CADEADO | Owner Canônico | Mudança Aplicada |
|--------------------|----------------|------------------|
| `scripts/00-capture-evidence.sh` | `vps-exec-selfhosted.yml` | Step `capture-evidence` no job `deploy-mcp` |
| `scripts/01-fix-ufw-conflicts.sh` | `porta-de-entrada.yml` | Detecção conflitos 3000/9000 no step `validar` |
| `scripts/02-apply-ufw-canonical.sh` | `vps-exec-selfhosted.yml` | Job `ufw-canonical` (condicional `CLOSE_EXTRA=1`) |
| `scripts/03-verify-bind-and-ports.sh` | `vps-exec-selfhosted.yml` | Step `verify-bind` (bind 127.0.0.1 + fail2ban + curl health) |
| `scripts/04-pm2-stability-snippet.sh` | `vps-exec-selfhosted.yml` | Step `pm2_stability` (recomendação ecosystem) |
| `checklists/ORDEM-APLICACAO.md` | `vps-exec-selfhosted.yml` | Fases 0-6 codificadas como jobs sequenciais |
| `checklists/ROTACAO-SECRETS.md` | `vps-exec-selfhosted.yml` + `porta-de-entrada.yml` | Step `secrets-rotation` (grep patterns) |
| `prompts/AUTODESTRUIDOR.md` | `meta-lupa` (AutoLupa) | **Já coberto** — AutoLupa exige autoconfronto |
| `prompts/CONSTRUTOR.md` | `centraldark-operational-method` | **Já coberto** — Boot + ciclo + SEALED_* |
| `prompts/VERIFICADOR-DE-SELO.md` | `meta-lupa` (AutoLupa) | **Já coberto** — AutoLupa valida selo |
| `docs/04-REACT-METALUPA-AUTOLUPA.md` | `meta-lupa` | **Já coberto** — 3 temperaturas + ponto fixo |
| `prompts/00-master-orchestrator.md` | `porta-de-entrada.yml` + `pr-auto-review.yml` | Fases A-H → jobs estendidos |
| `prompts/01-local-triage.md` | `pr-auto-review.yml` | Classificador `KNOWN_PATTERN \| PROBABLE \| UNKNOWN \| INSUFFICIENT` |
| `prompts/02-frontier-agent.md` | `meta-lupa` (MÉDIA/QUENTE) | Saída estruturada `FACTS \| HYPOTHESES \| TESTS \| FIX \| RISK \| ROLLBACK \| UNKNOWN` |
| `prompts/03-independent-judge.md` | `meta-lupa` (Judge) | Veredito exclusivo `APPROVED \| CORRECT \| BLOCKED` |
| `schemas/finding.schema.json` | `meta-lupa` + `pr-auto-review.yml` | Contrato de finding no receipt |
| `schemas/runtime-receipt.schema.json` | `porta-de-entrada.yml` + `vps-exec-selfhosted.yml` | Receipt `centraldark.runtime.receipt.v1` |
| `scripts/00-discovery-readonly.sh` | `porta-de-entrada.yml` | Discovery completo (system, PM2, Docker, Git, models) |
| `self-learning/SKILL.md` | `centraldark-operational-method` | Seção **Harvest Procedure** (promotion rule 3-pilares) |
| `go.txt` (FABLE_LOOP) | `meta-lupa` + `porta-de-entrada.yml` + `pr-auto-review.yml` | Quarentena + cleanroom + capability stripping + 20 mutant tests |

---

## Scripts Novos Criados (em `.github/scripts/`)

| Script | Propósito | Chamado Por |
|--------|-----------|-------------|
| `discovery.sh` | Discovery read-only completo | `porta-de-entrada.yml` step `discovery` |
| `pm2-stability.js` | Análise restart counts + ecosystem sugestão | `vps-exec-selfhosted.yml` step `pm2_stability` |
| `generate-receipt.js` | Emissão `centraldark.runtime.receipt.v1` | `porta-de-entrada.yml` step `runtime_receipt` |

---

## O Que JÁ Existia (NÃO MEXER)

| Capacidade | Localização | Prova |
|------------|-------------|-------|
| Meta Lupa (FRIA/MÉDIA/QUENTE + AutoLupa) | `.agents/skills/meta-lupa/SKILL.md` | 26539 bytes, SHA `42691e0` |
| Boot Universal + Ciclo Operacional | `centraldark-operational-method` | `CENTRALDARK_AI_BOOT` + 12-step cycle |
| Writer Único + Delta | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO...` | Contrato canônico |
| Porta de Entrada | `.github/workflows/porta-de-entrada.yml` | Job `validar` |
| PR Auto Review | `.github/workflows/pr-auto-review.yml` | Job `triage` |
| VPS Deploy | `.github/workflows/vps-exec-selfhosted.yml` | Job `deploy-mcp` |
| Sentinela | `.github/workflows/sentinela-divergencias.yml` | Drift guard + log-verificador |

---

## Princípios de Integração Aplicados

```bash
REUSE_BEFORE_CREATE_REQUIRED
ONE_WRITER_PER_SCOPE
LOCAL_REALITY = JUDGE
HISTORICAL != CURRENT
UNKNOWN != PASS
DOCUMENTED != EXECUTED
```

---

## Validação Final (Receipt)

```yaml
YAML_LINT: 3/3 workflows passing
NPM_TEST: 4/4 passing
NPM_BUILD: PASS
GIT_COMMIT: 67950e916 (feat) + 51e3cd4ca (crystal)
GIT_PUSH: origin/feat/gatilhos-execucao-reversivel-remediacao
JUDGE_VERDICT: APPROVED
FINAL_STATUS: PASS
```

---

## Próximos Passos Naturais (Writer = NONE)

1. **PR para main** — quando CHEFE autorizar
2. **Fases B-G Runtime Closed Loop** — topology, detectors, model-routing, patch-plan, isolated-impl, independent-judge
3. **Self-Learning Skill formal** — `.agents/skills/self-learning/` com harvest procedure
4. **Deploy VPS real** — validar evidence capture + UFW canonical em produção