
## 🎯 Objetivo

Antes de escrever UMA LINHA de código nova, disparar **3 enxames em paralelo** (só leitura, VPS + repo + docs) e voltar com **um único relatório consolidado** que responde tudo que tu pediu:

1. Tem duplicata (v1/v2/v3)? Onde?
2. Gateway tá vivo? Passou nos 3 testes da documentação?
3. Abacus tá conectado? Quais modelos respondem? Como usar em qualquer lugar (VSCode/Cursor/curl) via `https://api.centralldark.com/` **sem gastar** (Free Tier 0)?

Zero commit, zero edit, zero PM2 restart. Só leitura e chamadas HTTP de teste.

---

## 🐝 Enxame A — Auditoria de duplicatas (regra "1 script por função")

**Fio:** verificar se estou seguindo a regra antes de propor código novo.

**Alvos de leitura (VPS `/root/CentralDark/`):**
- `apps/modulos/HERMES-CORE/agents/` — listar todos agentes
- `infra/guardiao/detectores/` — pm2_watcher, git_watcher, docker_watcher, notifier
- `apps/modulos/proxy/`, `proxy-unlimi/`, `lovable-proxy/`, `elite-gateway/`, `arsenal-openai-adapter/` — comparar responsabilidades (têm 3+ proxies, cheira duplicata)
- `scripts/` — buscar padrão `*-v[0-9]*`, `*-old*`, `*-bkp*`, `*.backup`
- `docs/DOSSIE-ATUALIZA-CENTRALDARK-V2.md` e `DOSSIE-COMPLETO-ABACUS-CENTRALDARK-V1.md` — ler pra entender arquitetura oficial

**Entrega:** tabela "função → script único oficial → duplicatas suspeitas → recomendação (manter/matar/mesclar)".

---

## 🐝 Enxame B — Teste dos 3 da documentação (Gateway + Free Tier)

**Fio:** validar se o Gateway responde antes de propor qualquer feature nova.

**Passos (só leitura + curl):**
1. Ler `docs/DOSSIE-ATUALIZA-CENTRALDARK-V2.md` seção "validação" pra achar o **teste dos 3 oficial** (provável: ping simples / tool_call / histórico longo).
2. Ler `docs/CONSCIENCIA/ARSENAL/regras.json` e scripts em `scripts/validate-*` pra confirmar formato.
3. Rodar via `code--exec` (curl, `LOVABLE_API_KEY` local):
   - **Teste 1:** ping trivial → mede latência + confirma auth.
   - **Teste 2:** call com `tool_calls` → confirma que o fix do `tool_call.id` (PR #142) tá vivo em produção.
   - **Teste 3:** histórico longo (50+ msgs) → confirma sanitização no bridge.
4. Verificar Free Tier: `list_ai_gateway_requests` (últimos 7d) + `credits--get_credit_balance` pra ver quanto gastou/sobra.

**Entrega:** placar `🟢 3/3` ou `🔴 X/3` com log_id de cada teste + saldo de créditos.

---

## 🐝 Enxame C — Abacus + `api.centralldark.com` + guia de uso universal

**Fio:** o Abacus é o principal segundo o Dossiê V2 — preciso confirmar que tá vivo e documentar como plugar em qualquer ferramenta.

**Passos:**
1. **Ler dossiês** (`DOSSIE-COMPLETO-ABACUS-CENTRALDARK-V1.md` + `V2`) pra pegar:
   - Endpoint oficial (`api.centralldark.com/v1/...`?)
   - Lista de modelos que o Abacus expõe
   - Formato de auth (Bearer? Header custom?)
2. **Testar edge `abacus-router/status`** no HUB Supabase → confirma `keyConfigured: true/false`.
3. **Testar `https://api.centralldark.com/`** direto via curl:
   - `GET /` → healthcheck
   - `GET /v1/models` → listar modelos disponíveis
   - `POST /v1/chat/completions` com cada modelo listado → marcar quais respondem `🟢 200` vs `🔴 erro`
4. **Ler `docs/PENDENCIAS`** pra pegar contexto do que já foi feito.
5. **Verificar onde já tá conectado:**
   - `apps/modulos/hub/` — edge functions consumindo Abacus?
   - `apps/modulos/arsenal-openai-adapter/` — plugue OpenAI-compat aponta pro Abacus?
   - PM2 processes que apontam pra `api.centralldark.com`
6. **Montar guia leigo** de como usar em qualquer ferramenta (bloco no relatório final):
   - **VSCode (Continue.dev / Cline):** `baseURL: https://api.centralldark.com/v1` + header `Authorization: Bearer <token>` + `model: <modelo-listado>`
   - **Cursor:** override do OpenAI baseURL nas configs
   - **curl direto:** exemplo pronto pra colar
   - **Python/Node OpenAI SDK:** snippet copy-paste

**Entrega:** tabela `modelo → provider real → status → custo (free tier?)` + bloco "como plugar em qualquer lugar".

---

## 📦 Relatório final (formato)

```
🐝 A — Duplicatas: [tabela]
🐝 B — Teste dos 3: 🟢/🔴 X/3 + créditos: XX/YY
🐝 C — Abacus + api.centralldark.com:
       ├─ Endpoint vivo? 🟢/🔴
       ├─ Modelos disponíveis: [lista com placar]
       ├─ Já conectado em: [PM2 ids + edges]
       └─ Como usar (VSCode/Cursor/curl/SDK): [snippets]

🎯 Próximo fio: [recomendação baseada nos achados — SEM executar sem PERMITO PIVETE]
```

---

## 🔒 Trava

- **Só leitura + curl de teste.** Nenhum PR, nenhum commit, nenhum restart, nenhum PM2 save.
- Nenhuma exposição de secret (`LOVABLE_API_KEY`, PATs, service_role) — só uso interno.
- Se algum enxame achar bug crítico, **para e reporta**, não conserta sozinho.
- Ao final: espero **PERMITO PIVETE** com escolha do próximo fio antes de qualquer código.
