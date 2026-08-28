---
title: "VISUALIZACAO MERMAID PADRAO"
date: 2026-08-28
tags: ["consciencia"]
updated: 2026-08-28
---

# Visualização Mermaid — Padrão Obrigatório da Casa

**Decisão do SEGREDO/CHEFE (PERMITO PIVETE):** toda informação estruturada na
CentralDark deve poder ser expressa em **Mermaid** (.mmd). Isso fortalece os
fluxos: cada conceito vira diagrama + texto, não só prosa.

## Regra

> Para toda explicação de sistema com 3+ componentes, fluxo, sequência,
> estado, arquitetura ou relação: gere o `.mmd` correspondente.

Não é opcional. É padrão canônico, como o boot !CENTRALDARK.

## Duas skills — oscilar conforme ocasião

| Ocasião | Skill | Por quê |
|---|---|---|
| Validação rápida, zero install, CI | `skills/mermaid-skill` (Kroki via curl) | não precisa de Node/browser |
| Tema bonito, ASCII terminal, batch | `skills/pretty-mermaid` (Node, 15 temas) | render local, sem browser |
| PDF | `skills/mermaid-skill` (mmdc local) | Kroki não faz PDF |
| 17+ tipos + multi-agent | `skills/mermaid-skill` | cobertura maior |

**Oscilação:** usar Kroki quando só precisa de validar/exportar SVG/PNG sem
instalar nada; usar pretty-mermaid quando quer tema (tokyo-night, dracula, nord)
ou saída ASCII para terminal/chat.

## Uso

```bash
# 1. Gerar .mmd (texto canônico, vive no git)
# 2. Validar (NUNCA exportar sem validar)
# 3. Renderizar (Kroki ou pretty-mermaid)
# 4. Inspecionar (vision) — corrigir label cortado/densidade
# 5. Re-renderizar
```

Ver `skills/README.md` para comandos exatos.

## Exemplos já na Casa

- `skills/mermaid-skill/examples/centraldark-fluxo-canonico.{mmd,svg,png}`
- `skills/pretty-mermaid/examples/centraldark-arquitetura.{mmd,svg,png}`
