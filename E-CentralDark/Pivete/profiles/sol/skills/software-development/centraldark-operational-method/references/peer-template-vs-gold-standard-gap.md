# Peer Template vs Gold Standard Gap — Descoberta Crítica 2026-08-24

## Contexto
Durante validação de 275 skills locais contra o `skill-crystallization-engine` (gold standard), descobriu-se que skills "excelentes" pelo template peer (`hermes-agent-skill-authoring`) **falham no gold standard**.

## Scores de Validação
| Skill | Peer Score | Gold Standard Score | Gap |
|-------|------------|---------------------|-----|
| skill-crystallization-engine | 100% | 100% | — |
| delta-cadeado-trancado | peer ✅ | 92% | meta-lupa ref |
| hermes-profile-canonical-reconciliation | peer ✅ | 88% | desc, provenance, mantra |
| kimetsu-legacy-operational-method | peer ✅ | 82% | 8 gaps gold |
| kimetsu-legacy-breathing | peer ✅ | 78% | frontmatter, 3 planes, dims |
| auto-destilador | peer ✅ | **8%** | 11/12 gaps |

## Root Cause
O template peer (`hermes-agent-skill-authoring`) define **estrutura documental** (frontmatter, sections, checklist), mas o gold standard (`skill-crystallization-engine`) exige **metadados de execução/autovalidação** que o template peer NÃO exige:

| Gold Standard Exigido | Template Peer Tem? |
|----------------------|-------------------|
| `phases` (MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT) | ❌ |
| `runtime_checks` (executable per ecosystem) | ❌ |
| `failure_signature` (crystallizable) | ❌ |
| `remediation_escalation` (fixed order) | ❌ |
| `provenance` (sources+tests+receipts+SHA256) | ❌ |
| `counterproof` (clean execution) | ❌ |
| `three_planes` (knowledge, execution, config_origin) | ❌ |
| `three_dimensions` (dependência, decadência, cadência) | ❌ |
| `mantra` (MINERAR UMA VEZ...) | ❌ |

## Evidência Quantitativa
- 275 skills validadas
- Média gold standard: **22%**
- 272/275 abaixo de 70%
- 0 skills com as 3 dimensões completas
- Skills com template peer "excelente" (78-82%) falham no gold standard

## Regra Operacional
> **Ao criar/atualizar skill doncanônica, aplicar patch de metadados gold standard COMPLETO** — não só template peer.

Template peer = **necessário mas não suficiente**. Gold standard = **auto-validação executável**.

## Ação Requerida
Para cada skill doncanônica:
1. Aplicar template peer (estrutura base)
2. **Aplicar patch gold standard**: phases, runtime_checks, failure_signature, remediation_escalation, provenance (SHA256), counterproof, three_planes, three_dimensions, mantra
3. Validar com `validate_all_skills.py` → target ≥90%

## Referências
- `skill-crystallization-engine/SKILL.md` — definição completa do gold standard
- `validate_all_skills.py` — validador automatizado
- `skill_gold_validator.py` — validador single skill
- `batch_skill_validator.py` — validação em lote (GitHub API)

## Lição
> **Template peer = estrutura. Gold standard = autovalidação executável.**
> Skills sem metadados gold standard são "bonitas mas não se autovalidam".