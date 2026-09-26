# Mermaid — Padrão Obrigatório da Casa

Decisão do CHEFE (PERMITO PIVETE, 2026-08-27): toda informação estruturada da
CentralDark deve poder ser expressa em **Mermaid** (.mmd), além do texto. Isso
fortalece os fluxos: cada conceito vira diagrama + prosa.

## Regra

> Para toda explicação com 3+ componentes, fluxo, sequência, árvore, estado ou
> relação: gere o `.mmd`. Não é opcional — é padrão canônico como o boot
> !CENTRALDARK.

## Duas skills — oscilar conforme ocasião

| Ocasião | Skill | Por quê |
|---|---|---|
| Validação rápida, zero install, CI | `skills/mermaid-skill` (Kroki via curl) | não precisa de Node/browser |
| Tema bonito, ASCII terminal, batch | `skills/pretty-mermaid` (Node, 15 temas) | render local, sem browser |
| PDF | `skills/mermaid-skill` (mmdc local) | Kroki não faz PDF |

**Oscilação:** Kroki quando só validar/exportar SVG/PNG sem instalar nada;
pretty-mermaid quando quer tema (tokyo-night, dracula, nord) ou saída ASCII.

## Arquivos na Casa

- `skills/mermaid-skill/` — agents365 (Kroki)
- `skills/pretty-mermaid/` — imxv (temas)
- `skills/mermaid_render.py` — wrapper oscilante (pretty se npm ok, senão Kroki)
- `skills/README.md` — comandos exatos
- `docs/CONSCIENCIA/VISUALIZACAO-MERMAID-PADRAO.md` — convenção canônica

## Fluxo de render (ambas as skills)

1. Gerar `.mmd` (texto canônico, vive no git)
2. **Validar antes de exportar** (Kroki: `curl -s -X POST ... kroki.io/mermaid/svg`; pretty: o script já valida)
3. Renderizar (Kroki ou pretty-mermaid)
4. Inspecionar com vision — corrigir label cortado / densidade
5. Re-renderizar

Nunca exportar sem validar. Nunca declarar diagrama "pronto" sem inspeção visual.
