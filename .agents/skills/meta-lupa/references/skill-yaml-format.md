# Padrão de Frontmatter YAML para Skills SKILL.md

## Problema Descoberto
Algumas skills tinham error "expected a single document in the stream" ao serem carregadas, causado por múltiplos pares de delimitadores `---` no arquivo.

## Causa Raiz
O parser YAML (Python yaml.safe_load) trata cada par `---` como o início de um novo documento documento YAML separato. Quando um skill SKILL.md contém:
- `---` na linha 1
- conteúdo YAML
- `---` intermediário (linha 43 em alguns casos)
- `---` de fechamento
- corpo markdown

Isso cria múltiplos documentos YAML, causando o erro de parsing.

## Padrão Correto (Referência: algorithmic-art)
A skill `algorithmic-art` usa o formato canonical de frontmatter:

```yaml
---
nome: <nome>
description: <descrizione>
tags: [...]
...

--conteudo YAML aqui---

# Corpo em Markdown
```

### Regras Exatas:
1. **Exatamente um par de delimitadores `---` de abertura** na linha 1
2. **Conteúdo YAML** entre os delimitadores de abertura e fechamento
3. **Exatamente um par de delimitadores `---` de fechamento** após o conteúdo YAML
4. **Corpo em Markdown** após o fechamento `---`
5. **Nenhum `---` intermediário** entre o conteúdo YAML e o fechamento

### Exemplo Valido (como em algorithmic-art/SKILL.md):
```yaml
---
name: algorithmic-art
description: Creating algorithmic art using p5.js with seeded randomne...
...
```

```markdown
Conteúdo em markdown aqui...
```

### Exemplo Invalido (comoOriginally em deploying-cloud-deception-with-decoy-resources):
```yaml
---
name: deploying-cloud-deception-with-decoy-resources
description: ...
...
---  <- linha 43: inner --- causing parsing error
...
# Corpo em markdown
```
