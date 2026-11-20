---
name: Escopo Lovable — somente frontend
description: Lovable só mexe no frontend (src/) quando o Pivete pedir; nada de backend, infra, VPS, scripts ou docs por conta própria
type: preference
---

# Escopo do Lovable: somente frontend, sob demanda

**Regra:** O Lovable atua **exclusivamente na camada de frontend** (`src/`, componentes React, estilos, rotas, UI/UX) e **só quando o Pivete pedir explicitamente**.

## O que o Lovable PODE fazer
- Editar `src/` (componentes, páginas, hooks de UI, estilos)
- Ajustar `index.html`, `tailwind.config.ts`, `vite.config.ts` quando necessário pro frontend
- Tocar em `public/` (assets estáticos)
- Ler qualquer coisa do repo pra entender contexto

## O que o Lovable NÃO faz por conta própria
- Backend (Supabase migrations, edge functions, RLS) — só se pedido
- Infra (`infra/`, Caddy, guardião, MCP)
- Scripts da VPS (`scripts/`)
- Docs do Cérebro Vivo (`docs/CONSCIENCIA/`, `docs/BRAIN/`)
- Workflows (`.github/workflows/`)
- Áreas protegidas listadas no `CLAUDE.md §9`

## Como aplicar
- Quando o Pivete pedir mudança visual/UI → fazer no frontend e pronto.
- Quando a tarefa exigir backend/infra/scripts → **perguntar antes** ou apontar que está fora do escopo padrão.
- Não propor mexer em backend/infra "de brinde" só porque viu algo que daria pra melhorar.

**Por quê:** O Lovable é o ponto da Sincronia 4-Point responsável pelo frontend. Backend, VPS e Cérebro Vivo têm outros caminhos (Claude/MCP/CI) e não devem ser tocados pelo Lovable sem ordem explícita.
