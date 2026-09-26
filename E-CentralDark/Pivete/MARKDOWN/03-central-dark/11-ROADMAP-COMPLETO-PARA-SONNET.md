# 11 — ROADMAP COMPLETO PARA O SONNET (VPS)

**Intenção:** entender **como um produto multi-agent funciona** (instalação, primeiros passos, providers, direção/roadmap) e **implementar o equivalente no Central Dark**.  
**Não é:** copiar UI, brand, preço, código ou conta de terceiros.  
**É:** padrão de produto + checklist pro app que o Sonnet já está fazendo.

**Leia junto:** `../02-ia/AI-CONTEXT-MASTER.md` · `07-mapa-conversao-central-dark.md` · `10-mapa-paginas-site.md`

---

## 0. O que o usuário quer que você (Sonnet) entenda

| Bloco | Pergunta | Resposta curta |
|-------|----------|----------------|
| Instalação | Como o user entra no produto? | Baixa runtime **ou** abre web HUB |
| Primeiros passos | O que fazer nos 10 min após acesso? | Login → entitlement → provider/key → 1ª missão |
| Providers | Como pluga modelo? | Gateway próprio e/ou BYOK |
| Roadmap produto | O que construir em ordem? | P0→P4 abaixo |
| Negócio | O que sustenta? | Assinatura cockpit + (opcional) usage gateway |

---

## 1. INSTALAÇÃO (padrão de mercado → Central Dark)

### Padrão de mercado (genérico)
```
1. Conta (OAuth Google/GitHub)
2. Plano / trial (entitlement)
3. Baixar app desktop (Mac/Win/Linux)  OU  usar web
4. Auto-update do runtime
5. Login no app (device code / OAuth desktop)
6. Pronto pra configurar providers
```

### Equivalente Central Dark (o que implementar)
```
1. Login HUB (Supabase Auth) — JÁ EXISTE
2. Plano / entitlement HUB — FORMALIZAR
3. Runtime:
   - MVP: Mission Room 100% WEB no HUB (não depende de desktop)
   - Depois: CLI / node local opcional
4. API key do gateway Arsenal (user gera no HUB)
5. (Opcional) BYOK de providers externos
6. Health: gateway + MCP + Hermes vivos
```

### Checklist instalação (DoD)
- [ ] User cria conta no HUB
- [ ] User vê dashboard com status do plano
- [ ] User gera `CENTRALDARK` / Arsenal API key
- [ ] User abre Mission Room (web)
- [ ] User roda 1 chat via `api.centralldark.com` (Arsenal)
- [ ] Docs “instalação” com 5 passos em português

### O que NÃO precisa copiar
- Binário desktop de terceiro  
- Gatekeeper macOS / dmg alheio  
- Nome “Baixar App” igual — no CD pode ser “Abrir Mission Room” + “Gerar API Key”

---

## 2. PRIMEIROS PASSOS (onboarding 10 minutos)

### Sequência obrigatória (padrão que funciona)
```
Passo 1 — Entrar
  Login no HUB

Passo 2 — Entender onde está
  Dashboard: plano, status, atalhos

Passo 3 — Conectar cérebro (provider)
  Gerar key Arsenal  OU  colar BYOK
  Testar: list models / 1 completion

Passo 4 — Escolher squad/template
  Ex: "feature-fast" = conductor + worker + reviewer

Passo 5 — Primeira missão curta
  Goal simples: "Liste arquivos do projeto e resuma em 5 bullets"
  Ver ≥1 agent rodando + cost (mesmo que $0.00)

Passo 6 — Ver resultado
  Timeline + custo + status completed
  CTA: "criar segunda missão" / "ver ajuda providers"
```

### Métricas de ativação (pra product)
- `first_key_created` < 15 min pós-signup  
- `first_mission_completed` < 24h  
- Se falhar: artigo de ajuda + health do gateway  

### Artigos de ajuda mínimos (seed pro HUB)
1. `primeiros-passos` — os 6 passos acima  
2. `instalacao` — conta, browser suportado, key  
3. `providers` — Arsenal modes + BYOK  
4. `primeira-missao` — exemplo de goal + o que esperar  
5. `budget-e-custo` — como ler $ e hard-stop  
6. `modos-arsenal` — router / parallel / debate / hermes  

---

## 3. PROVIDERS (como pluga modelo)

### Conceito (não confundir)
| Termo | Significado |
|-------|-------------|
| **Ferramenta / runtime** | Onde o agent roda (HUB Mission Room, CLI, MCP) |
| **Provider** | Quem serve o modelo (Abacus, Anthropic, OpenAI…) |
| **Modelo** | ex. flagship vs barato |
| **Modo Arsenal** | Estratégia de roteamento (1 modelo, parallel, debate…) |
| **Role** | Papel na missão (conductor, scout, builder…) |

**Role ≠ modelo.**  
Mesmo role pode trocar de modelo; mesmo modelo pode servir roles diferentes.

### Duas formas de provider no Central Dark

#### A) Gateway próprio (preferido — moat)
```
User → Arsenal Adapter (:8090 / api.centralldark.com)
     → Abacus RouteLLM (100+ models)
     → (fallback OpenRouter se switch)

Auth: Bearer / x-api-key do HUB
Audit: api.audit_log_api
Modes públicos: arsenal-router | parallel | debate | hermes (+ aliases)
```

#### B) BYOK (opcional)
```
User cola key Anthropic/OpenAI/etc no HUB (vault)
Mission Room pode rotear:
  - tasks baratas → Arsenal barato
  - tasks flagship → BYOK se user quiser
Nunca logar key completa
```

### Settings de provider (o que a UI precisa)
```
Providers
├── Arsenal Gateway
│   ├── key status (ok/revoked)
│   ├── default mode
│   └── usage este mês
├── BYOK list[]
│   ├── provider_name
│   ├── key_hint (****abc)
│   └── enabled
└── Price table (read-only pro user ou admin)
```

### Mapa role → provider sugerido (template CD)
| Role | Preferência de custo | Exemplo de modo |
|------|----------------------|-----------------|
| Conductor | médio/alto | router ou hermes |
| Scout | baixo | router barato |
| Builder | médio | router / parallel |
| Reviewer | médio/alto | debate ou judge |
| Executor | baixo | router barato |
| Council | alto (vale a pena) | parallel / debate |

### Teste de provider (Sonnet deve automatizar)
```bash
# exemplo conceitual
curl -s https://api.centralldark.com/v1/models -H "Authorization: Bearer $KEY"
curl -s https://api.centralldark.com/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"arsenal-router","messages":[{"role":"user","content":"ping"}]}'
```

---

## 4. ROADMAP INTEIRO DO PRODUTO (ordem de build)

> Isto é o **roadmap do app Central Dark Mission Cockpit**.  
> Sonnet: implemente nesta ordem. Não pule metering/budget.

### FASE P0 — Spec e dados (fundação)
**Objetivo:** contratos e tabelas existem.

- [ ] ADR: Mission Room no HUB  
- [ ] Tables: `missions`, `mission_agents`, `mission_events`, `cost_ledger`, `price_table`, `squad_templates`, `plans`, `entitlements`  
- [ ] RLS por `user_id`  
- [ ] Estados da missão documentados  
- [ ] **Entrega:** SQL + mermaid + este checklist marcado  

### FASE P1 — Missão + gateway + custo + budget
**Objetivo:** 1 user roda 1 missão com custo e hard-stop.

- [ ] API create/start/cancel/get mission  
- [ ] AgentRunner chama Arsenal chat completions  
- [ ] `cost_ledger` grava tokens→USD  
- [ ] Budget hard-stop → `budget_exceeded`  
- [ ] Audit das calls  
- [ ] **Teste:** curl end-to-end  

### FASE P2 — Orquestração (papéis / squad)
**Objetivo:** não é mais 1 chat solto — é time.

- [ ] Orchestrator.plan(goal) → steps  
- [ ] 3 squad templates: `bugfix`, `feature`, `research`  
- [ ] ≥2 roles na mesma missão (pipeline ou parallel)  
- [ ] Timeline de events  
- [ ] Mapear roles ↔ modos Arsenal quando fizer sentido  
- [ ] **Teste:** missão feature com conductor+worker+reviewer  

### FASE P3 — UI HUB (as “páginas”)
**Objetivo:** user humano consegue usar sem curl.

| Página CD | Job | Status alvo |
|-----------|-----|-------------|
| Dashboard | home, plano, CTAs | P3 |
| Planos / Billing | entitlement | P3/P4 |
| Mission Room | coração do app | P3 |
| Keys / Providers | Arsenal + BYOK | P3 |
| Ajuda | 6 artigos seed | P3 |
| Roadmap (Direção) | transparência alpha | P3 |
| Download app | opcional depois | P5 |

- [ ] Lista de missões  
- [ ] Detalhe: agents, cost live, cancel  
- [ ] Nova missão (goal + budget + squad)  
- [ ] Empty states + erros legíveis  

### FASE P4 — Entitlements + polimento comercial
**Objetivo:** plano limita parallel/features; onboarding redondo.

- [ ] `max_parallel_agents` por plano  
- [ ] Feature flags (voz, memória, team)  
- [ ] Checkout (Stripe e/ou EFI — o que já existir no stack)  
- [ ] Dashboard mostra uso do mês  
- [ ] Relatório simples de custo  
- [ ] Auth enforce no gateway (plano de saída do shadow)  

### FASE P5 — Diferenciação Central Dark (moat)
**Objetivo:** não ser “mais um chat”.

- [ ] Approvals (`hub_approvals`) em tools perigosas  
- [ ] MCP tools na missão com policy  
- [ ] Memória por missão/projeto (`memoria-api`)  
- [ ] Voz opcional (`centraldark-voice`)  
- [ ] Telegram notifica missão done / budget hit  
- [ ] CLI local opcional  

---

## 5. ROADMAP “DIREÇÃO” (o que mostrar pro user no HUB)

Página **Direção / Roadmap** do produto (transparência), não confundir com roadmap de eng acima.

```
Roadmap UI
├── Now (em progresso)     ← o que o time está shipando
├── Next (próximo sprint)
├── Later (backlog)
└── Shipped (changelog)
```

**Conteúdo inicial sugerido (CD):**
| Sprint | Itens |
|--------|-------|
| Now | Mission Room MVP, cost ledger, budget stop |
| Next | Squad templates, ajuda, dashboard |
| Later | Voz, desktop opcional, team seats |
| Shipped | Gateway Arsenal, HUB auth, MCP, Hermes (já existem como base) |

---

## 6. FLUXO ÚNICO (instalação → valor)

```
SIGNUP HUB
   → DASHBOARD (vê plano)
   → KEYS (Arsenal)
   → AJUDA primeiros-passos
   → MISSION ROOM
        → escolhe squad
        → goal + budget
        → agents rodam (providers)
        → cost live
        → completed
   → volta DASHBOARD (histórico)
   → (se quiser) PLANOS upgrade
   → DIREÇÃO (vê o que vem)
```

---

## 7. O QUE MANDAR PRO SONNET NA VPS (pacote mínimo)

Anexar nesta ordem:

1. `11-ROADMAP-COMPLETO-PARA-SONNET.md` **(este arquivo)**  
2. `../02-ia/AI-CONTEXT-MASTER.md`  
3. `../02-ia/AI-SCHEMA.json`  
4. `07-mapa-conversao-central-dark.md`  
5. `10-mapa-paginas-site.md`  
6. Dossiê Arsenal mais recente (se existir na VPS)

**Prompt curto:**
```
Intenção genuína: implementar Mission Cockpit Central Dark.
NÃO copiar produto de terceiro (UI/brand/código).
Seguir 11-ROADMAP-COMPLETO-PARA-SONNET.md fases P0→P4.
Reusar: arsenal-openai-adapter, HUB Supabase, Hermes, MCP, memoria-api.
Começar pelo P0 se schema não existir; senão continuar do gap atual.
Responda com: estado atual do app → próximo slice → arquivos → teste.
```

---

## 8. ANTI-ESCOPO (pra não desviar)

| Fora de escopo | Motivo |
|----------------|--------|
| Clonar landing/pricing de terceiro | IP / desnecessário |
| Pegar senha/conta alheia | antiético e inútil |
| Dependência de binário alheio | stack CD basta |
| “Só chat sem missão/custo” | não prova o modelo |
| Feature spam antes de budget | quebra confiança |

---

## 9. DEFINIÇÃO DE PRONTO (produto mínimo honesto)

User consegue **sem você na call**:

1. Criar conta / logar no HUB  
2. Gerar key Arsenal  
3. Ler “primeiros passos”  
4. Criar missão com budget  
5. Ver agents/roles rodando  
6. Ver custo  
7. Estourar budget com stop  
8. Ver item no roadmap do produto  

Se 1–8 ok → o Sonnet entregou o **núcleo**.  
Resto é evolução (P5).

---

## 10. Mensagem final pro implementador

> O usuário não quer o app de ninguém.  
> Quer o **entendimento** de instalação, primeiros passos, providers e roadmap  
> para o **Central Dark** nascer completo e coerente.  
> Construa em cima do que **já existe** (Arsenal, HUB, Hermes, MCP).  
> Prove valor com **missão + custo + paralelo de papéis**.
