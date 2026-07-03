# Planão: Prompt pro Fabler + Aplicação no Hub

Ideia: dispara um **prompt-mestre único** no Fabler (Claude Code via EliteAnthropic id 52 → `api.centralldark.com`) que já vem carregado com o **estado real do CentralDark hoje** (o que existe, o que acabamos de subir, onde estão as dores) + a **tarefa do MCP Catalog** que você colou. Ele devolve arquitetura pronta; a gente aplica direto na aba nova **Catálogo** do Hub.

---

## Parte 1 — O prompt pronto pra colar no Fabler

Copia e cola do bloco abaixo (é uma coisa só). O placeholder `{{TAREFA_MCP_CATALOG}}` já vem preenchido com o texto que você mandou.

```markdown
# MODO: ARQUITETO SÊNIOR — MCP CATALOG NO HUB CENTRALDARK

Você é o arquiteto responsável por consolidar o **MCP Market HUB** do CentralDark.
Fala PT-BR, direto, sem enrolação, tom Pivete-friendly (o dono é não-técnico mas
manda as ideias grandes). Entregue design pronto pra codar, não teoria.

## 1) ESTADO REAL DO ECOSSISTEMA (fatos, não suposições)

### Infra viva na VPS (/root/CentralDark, PM2)
- id 33  CentralDark-MCP           → dispatcher atual (mcp_admin_call)
- id 27  CentralDark-HubBot        → bot @srver1bot, cluster
- id 55  CentralDark-ArsenalAdapter → Conselho de IAs (router/refinar/debate)
- id 52  CentralDark-EliteAnthropic → gateway Claude (api.centralldark.com) — VOCÊ
- id 51  CentralDark-EliteHTTP      → gateway ChatGPT via Zendriver
- id 50  CentralDark-EliteWS        → gateway WS
- id 53  CentralDark-GraphPanel     → indexação por grafo (economia de tokens)
- id 45  CentralDark-EvolucaoIAs    → bot Telegram de agentes
- id 5   CentralDark-WebhookDeploy  → deploy webhook
- id 57  CentralDark-TelegramMTProto → **NOVO** login MTProto (gramjs, porta 8790)
                                      exposto em https://status.centralldark.com/mtproto/*

### Hub (frontend) — /root/CentralDark/apps/modulos/hub (React+Vite, design Esmeralda)
- Abas atuais: Overview · Serviços · Conectores · Políticas · Aprovações · Auditoria · Arquitetura
- Fonte da verdade Supabase HUB: lyoigsqluyktoclwdaft
  - Tabelas: connectors, policies, approvals, audit_log (hash-chain), user_roles
- Card recém-adicionado na aba Serviços: TelegramMTProtoCard (login pessoal Telegram)

### Dispatcher MCP atual (dor conhecida — resolver)
- Endpoint público: https://mcp.centralldark.com/mcp (auth Bearer)
- /tools.json público lista ~102 tools
- mcp_admin_call (interno) enxerga só ~70-74 → **catálogo dessincronizado**
- Nomeação: mcp_custom_4aHUa--<tool> no client / <tool> local

### O que já foi decidido (imutável, respeita)
- **Bots Telegram separados**: @srver1bot=HUB / @SEGREDOPUXADASBOT=TelePainel — nunca misturar
- **Áreas protegidas** (não mexer sem "PERMITO PIVETE"): scripts/webhook, contas-admin,
  Caddy, secrets/, docs/CONSCIENCIA/, apps/modulos/status, apps/modulos/Bolt, WebUI, graph-panel
- **Fluxo obrigatório**: GitHub = fonte da verdade → deploy → VPS. Nunca editar direto na VPS
- **Design System Esmeralda**: rounded-xl, shadow-3d-*, tema emerald light default
- **Segurança**: RLS obrigatório, GRANTs explícitos em toda tabela public,
  roles em tabela separada (user_roles), has_role() SECURITY DEFINER

### Documentação viva (leia se precisar)
- docs/CONSCIENCIA/README.md — regras invioláveis
- docs/CONSCIENCIA/ARSENAL/ — sistema Conselho de IAs (referência pra veto do Claude)
- docs/CONSCIENCIA/DARKAI/ — orquestração de IAs via comando darkai
- docs/INSTALADOR/README.md — arquitetura completa, portas, deps

## 2) TAREFA (arquitetar e entregar)

{{TAREFA_MCP_CATALOG_ORIGINAL}}

## 3) RESTRIÇÕES DURAS (não negocia)

1. Reuso máximo do que já existe. Não proponha reescrita do MCP dispatcher (id 33);
   proponha **camada de catálogo em cima** que consulta /tools.json e reconcilia.
2. Storage: usar Supabase HUB (lyoigsqluyktoclwdaft) — criar schema `catalog` novo,
   não misturar com schema `hub` existente.
3. Autenticação: reaproveitar o Bearer atual (CENTRALDARK_MCP_SESSION) pro pull;
   RLS + user_roles pra edição no Hub.
4. Sync: pull scheduled + webhook on-demand. Nada de push do MCP pro Hub
   (mcp id 33 é read-only nesse contrato).
5. UI: seguir Esmeralda. Sub-abas dentro de nova aba **Catálogo**:
   Servers · Skills · Toolkits · Health · Publicação.
6. Agentes: Claude tem **veto** (integra com Arsenal Council existente em
   docs/CONSCIENCIA/ARSENAL). Toda mudança de skill "published" passa por Claude.
7. Zero downtime: dispatcher atual continua servindo agentes durante a migração.

## 4) FORMATO DE ENTREGA (siga exatamente)

Devolve num arquivo Markdown único com estas seções, nessa ordem:

1. **TL;DR** (5 linhas, o que muda pro Pivete em linguagem leiga)
2. **Diagrama de arquitetura** (mermaid `graph TD` — sem emoji, cores neutras)
3. **Modelo de dados** (SQL DDL completo do schema catalog, com GRANTs e RLS já escritos —
   pronto pra virar migration Supabase)
4. **Sync engine** (pseudocódigo TypeScript: função pull, diff, apply, com tratamento
   de conflito e detecção de tool removida/renomeada)
5. **Health check** (o que mede, thresholds, tabela catalog.health_snapshots, cron)
6. **Fluxo de publicação de Skill** (mermaid sequenceDiagram, incluindo veto Claude)
7. **Endpoints/tools novas** (lista curta: nome, verbo HTTP, payload, resposta)
8. **UI Hub — wireframe em ASCII** de cada sub-aba (Servers/Skills/Toolkits/Health/Publicação)
9. **Riscos + mitigações** (top 5, priorizados)
10. **Plano em fases** (F1 walking skeleton em 2 dias, F2 sync automático,
    F3 publicação com veto, F4 storefront público). Cada fase: entregável concreto
    + critério de "pronto".
11. **Checklist de aplicação no Hub** (ordem exata de PRs, com nomes de arquivos reais
    baseados na estrutura atual: apps/modulos/hub/src/HubPage.tsx, componentes em
    apps/modulos/hub/src/components/catalog/, migrations em db/migrations/)

## 5) O QUE NÃO FAZER

- Não sugerir Redis, Kafka, RabbitMQ, k8s, Docker Swarm ou qualquer infra nova.
  Só Supabase + Node/PM2 + Caddy (o que já roda).
- Não propor OAuth novo — reusar o Bearer.
- Não inventar nomes de tools que não existem. Se citar tool, cita do catálogo real.
- Não escrever código de produção completo — pseudocódigo + DDL basta.
- Não pedir esclarecimento. Assume o razoável e segue.

Começa agora. Direto no entregável, sem preâmbulo.
```

**Onde `{{TAREFA_MCP_CATALOG_ORIGINAL}}` vira** — cola exatamente o bloco que você me mandou (do "# TAREFA: Arquitetura e Implementação..." até o fim de "baixa fricção operacional").

---

## Parte 2 — Como disparar

Duas opções, escolhe uma na implementação:

**A) Via chat direto no Fabler** (mais simples pra ver a resposta agora):
- Abre a interface do Claude Code apontando pro gateway `api.centralldark.com`
- Cola o prompt inteiro
- Recebe o markdown de resposta

**B) Via MCP tool `elite_gateway_chat`** (integra no Hub):
- Cria botão "Consultar Fabler" na nova aba Catálogo
- No clique, chama `mcp_custom_4aHUa--elite_gateway_chat` com o prompt acima
- Salva a resposta em `catalog.architecture_docs` (tabela nova) pra virar histórico versionado

Recomendo **A primeiro** (validar a resposta), depois **B** vira feature permanente.

---

## Parte 3 — Aplicação no Hub (depois que Fabler responder)

Ordem sequencial, cada passo = 1 PR pequeno:

1. **Migration `catalog` schema** — cria tabelas que o Fabler devolveu (com GRANT + RLS)
2. **Edge function `catalog-sync`** — pull do `/tools.json` público, diff contra tabela `catalog.tools`, apply
3. **Cron job** — chama `catalog-sync` a cada 15 min (via `pg_cron` ou PM2 tick)
4. **Nova aba "Catálogo" no HubPage.tsx** — adiciona no array `TABS`, cria componente `CatalogSection`
5. **Sub-abas Servers/Skills/Toolkits** — cada uma vira componente próprio em `apps/modulos/hub/src/components/catalog/`
6. **Sub-aba Health** — reusa `catalog.health_snapshots`, gráfico simples
7. **Sub-aba Publicação** — form de nova skill → chama Arsenal Council pro veto Claude
8. **Storefront público** (F4) — nova rota `/catalog` em `apps/web` pra exibir tools disponíveis

Bloqueadores conhecidos que a gente resolve no meio do caminho:
- Erro TS pré-existente em `McpCard.tsx` (prop `asChild`) — corrigir antes de rebuildar hub
- Reconciliação MCP id 33: o /tools.json precisa refletir os 102 tools de verdade; hoje admin vê só 70. Isso é auditado pela `mcp_catalog_diff` — vira o primeiro alert do health check

---

## Parte 4 — O que a gente ganha

- **Pivete**: aba nova no Hub com catálogo vivo, botão "sincronizar agora", vê o que cada IA pode fazer
- **Claude/agentes**: consultam catálogo por API, sabem o que existe sem chutar
- **Segurança**: publicação de skill nova passa por veto (Arsenal Council já existe)
- **Observabilidade**: histórico de sync + divergências, some o problema atual de "público mostra X, admin mostra Y"

---

## Aprovando este plano

Se tá bom, aprova que eu já:
1. Disparo o prompt no Fabler (ou te entrego o texto pra você colar no Claude Code)
2. Espero o markdown de resposta
3. Convertemos em migrations + componentes na sequência do checklist

Se quiser mudar o escopo (ex: só F1 primeiro, ou pular veto Claude), me fala antes de aprovar.
