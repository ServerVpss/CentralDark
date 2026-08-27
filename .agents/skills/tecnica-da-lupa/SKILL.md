---
name: tecnica-da-lupa
description: Alias de compatibilidade para revisão de design grande. Encaminha integralmente para a MetaLupa canônica e seu guardrail design-bloat-review; não mantém método, owner ou autoridade paralelos.
metadata:
  type: redirect
  status: COMPATIBILITY_ALIAS
  owner: .agents/skills/meta-lupa/SKILL.md
  canonical_guardrail: .agents/skills/meta-lupa/guardrails/design-bloat-review.md
---

# Técnica da Lupa — redirect de compatibilidade

Este caminho permanece somente para **descoberta de chamadas históricas**.

```text
TECNICA_DA_LUPA
→ LOAD .agents/skills/meta-lupa/SKILL.md
→ APPLY .agents/skills/meta-lupa/guardrails/design-bloat-review.md
```

```text
TECNICA_DA_LUPA_IS_SECOND_SKILL=false
TECNICA_DA_LUPA_IS_SECOND_OWNER=false
TECNICA_DA_LUPA_IS_AUTHORITY=false
META_LUPA_IS_CANONICAL_OWNER=true
REUSE_BEFORE_CREATE=true
```

Se uma IA encontrar referência antiga a `tecnica-da-lupa`, deve seguir o redirect acima e aplicar os sete filtros pelo owner MetaLupa, sem duplicar conteúdo ou criar uma nova versão.
