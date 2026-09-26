# COMANDO - CHANGELOG_TECNICO.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\docs\CHANGELOG_TECNICO.md
**SHA:** 3397eb62c2687b56
**Timestamp:** 2026-08-26T19:31:58.033211
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Decisão:** Em acordo com o escopo operacional multi-instância, o termo de interface (UI) `Instâncias` será integralmente mantido na tela do Bot. Esse termo é didático para o usuário final que comp

### Riscos
- ### Risco: Médio
- ### Risco: Baixo (tabelas novas, segurança melhorada)
- - **Diagnóstico do Risco:** O arquivo de sincronização Github-VPS (`clone-deck-gh-pull-with-deploy.sh`) possuía uma trava que rejeitava atualizações se a branch local estivesse minimamente suja (`[BLO
- - **Diagnóstico do Risco:** O arquivo `/usr/local/bin/clone-deck-gh-pull` da VPS não estava sendo atualizado pelo `post-deploy.sh` porque a trava anterior (`! grep -q "post-deploy"`) impedia a sobresc

### Ouro Bruto (primeiros 5000 chars)
```
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

## $(date +%Y-%m-%d): Hotfix 
```