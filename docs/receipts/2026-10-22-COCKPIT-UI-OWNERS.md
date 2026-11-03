# Cockpit — compactacao visual e 25 owners (22/10/2026)
@code_ref: apps/instinto-superior/src/data/painel-unico.ts
@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx; apps/instinto-superior/src/components/central/MapaOwners.tsx; apps/instinto-superior/src/components/central/ArchitectureVisualization.tsx; apps/instinto-superior/src/data/painel-unico.ts
@last_updated: 2026-11-03T17:53:43.936Z
@estado: SOURCE_DOC_RECONCILED_IN_PR_1977; VISUAL_ONLY=true; TYPECHECK_UNKNOWN; CI_UNKNOWN; UI_E2E_UNKNOWN; RUNTIME_NOT_IN_SCOPE
@next_cursor: validar CODE_DOC_NOT_UPDATED_IN_SAME_DIFF no diff do PR #1977; reconciliar os demais owners do Hermes/Corpo Unico/Instinto Superior. Nao requer VPS/deploy neste escopo.

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

<!-- CORRECAO_P1_1973_SOURCE_ONLY_20261103 -->
## Revisão documental pós-merge do PR #1973 — SOURCE_ONLY (03/11/2026)

- **Intenção exata:** alinhar o texto do catálogo `apps/instinto-superior/src/data/painel-unico.ts` à realidade de que `docs/HUD/HUD.html` é histórico, enquanto `HudDeterministico.tsx` é indicado como projeção estática de inventário no cockpit. Isso **não** demonstra paridade entre Hermes, Corpo Único e Instinto Superior.
- **Código já integrado anteriormente:** [PR #1973](https://github.com/ServerVpss/CentralDark/pull/1973), HEAD revisado `af009c9fa1bf64acf441f6789da76617a0ce9b43`, merge `55db287f203d3208bc92d50e1a21b7250a827d21`, arquivo `apps/instinto-superior/src/data/painel-unico.ts:258`. A alteração foi de descrição/linguagem visual: `VISUAL_ONLY=true`, não executa integração ou deploy.
- **Achado de revisão P1:** [comentário no diff](https://github.com/ServerVpss/CentralDark/pull/1973#discussion_r4458129463), `CODE_DOC_NOT_UPDATED_IN_SAME_DIFF`, exigia atualização do `#OBSERVACOES#` no arquivo e deste recibo. O thread do PR anterior estava `is_resolved=false` quando verificado em 03/11/2026.
- **Menor delta corretivo:** nesta branch do [PR #1977](https://github.com/ServerVpss/CentralDark/pull/1977), o `#OBSERVACOES#` no próprio `painel-unico.ts` agora declara `@owner`, `@doc_ref`, `@last_updated`, `@implementado`, `@pendente`, `@estado` e `@next_cursor`. Este mesmo documento é atualizado no diff do PR #1977.
- **Limites de prova:** foi realizado readback do conteúdo no GitHub; a execução do validador `scripts/lupa/diagram-route-gate.mjs#validateDiffCoverage`, CI, renderização, uso pela Casa e integração funcional **não** foram executados nem declarados PASS. A atualização do documento e o merge histórico não encerram automaticamente a revisão P1 do #1973.
- **Próximo cursor:** conferir o diff completo do PR #1977, validar a regra `CODE_DOC_NOT_UPDATED_IN_SAME_DIFF` com o gate existente, registrar resultado no HUD, e continuar a reconciliação de source dos owners existentes. **VPS_REQUIRED=false · DEPLOY_REQUIRED=false · SOURCE_ONLY=true**.

<!-- /CORRECAO_P1_1973_SOURCE_ONLY_20261103 -->
