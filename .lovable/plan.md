
# Plano — Investigação Abacus no HUB

Uma missão só, três frentes em cascata: **frontend aqui**, **backend no HUB via VPS**, **chave no cofre do HUB**. Tudo termina num modal único, bonito, responsivo, sem poluir o painel.

---

## 🔴 Bloqueio honesto antes de tudo — chave trial

Preciso te avisar: eu **não consigo criar uma conta trial da Abacus sozinho**. O cadastro deles exige e-mail, verificação, cartão pra trial paga. Duas saídas:

- **(A) Você cria o trial** (`abacus.ai` → sign up → 7 dias grátis do ChatLLM) e me passa a chave aqui no chat. Eu já ligo os secrets via SSH direto no cofre do HUB.
- **(B) Eu deploya o esqueleto todo funcionando "vazio"**: modal, tabela de logs, edge function pronta — e no lugar da resposta real da Abacus, ela retorna `{"status": "sem chave configurada"}`. Quando você trouxer a chave depois, é 1 comando SSH pra plugar e tudo passa a funcionar de verdade.

**Meu default se você não responder:** vou de **(B)** e deixo o modal com um banner amarelo "chave não configurada — cole aqui pra ativar". Assim nada trava.

---

## 1) Frontend — aba "Abacus" no HUB (eu faço aqui no Lovable)

Nova aba na `HubPage.tsx`, ao lado das 5 existentes (Dashboard, Catálogo, Políticas, Conectores, Auditoria).

**Um único botão grande** abre **UM modal responsivo** com 4 sub-abas internas:

| Sub-aba | Conteúdo |
|---|---|
| 🟢 **Status** | Ping em tempo real: `routellm.abacus.ai/v1/models`, `chatllm.abacus.ai`, worker do Gunnar. Latência, código HTTP, badge verde/amarelo/vermelho. |
| 🤖 **Modelos** | Lista dos 34 modelos Abacus. Marca ativos. Radio pra escolher modelo default do teste. Preview de custo estimado. |
| 📜 **Logs** | Tabela ao vivo (últimas 100 requests): timestamp, modelo, status, latência, tokens, snippet do erro. Filtro por status/modelo. Botão exportar CSV. |
| 🧪 **Console** | Textarea pra prompt + botão "Enviar teste". Mostra resposta streaming + tempo total. Todo request vira linha nos Logs automaticamente. |

**Design:** padrão esmeralda oficial (`#10b981`, fundo `#052e2b`, sombras 3d), `card-premium` no modal, tabs com `data-[state=active]:gradient-emerald`, mobile-first (430px width já testado).

**Arquivos que vou criar:**
- `apps/modulos/hub/src/components/abacus/AbacusTab.tsx` — aba + botão
- `apps/modulos/hub/src/components/abacus/AbacusModal.tsx` — modal com as 4 sub-abas
- `apps/modulos/hub/src/components/abacus/panels/StatusPanel.tsx`
- `apps/modulos/hub/src/components/abacus/panels/ModelsPanel.tsx`
- `apps/modulos/hub/src/components/abacus/panels/LogsPanel.tsx`
- `apps/modulos/hub/src/components/abacus/panels/ConsolePanel.tsx`
- `apps/modulos/hub/src/hooks/useAbacus.ts` — chama a edge function via `hub-client.ts`

**Arquivo alterado:**
- `apps/modulos/hub/src/HubPage.tsx` — adiciona a 6ª aba (`grid-cols-6`)

---

## 2) Backend — edge function no HUB Supabase (via SSH + VPS)

Como eu **não posso** deployar edge no HUB (`lyoigsqluyktoclwdaft`) direto pelas tools do Lovable, o fluxo é:

**Passo a passo do deploy:**
1. Via MCP `execute_command` na VPS, entro em `/root/CentralDark/`
2. Crio `supabase/functions/abacus-router/index.ts` (código escrito por mim, versionado no repo)
3. Login no Supabase CLI usando `HUB_SUPABASE_PAT` (já está nos secrets)
4. `supabase functions deploy abacus-router --project-ref lyoigsqluyktoclwdaft`
5. `supabase secrets set ABACUS_API_KEY=<chave> --project-ref lyoigsqluyktoclwdaft` (só se você trouxer a chave)

**O que a edge function faz:**
- Endpoint OpenAI-compatible: `POST /functions/v1/abacus-router/v1/chat/completions`
- Valida JWT do usuário logado no HUB (`Authorization: Bearer <token>`) — sem login, 401
- Lê `ABACUS_API_KEY` do cofre do HUB (nunca vaza pro browser)
- Repassa `{model, messages, stream, temperature}` pro `routellm.abacus.ai/v1/chat/completions`
- Antes de responder, grava linha em `abacus_logs`: `user_id`, `model`, `status`, `latency_ms`, `tokens_in`, `tokens_out`, `error_snippet`, `payload_hash`
- Suporta streaming (SSE) e non-streaming
- Trata erros: 401 upstream → `{error: "chave inválida"}`; 429 → `{error: "rate limit"}`; 402 → `{error: "créditos zerados"}`; 404 (Abacus HTML) → `{error: "endpoint morto"}`

**Endpoint auxiliar:** `GET /functions/v1/abacus-router/status` — retorna `{keyConfigured: true/false, endpointsOnline: {...}, modelCount: 34}` pra alimentar o painel Status sem gastar crédito.

**Endpoint de logs:** `GET /functions/v1/abacus-router/logs?limit=100` — lê da tabela, RLS aplica.

---

## 3) Banco — tabela `abacus_logs` no HUB (migration via SSH)

Migration `0xxx_abacus_logs.sql` aplicada no HUB via `psql $HUB_SUPABASE_DB_URL`:

```sql
create table if not exists public.abacus_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  model text not null,
  status int not null,
  latency_ms int,
  tokens_in int,
  tokens_out int,
  error_snippet text,
  request_hash text,
  created_at timestamptz default now()
);

grant select, insert on public.abacus_logs to authenticated;
grant all on public.abacus_logs to service_role;
alter table public.abacus_logs enable row level security;

create policy "usuário vê seus logs" on public.abacus_logs
  for select to authenticated using (auth.uid() = user_id);
create policy "service_role escreve" on public.abacus_logs
  for insert to service_role with check (true);
```

RLS travado: cada usuário só vê suas próprias linhas. Service role (edge) escreve por todos.

---

## 4) Chave Abacus — cofre do HUB, nunca no Lovable

Respeitando a **trava** (proibido secret de provider no Lovable atual):

- **Se você trouxer a chave:** salvo via SSH →
  `ssh -i $VPS_SSH_KEY_LOVABLE $VPS_USER_LOVABLE@$VPS_HOST_LOVABLE "supabase secrets set ABACUS_API_KEY=<valor> --project-ref lyoigsqluyktoclwdaft"`
  Chave vive só no cofre do Supabase gerenciado do HUB. Frontend nunca vê. Lovable Cloud atual nunca vê.

- **Se não trouxer agora:** edge function checa `Deno.env.get("ABACUS_API_KEY")`, se vazio devolve `{keyConfigured: false}` e o modal mostra banner amarelo com input pra colar depois.

---

## 5) Ordem de execução (quando você aprovar o plano)

1. Frontend: crio os 6 arquivos React + edito `HubPage.tsx` (aqui mesmo, você vê no preview)
2. VPS: SSH → cria `supabase/functions/abacus-router/index.ts` no repo
3. VPS: aplica migration `abacus_logs` via `psql`
4. VPS: `supabase functions deploy abacus-router --project-ref lyoigsqluyktoclwdaft`
5. Testa `/status` sem chave → deve retornar `{keyConfigured: false}` + endpoints
6. (se você trouxe chave) Seta `ABACUS_API_KEY` no cofre e roda 1 teste pelo console do modal
7. Commit no `ServerVpss/CentralDark` com tudo
8. Card Hermes no Telegram admin no final

---

## O que **não** vou fazer

- ❌ Não vou tocar em `src/integrations/supabase/client.ts` (é do Lovable Cloud atual, trava)
- ❌ Não vou criar migration no Lovable Cloud atual
- ❌ Não vou colocar `ABACUS_API_KEY` em nenhum lugar do frontend nem do `.env`
- ❌ Não vou inventar chave trial — se você não trouxer, deploya vazio e avisa no modal
- ❌ Não vou mexer nas áreas 🔒 protegidas (bot-telegram, HERMES-CORE, mapeamento, etc.)

---

## Preciso da tua palavra em 2 coisas antes de sair fazendo:

1. **Chave trial:** (A) você traz agora, ou (B) deploya vazio primeiro?
2. **Nome do submenu:** `Abacus` limpo, ou `🧪 Abacus (Investigação)` mais descritivo?

Se responder só "vai", assumo **B + Abacus**.
