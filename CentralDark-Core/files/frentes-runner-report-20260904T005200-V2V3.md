Frentes Runner — F5 (Mapeamento V2 / V3)
Timestamp: 2026-09-04T00:52:00-03:00

Resumo executivo
- Objetivo: localizar todas as ocorrências de tokens/artefatos V2, V3 ou V2/V3 no repositório e categorizar por: documentação (política/guia), código/config, artefatos públicos (site/build), e testes.
- Escopo: busca recursiva no workspace.
- Resultado (resumo): centenas de menções (predominantemente em docs/CONSCIENCIA e relatórios). Arquivos-chave listados abaixo.

Principais categorias e exemplos
1) Documentação e governaça (histórico, política)
   - docs/CONSCIENCIA/CONSOLIDACAO-CENTRALDARK-V2.md
   - docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md
   - docs/CONSCIENCIA/REGISTRO-GUARDIAO-DECISOR-V3.md
   - docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md
   Observação: são referências normativas ou históricas; normalmente NÃO devem ser renomeadas automaticamente.

2) Artefatos públicos / websites (versões distintas em produção)
   - public/jarvis-lab-v2/index.html
   - public/jarvis-lab-v3/index.html
   - .github/workflows/caddy-telepainel-v2.yml
   Observação: ativos distintos para deploy — tratar como produtos separados.

3) Código, scripts e configurações
   - apps/modulos/hub/src/components/hermes/HermesTab.tsx
   - apps/modulos/mcp/src/config.js (usa flags/paths relativos a V2?)
   - apps/modulos/hub/supabase/migrations/* (migrations nomeadas com v2/v3 contexto)
   Observação: revisar caso a string V2/V3 seja uma flag de runtime; alterações exigem teste.

4) Tests & samples
   - scripts, testes e fixtures podem conter V2/V3 como dados históricos.

Quantidade e impacto
- Arquivos encontrados: >800 em docs, dezenas em src/ e várias entradas em public/ e workflows.
- Impacto direto: baixo (muitos arquivos são documentação histórica). Alterações automáticas têm alto risco de regressão se aplicadas sem owner.

Recomendações (próximo passo)
1) Não aplicar mudanças em massa. Primeiro consolidar política: criar um documento canônico "V2/V3 policy" apontando para owners e significado (ex.: docs/CONSCIENCIA/CONSOLIDACAO-V2V3.md).
2) Para artefatos públicos separados (jarvis-lab-v2/v3) manter ambos; documentar owner e ciclo de vida.
3) Para flags de runtime/config, invocar testes unitários e CI antes de normalizar nomes.
4) Ação mínima imediata (opcional): criar um relatório de mapeamento (este arquivo), marcar F5 in_progress e abrir uma task para cada subgrupo (docs, code, public, tests) com owners.

Evidência / arquivos-chave (não exaustivo)
- docs/CONSCIENCIA/CONSOLIDACAO-CENTRALDARK-V2.md
- docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md
- docs/CONSCIENCIA/REGISTRO-GUARDIAO-DECISOR-V3.md
- public/jarvis-lab-v2/index.html
- public/jarvis-lab-v3/index.html
- .github/workflows/caddy-telepainel-v2.yml
- apps/modulos/hub/src/components/hermes/HermesTab.tsx

Próximos passos que o frentes-runner executará se autorizado
- Gerar subtasks (docs/code/public/tests) e marcar owners sugeridos (heurística: arquivos em docs/ -> docs-owner; apps/modulos/* -> módulo owner).
- Opcional: abrir branch/commits com mudanças triviais de documentação ou criações de stub policy file.

Relatório gerado automaticamente pelo frentes-runner. Arquivo de referência: files/frentes-runner-report-20260904T005200-V2V3.md
