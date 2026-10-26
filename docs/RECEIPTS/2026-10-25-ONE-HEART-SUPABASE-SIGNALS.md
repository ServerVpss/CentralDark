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

## CONTRAPROVA AO VIVO — 2026-10-26 08:52 UTC

Leitura read-only pelo conector Supabase direto; projeto `CentralDark` (`lyoigsqluyktoclwdaft`), região `sa-east-1`, estado da plataforma `ACTIVE_HEALTHY`. Não houve escrita no banco.

| Fonte existente | Linhas | Último sinal | Sinais nos últimos 5 min | Leitura conservadora |
|---|---:|---|---:|---|
| `public.edge_function_health` | 79 | 2026-07-02 18:30:11 UTC | 0 | STALE |
| `public.module_health_status` | 95 | 2026-10-26 08:37:39 UTC | 0 | STALE para a janela de 5 min |
| `public.radar_pulses` | 0 | nenhum | 0 | MISSING |

**Veredito para o cartão One Heart:** `UNKNOWN`, nunca verde. O requisito descrito acima — Edge Functions frescas, módulos frescos e os 12 pulsos de Radar frescos/PASS — não está satisfeito no readback atual. A ausência de pulsos e a idade de `edge_function_health` impedem declarar integração operacional, mesmo com o projeto Supabase saudável.

**Limite de sincronização:** a chamada do atualizador CentralDark pelo MCP não pôde ser usada nesta sessão porque o endpoint SSE configurado respondeu 404; por isso, este recibo foi anexado ao owner desta PR via GitHub. Não foi feito deploy, alteração de tabela, Edge Function ou promoção de estado no Cockpit.
