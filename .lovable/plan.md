## 🎯 Alvo
Implementar 100% do **DOSSIÊ V2** (`/root/CentralDark/docs/PENDENCIAS/DOSSIE-ATUALIZA-CENTRALDARK-V2.md`) no HUB + adicionar o **card "Abacus RouteLLM"** no painel `hub.centralldark.com`.

## 📋 Escopo (baseado nas 7 seções da V2)

### 1. Edge `proxy` no HUB Supabase (`lyoigsqluyktoclwdaft`)
Já existe (implementado no fio anterior). Auditar e garantir que tem TODAS as 4 técnicas:
- ✅ **T1 - Memory Injection**: função `injectMemory(userFacts, messages)` — puxar facts da tabela `hermes_memoria` do usuário e injetar no system prompt.
- ✅ **T2 - Multi-model Council**: `multiModelCouncil(question, models[])` com `Promise.all` real (não stub) → sintetizador via `openai/gpt-5.5` no gateway Lovable.
- ✅ **T3 - Circuit Breaker + Mock Fallback**: contador de falhas por provider (Map em memória do edge), threshold=5, TTL=60s, cai em mock limpo.
- ✅ **T4 - Sanitização**: catch retorna `{error:"upstream_error", message:"Tente novamente em instantes"}` — sem HTML, sem stack, sem detalhes do upstream.

### 2. Tabela de logs `ai_requests` (HUB Supabase)
Migration nova no HUB (não no Lovable):
```sql
CREATE TABLE hub.ai_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id text,
  model text,
  provider text,
  input_tokens int,
  output_tokens int,
  latency_ms int,
  status text,        -- success | fallback | error
  error_code text,
  circuit_state text  -- closed | open | half_open
);
GRANT SELECT, INSERT ON hub.ai_requests TO authenticated;
GRANT ALL ON hub.ai_requests TO service_role;
ALTER TABLE hub.ai_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura autenticada" ON hub.ai_requests FOR SELECT TO authenticated USING (true);
```
Edge `proxy` insere 1 linha por request.

### 3. Rota pública `/v1/inventory` no `arsenal-openai-adapter` (VPS)
🔒 exige **PERMITO PIVETE** (adapter é área protegida).
Retorna JSON agregado (cache 60s):
```json
{ "total":134, "byFamily":{"openai":34,"anthropic":18,...},
  "routes":[{"method":"GET","path":"/status","auth":"public"},...],
  "checkedAt":"2026-07-09T..." }
```

### 4. Card **"Abacus RouteLLM"** no painel `hub.centralldark.com`
Localizar Passo 0 (a pasta do front do HUB na VPS — provavelmente `apps/modulos/hub/frontend/` ou similar).
- Cor esmeralda (padrão travado).
- Header: ícone + "Abacus RouteLLM" + badge 🟢.
- Corpo: `134 modelos • 3 rotas • keyConfigured ✅`.
- **Click** → drawer com 3 abas: **Modelos** (busca), **Rotas**, **Provedores** (agrupamento).
- Refresh automático 60s.

### 5. View de logs no TelePainel (item 7 do dossiê)
No painel HUB, aba "Logs IA": lê `hub.ai_requests` (últimas 100), mostra tabela com filtro por status/model. Gráfico simples de latência p95.

### 6. Documentação de quando rodar stress test (item 5 do V2)
Criar `docs/GOVERNANCA/QUANDO-RODAR-STRESS.md` com as regras:
- Novo provider no catálogo MCP.
- Após mudança grande no edge/gateway.
- 1×/semana ou mês nos providers principais.
- Quando monitoring alertar degradação.

### 7. Setup free-path documentado (item 4 do V2)
Criar `docs/GOVERNANCA/FREE-PATH-PROXY.md` documentando providers free (Gemini free tier, HuggingFace, etc.) e como o `proxy` cai neles quando circuit breaker abre.

---

## 🗺️ Ordem de execução

```txt
Passo 0  Ler VPS: apps/modulos/hub/ + arsenal-openai-adapter/ + achar front do hub.centralldark.com
Passo 1  Auditar edge 'proxy' → completar T1/T2/T3/T4 que estiverem só como stub
Passo 2  Migration hub.ai_requests + GRANTs
Passo 3  Instrumentar edge 'proxy' pra logar em hub.ai_requests
Passo 4  Rota /v1/inventory no arsenal-openai-adapter (🔒 precisa PERMITO)
Passo 5  Componente AbacusRouterCard + drawer no front do HUB
Passo 6  View "Logs IA" no painel HUB lendo hub.ai_requests
Passo 7  Docs FREE-PATH + QUANDO-RODAR-STRESS
Passo 8  Commit no ServerVpss/CentralDark + pm2 reload adapter + deploy edge proxy
Passo 9  Card Hermes v1.3 no Telegram admin: "V2 implementada, evidência: ..."
```

## 🔒 Regras respeitadas
- Backend só no HUB Supabase (`lyoigsqluyktoclwdaft`), **nunca** no Lovable atual.
- Escopo: VPS (`/root/CentralDark/`) + GitHub (`ServerVpss/CentralDark`).
- Padrão visual esmeralda.
- Áreas 🔒 (`arsenal-openai-adapter`, `hub/`) só com autorização explícita.
- Nada de force-push, nada de mexer no `main` sujo da VPS sem salvar patches.

## ❓ Autorizações necessárias antes de partir pra build
1. **PERMITO PIVETE** pra tocar em `apps/modulos/arsenal-openai-adapter/` (Passo 4) e `apps/modulos/hub/` (Passos 1, 5, 6)?
2. Aprovado deployar edge `proxy` no HUB Supabase (Passo 8)?
3. Manter o card só no painel HUB, ou espelhar também no TelePainel Lovable? (Recomendo **só HUB** — regra "OAuth/keys/status de provider = só HUB").

Manda "PERMITO PIVETE, toca ficha na V2" que eu executo Passos 0→9 em cascata.
