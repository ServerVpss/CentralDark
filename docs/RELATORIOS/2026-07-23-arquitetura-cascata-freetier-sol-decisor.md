# 🧭 Arquitetura de Rotas em Cascata — Free-Tier → Pago

> **📌 Documento gerado em:** 2026-07-23  
> **📍 PR:** #316 (mesmo PR de conformidade da Lupa + intent router)  
> **🎯 Escopo:** planejamento pessoal do Pivete — NÃO é produto, NÃO tem cliente, NÃO distribui.

---

## 🚨 AVISO GRANDE — LEIA ANTES DE QUALQUER COISA

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ⚠️  ESTE DOCUMENTO É PLANEJAMENTO. NADA AQUI ESTÁ CONSOLIDADO.  ⚠️ ║
║                                                                      ║
║   • Não implementar nada sem ordem explícita.                        ║
║   • Não fazer merge deste PR até revisão final.                      ║
║   • Não tratar preços, rotas ou fluxos como decisão travada.         ║
║                                                                      ║
║   👑 DECISOR FINAL:                                                   ║
║      1. Pivete (autoridade máxima)                                   ║
║      2. Sol (GPT-5.6-sol) — árbitro técnico delegado                 ║
║                                                                      ║
║   ❌ Nenhum outro modelo, IA ou humano tem autoridade para           ║
║      aprovar, consolidar ou mergear esta arquitetura.                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Este PR (#316) é um workspace de arquitetura.** Serve pra Sol analisar, o Pivete refinar, e no fim virar uma decisão. Enquanto isso, é rascunho vivo.

---

## 🎯 O que o Pivete pediu (literal, sem generalizar)

> "A estratégia é tentar montar algo que utilize tudo que for possível distribuindo como se fosse uma orquestração de cima para baixo utilizando o topo pra orquestrar modelos menores e se possível usando todos os free tier com troca automática só assim depois partir para os pagos. A Luca [Luna] é o suficiente pra fazer um estrago utilizando apenas os modelos grátis quando esgotar aí sim eles faz rolou começando de novo orquestração de cima para baixo do topo para o menor designando papéis."

**Tradução operacional:**
1. **Não escolher UM modelo** — usar TODOS que der.
2. **Orquestração cascata top-down:** um modelo grande no topo distribui tarefas pra modelos menores.
3. **Free-tier PRIMEIRO, sempre.** Só cai pra pago quando esgotar TODAS as cotas grátis.
4. **Rotação automática:** esgotou cota A → tenta B → tenta C → só depois vai pra pago.
5. **Cada modelo recebe um papel** (não é fila cega, é distribuição por especialidade).

---

## 🏗️ Arquitetura proposta (rascunho v0.1)

### Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 0 — MAESTRO (topo, orquestrador)                        │
│  Recebe o prompt do Pivete, decide o plano, distribui.          │
│  Candidato: Nemotron 3 Ultra 550B (free tier via NVIDIA NIM)    │
│             OU Sol quando Nemotron estourar cota                │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ CAMADA 1       │ │ CAMADA 1       │ │ CAMADA 1       │
│ Sub-agente     │ │ Sub-agente     │ │ Sub-agente     │
│ CÓDIGO         │ │ REVISÃO        │ │ CHAT/RÁPIDO    │
│                │ │                │ │                │
│ Free primeiro: │ │ Free primeiro: │ │ Free primeiro: │
│ • Gemini 2.5   │ │ • DeepSeek V3  │ │ • Gemini Flash │
│   Flash (free) │ │   (free OR)    │ │   Lite (free)  │
│ • Llama 3.3 70b│ │ • Qwen 2.5 72b │ │ • Llama 3.1 8b │
│   (Groq free)  │ │   (free OR)    │ │   (Groq free)  │
│                │ │                │ │                │
│ Cascata →      │ │ Cascata →      │ │ Cascata →      │
│ Terra (pago)   │ │ Terra (pago)   │ │ Luna (pago)    │
└────────────────┘ └────────────────┘ └────────────────┘
```

### Regras de cascata (algoritmo)

```python
def escolher_modelo(camada, categoria):
    fila = ROTAS[camada][categoria]  # ex: ['gemini-free', 'llama-groq', 'terra-pago']
    for candidato in fila:
        if not cota_esgotada(candidato) and not em_cooldown(candidato):
            return candidato
    # todos esgotados na camada — sobe pra camada de cima ou pago
    return fila[-1]  # último = fallback pago garantido
```

**Gatilhos de troca:**
- HTTP 429 (rate limit) → marca cota esgotada, cooldown 60min, próximo da fila.
- HTTP 402 (créditos) → mesmo tratamento.
- HTTP 5xx / timeout → cooldown 5min, próximo da fila.
- Reset diário à meia-noite UTC → limpa flags de cota.

---

## 💰 Painel de Custo (ESTENDE cockpit existente, NÃO cria tela nova)

**Regra:** o painel entra dentro de `src/paginas/admin-cockpit/SalaControle.tsx` como novo card `<CustoPorRota />`. **Não criar rota nova, não criar página nova.**

### O que o card mostra

| Coluna | Fonte | Cálculo |
|--------|-------|---------|
| Rota | `rotas.json` | nome da regra (código, revisão, chat…) |
| Modelo atual | `ai_requests` último registro | vencedor da cascata agora |
| Chamadas 24h | `ai_requests` count | agrupado por modelo |
| Custo estimado | tokens × preço tabela | in×preço_in + out×preço_out |
| Custo real | provider billing (quando existir) | webhook OpenRouter ou CSV manual |
| Delta % | (real − estimado) / estimado | pra pegar drift de preço |
| Free vs Pago | contador | quanto foi economizado usando free-tier |

### Fonte de dados

- **Estimado:** view `api.ai_requests` já existe no HUB (`20260709_api_ai_requests_view.sql`). Só criar view auxiliar `api.ai_costs_estimated` que faz o JOIN com preço da `rotas.json`.
- **Real:** ainda não existe. Precisa endpoint no HUB que ingere billing do OpenRouter/NVIDIA. **PENDENTE — não fazer agora, só documentar.**

---

## 📊 Métricas por Provedor (no HUB, não em tela nova)

**Estender** a tabela `public.ai_requests` no HUB Supabase (`lyoigsqluyktoclwdaft`) com colunas que já podem existir mas não estão sendo populadas:

```sql
-- PLANO. NÃO RODAR AGORA. Aguardando ordem do Pivete/Sol.
-- Verificar antes se colunas já existem — não duplicar.
ALTER TABLE public.ai_requests
  ADD COLUMN IF NOT EXISTS provider     text,  -- 'openrouter' | 'nvidia' | 'groq' | 'elite'
  ADD COLUMN IF NOT EXISTS free_tier    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS route_key    text,  -- 'codigo' | 'revisao' | 'chat_curto' …
  ADD COLUMN IF NOT EXISTS cascade_step int;   -- 0 = primeira escolha, 1 = fallback 1, etc.
```

**Views derivadas (apenas planejamento):**
- `api.metrics_by_provider` — latência p50/p95, taxa de erro, tokens médios por provedor/dia.
- `api.cascade_health` — quantas vezes cada camada foi acionada, quantos fallbacks disparados.

---

## 🔬 Endpoint de teste — DEIXAR CLARO QUE É DO PIVETE

**URL oficial:** `https://api.centralldark.com/v1/debug/echo-route`

> **📢 Este endpoint está em `api.centralldark.com` → aponta pro Elite Gateway do Pivete (PM2 `CentralDark-EliteHTTP`, porta 8080, VPS 100% dele). Não é OpenRouter, não é NVIDIA, não é Abacus. É a infraestrutura do próprio Pivete que orquestra os provedores por baixo.**

### Contrato (rascunho — PLANO, não implementado)

**Request:**
```http
POST https://api.centralldark.com/v1/debug/echo-route
Authorization: Bearer <CENTRALLDARK_API_KEY>
Content-Type: application/json

{
  "prompt": "me explica RLS em uma frase",
  "forcar_camada": null,
  "forcar_modelo": null
}
```

**Response:**
```json
{
  "proprietario": "pivete-centraldark",
  "gateway": "api.centralldark.com (Elite HTTP Gateway, VPS PM2 id 51)",
  "decisao": {
    "camada": 1,
    "categoria": "chat_curto",
    "cascata_tentativas": [
      { "passo": 0, "provider": "groq",       "modelo": "llama-3.1-8b",    "resultado": "429_cota" },
      { "passo": 1, "provider": "openrouter", "modelo": "gemini-flash-lite","resultado": "ok" }
    ],
    "provider_final": "openrouter",
    "modelo_final": "google/gemini-3.1-flash-lite",
    "free_tier": true
  },
  "resposta": "RLS filtra linhas da tabela conforme regra escrita em SQL, por usuário.",
  "tokens": { "in": 12, "out": 23 },
  "latencia_ms": 340,
  "custo_estimado_usd": 0.0000012,
  "log_id": "req_01j3z4k..."
}
```

O Pivete manda um prompt e vê **exatamente** qual provedor pegou, qual modelo, quanto tempo, quanto custou, e se caiu free ou pago. Sem mistério.

---

## 🔍 AUTO-LUPA aplicada nesta arquitetura

Apliquei a **Lupa Bayesiana canônica** (do repo, blob `4d0c4e8f`) neste próprio plano.

### AutoLupa — 15 verificações

| # | Verificação | Status | Nota |
|---|-------------|--------|------|
| 1 | Contrato explícito | 🟢 | Objetivo, escopo, decisor final declarados |
| 2 | Escopo travado | 🟢 | Uso pessoal, não produto |
| 3 | Fontes primárias | 🟡 | Preços do OpenRouter (23/07) — precisa refresh antes de consolidar |
| 4 | Falsificadores nomeados | 🟢 | 429/402/5xx com ação clara |
| 5 | Métricas mensuráveis | 🟢 | latência, tokens, custo delta% |
| 6 | Riscos explícitos | 🟡 | Falta: risco de vendor lock em Groq/NVIDIA free |
| 7 | Alternativas descartadas | 🟡 | Não descartei formalmente "modelo único" — Pivete já vetou isso |
| 8 | Reversibilidade | 🟢 | Só documento, zero código executado |
| 9 | Custo cognitivo | 🟢 | Painel reusa cockpit, endpoint reusa Elite |
| 10 | Dependências externas | 🟡 | Depende de webhooks de billing que ainda não existem |
| 11 | Ponto único de falha | 🟢 | Cascata elimina SPOF por design |
| 12 | Timing e prazo | 🔴 | **GAP:** não defini quando cada fase entra. Fica pro Pivete/Sol decidir |
| 13 | Comitê independente (XP-3) | 🔴 | **GAP:** só Sol vai revisar. É consciente e intencional |
| 14 | Assinatura de origem | 🟢 | Este doc + PR #316 + branch nomeada |
| 15 | Reprodutibilidade | 🟢 | rotas.json versionado, cálculo de custo determinístico |

### Veredito da AutoLupa: **CONDICIONAR**

**Ponto fixo não atingido.** 3 gaps abertos (#6, #7, #10, #12, #13) — mas TODOS são conscientes:
- #12 e #13 são delegados ao Pivete/Sol por decisão do próprio Pivete.
- #6, #7, #10 são pra próxima rodada de refinamento no próprio PR.

**Não mergear enquanto os gaps não forem endereçados por Sol ou Pivete.**

---

## ✅ Checklist de refinamento (marcar no próprio PR)

Copiar isto pro body do PR #316 pra virar checklist do GitHub:

```
### 🧠 Estratégia (decisor: Pivete ou Sol)
- [ ] Sol revisou a cascata top-down e aprovou o esqueleto
- [ ] Pivete confirmou lista de provedores free-tier alvo
- [ ] Decidido: Nemotron entra pelo NIM (free) ou OpenRouter (pago)?
- [ ] Definido reset diário da cota (UTC vs BRT)

### 💰 Painel Custo (estender SalaControle.tsx)
- [ ] Criar view api.ai_costs_estimated no HUB
- [ ] Adicionar card <CustoPorRota /> em SalaControle (sem rota nova)
- [ ] Ingestão de billing real do OpenRouter (webhook ou CSV)
- [ ] Cálculo de "quanto foi economizado com free-tier"

### 📊 Métricas HUB
- [ ] Confirmar colunas provider/free_tier/route_key/cascade_step em ai_requests
- [ ] Migration ALTER TABLE (só depois de OK do Pivete)
- [ ] View api.metrics_by_provider
- [ ] View api.cascade_health

### 🔬 Endpoint /v1/debug/echo-route
- [ ] Adicionar rota no Elite Gateway (apps/modulos/elite-gateway)
- [ ] Deixar claro no header X-Owner: pivete-centraldark
- [ ] Logar tentativas de cascata completas no ai_requests
- [ ] Testar via curl e via card no cockpit

### 🔍 Fechar gaps da AutoLupa
- [ ] Gap #6 — documentar risco de vendor lock free-tier
- [ ] Gap #7 — descartar formalmente "modelo único" com nota do Pivete
- [ ] Gap #10 — mapear webhooks de billing necessários
- [ ] Gap #12 — Pivete/Sol define fases e prazos
- [ ] Gap #13 — Sol assina como comitê independente
```

---

## 🔒 O que NÃO fazer neste PR

- ❌ Não criar rota `/custo` ou `/metrics` novas no frontend — usa cockpit.
- ❌ Não criar novo edge function — estende `abacus-router` ou cria dentro do Elite Gateway VPS.
- ❌ Não mudar `apps/modulos/HERMES-CORE/core/cadeia.json` — área 🔒 protegida.
- ❌ Não mexer no bot `@srver1bot` — área 🔒 protegida.
- ❌ Não fazer merge sem OK explícito do Pivete OU do Sol.

---

## 📎 Referências consolidadas neste PR

Este documento é o **mestre**. Os arquivos abaixo continuam na branch mas foram absorvidos:

- `docs/RELATORIOS/2026-07-23-precos-reais-nemotron-vs-gpt56.md` → seção de preços aqui.
- `docs/RELATORIOS/2026-07-23-router-intent-luna-terra-nemotron.md` → matriz cascata aqui.
- `scripts/router/rotas.json` → base do algoritmo de cascata (será estendida com free-tiers).
- `scripts/router/intent_router.py` → esqueleto do decisor (v0.1, precisa evoluir pra cascata).
- `scripts/lupa/validar_autolupa_hash.py` → guard de integridade da Lupa (já ativo).
- `.github/workflows/lupa-conformance.yml` → CI da conformidade (já ativo).

---

**Fim do documento. Aguardando refinamento do Pivete e análise do Sol.**
