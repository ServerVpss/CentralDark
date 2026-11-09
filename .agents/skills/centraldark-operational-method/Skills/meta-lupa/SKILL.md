---
name: centraldark-meta-lupa-adapter
description: "Adaptador da Skill Mae para META-LUPA; preserva owner original e utiliza Hermes existente."
owner: centraldark-operational-method
canonical_source: ".agents/skills/meta-lupa/SKILL.md"
status: OPERATIONAL_ADAPTER
---

# META-LUPA

**Finalidade:** Contraprova e calibracao proporcional ao risco.

**Owner canonico:** .agents/skills/meta-lupa/SKILL.md. Consultar antes de aplicar; nao copiar runtime nem criar gatilho ou executor paralelo.

**Procedimento:** INTENCAO -> CURRENT -> OWNER -> PROVA -> APLICAR METODO ORIGINAL -> CONTRAPROVA -> RECEIPT -> NEXT_CURSOR.

**Gates:** SOURCE_PRESENT, OWNER_RESOLVED, RUNTIME_OBSERVED avaliados separadamente. Metodo documentado nao prova execucao. Se nao aplicavel nesta rodada 40/40: NOOP_JUSTIFIED.

**Conexoes:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.

**Compatibilidade:** preservar a fonte e os aliases em .agents/skills ate validar todos os loaders.
