<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Changelog Técnico

*(Registro sistemático de tudo o que foi alterado nas sprints de desenvolvimento).*

... (previous entries) ...

---

## 2026-05-29: Integração Real Front ↔ Back ↔ VPS

### Resumo Leigo:
O sistema deixou de ser um protótipo visual. Agora, ao criar uma conta, os dados são salvos no banco de dados.

### Explicação Técnica:
- AuthContext Real com `supabase.auth`
- Service Layer: `src/services/*`
- QR Code Bridge via `proxy.multizap.dev`
- Real-time Postgres no Chat

### Risco: Médio
### Próximo Passo: Webhook VPS.

## 2026-05-29: VPS Autoconnect + Wabot Bridge

- Cofre seguro `/root/Multizap/secrets/wabot.env` (chmod 600)
- Script `ia-autoconnect.sh`
- wabot-bridge estabilizado na porta 9010
- Recargas/whatsapp-server não tocado

## 2026-05-30: Webhook CloneDeck-GitHub-Webhook (porta 9003)

- Listener Node.js com HMAC SHA-256 obrigatório
- Secret em `.env` (chmod 600), não no código
- Pull script com `flock` + `git status --porcelain`
- URL: `https://hook.multizap.dev/webhook`

## 2026-05-30: Documentação de Conexão Automática

- `conexao-ia/START_HERE.md`, `AUTO_CONNECT.md`, `CHECKLIST.md`

## 2026-05-30: GitHub Actions Supabase Migrations

- Workflow `supabase-migrations.yml`
- Tabela `_schema_migrations` (filename, checksum, applied_at)
- `ON_ERROR_STOP=1`, psql via `SUPABASE_DATABASE_URL` secret

## 2026-05-30: Fix Signup Trigger

- Unificou `handle_new_user` + `handle_new_user_workspace`
- `SECURITY DEFINER` + `SET search_path = public, extensions`
- `gen_random_uuid()` em vez de `gen_random_bytes()`

## 2026-05-30: Fix RLS workspace_members

- Policy circular resolvia → retornava vazio
- Fix: `user_id = auth.uid()` direto + `user_is_member_of()`
- GRANT authenticated em workspace_members e workspaces

## 2026-05-30: Schema alignment (messages + system_logs)

- `messages.instance_id` DROP NOT NULL
- `system_logs` + 5 colunas (user_id, entity_type, entity_id, details, ip_address)

## 2026-05-30: Chat Redesign WhatsApp Web

- Componentes extraídos: ChatSidebar, ChatWindow, ContactInfoPanel
- Dark theme autêntico, bubbles com tails, status icons
- Auto-resize input, Enter/Shift+Enter, attachment menu
- Supabase real-time preservado

## 2026-05-30: Portal de Módulos + Plans + Segurança

### Resumo Leigo:
Criado um portal pós-login que mostra os módulos liberados pelo plano do cliente. O token de segurança que estava exposto no código foi removido.

### Explicação Técnica:
- **SEGURANÇA:** Removido `VPS_TOKEN` hardcoded do `instanceService.ts`
- Gateway agora autenticado via JWT Supabase (session token)
- Tabelas: `modules` (2), `plans` (4), `plan_modules` (6), `subscriptions` (1)
- `ModulePortal.tsx`: cards dos módulos com estado locked/unlocked
- `subscriptionService.ts`: busca plano/módulos via Supabase
- Login redireciona para `/portal`
- RLS em todas as tabelas novas
- Seed com dados reais (bot, crm, free→enterprise)

### Arquivos criados:
- `supabase/migrations/20260530060000_modules_and_plans.sql`
- `src/pages/ModulePortal.tsx`
- `src/services/subscriptionService.ts`

### Arquivos alterados:
- `src/services/instanceService.ts` (token removido)
- `src/App.tsx` (rota /portal)
- `src/pages/Login.tsx` (redirect /portal)
- STATE.md, AGENTS.md, docs/*, conexao-ia/*

### Risco: Baixo (tabelas novas, segurança melhorada)

## $(date +%Y-%m-%d): Implantação do Padrão de Segurança (Security-First)
- **Criação do Diretório de Segurança:** Estabelecida a pasta oficial `security/` como o centro das diretrizes e decisões de proteção do projeto.
- **Documentação de Segurança:** Criados manuais essenciais (`README.md`, `SECURITY_CHECKLIST.md`, `REALTIME_SECURITY.md`, `WEBHOOK_SECURITY.md`, `SUPABASE_SECURITY.md`), definindo regras rígidas contra exposição de tokens e manipulação descuidada da base de dados e do WuzAPI.
- **START_HERE.md Atualizado:** Adicionada diretiva obrigatória para consultar a política de segurança antes de iniciar qualquer desenvolvimento.
- **Relatório Diagnóstico 021:** Processado relatório prévio de segurança detalhando vetores de dados sensíveis entre Gateway, WuzAPI e Supabase Realtime, validando chaves `anon` no front-end e `service_role` exclusivamente no back-end.

## $(date +%Y-%m-%d): Ajuste de Diretriz Security-First (Foco em Entrega)
- **Atualização de Processo:** Adoção de pragmatismo. Código novo nasce 100% seguro (Security-by-Design), porém débitos técnicos antigos são transformados em **Backlog** para não travar entregas fundamentais.
- **Prioridades Oficiais Definidas:** 1) Finalizar Chat Realtime. 2) Finalizar Notificações.
- **Criação do Backlog de Segurança:** Criado o `security/SECURITY_BACKLOG.md` dividindo riscos em `Crítico`, `Alto`, `Médio` e `Baixo`. Riscos Críticos (vazamento de tokens, webhooks abertos, RLS falho) forçam pausa imediata e correção. Riscos Menores são enfileirados para pós-produção das prioridades 1 e 2.

## $(date +%Y-%m-%d): Hotfix do Webhook de Autodeploy VPS
- **Diagnóstico do Risco:** O arquivo de sincronização Github-VPS (`clone-deck-gh-pull-with-deploy.sh`) possuía uma trava que rejeitava atualizações se a branch local estivesse minimamente suja (`[BLOQUEADO] Alteracoes tracked`), e caso passasse, forçava uma aniquilação usando `git reset --hard "origin/main"`, o que apagaria arquivos de infra configurados pelo usuário na VPS.
- **Correção Implementada:** O script foi reescrito sem hard resets. Caso detecte mudanças locais (*DIRTY Tree*), ele injeta `git stash`, executa `git pull --rebase` do *remote* e devolve as mudanças silenciosamente com `git stash pop`. Se estiver limpo, segue o `fast-forward` (`--ff-only`) tradicional. O Webhook passa a sincronizar perfeitamente garantindo o *Zero-Downtime* exigido pelo Post Deploy.

## $(date +%Y-%m-%d): Correção Definitiva do Sincronizador VPS
- **Diagnóstico do Risco:** O arquivo `/usr/local/bin/clone-deck-gh-pull` da VPS não estava sendo atualizado pelo `post-deploy.sh` porque a trava anterior (`! grep -q "post-deploy"`) impedia a sobrescrita caso o arquivo já contivesse a palavra "post-deploy". Isso fez com que o webhook antigo (que bloqueava *dirty trees*) continuasse vivo na máquina, barrando novos commits de entrarem no working tree.
- **Correção Implementada:** O `post-deploy.sh` foi atualizado para fazer uma checagem rigorosa de checksum (byte a byte via `cmp -s`). Se a versão do GitHub for diferente da versão instalada na VPS, ele substitui e aplica `chmod +x` automaticamente.

## $(date +%Y-%m-%d): Hotfix React Hook Rule Violation
- **Diagnóstico:** O componente `Chats.tsx` disparou o *React Minified Error #321*. A engine identificou a quebra da regra áurea do React: Hooks customizados (como nosso `useRealtimeMessages`) não podem ser invocados de forma condicionada ou por debaixo de funções de ciclo de vida (`useEffect`). O script da etapa anterior injetou erroneamente a chamada em contexto inferior.
- **Correção Implementada:** O bloco do `useRealtimeMessages` foi transposto fisicamente para o escopo Top-Level (raiz) da declaração de `Chats()`. A assinatura de WebSocket agora obedece o ciclo de renderização síncrona do componente. Build do VITE aprovado. Tela acessível.

## $(date +%Y-%m-%d): Hotfix Gateway WuzAPI Payload Parser
- **Diagnóstico:** O webhook `POST /webhooks/wuzapi` não estava recebendo os dados corretamente. Evidências do Caddy/PM2 mostravam requests com `Content-Type: application/x-www-form-urlencoded` da biblioteca `go-resty` (WuzAPI), mas o Gateway Express só estava configurado para parsear `application/json`.
- **Correção Implementada:** 
  1. Injetado `app.use(express.urlencoded({ extended: true, limit: '15mb' }))` no `app.js`.
  2. Atualizada a rota `webhooks.routes.js` para iterar de forma resiliente os *rawBody* através de campos mistos (`jsonData` embutido como string JSON ou payload encodado direto).
  3. Desativado o vazamento explícito do body (Message body) e tokens expostos em tela. Loggers sanitizados salvam agora apenas metadados (*keys*, *content-type*, mask de ID). O serviço `webhookService` não trava o salvamento local do Supabase se falhar ao fazer proxy externo (Atendimento URL).

## $(date +%Y-%m-%d): Sync Master Gateway <> WuzAPI (Contatos e Avatares)
- **Adequação ao Spec Oficial:** O `wuzapiClient.js` foi reescrito para respeitar as assinaturas oficiais do Go/Whatsmeow. Substituído o fetch de contatos para `GET /user/contacts` e criado módulo opcional de Avatar (`POST /user/avatar`). A função de disparo de mensagens agora envelopa o JSON strict-case para `Phone`, `Body` e `Id`.
- **Parsing e Upsert Seguro:** O `supabaseService` agora lê objetos complexos convertendo a extração pela Key primária (`jid`). A hierarquia visual de nomes imposta segue: FullName > BusinessName > PushName > FirstName > Telefone. Protegido por filtro anti-sobrescrita (`name_locked`).
- **Migração Declarativa (SQL):** Gerado `_add_contact_wuzapi_fields.sql` no diretório de Migrations do Supabase, contendo sintaxe `ADD COLUMN IF NOT EXISTS` para injetar os 10 novos campos necessários da base de contatos nativos.
- **Roteador Interno:** Gateway agora enxerga a porta `/messages/send-text` com payload bridge de conexão ativa.

## $(date +%Y-%m-%d): Adoção do Mapeamento Seguro Orientado por Evidências
- **Mudança de Paradigma do Agente:** O protocolo de trabalho de IA foi atualizado do padrão anterior para o modelo rigoroso de *Systematic Debugging with Layman Mapping, Technical Proof, and Safe Operation*.
- O artefato `security/NEXT_SESSION_PROMPT.md` foi gerado. Ele contém a diretiva raiz formatada para enquadrar futuras sessões do Arena ou de IAs externas na mesma governança estrita ("Mostre o comando, log, teste e arquivo real. Sem narrativas infundadas").
- Impostos os bloqueios arquiteturais finais: proibição de comandos nucleares (`pm2 restart all`, `run-once cru`, resets remotos), adoção de dashboards visuais de progresso e uso da "Linguagem Dupla" técnica/leiga por default.

## $(date +%Y-%m-%d): Adoção do Novo Banco Próprio e Segregação de Entidades (Self-Identity)
- **Desassociação do Banco Lovable:** Encerrada tentativa de persistência na nuvem terceirizada. As rotinas preparam o ecossistema para focar no cluster Postgres privado da aplicação principal.
- **Isolamento de Entidade do Bot (Recargas Brasil):** O número da sessão do cliente terminado em `5676` foi hardcoded como `is_from_me` logic entity (Aparelho Conectado, não usuário da agenda).
- **Ações Aplicadas:** `upsertContact` agora força inserção de flag especial e nomenclatura restrita (`Recargas Brasil (Sistema)`) se ler o próprio número. `saveMessage` aciona o flag `_skip_ticket` prevenindo a criação de chats fantasmas no CRM quando o robô dispara outbound messages.

## $(date +%Y-%m-%d): Correção de Sincronismo do Estado de Conexão WuzAPI
- **Diagnóstico:** O Painel de Conexões do Frontend exibia instâncias falsamente logadas. O gateway do Node estava apenas retornando o estado "salvo" em `connections.json` sem validar ativamente se os Sockets no container GoLang ainda estavam estabelecidos.
- **Correção Implementada:** 
  1. O endpoint interno `getStatus` foi atualizado para atuar como interceptador de *Truth*. Ele realiza fetch obrigatório no `/session/status` da WuzAPI. Se o retorno for *desconectado* ou *error*, ele rebaixa o status persistido localmente (`updateConnection`) para "disconnected", impedindo a UI do CRM de mascarar travamentos.
  2. O Endpoint `getQr` agora força o `wuzapi.startSession()` para reinflar o listener antes de solicitar um buffer Base64 novo, quebrando o loop infinito "Aguardando QR do Servidor" relatado na UI.

## $(date +%Y-%m-%d): Restauração da UX de Seleção de Provedores de Conexão
- **Diagnóstico:** A tela de Instâncias do painel *Bot* havia perdido a interface estendida que dividia a criação de conexões em diferentes provedores.
- **Auditoria Executada:** A IA vasculhou o histórico global de commits da aplicação legada (CRM) e encontrou a arquitetura em `WhatsAppConnectChoicePanel.tsx`. 
- **Correção Implementada:** Foi recriado o modelo conceitual dentro do *Modal* de Adição do `bot/src/pages/Instances.tsx`. O usuário agora tem visualização clara da dicotomia estrutural:
  - **Provedor 1:** WuzAPI (QR Code / Servidor Próprio).
  - **Provedor 2:** WhatsApp Cloud API (Oficial / Configuração no CRM).
- O fluxo subjacente de injeção na WuzAPI local do Bot não foi violado.

## $(date +%Y-%m-%d): Solução do Status Falso e Congelamento de QR (Bridge Logic)
- **Diagnóstico da Causa:** Encontramos que a origem do "Falso Conectado" e do QR Code travado em `401 Unauthorized` vinha do Worker Background do bot (`apps/bot/server/src/bridge/supabase-sync.js`). Este script em Node puro fazia polling na tabela `instances` do Supabase e tentava falar com a porta `8081` (WuzAPI).
- O erro letal: A WuzAPI nativa exige que **cada número de celular tenha um Token gerado**, mas o script estava mandando a chave Administrativa do servidor (no Header `Token`) para todo mundo. Obviamente, a API rejeitava (401), e o script não entendia o erro.
- **Correção (Backlog Cumprido):** O worker `supabase-sync.js` foi reescrito:
  - Adotou checagem do banco. Se não houver `wuzapi_token`, ele bate no `POST /admin/users` da WuzAPI como Admin e resgata um Token verdadeiro de uso.
  - Ele agora injeta esse Token verdadeiro no `GET /session/status` e no `POST /session/connect`.
  - Se a WuzAPI responder "unpaired" (despareado), ele roda nativamente um `GET /session/qr` enviando a string em base64 e salvando-a no Supabase via REST para o Front-end ler no *Modal* instantaneamente.

## $(date +%Y-%m-%d): Consolidação de Nomenclatura UX (Instâncias x Conexões)
- **Decisão:** Em acordo com o escopo operacional multi-instância, o termo de interface (UI) `Instâncias` será integralmente mantido na tela do Bot. Esse termo é didático para o usuário final que compreende o ecossistema como "múltiplas instâncias de WhatsApp".
- **Lógica Oculta (Under-the-hood):** A persistência e requisições assíncronas do backend, contudo, estão mapeadas e seladas contra a tabela primária real da infraestrutura: `whatsapp_connections`.
- Nenhum `CREATE TABLE instances` furtivo existirá mais na arquitetura atual do Supabase. A dicotomia entre front semântico e back técnico foi absorvida pelo Adapter Pattern no `instanceService.ts`.

## $(date +%Y-%m-%d): Resolução de Efeito Colateral do Hard Deploy (Minified Error 321)
- **Diagnóstico do Incidente:** O script agressivo de Deploy `050` gerou um efeito reverso e indesejado ao forçar reset da *Working Tree* de forma agnóstica na VPS. Isso engoliu as tipagens JSX que referenciam ícones críticos como `Cloud` e `Power` em `Instances.tsx`.
- **Mitigação:** Foi criado o script imutável de patching `057-fix-cloud-power-pos-hard-deploy.sh`, que age apenas nas dependências do `lucide-react` de forma idempontente usando injeção em V8 JS nativo, restabelecendo o bundle `dist/` do React de forma asséptica.
- **Aprendizado Técnico:** Abandono imediato do uso do comando de reset duro `050-hard-deploy-bot.sh` em favor de deploys progressivos e isolados para evitar reversão de hotfixes.

## $(date +%Y-%m-%d): Verificação de Escopo Operacional Limitado
- **Diagnóstico de Autoridade:** Foi constatado que a IA no ambiente Arena Mode não possui CLI configurada nem as chaves para atuar via `gh` ou acionar conexões SSH de entrada na VPS.
- Qualquer instrução que demande manipulação de repositório via `gh pr merge`, extração de Action Secrets, invocação de túneis Secure Shell reversos ou gatilhos diretos de terminal root foi permanentemente documentada como dependente de execução física (Copiar e Colar) pelo Operador do Projeto, preservando o modelo Zero-Trust.

## $(date +%Y-%m-%d): Continuidade da Orquestração
- **Ato de Transição:** O log remoto extraído provou a fusão (`merge --squash`) da PR #112 efetuada pelo Admin root. O auto-orquestrador absorveu sequencialmente as rotinas 070 (QR Dir), 071 (Chat Realtime) e 072 (Contatos).
- Nenhuma falha severa apontada na cadeia. A pipeline atualizou a master do clone-deck local.

## $(date +%Y-%m-%d): Matriz de Prompt Operacional para Sessões de IA (Orchestration Specs)
- **Documentação de Processos:** Atualizado o arquivo de Prompt Oficial `security/NEXT_SESSION_PROMPT.md` com a taxonomia do repositório físico na VPS (`/root/Multizap/`) e restrições absolutas de movimentação de pastas e exibição de tokens.
- **Artefato de Interoperabilidade:** Criado arquivo `security/PLAN_VPS_ORCHESTRATOR.json` em formato serializado, de forma que outros agentes (OpenAI, Anthropic ou ferramentas de Auto-Deploy do Github Actions) possam puxar a diretiva e compreender o state machine das branches protegidas.
- Nenhuma alteração mutável em produção efetuada. Foco metodológico para garantir continuidade de memória sem perda de *context window* em sessões subsequentes.
