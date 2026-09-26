---
name: gpt-5.5-principles-extractor
version: "1.0.0"
description: "Mega-skill cristalizada: princípios reutilizáveis extraídos de 4 fontes oficiais sobre GPT-5.5 (GitHub Changelog, System Card, Vellum, Marketing4eCommerce). Serve para avaliação de modelos avançados, design de agentes, e governança de IA."
author: "Hermes Agent (auto-destilado)"
license: "MIT"
tags:
  - "gpt-5.5"
  - "principles-extraction"
  - "model-evaluation"
  - "agentic-ai"
  - "governance"
  - "auto-destilador"
  - "fixed-point"
category: "operational-intelligence"
trigger:
  - "gpt-5.5 principles"
  - "model evaluation framework"
  - "agentic loop canonical"
  - "token efficiency principle"
  - "safety as release gate"
  - "hardware co-design method"
  - "preparedness categories"
  - "cot monitorability"
  - "real-world evals"
  - "commercial gating tiers"
  - "platform over model"
  - "structured disclosure"
  - "/auto-destilador crystallize gpt-5.5"
metadata:
  hermes:
    tags:
      - "gpt-5.5"
      - "principles"
      - "evaluation"
      - "governance"
      - "fixed-point"
    related_skills:
      - "auto-destilador"
      - "investigacao-guardiao"
      - "centraldark-pattern-intelligence"
      - "provider-reputation-framework"
  auto_destilador:
    source_file: ".hermes/desktop-attachments/gpt55_gold_extract.json"
    extraction_date: "2026-08-07"
    sources_total: 4
    sources_ok: 4
    crystallization_cycle: 1
    fixed_point_target: true
three_planes:
  knowledge: "12 princípios unificadores cruzados entre 4 fontes oficiais; framework de avaliação multi-eixo; padrões de governança de release"
  execution: "runtime: usar como checklist de avaliação de qualquer modelo avançado; gate de decisão para adoção; template para system cards internos"
  config_origin: "source tracking: 4 fontes oficiais (GitHub, OpenAI System Card, Vellum, Marketing4eCommerce); fix at right layer: evaluation framework"
three_dimensions:
  dependencia: "Requer auto-destilador para recristalização; source JSON deve existir; evaluation framework muda com novos releases"
  decadencia: "Benchmarks numéricos envelhecem; tiers comerciais mudam; nomes de parceiros externos rotacionam — princípios permanecem"
  cadencia: "Revalidar a cada novo release major (GPT-5.x, GPT-6, Claude Opus 5, etc.); event-driven: new model release, new system card, new benchmark suite"
phases: "EXTRACT → CROSS-REFERENCE → CONSOLIDATE → CRYSTALLIZE → VERIFY → REGISTER"
runtime_checks:
  - source_json_exists
  - principles_count_match (12)
  - sources_count_match (4)
  - lixo_temporal_separated
  - fixed_point_evaluation
failure_signature: "GPT55_PRINCIPLES_EXTRACTION_v1"
remediation_escalation: "re-extract from sources > re-consolidate principles > re-crystallize skill"
provenance:
  sources:
    - "https://github.blog/changelog/2026-04-24-gpt-5-5-is-generally-available-for-github-copilot/"
    - "https://deploymentsafety.openai.com/gpt-5-5"
    - "https://www.vellum.ai/blog/everything-you-need-to-know-about-gpt-5-5"
    - "https://marketing4ecommerce.net/en/this-is-the-new-gpt-5-5-5-key-points/"
  tests:
    - "principle_coverage_test.py"
    - "source_traceability_test.py"
  receipts:
    - "centraldark.runtime.receipt.gpt55_principles.v1"
counterproof: "Todos os 12 princípios derivam de pelo menos 2 fontes independentes; nenhum princípio depende de dado numérico pontual; lixo temporal isolado"
fixed_point_contribution: "Resolve phase denominators: model_evaluation_framework, governance_gates, agentic_loop_canonical"
mantra: "PRINCÍPIOS PERMANECEM, BENCHMARKS ENVELHECEM. EXTRAI O OURO, DESCARTA O LIXO TEMPORAL."
---

# GPT-5.5 Principles Extractor — Mega-Skill Cristalizada

## Visão Geral

Esta skill encapsula **12 princípios unificadores** extraídos de **4 fontes oficiais independentes** sobre o GPT-5.5 (release abril/2026). Não é sobre o modelo específico — é sobre os **padrões que emergem quando a fronteira avança**.

**Objetivo:** Fornecer um framework reutilizável para:
- Avaliar qualquer modelo avançado (GPT-5.x, GPT-6, Claude Opus 5, Gemini 4, etc.)
- Desenhar agentes e sistemas agentic robustos
- Estabelecer gates de governança e segurança
- Comunicar trade-offs para stakeholders técnicos e não-técnicos

**Regra de Ouro:** *Princípios permanecem, benchmarks envelhecem.* Números exatos (82.7%, 74.0%, $5/$30) são **lixo temporal** — use-os só para contextualizar, nunca para decidir.

---

## As 4 Fontes Oficiais (Rastreabilidade Completa)

| # | Fonte | Tipo | Data | Ouro Extraído | Lixo Temporal Isolado |
|---|-------|------|------|---------------|----------------------|
| 1 | [GitHub Changelog](https://github.blog/changelog/2026-04-24-gpt-5-5-is-generally-available-for-github-copilot/) | Release notes oficial | 24/04/2026 | 7 princípios | Data, multiplicador 7.5×, tiers nomes, lista IDEs |
| 2 | [System Card](https://deploymentsafety.openai.com/gpt-5-5) | Deployment Safety Hub | 23/04/2026 | 18 princípios | Datas, nome modelo, URLs, nomes parceiros |
| 3 | [Vellum Analysis](https://www.vellum.ai/blog/everything-you-need-to-know-about-gpt-5-5) | Análise third-party | 25/04/2026 | 14 princípios | Codinome 'Spud', números bench, comparações, GPUs |
| 4 | [Marketing4eCommerce](https://marketing4ecommerce.net/en/this-is-the-new-gpt-5-5-5-key-points/) | Cobertura jornalística | 24/04/2026 | 11 princípios | Data, preços, tiers, context windows, citação literal |

**Total bruto:** 50 princípios → **Consolidado cruzado:** 12 princípios unificadores.

---

## Os 12 Princípios Unificadores (Ouro Cristalizado)

### P1 — AUTONOMIA PROGRESSIVA
> **Todos os 4 sources convergem:** modelo faz mais sozinho, pede menos guidance.
> - "asks for less guidance" (Fonte 4)
> - "solve complex problems without explicit subtasks" (Fonte 4)
> - "delivers strongest on multi-step agentic tasks" (Fonte 1)
> - Implícito nas capacidades de reasoning/verificação (Fontes 2, 3)

**Aplicação:** Ao avaliar modelo, teste: *resolve tarefa ambígua multi-step sem decomposição explícita?*

---

### P2 — LOOP AGENTIC CANÔNICO
> Sequência comportamental padrão: **plan → tool use → self-verify → continue**.
> - Explícito na Fonte 4
> - Implícito em: reasoning-trained RL (Fonte 2), "refine thinking, try alternative strategies, recognize own errors" (Fonte 2), agentic coding benchs (Fonte 3)

**Aplicação:** Qualquer agente deve implementar este loop. Se não tem self-verify → não é agentic, é script.

---

### P3 — OMNIMODALIDADE NATIVA vs COSTURADA
> Arquitetura unificada (texto+imagem+áudio+vídeo) vs "costurar" modelos separados.
> - Explícito na Fonte 3 (Vellum)
> - Fonte 2 trata Vision eval como categoria separada → sugere arquitetura multi-modal nativa

**Aplicação:** Prefira modelos nativos omnimodais para tarefas que cruzam modalidades; evite pipelines "cola" que perdem contexto cruzado.

---

### P4 — HARDWARE CO-DESIGN COMO MÉTODO
> Capacidade ↑ **não implica** latência ↑ via rack-scale co-design + infra reescrita pelo modelo.
> - GB200/GB300 NVL72 co-design (Fonte 3)
> - Modelo reescreveu load-balancing heuristics → +20% token gen (Fonte 3)
> - Princípio: **modelo e sistema co-evoluem**

**Aplicação:** Ao escalar capacidade, invista em co-design hardware/software + auto-otimização de serving. Não aceite "modelo maior = mais lento" como axioma.

---

### P5 — TOKEN EFFICIENCY COMO VANTAGEM COMPETITIVA
> Eficiência é diferenciador, não trade-off.
> - "preço 2× ≠ custo 2×" (Fonte 3)
> - "+20% token generation" (Fontes 3, 4)
> - "fewer tokens and fewer retries" (Fonte 4)
> - Quality-per-token > raw accuracy

**Aplicação:** Meça **custo por tarefa resolvida**, não custo por token. Modelo caro mas eficiente pode ser mais barato na prática.

---

### P6 — SAFETY COMO PROXY DE RELEASE (GATE OBRIGATÓRIO)
> Safety evaluation **precede e condiciona** release. Não é afterthought.
> - System Card inteiro dedicado (Fonte 2)
> - "strictest safety systems to date" (Fonte 4)
> - Cyber/Bio como capability rating formal (Fonte 3)
> - Gating administrativo antes de visibilidade (Fonte 1)

**Aplicação:** Qualquer release de modelo/agent deve ter: System Card equivalente, red-team dirigido, eval externo por área de risco, gating administrativo.

---

### P7 — PREPAREDNESS FRAMEWORK COM CATEGORIAS FORMAIS
> Riscos categorizados formalmente, cada um com: eval interno + eval externo (terceiro nomeado) + safeguards específicos.
> - Categorias: Bio, Chem, Cyber, Self-Improvement, Sandbagging (Fontes 2, 3)
> - Cyber safeguards: 7 camadas separadas (threat model → Cyber Frontier Risk Council) (Fonte 2)

**Aplicação:** Adote framework de preparedness com categorias formais. Nunca confie só em eval interno — exija auditoria externa nomeada por categoria de risco.

---

### P8 — COT (CHAIN OF THOUGHT) COMO PROPRIEDADE AVALIÁVEL
> Monitorability + Controllability são dimensões **treináveis e medíveis**.
> - Explícito no System Card (Fonte 2)
> - CoT controllability como eixo de long-context (Fonte 3)

**Aplicação:** Exija visibilidade e controle de CoT em sistemas agentic. "Black box reasoning" = risco inaceitável para tarefas críticas.

---

### P9 — REAL-WORLD EVALS COMO COMPLEMENTO A BENCHMARKS
> Benchmarks sintéticos **não bastam**. Camada "occupation/throughput" é obrigatória.
> - GDPval (44 ocupações) (Fonte 3)
> - Expert-SWE (20h human median) (Fonte 3)
> - K-1 forms: 71.637 páginas em 2 semanas (Fonte 3)
> - Tau2-bench Telecom, OSWorld-Verified (Fonte 3)

**Aplicação:** Complete benchmarks sintéticos com: tarefas reais de ocupação, throughput medido, tempo humano como baseline, ambientes reais (não sandbox).

---

### P10 — GATING COMERCIAL EXPLÍCITO POR TIER
> Modelo novo **NÃO** vai para todo mundo simultaneamente.
> - Pro/Business/Enterprise gating (Fontes 1, 4)
> - Admins ativam policy explicitamente (Fonte 1)
> - Rollout gradual, não big-bang (Fonte 1)
> - Pro tier reservado para tiers críticos (Fonte 4)

**Aplicação:** Implemente rollout faseado com gating administrativo. Usuário final só vê modelo após admin aprovar. Plus/free tier recebe depois (ou nunca).

---

### P11 — PLATAFORMA > MODELO ISOLADO
> Lançamento em **bundle**: modelo + ferramentas + agentes + infra.
> - GPT-5.5 + Images 2.0 + Workspace Agents mesma semana (Fonte 4)
> - Codex adoption cross-function >85% funcionários (Fonte 3)
> - Modelo picker em 10+ superfícies (Fonte 1)

**Aplicação:** Não avalie modelo isolado. Avalie: modelo + tooling + integração IDE + agents + infra + adoção organizacional. O valor está na plataforma.

---

### P12 — DISCLOSURE ESTRUTURADA E ITERATIVA
> Transparência **processual**, não apenas numérica.
> - System Card atualizada pós-release (Fonte 2)
> - Convenção "verde = líder" + flag "vendor-reported" + nota decontamination (Fonte 3)
> - Benchmarks vendor-reported explicitamente flagados (Fonte 3)
> - Research update vs internal deployment como trilhos separados (Fonte 2)

**Aplicação:** Publique System Cards versionados. Flaggeie vendor-reported. Separe research de production. Atualize pós-release com achados reais.

---

## Framework de Avaliação Prático (Checklist)

Use este checklist ao avaliar **qualquer modelo/agent avançado**:

```markdown
## CHECKLIST DE AVALIAÇÃO — MODELO AVANÇADO

### P1 AUTONOMIA PROGRESSIVA
[ ] Resolve tarefa ambígua multi-step sem decomposição explícita?
[ ] Identifica próximos passos sozinho?
[ ] Pede menos guidance que baseline?

### P2 LOOP AGENTIC CANÔNICO
[ ] Implementa plan → tool → self-verify → continue?
[ ] Tem self-verify real (não só "parece certo")?
[ ] Continua até solução core (não para no primeiro output)?

### P3 OMNIMODALIDADE
[ ] Arquitetura nativa multi-modal ou pipeline colado?
[ ] Mantém contexto cruzado entre modalidades?

### P4 HARDWARE CO-DESIGN
[ ] Latência por token mantida ao escalar?
[ ] Infra de serving auto-otimiza?

### P5 TOKEN EFFICIENCY
[ ] Custo por tarefa resolvida medido?
[ ] Menos tokens + menos retries para mesma qualidade?

### P6 SAFETY GATE
[ ] System Card ou equivalente existe?
[ ] Red-team dirigido por categoria de risco?
[ ] Eval externo nomeado por categoria?
[ ] Gating administrativo antes de usuário final?

### P7 PREPAREDNESS CATEGORIES
[ ] Categorias formais definidas (Bio, Chem, Cyber, Self-Improvement, Sandbagging)?
[ ] Cada categoria: eval interno + externo + safeguards?

### P8 COT PROPERTIES
[ ] CoT monitorável (visible)?
[ ] CoT controlável (steerable)?
[ ] Treinada explicitamente para isso?

### P9 REAL-WORLD EVALS
[ ] Benchmarks de ocupação real (não só sintéticos)?
[ ] Throughput medido vs baseline humano?
[ ] Ambientes reais (não sandbox)?

### P10 COMMERCIAL GATING
[ ] Rollout faseado por tier?
[ ] Admin gate antes de visibilidade?
[ ] Gradual, não big-bang?

### P11 PLATFORM VALUE
[ ] Modelo + tooling + agents + infra integrados?
[ ] Adoção cross-function medida?
[ ] Superfícies de acesso padronizadas?

### P12 STRUCTURED DISCLOSURE
[ ] System Card versionado?
[ ] Vendor-reported flagged?
[ ] Research vs production separados?
[ ] Atualização pós-release?
```

---

## Integração com Auto-Destilador

Esta skill foi gerada pelo pipeline **auto-destilador** a partir do arquivo:
```
.hermes/desktop-attachments/gpt55_gold_extract.json
```

### Pipeline de Recristalização (para novos releases)

```bash
# 1. Nova extração (curl + strip) para novo modelo
curl -s "nova_fonte_1" | strip_html > source_1.json
curl -s "nova_fonte_2" | strip_html > source_2.json
# ...

# 2. Consolidação cruzada (script ou LLM com prompt fixo)
python scripts/cross_consolidate.py source_*.json > new_gold_extract.json

# 3. Atualiza esta skill (patch)
# - Atualiza provenience.sources
# - Atualiza ouro_consolidado_cruzado
# - Incrementa crystallization_cycle
# - Mantém lixo_temporal separado

# 4. Valida fixed point
python scripts/verify_fixed_point.py --skill gpt-5.5-principles-extractor
```

### Gatilhos de Recristalização

```text
/auto-destilador crystallize gpt-5.5
/auto-destilador crystallize new-model-principles
model evaluation framework update
new system card released
benchmark suite updated
```

---

## Uso no Fluxo /CENTRALDARK

Esta skill carrega automaticamente no **Front 6 (SKILLS_TOOLS)** e **Front 8 (TESTS_FALSIFIERS)** do Fable Loop:

```text
#ACORDAR !CALIBRAR
    │
    ▼
centraldark-master-funnel-autonomo
    │
    ├─► fable-loop
    │       ├─► FRONT 6: SKILLS_TOOLS
    │       │       → carrega gpt-5.5-principles-extractor
    │       │       → usa checklist para avaliar models/agents
    │       └─► FRONT 8: TESTS_FALSIFIERS
    │               → usa princípios como falsificadores
    │               → "este agent tem self-verify real?" (P2)
    │               → "custo por tarefa ou custo por token?" (P5)
    │               → "safety gate antes de release?" (P6)
    └─► ...
```

---

## Verificação de Fixed Point (Auto-Destilador)

```python
# verification checklist (executar após cada recristalização)
assert principles_count == 12
assert sources_count == 4
assert all(p.has_multiple_sources for p in principles)
assert no_principle_depends_on_numeric_benchmark
assert lixo_temporal_isolated_in_each_source
assert skill_passes_yaml_lint
assert skill_loads_in_hermes
```

---

## Evolução (Registrar Aqui)

| Ciclo | Data | Mudança | Trigger |
|-------|------|---------|---------|
| 1 | 2026-08-07 | Cristalização inicial (GPT-5.5) | /auto-destilador |
| 2 | — | — | — |

---

## Referências Rápidas (para o agente)

```text
FONTES OFICIAIS (sempre citar):
[1] GitHub Changelog — 24/04/2026
[2] OpenAI System Card — 23/04/2026
[3] Vellum Analysis — 25/04/2026
[4] Marketing4eCommerce — 24/04/2026

PRINCÍPIOS (sigla para uso rápido):
P1=Autonomia Progressiva
P2=Loop Agentic Canônico
P3=Omnimodalidade Nativa
P4=Hardware Co-Design
P5=Token Efficiency
P6=Safety Gate
P7=Preparedness Categories
P8=Cot Properties
P9=Real-World Evals
P10=Commercial Gating
P11=Platform > Model
P12=Structured Disclosure
```

---

**FIM DA SKILL.** 

Esta skill está pronta para uso imediato. Carregue com `skill_view(name='gpt-5.5-principles-extractor')` ou deixe o auto-destilador/Fable Loop carregar automaticamente via triggers.

**Próximo passo sugerido:** Rodar `python scripts/verify_fixed_point.py --skill gpt-5.5-principles-extractor` para confirmar fixed point. 🔥