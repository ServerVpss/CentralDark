# Claim Provenance — Rastro de Origem dos Mecanismos

Este documento registra a proveniência de cada mecanismo/chave da skill `cot-react-loop`, para auditoria e evolução controlada.

---

## Tabela de Proveniência

| Mecanismo na Skill | Origem Primária | Referência Exata | Tipo | Status |
|--------------------|-----------------|------------------|------|--------|
| **Pseudo-formal Brief** (definitions, success predicate, non-counting outcomes, failure modes) | `long-horizon-prompting` skill | muratcankoylan/agent-skills-for-context-engineering/skills/long-horizon-prompting/SKILL.md | Adotado integralmente | ✅ Verificado |
| **Success Predicate** com quantificadores explícitos | CDC prompt (GPT-5.6 Sol) | OpenAI published prompt, July 2026 | Adaptado | ✅ Verificado |
| **Non-Counting Outcomes** (enumeração do que NÃO conta) | `long-horizon-prompting` | "An enumerated list of results that do not count" | Adotado integralmente | ✅ Verificado |
| **Failure Modes enumerados** para auditor | `long-horizon-prompting` | "A concrete checklist of domain-specific ways a candidate can be subtly wrong" | Adotado + expandido p/ domínios | ✅ Verificado |
| **ReAct Loop** (Think → Act → Observe) | Yao et al. 2023 "ReAct" | arXiv:2210.03629 | Adotado | ✅ Verificado |
| **Chain-of-Thought** (CoT) | Wei et al. 2022 | arXiv:2201.11903 | Adotado | ✅ Verificado |
| **Auto-crítica / Self-Criticism** | Madaan et al. 2023 "Self-Refine" | arXiv:2303.17651 | Adotado + checklist estruturado | ✅ Verificado |
| **Self-Consistency** (múltiplas amostras) | Wang et al. 2023 | arXiv:2203.11171 | Referenciado (não implementado no loop único) | 📋 Referenciado |
| **Tree of Thoughts** (ToT) | Yao et al. 2023 | arXiv:2305.10601 | Referenciado (não implementado) | 📋 Referenciado |
| **Optimization Ladder** (6 rungs) | `self-improvement-loops` skill | Weng "Harness Engineering for Self-Improvement" (Lil'Log 2026) | Adaptado: Outside-the-loop invariant | ✅ Verificado |
| **Outside-the-Loop Invariant** (evaluator fora) | `self-improvement-loops` | "The evaluator, its instrumentation, permission control, and budget enforcement must live outside the surface the loop can modify" | Adotado integralmente | ✅ Verificado |
| **Two-Split Acceptance** (held-in + held-out) | `self-improvement-loops` | Zhang et al. "Self-Harness" (arXiv:2606.09498) | Adotado: mental a cada CRITIC | ✅ Verificado |
| **Empirical Acceptance, Never Rationale** | `self-improvement-loops` | "Accept a self-modification only on measured evidence" | Adotado: evidência > racionalização | ✅ Verificado |
| **Filesystem Experience Archive** | `self-improvement-loops` | "Store every candidate as a directory..." | Adaptado: JSONL log por iteração | ✅ Verificado |
| **Diversity Preservation** | `self-improvement-loops` | Archive + discounted fitness + near-duplicate rejection | Não implementado no loop único (multi-candidato) | 📋 Futuro |
| **CoT Eficácia** (por que funciona) | IBM CoT article | https://www.ibm.com/br-pt/think/topics/chain-of-thoughts | Fundamentação teórica | ✅ Verificado |
| **Variantes CoT** (zero-shot, few-shot, self-consistency, ToT, ReAct, self-criticism) | IBM CoT article | "Variantes da cadeia de ideias" | ReAct + self-criticism adotados | ✅ Verificado |
| **CRITIC Checklist** (7 checks) | Síntese própria + MetaLupa | Baseado em MetaLupa §16 + self-improvement-loops gotchas | Síntese própria | 🧪 Novo |
| **PONTO_FIXO** (critic não muda em 2 iters) | MetaLupa §16 + self-improvement-loops | "Ponto fixo resfria e encerra" | Adotado | ✅ Verificado |
| **Outside-the-Loop Invariant** (budget/permission/sandbox no runtime) | `self-improvement-loops` + `harness-engineering` | "Constraints stated in prompt text get evolved away. Enforce budgets... in the runtime" | Adotado integralmente | ✅ Verificado |
| **Two-Split Mental** (held-in + held-out a cada CRITIC) | `self-improvement-loops` | Two-split acceptance gate | Adaptado: mental a cada iteração | ✅ Verificado |

---

## Claims com ID (para rastreabilidade)

| Claim ID | Claim | Fonte | Status |
|----------|-------|-------|--------|
| `claim-cot-react-loop-001` | Loop THINK→ACT→OBSERVE→CRITIC→REFINE→DECIDE reduz erro silencioso em ~60-80% vs só MetaLupa final | Estimativa baseada em gap fase DURANTE | 🧪 Estimativa |
| `claim-cot-react-loop-002` | Two-split mental a cada CRITIC previne trade-offs silenciosos | `self-improvement-loops` two-split acceptance | ✅ Teórico |
| `claim-cot-react-loop-003` | Non-counting outcomes previne "quase" virar PASS | `long-horizon-prompting` non-counting outcomes | ✅ Empírico (repo) |
| `claim-cot-react-loop-004` | Outside-the-loop invariant (evaluator fora) previne reward hacking | `self-improvement-loops` Outside-the-Loop Invariant | ✅ Empírico (repo) |
| `claim-cot-react-loop-005` | CRITIC checklist estruturado detecta FALSO_VERDE que passaria batido | MetaLupa §16 falso verde patterns | ✅ Empírico (MetaLupa) |
| `claim-cot-react-loop-006` | PONTO_FIXO (critic não muda 2 iters) evita loop zumbi | MetaLupa §16 ponto fixo | ✅ Empírico (MetaLupa) |

---

## Skills do Repo Muratcan Referenciadas (para futuro)

| Skill | Relevância | Ação |
|-------|------------|------|
| `self-improvement-loops` | Core: optimization ladder, outside invariant, two-split, empirical acceptance | ✅ Integrado |
| `long-horizon-prompting` | Core: pseudo-formal brief, non-counting outcomes, failure modes, persistence+verification | ✅ Integrado |
| `harness-engineering` | Runtime enforcement: locked surfaces, rollback, novelty gates | ✅ Referenciado (outside invariant) |
| `evaluation` / `advanced-evaluation` | Evaluator/Judge design | Referenciado (outside invariant) |
| `context-compression` / `memory-systems` | Compaction/handoff para long runs | Futuro |
| `multi-agent-patterns` | Topology, handoff, coordination | Futuro (para orchestration) |
| `context-optimization` | One-shot efficiency | Complementar |
| `context-fundamentals` / `context-degradation` | Context mechanics | Referência |
| `tool-design` | Tool schema design | Complementar |
| `project-development` | Pipeline shape, cost estimation | Referenciado |
| `bdi-mental-states` | Belief-Desire-Intention modeling | Futuro (reasoning explícito) |
| `advanced-evaluation` | LLM-as-judge, pairwise, bias mitigation | Referenciado (judge) |

---

## Próximos Passos de Proveniência

1. **Adicionar claim IDs** inline no SKILL.md (ex: `[claim-cot-react-loop-003]`)
2. **Criar `researcher/claims/index.jsonl`** no skill dir (padrão do repo muratcankoylan)
3. **Validar claims** com testes reais na Casa (rodar loop em tarefas reais)
4. **Atualizar** claims com evidência medida (PASS/REFUTADO/INCONCLUSIVO)