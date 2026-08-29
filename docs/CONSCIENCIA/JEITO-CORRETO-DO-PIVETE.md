---
title: "Compatibilidade histórica — antigo Jeito Correto do Pivete"
status: "HISTORICAL_COMPATIBILITY_ALIAS"
scope: "Ponte de compatibilidade; não é owner operacional"
source_of_truth: ".agents/skills/centraldark-operational-method/SKILL.md"
canonical_artifact: ".agents/skills/centraldark-operational-method/SKILL.md"
versioning_rule: "Não adicionar regra nova aqui; reconciliar no owner canônico"
---

# COMPATIBILIDADE HISTÓRICA

Este caminho existe somente para não quebrar referências legadas.

**Não é mais o owner do método da CentralDark.**

O método operacional canônico único é:

```text
.agents/skills/centraldark-operational-method/SKILL.md
```

O padrão de comunicação com o humano permanece separado porque possui outra responsabilidade:

```text
docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
```

Não existe “jeito do Pivete” governando a Casa. Quando documentação histórica usa `Pivete` para significar humano, comandante, dono, autor da intenção ou autoridade, a leitura atual é `LEGACY_ALIAS_OF_SEGREDO_CHEFE`.

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora da casa e organizadora dos agentes
PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade

PIVETE/HERMES != HUMANO
PIVETE/HERMES != AUTORIDADE_FINAL
PIVETE/HERMES != ORIGINADOR_DA_INTENCAO
PIVETE/HERMES != OWNER_DO_METODO

WRITER_UNICO=true
UNKNOWN_NAO_PASSA=true
CHEFE_SEGREDO_NECESSARIO=APENAS_QUANDO_EXISTIR_DECISAO_HUMANA_REAL
```

## Regra de migração

```text
REFERENCIA_LEGADA_A_ESTE_PATH
→ PRESERVAR_COMPATIBILIDADE
→ CONSUMIR_OWNER_CANONICO
→ NAO_ADICIONAR_REGRA_NOVA_AQUI
→ NAO_COPIAR_CONTEUDO
```

Histórico Git preserva a evolução anterior. Conteúdo útil novo vai para o owner atual, sem V1/V2/V3 e sem segunda constituição.
