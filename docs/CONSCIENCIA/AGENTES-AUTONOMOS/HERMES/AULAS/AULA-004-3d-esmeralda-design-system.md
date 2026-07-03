# AULA-004 — Design System 3D Esmeralda (quando aplicar cada sombra)

**Data:** 2026-07-03  
**Categoria:** conceito  
**Pré-requisitos:** nenhum  
**Tempo estimado:** 5 min

## 1. O que é
Sistema visual oficial de todos os frontends do CentralDark (painel Lovable + Open WebUI). Estilo app nativo, tátil, emerald light default. Utilitários definidos em `src/index.css` do repo Lovable + portados pro `esmeralda.css` do WebUI.

## 2. Quando usar
| Situação | Classe |
|---|---|
| Botão primário CTA | `shadow-3d-primary` + `active:translate-y-[1px]` + `active:shadow-3d-pressed` |
| Botão destrutivo | `shadow-3d-destructive` |
| Card premium/destaque | `card-premium` (`rounded-xl` + `shadow-3d-soft` + border) |
| Card comum | `shadow-3d-soft` |
| Tooltip / dropdown / popover | `rounded-xl` + `shadow-3d-soft` |
| Toast | `rounded-xl` + `shadow-3d` |
| Sidebar direita | `shadow-side-right` |
| Input em foco tátil | `shadow-3d-inset` (novo — a criar) |
| Banner âmbar/warning | `shadow-3d-warning` (novo — a criar) |

## 3. Como fazer
1. Nunca hardcodar cor (`text-white`, `bg-[#...]`, `text-gray-*`) — usar tokens semânticos (`text-primary-foreground`, `bg-primary`, `text-muted-foreground`)
2. Sempre `rounded-xl` (12px) pra cards/botões grandes, `rounded-lg` (8px) pra inputs, `rounded-md` só pra badges pequenas
3. Toda interação clicável: `active:translate-y-[1px]` (feedback tátil)
4. Light default (`html { color-scheme: light }`) — dark opcional

## 4. Comandos prontos
Ver auditoria completa em `docs/CONSCIENCIA/ARSENAL/` (relatório com 15 arquivos a corrigir).

## 5. Armadilhas
- ❌ `text-white` sobrevive no light mode como texto branco no fundo branco — sempre `text-primary-foreground`
- ❌ `shadow-lg` vanilla não tem cor emerald — sempre `shadow-3d*`
- ❌ Misturar `rounded-md` (6px) com `rounded-xl` (12px) no mesmo container — parece bug

## 6. Verificação
- ✅ Botão pressionado afunda 1px + sombra reduz
- ✅ Cor primária consistente entre painel e WebUI (mesmo emerald)
- ✅ Zero cor hardcoded em novo componente

## 7. Ver também
- APRENDIZADOS/003-webui-custom-css-rota.md
- AULA-002 (WebUI CSS)
- Memória `mem://` UI/UX Esmeralda
