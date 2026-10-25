# One Heart — Supabase Health Signals (25/10/2026)

## INTENCAO E OWNERS
CHEFE quer um fio unico da API /heartbeat agregando estados existentes do Supabase, sem multiplicar Edge Functions e em paralelo, mas sem misturar o trabalho de pareamento PR #1957.
OWNER API: apps/modulos/mcp/src/index.js e dist/index.js, GET /heartbeat.
OWNER dados: public.edge_function_health, public.module_health_status, public.radar_pulses.
OWNER interface: apps/instinto-superior/src/lib/cockpit.functions.ts e components/central/StatusPanel.tsx.

## DELTA
- Reusa URL e chave privadas do Hub/Supabase apenas no runtime MCP; nao publica chave ou linhas detalhadas.
- Novo adapter one-heart-supabase.js em src/dist agrega resumos via REST existente com timeout 1500ms e cache local de 30s.
- Nao cria Edge Functions, cron, banco, tabelas, endpoints nem duplicata de /heartbeat.
- GET /heartbeat preserva todos os campos antigos e adiciona supabase com estado independente.
- Estado FAIL quando ha funcao/missao de radar com falha ou modulo degraded/failing; UNKNOWN quando parcial, ausente, obsoleto ou configuracao incompleta.
- PASS agregado exige Edge Functions frescas e saudaveis, modulos frescos e em estado conhecido, os 12 probes do RadarPanel frescos e PASS.
- Cockpit reaproveita consulta ao proprio /heartbeat, recebe campos de resumo e mostra cartao Supabase One Heart no StatusPanel existente.
- Nao expor estado verde por HTTP 200, sem dados, ou amostras parciais.
- A consulta externa usa allowlist host HTTPS supabase.co, sem exibir detalhes ou chave privada.

## PROVA
- node --check JS src/dist: PASS.
- TypeScript TSX parse via esbuild (cockpit.functions.ts e StatusPanel.tsx): PASS.
- node --test tests/one-heart-supabase.test.mjs: 9/9 PASS. Exercita configuracao ausente, resumo completo, amostra parcial, stale, erro, falha, chave nao exposta, contrato unico e UI.
- git diff --check: PASS.
- Suíte operacional-telemetry.test.mjs: 7/8. Mesma falha regex em teste de recibo reproduzida sem o delta no checkout separado de pareamento. NAO imputar esta falha ao One Heart.

## ESTADO / NEXT_CURSOR
Prova local de fonte e interface apenas. COMMIT != CI != MERGED != DEPLOYED. Validar gates e readback da API em producao no mesmo SHA. Em Supabase, verificar frescor de edge_function_health/module_health_status e emissao dos 12 radar_pulses; ate haver sinais reais o cartao e UNKNOWN. Pareamento continua na PR #1957 isoladamente.
