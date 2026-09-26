# Template — Página de Modelo

> Use este template para cada modelo. Nunca criar variante. Versão interna
> vai no frontmatter, não no nome do arquivo.

```markdown
---
modelo: <exato nome canônico, kebab-case>
provider: <openai | anthropic | google | xai | meta | deepseek | ...>
capability_tier: <frontera | flagship | mid | small | nano>
version_pagina: 0.1.0
data_criacao: YYYY-MM-DD
ultima_atualizacao: YYYY-MM-DD HH:MM
fontes_primarias:
  - url: <exato>
    sha: <opcional, se verificável>
    data_consulta: YYYY-MM-DD
manter_sempre:
  - <1 bullet mínimo>
  - <2 bullet mínimo>
classificacao_5c:
  promoteu_a: <n>
  ignorou_b: <n>
  fechou_c: <n>
  rejeitou_d: <n>
  rejeitou_e: <n>
---

# Modelo: <Nome Canônico>

## Identidade
- provider:
- capability_tier:
- context_window (input/output):
- modalities (texto, visão, áudio, vídeo, tool):
- aliases_outros_nomes:
- restrições/curiosidades:

## Comportamento validado
- <bullet prova>
- <bullet prova>

## Limites conhecidos
- <bullet>
- <bullet>

## Padrões de uso (do Pivete)
- <quando usar, quando evitar>

## Como a Casa usa
- <config, skill, tool, route>

## Evidência / SHA
- <url>:<sha>:<consulta>

## Última atualização
- YYYY-MM-DD HH:MM

## Pendente de verificação
- (vazio = tudo triado)
```

## Regras do template

- **Frontmatter obrigatório** — versão, data, fontes SHA-contadas.
- **Sem campos vazios** — se não tem, escreva "—" + motivo.
- **Bullet seco** — sem floreio, sem "é incrível", sem popularidade.
- **SHA = verificável** — se não dá, marque "pendente".
- **Pivete escreve PADRÕES DE USO.** Você (eu) propões, Pivete valida.
