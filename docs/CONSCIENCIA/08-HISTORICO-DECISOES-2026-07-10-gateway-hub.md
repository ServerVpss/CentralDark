---
title: "08 HISTORICO DECISOES 2026 07 10 Gateway Hub"
date: 2026-08-27
tags: ["consciencia"]
updated: 2026-08-27
---

# Relatório 10/07/2026 — Gateway (138 modelos) + Destravar HUB

```
╔═══════════════════════════════════════════════════════════╗
║  📋 RESUMO DO DIA — CentralDark                              ║
╠═══════════════════════════════════════════════════════════╣
║  ✅ Gateway agora expõe 146 modelos (era 9)                  ║
║  ✅ 7 arquivos com conflito de merge corrigidos               ║
║  ✅ Bug do login (todo mundo virava "visitante") corrigido    ║
║  🟡 2 correções prontas mas PRECISAM de 1 comando seu         ║
║  🟢 Nada que já funcionava foi quebrado                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 1. Pra você, direto (sem termo técnico)

### O que já está funcionando AGORA, sem você fazer nada

**Seu gateway (`api.centralldark.com`) agora mostra 146 modelos de IA, não mais 9.**
Antes, se você abrisse o Cursor ou o Claude Desktop apontando pro seu gateway, só via 9 opções (a maioria eram "apelidos" repetidos do mesmo modelo). Agora ele mostra os 146 modelos de verdade que você tem contratado no Abacus (Claude, GPT-5, Gemini, Grok, etc — tudo). Testei ao vivo, funcionando: você pode pedir qualquer um deles pelo nome (ex: `claude-sonnet-5`, `gpt-5.5`, `grok-4.5`) que ele responde de verdade.

O que já funcionava antes (os 4 modos "Arsenal": router, parallel, debate, hermes) **continua funcionando exatamente igual** — não toquei em nada que já rodava.

**Consertei 7 arquivos do HUB que estavam com "remendo de costura mal feita".**
Alguém (provavelmente uma sincronização do Lovable) deixou pedaços de código colados de duas versões diferentes, tipo um Frankenstein — isso já tinha derrubado seu gateway uma vez hoje de manhã (crashou e voltou sozinho). Consertei os 7, testei cada um, nenhum quebrou.

**Achei por que o HUB "trava" gente como visitante — inclusive você.**
O código de login tentava checar se você é admin numa tabela que não existe nesse projeto (existe só no projeto do TelePainel, que é outro banco separado). Resultado: todo mundo, até você, era tratado como visitante comum e ficava travado em telas que deveriam estar liberadas (tipo Políticas). **Já corrigi o código** — mas falta uma peça.

### O que falta — e por que só você pode destravar essa parte

Pra essas 2 correções valerem de verdade, alguém precisa **rodar um comando de banco de dados** usando uma senha (chamada `HUB_SUPABASE_PAT`) que **eu não tenho acesso aqui na VPS** — e é assim mesmo que tem que ser, é uma chave sensível. Não inventei nem chutei nada no lugar dela.

**O que fazer (rápido, 2 comandos):**
1. Pegar essa chave `HUB_SUPABASE_PAT` (deve estar guardada num cofre/secrets que você usa pra essas credenciais)
2. Rodar, na pasta `apps/modulos/hub/`:
   ```
   export SUPABASE_ACCESS_TOKEN=<a chave aqui>
   supabase db push --project-ref lyoigsqluyktoclwdaft
   ```
Isso vai criar as tabelas que faltam e destravar: seu login como admin de verdade, e as abas Políticas/Auditoria/Catálogo/Conectores do HUB (hoje elas não travam a tela, só não mostram dado real).

Depois disso, também falta **1 linha manual** pra te tornar admin de fato (o comando exato já está escrito dentro do arquivo da correção, só falta seu ID de usuário que só aparece no painel do Supabase, aba Authentication).

---

## 2. Detalhe técnico (pra quem for auditar depois)

### 2.1 — Gateway: passthrough dos 138/146 modelos

**Arquivo alterado:** `apps/modulos/arsenal-openai-adapter/server.mjs`

- Nova função `fetchAbacusCatalog()` — busca a lista de modelos direto de `${PROVIDER_BASE}/models` (Abacus RouteLLM), cache de 5 min.
- Rota `GET /v1/models`: agora concatena os 9 modelos curados (4 modos Arsenal + 5 aliases, como já era) com todos os IDs do catálogo Abacus que não colidem com os curados. Total hoje: **146** (9 + 137, o Abacus reportou 137 novos na hora do teste; a contagem "crua" pode oscilar, é normal — já era assim antes, documentado no dossiê de hoje mais cedo).
- Rota `POST /v1/chat/completions`: se o `model` pedido não bater com nenhum dos 4 modos Arsenal, verifica se existe no catálogo Abacus — se existir, faz **passthrough direto** via `callProvider()` (mesma função que já existia, reaproveitada). Se não existir em nenhum dos dois, mantém o erro 400 de sempre.
- **Nada do fluxo antigo foi alterado** — só adicionei um caminho novo (`if (!rodar) { ... }`) antes do erro 400 que já existia.

**Testado e confirmado (agente dedicado, isolado antes de ir pra produção):**
- Local (porta de teste 8095): `/health` 200, `/v1/models` = 146 itens, modo antigo (`arsenal-router`) OK, alias antigo (`gpt-4o`) OK, passthrough novo (`claude-sonnet-5`) OK.
- Produção (`api.centralldark.com`, depois do `pm2 restart CentralDark-ArsenalAdapter`): mesmos 5 testes, todos verdes. `pm2 jlist` confirmado sem crash loop (`unstable_restarts: 0`).

**Chave/segredo usado:** a chave de produção do adapter (`ARSENAL_ADAPTER_KEY` / `cdk_live_...`) já estava configurada no `ecosystem.config.cjs` do próprio módulo — não precisei adicionar nada novo. **Aviso de segurança à parte (não resolvido, fora do escopo desta rodada):** essa chave está hardcoded em texto puro em pelo menos 3 lugares (`ecosystem.config.cjs`, `AbacusApiCard.tsx`, `GatewayTab.tsx`) — vale rotacionar quando tiver tempo, mas não mexi porque você pediu foco em "funcionar", não em segurança agora.

### 2.2 — Conflitos de merge resolvidos (7 arquivos)

Todos em `apps/modulos/hub/src/`:
- `HubPage.tsx`, `pages/LoginPage.tsx`, `integrations/supabase/hub-client.ts`, `components/ButtonLogDrawer.tsx`, `lib/buttonLog.ts`, `components/dashboard/AbacusApiCard.tsx`, e mais 6 arquivos abacus/* que tinham só modificação simples sem conflito real.

Padrão em 100% dos casos: o lado `origin/main` sempre adicionava uma funcionalidade nova (instrumentação `logButton(...)`, hook `useHubAutoRefresh`) que o lado `HEAD` simplesmente ainda não tinha — não havia lógica conflitante de verdade, então mantive sempre o lado `origin/main` (mais completo). Validado com `esbuild`/`tsc` em cada arquivo, sintaxe 100% ok, zero marcador de conflito restante em todo o repo (`grep` confirmado).

Também corrigido: `apps/modulos/status/painel-data.json` (arquivo de estado vivo, tinha conflito só em 2 campos de timestamp — mantido o mais recente).

**Nenhum desses 7+1 foi commitado ainda** — ficaram no working tree local, prontos pra você revisar e decidir quando commitar.

### 2.3 — Bug do login/roles (useAuth.ts)

**Arquivo alterado:** `apps/modulos/hub/src/hooks/useAuth.ts`
**Arquivo novo (migration, ainda NÃO aplicada no banco):** `apps/modulos/hub/supabase/migrations/20260710120000_user_roles.sql`

Causa raiz: o código consultava `hubClient.from('user_profiles')...single()` — essa tabela existe só no projeto Supabase do TelePainel (`kagejpghnwdfymddwxuf`), **não** no projeto do HUB (`lyoigsqluyktoclwdaft`). A consulta sempre falhava, o erro era ignorado (`.single()` sem checar `error`), e o código caía no fallback `role: 'viewer'` — pra QUALQUER usuário, inclusive admin real. Pior: o listener de mudança de sessão (`onAuthStateChange`) nem tentava buscar o cargo — já vinha hardcoded como `'viewer'`.

Correção: criei função `fetchRole()` que consulta uma tabela nova `api.user_roles` (ainda não existe no banco — está na migration), usada tanto no carregamento inicial quanto na mudança de sessão. Erros reais (tabela ausente, RLS bloqueando etc) agora vão pro console em vez de serem engolidos silenciosamente.

**Pendência:** migration não aplicada (falta `HUB_SUPABASE_PAT`, ver seção 1). Depois de aplicada, inserir manualmente 1 linha te promovendo a admin — o comando SQL exato já está comentado no fim do arquivo da migration, só falta seu UUID de usuário (pegar em Supabase → Authentication → Users, projeto `lyoigsqluyktoclwdaft`).

### 2.4 — Tabelas fantasma (Políticas, Auditoria, Catálogo, Conectores)

**Arquivo novo (migration, ainda NÃO aplicada no banco):** `apps/modulos/hub/supabase/migrations/20260710130000_criar_tabelas_hub_faltantes.sql`

O frontend do HUB já tinha código pronto (`usePolicies.ts`, `useAudit.ts`, `CatalogTab.tsx`, `OAuthConnectors.tsx`) esperando 6 tabelas que nunca foram criadas nesse projeto: `policies`, `audit_logs`, `catalog_tools`, `catalog_sync_runs`, `oauth_providers`, `oauth_connections`. Sem elas, essas 4 abas do HUB não travam a tela (o código já tem fallback gracioso), mas mostram dado vazio ou estático em vez de dado real.

A migration nova cria as 6, com as colunas exatas que cada componente já espera (conferido lendo o código, não inventado), RLS habilitado seguindo o mesmo padrão das migrations existentes, e um "seed" inicial de 38 provedores OAuth conhecidos (openai, claude, gemini, github, notion etc) pra aba Conectores já nascer populada.

**Pendência:** mesma credencial `HUB_SUPABASE_PAT` necessária pra aplicar (seção 1).

### 2.5 — Mapa completo de botões do HUB (achados de qualidade, não bloqueantes)

Investigação cobriu todas as abas (Dashboard, Abacus, Auditoria, Catálogo, Conectores, Gateway, Hermes, Políticas, Login). Achados que valem correção futura, nenhum é bloqueante hoje:

- **Toast falso em 4 telas** (`McpCard.tsx`, `TelegramMTProtoCard.tsx` — as 2 cópias, `catalog/SyncButton.tsx`, `audit/AuditExport.tsx`): usam um hook de notificação (`@/shared/hooks/use-toast`) que só escreve no console do navegador, não mostra nada na tela. Usuário acha que nada aconteceu quando na verdade a ação rodou.
- **Pior caso: `PolicyEditor.tsx`** — se salvar uma política falhar, o erro vai só pro console, zero aviso na tela.
- **Botão morto:** "Testar Latência" em `GatewayCard.tsx` não tem nenhuma ação ligada (decorativo).
- **2 links mortos** na tela de login: "esqueci [senha]" e "Fale com o admin" (`href="#"` sem função).
- **2 arquivos duplicados órfãos:** `TelegramMTProtoCard.tsx` existe em 2 lugares diferentes, nenhum dos dois é usado por ninguém hoje.
- **3 arquivos de backup soltos** dentro de `src/` (`.bkp-*`) — código morto, seguro de remover quando quiser.

Relatório completo com arquivo+linha de cada botão está registrado nesta sessão (posso extrair pra um arquivo separado se quiser consultar depois).

---

## 3. Onde ficaram as chaves/credenciais mencionadas

- `ARSENAL_ADAPTER_KEY` (a chave `cdk_live_...` do gateway): já vivia em `apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs` — não criei, não movi, só usei a que já existia pra testar.
- `HUB_SUPABASE_PAT` (necessária pra aplicar as 2 migrations pendentes): **não está em nenhum `.env` da VPS nem nos secrets locais** — confirmei em `/root/CentralDark/.env`, `/root/CentralDark/secrets/.env` e na sessão do shell. Só existe menção ao *nome* da variável em `docs/CONSCIENCIA/PIVETE-IA/PIVETE-16-SECRETS-CONNECTORS.md`, sem o valor. Precisa vir de onde você guarda essas credenciais sensíveis (cofre/gerenciador de secrets).

## 4. O que NÃO foi tocado

- Nenhum commit foi feito — tudo está no working tree, esperando sua revisão.
- Nenhuma migration foi aplicada no banco real (faltou credencial, documentado acima).
- Nada de segurança/rotação de chave foi feito (você pediu pra deixar com os auditores por agora).
- Nenhum processo PM2 além do `CentralDark-ArsenalAdapter` foi reiniciado.
