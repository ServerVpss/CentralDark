# Cockpit — compactacao visual e 25 owners (22/10/2026)
@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx; apps/instinto-superior/src/components/central/MapaOwners.tsx; apps/instinto-superior/src/components/central/ArchitectureVisualization.tsx; apps/instinto-superior/src/data/painel-unico.ts
@last_updated: 2026-10-22
@estado: SOURCE_COMMITTED; TYPECHECK_UNKNOWN; CI_UNKNOWN; UI_E2E_PENDING; VPS_NOT_DEPLOYED
@next_cursor: testar TSX com o build real, corrigir regressões, publicar por owner e medir viewport 375/768/1440, clique, API ACK, resultado e contraprova no navegador da Casa.

## Descobertas no source
- 25 abas numa faixa min-w-max extensa e botoes laterais sobrepostos em mobile.
- Imports repetidos de useState e HudDeterministico.
- Conteudo Unigram sem fechamento; triggers Regras Forja e Inventario sem conteudo proprio.
- Arquitetura e HTML Consolidation com 100% historico apresentado como PASS vivo.

## Mudanca
- Menu compacto padrao (Visao / Oficina / Hermes) e grid de 25 areas recolhivel, responsivo de duas a cinco colunas.
- Um unico indice COCKPIT_ABAS aponta id, titulo, owner real, auth e limite de evidencias; MapaOwners navega em cada owner disponivel.
- Fechamento JSX e duas abas documentais que levam a owners, sem substituir executor.
- Selos estaticos convertidos em referencia historica ou UNKNOWN; nao alegar deploy.
- Preserva tema DEFAULT de DesignCenter e sessao Supabase; nao duplica Hermes nem MCP.

## Gates
STATIC_MAPPING: 25 triggers e 25 contents únicos com zero TabsContent abertos e uma importação de cada simbolo.
Compile, typecheck, visual, clique/ACK, API, e runtime nao foram executados nesta prova.
