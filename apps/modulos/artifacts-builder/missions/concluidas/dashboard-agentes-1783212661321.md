# Dashboard de Agentes CentralDark

## Tipo
react-spa

## Descrição
Dashboard em tempo real mostrando todos os 24 agentes PM2 do ecossistema CentralDark com status online/offline, uptime, CPU, memória. Cards com cores por categoria (IA=roxo, Bot=azul, MCP=ciano, Infra=verde). Atualização automática a cada 5s.

## Requisitos
- Grid de cards com todos os 24 processos PM2
- Cada card mostra: nome, status (🟢/🔴), uptime, CPU%, memória
- Cores por categoria: IA (#a78bfa), Bot (#38bdf8), MCP (#22d3ee), Infra (#34d399)
- Barra de busca/filtro por nome
- Ordenação: críticos (offline) primeiro
- Tooltip com detalhes ao hover
- Atualização automática via fetch a cada 5s
- Indicador de "última atualização"
- Responsivo (mobile-first)

## Rotas
/

## Tema
dark


---
**Status:** ✅ Concluído
**Slug:** dashboard-de-agentes-centraldark
**Data:** 2026-07-05T00:51:01.321Z
