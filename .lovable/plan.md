## Fase Gemini — analisa TUDO antes de tocar em qualquer coisa

Zero mudança em produção. Coleto tudo que a gente já mapeou, mando pro **Gemini 2.5 Pro via `ai-proxy` do darkai** (que já tá funcional na VPS), e ele devolve um parecer técnico completo. Só depois disso a gente decide o que fazer.

## O que vai pro Gemini analisar

**Bloco 1 — Duplicação Thinker (Docker vs PM2)**
- `Dockerfile` + `docker-compose.yml` (que a IA criou e não commitou)
- `src/index.mjs` do Thinker (o que roda no PM2)
- Log dos 58 crashes do PM2 (motivo do `EADDRINUSE`)
- Saída do container Docker funcionando OK
- **Pergunta pro Gemini:** "Qual das duas versões manter? Docker isolado ou PM2 nativo? Trade-offs de segurança, memória, monitoramento e alinhamento com o padrão CentralDark."

**Bloco 2 — PiveteSync quebrado**
- Código completo de `pivete-sync.mjs`
- Schema que ele espera (`hub.pivete_consciencia` + `hub.pivete_sync_log`)
- Erro atual: `Could not find table 'api.pivete_consciencia' in schema cache`
- **Pergunta pro Gemini:** "Este schema tá correto? RLS e GRANT tão cobrindo o service_role? Falta algo? Vai colidir com tabela existente no HUB?"

**Bloco 3 — notify.mjs (Card Hermes v1.3) quebrado**
- Código de `notify.mjs`
- Padrão oficial `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`
- Log do erro atual ("Command failed")
- **Pergunta pro Gemini:** "Por que quebrou? É path, env, ou lógica? Como consertar seguindo o padrão travado (connector Telegram `sendMessage`, connection `std_01kvw4jkcbekyr1t33vs4p5e9w`, admin `1901426549`)?"

**Bloco 4 — Mapa geral dos 22 serviços**
- Lista completa: 14 PM2 + 8 Docker + 1 systemd
- Portas em uso e donos
- Auditoria MCP dos últimos 3 dias
- **Pergunta pro Gemini:** "Tem algum serviço redundante? Órfão? Faltando algo crítico? Recomendações de consolidação sem quebrar nada?"

## Como vou rodar

Via SSH na VPS, chamando o `ai-proxy` do darkai (que já tá vivo — PM2 `CentralDark-ArsenalProxy` + `CentralDark-ArsenalAdapter` conectados no Lovable AI Gateway):

```text
1) Colho todos os arquivos + logs em /tmp/analise-gemini/
2) Monto 4 prompts (um por bloco), cada um com contexto completo
3) Disparo em paralelo pro Gemini 2.5 Pro via darkai
4) Salvo cada parecer em /tmp/analise-gemini/parecer-{N}.md
5) Te apresento resumo em PT-BR + recomendação de ação por bloco
```

## Tempo estimado
- Coleta de arquivos: ~30s
- 4 análises Gemini em paralelo: ~90s
- Consolidação do parecer: instantâneo
- **Total: ~2 minutos**

## O que NÃO acontece nesta fase
- ❌ Nenhum `pm2 delete`
- ❌ Nenhum `docker compose down`
- ❌ Nenhuma tabela criada no HUB
- ❌ Nenhum commit no git
- ❌ Nenhum arquivo alterado

Só leitura + análise. Depois que tu ler os pareceres do Gemini, tu decide o que aprovar.

## Próxima fase (só depois do teu OK)
Baseado nos pareceres:
1. Decisão Thinker (mata PM2 ou mata Docker)
2. Criação das tabelas HUB (se Gemini aprovar schema)
3. Fix do notify.mjs
4. Commit do Dockerfile + inventário oficial dos 22 serviços

Aprova essa fase de análise pura?