# Skills Mermaid Integradas — CentralDark

Duas skills de diagramação Mermaid integradas na Casa, cada uma com foco diferente.

## 1. `skills/mermaid-skill` (Agents365)

Gera `.mmd` e exporta via **Kroki API** (curl, sem browser) ou `mmdc` local.
Validação obrigatória antes de exportar. Suporta 17+ tipos.

**Uso rápido:**
```bash
# Validar + SVG via Kroki (sem instalar nada)
curl -s -X POST -H "Content-Type: text/plain" \
  --data-binary @skills/mermaid-skill/examples/centraldark-fluxo-canonico.mmd \
  https://kroki.io/mermaid/svg -o saida.svg
```

**Exemplo gerado:** `skills/mermaid-skill/examples/centraldark-fluxo-canonico.{mmd,svg,png}`
— Fluxograma do ciclo canônico !CENTRALDARK → REALITY_JUDGE.

## 2. `skills/pretty-mermaid` (imxv)

Render local com Node.js, **15 temas** (tokyo-night, dracula, nord...), suporta
SVG / PNG / ASCII terminal. Não precisa de browser.

**Uso rápido:**
```bash
cd skills/pretty-mermaid
npm install   # 1x
node scripts/render.mjs \
  --input examples/centraldark-arquitetura.mmd \
  --output examples/centraldark-arquitetura.svg \
  --theme tokyo-night
```

**Exemplo gerado:** `skills/pretty-mermaid/examples/centraldark-arquitetura.{mmd,svg,png}`
— Arquitetura Casa ↔ GitHub ↔ VPS com tema tokyo-night.

## Como escolher

| Necessidade | Skill |
|---|---|
| Validação rápida, zero install (curl) | `mermaid-skill` (Kroki) |
| Tema bonito, ASCII terminal, batch | `pretty-mermaid` |
| PDF | `mermaid-skill` (mmdc local) |
| 17+ tipos + multi-agent | `mermaid-skill` |

## Diagramas de exemplo (nesta pasta)

- `centraldark-fluxo-canonico.*` — ciclo canônico (agents365/Kroki)
- `centraldark-arquitetura.*` — arquitetura 3 camadas (imxv/pretty-mermaid)

Ambos renderizados e inspecionados (vision): legíveis, sem sobreposição.
Pequeno ajuste cosmético sugerido no diagrama 2: aumentar margem esquerda
para não cortar "AUTO-DESTILADOR".
