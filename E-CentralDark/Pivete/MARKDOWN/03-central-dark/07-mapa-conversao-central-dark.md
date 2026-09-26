# 07 — Mapa de conversão: padrão multi-agent → Central Dark

**Objetivo:** transformar entendimento de mercado em **plano de produto seu**, sem copiar concorrente.

**Base de estado (2026-07-10):** dossiê Arsenal/HUB (gateway vivo, Abacus conectado, PM2 modules, HUB Supabase).

---

## 1. Tradução de conceitos

| Conceito de mercado | Conceito Central Dark | Onde vive hoje |
|---------------------|----------------------|----------------|
| Multi-agent IDE / cockpit | **HUB Cockpit / Mission Room** | `hub/` (parcial) |
| Piloto / Orchestrator | **Hermes + Arsenal modes** | `HERMES-CORE/`, `hermes-thinker/` |
| Panes paralelos | **Agent sessions / missions** | a unificar |
| Squad por papel | **Roles + hub_capabilities** | `hub_capabilities`, regras Arsenal |
| Model barato/bulk | **Abacus models via gateway** | RouteLLM 100+ models |
| Model flagship | **arsenal-parallel / debate / modelo top** | adapter `:8090` |
| Cost tracker | **audit_log_api + ai_requests + UI custo** | parcial (audit shadow) |
| Cost cap | **budget policy + hard stop** | a implementar |
| Catálogo agents/skills | **MCP tools + catálogo HUB** | MCP `:9100` |
| ClockVoice / voz | **centraldark-voice** | módulo existe |
| Discord community | **Telegram grupo Evolução + canais** | bots vivos |
| BYOK providers | **oauth-broker + keys user + gateway key** | parcial |
| Billing assinatura | **Stripe/EFI no HUB** | secrets EFI existem; Stripe a formalizar |
| Auth | **Supabase Auth HUB** | vivo |
| Releases desktop | **Web HUB first** (desktop opcional depois) | HUB web |
| Playbook grant | **Playbook Arsenal / packs** | a criar (seu growth) |

---

## 2. Você já tem vs falta (gap analysis)

### Já tem (ativos reais)

```
✅ Gateway OpenAI-compat público (9 modes/aliases)
✅ Upstream Abacus com dezenas/centenas de modelos
✅ ArsenalAdapter (router/parallel/debate/hermes)
✅ Auditoria shadow → HUB
✅ HUB Supabase (roles, policies, approvals, connectors)
✅ MCP server (muitas tools)
✅ Hermes core / thinker
✅ Voz (centraldark-voice)
✅ Memória API
✅ OAuth broker
✅ PM2 ecosystem na VPS
✅ Observabilidade parcial (telegram, status)
```

### Falta para “app multi-agent completo no SEU modelo”

```
❌ Mission Room unificada (UI de missão com N agents)
❌ Squad templates first-class no HUB
❌ Cost meter $ por missão/agent (não só log técnico)
❌ Budget hard-stop por plano/missão
❌ Entitlements claros (plano → max_parallel, features)
❌ Onboarding “1ª missão em 10 min”
❌ Relatório semanal de economia/uso pro user
❌ Auth enforce real no gateway (sair de shadow em prod)
❌ Super-admin-status edge (hoje 404)
❌ Proxy health degradado (corrigir)
❌ Catálogo público de squads/skills “Central Dark”
```

---

## 3. Arquitetura alvo Central Dark (conversão)

```
                         ┌─────────────────────────────┐
  User (browser) ───────►│  HUB Web (centralldark)     │
                         │  - Mission Room             │
                         │  - Squad builder            │
                         │  - Cost dashboard           │
                         │  - Billing / keys           │
                         └──────────────┬──────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
     ┌────────────────┐      ┌──────────────────┐      ┌─────────────────┐
     │ Hermes / Orch  │      │ MCP :9100        │      │ Policy/PDP      │
     │ plan + roles   │      │ tools reais      │      │ approvals       │
     └───────┬────────┘      └────────┬─────────┘      └────────┬────────┘
             │                        │                         │
             └────────────┬───────────┴────────────┬────────────┘
                          ▼                        ▼
                 ┌──────────────────┐    ┌──────────────────┐
                 │ Arsenal Adapter  │    │ Metering/Audit   │
                 │ :8090            │    │ api.* tables     │
                 │ modes multi-IA   │    │ cost views       │
                 └────────┬─────────┘    └──────────────────┘
                          ▼
                 ┌──────────────────┐
                 │ Abacus RouteLLM  │
                 │ (+ fallback OR)  │
                 └──────────────────┘
```

---

## 4. Modelo de negócio Central Dark (convertido)

### Oferta recomendada (híbrida)

| Camada de receita | O que é | Exemplo de naming (seu) |
|-------------------|---------|-------------------------|
| **HUB Access** | assinatura do cockpit | Central Dark HUB Free / Pro / Team |
| **Arsenal Usage** | créditos ou fair-use no gateway | Arsenal Credits / Unlimited Pro |
| **BYOK boost** | user cola keys próprias + orquestra no HUB | “Traga sua key” |
| **Add-ons** | voz, memória longa, seats, SLA | Voice Pack, Memory Pro |
| **Services** (opcional) | setup, automação sob medida | Ops / deploy assist |

### O que NÃO copiar

- Nome Boost/Boost Pro
- Preço e copy de terceiros
- Dependência de grant Xiaomi como tese central
- Branding “multi-agent IDE pra Claude Code” como identidade

### Tese Central Dark

> **“Gateway + conselho de IAs + políticas + cockpit de missões.”**  
> Não é só IDE de um CLI. É **plataforma**.

Isso é diferencial real: Arsenal Parallel/Debate + PDP + MCP + Telegram ops.

---

## 5. Papéis (roles) no DNA Central Dark

| Role de mercado | Role Central Dark | Implementação sugerida |
|-----------------|-------------------|------------------------|
| Orchestrator | **Hermes Conductor** | Hermes-core |
| Scout | **Recon** | elite-recon / scout agent |
| Builder | **Crafter / Artifacts** | artifacts-builder |
| Reviewer | **Judge** | arsenal judge / modo debate |
| Executor | **Worker barato** | arsenal-router + model cheap |
| Council | **Arsenal Parallel/Debate** | modes existentes |
| Autônomo | **Hermes mode** | arsenal-hermes |

---

## 6. Roadmap de conversão (ordem de implementação)

### Fase 0 — Contexto (esta pasta) ✅
Entendimento + mapa + prompt VPS

### Fase 1 — Fundações de dinheiro e verdade
1. Definir planos e entitlements no HUB
2. Metering: token → $ (price table versionada)
3. Dashboard de custo por user/missão
4. Auth enforce no gateway (gradual)

### Fase 2 — Mission Room MVP
1. Criar missão (goal + budget + squad)
2. Rodar 1 conductor + 2 workers
3. Timeline + status + cancel
4. Hard stop budget

### Fase 3 — Squads & catálogo
1. Templates (bugfix, feature, research, debate)
2. UI de montar squad
3. Publicar catálogo Central Dark (skills/MCP packs)

### Fase 4 — Diferenciação
1. Approvals nas tools perigosas
2. Memória por missão/projeto
3. Voz no cockpit
4. Relatório semanal automático (Telegram/email)

### Fase 5 — Polimento comercial
1. Onboarding 10 min
2. Status page limpa
3. Docs para Sonnet/VPS e para user
4. Pricing público Central Dark

---

## 7. Regras anti-cópia (para a IA da VPS)

1. **Não** reutilizar nomes de produto/planos de terceiros  
2. **Não** clonar layout/landing palavra por palavra  
3. **Não** puxar código de repo alheio  
4. **Sempre** preferir módulos em `/root/CentralDark/apps/modulos/`  
5. **Sempre** gravar audit e respeitar PDP  
6. **Sempre** OpenAI-compat no gateway (clientes existentes)  
7. Branding: Central Dark / Arsenal / Hermes / HUB  

---

## 8. Definição de pronto (DoD) do “app parecido no meu modelo”

O app está “convertido” quando:

- [ ] User loga no HUB e cria uma Mission  
- [ ] Mission usa Arsenal (não CLI de terceiro como dependência única)  
- [ ] ≥2 agents/roles em paralelo ou pipeline  
- [ ] Custo $ aparece live e no histórico  
- [ ] Budget cap funciona  
- [ ] Plano do user limita parallel/features  
- [ ] MCP tools entram no fluxo com policy  
- [ ] Nada disso depende de copiar app externo  

---

## 9. Frase para alinhar o time/IA

> Overclock (mercado) ensina o **padrão**: cockpit + papéis + custo + assinatura.  
> Central Dark implementa o **padrão** com **Arsenal + HUB + MCP + Hermes + Abacus**.  
> Resultado: produto **próprio**, modelo **híbrido**, stack **já existente**.
