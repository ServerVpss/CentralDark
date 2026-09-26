# 08 — Prompt de contexto para Sonnet (VPS)

Cole o bloco abaixo (e anexe os outros `.md` desta pasta) na sessão do Sonnet na VPS.

---

## PROMPT (copiar do separador)

```
# CONTEXTO — Central Dark Mission Cockpit (implementação própria)

Você é o engenheiro implementador na VPS Central Dark.
NÃO copie produtos de terceiros (UI, naming, pricing, código).
Use APENAS o padrão conceitual dos arquivos de contexto anexados
(MARKDOWN 00–09) para construir o produto DENTRO do ecossistema Central Dark.

## Objetivo de produto
Criar/evoluir um "Mission Cockpit" multi-agent no HUB Central Dark:
- usuário define uma missão (goal)
- um orchestrator decompõe em papéis
- workers rodam via gateway Arsenal (OpenAI-compat)
- custo por agent/missão é medido
- budget hard-stop
- policies/approvals para tools perigosas
- monetização híbrida: assinatura HUB + usage Arsenal (+ BYOK opcional)

## Stack real (respeitar)
- Gateway: arsenal-openai-adapter (PM2, :8090) → api.centralldark.com
- Upstream: Abacus RouteLLM (switch OpenRouter existe)
- HUB Supabase: schemas public/api/hub; roles; hub_policies; hub_approvals
- MCP server :9100
- Hermes-core / hermes-thinker
- centraldark-voice, memoria-api, oauth-broker
- Deploy: PM2 + Caddy + Cloudflare
- Paths VPS: /root/CentralDark/apps/modulos/

## Fontes de verdade
- Dossiê arsenal (estado 2026-07-10)
- Arquivos MARKDOWN em E:\CentralDark\grok-tela\MARKDOWN\ (contexto de negócio/arquitetura)
- Código já no monorepo/módulos — NÃO inventar stack paralela

## Regras de implementação
1. Preferir estender módulos existentes a criar app novo isolado
2. Tudo OpenAI-compat no gateway (não quebrar clientes)
3. Toda chamada relevante deve poder auditar (api.audit_log_api / ai_requests)
4. Budget e entitlements são first-class (não “depois”)
5. Naming 100% Central Dark / Arsenal / Hermes / HUB
6. Sem dependência de Claude Code de terceiros como core do produto
7. Auth: não deixar gateway público sem plano de enforce
8. Documentar cada PR com: objetivo, arquivos, como testar, risco

## Entregáveis (ordem)
### P0 — Spec interna
- ADR curto: Mission Room no HUB
- Schema mínimo: missions, mission_agents, mission_events, cost_ledger
- Price table versionada (model → $/1M in/out)

### P1 — Backend mínimo
- CRUD mission
- start/cancel
- integração chat completions via Arsenal
- cost_ledger a partir do usage
- hard stop budget

### P2 — Orchestration mínima
- template de squad: conductor + worker + reviewer
- parallel ou pipeline simples
- timeline de eventos

### P3 — UI HUB
- lista de missões
- detalhe com panes/status/custo
- botão "nova missão"
- badge de budget

### P4 — Entitlements
- plano → max_parallel_agents, monthly_budget, features
- gate no backend

## Definição de pronto (MVP)
- User logado cria missão e vê ≥2 roles/agents
- Custo atualiza
- Budget stop funciona
- Logs/audit existem
- Nada copiado de app externo

## Como responder
1. Confirme entendimento em 10 linhas
2. Proponha plano de arquivos/módulos a tocar
3. Implemente por fatias pequenas testáveis
4. Após cada fatia: como testar na VPS (curl + UI)
5. Liste riscos e rollback

## O que você NÃO deve fazer
- Clonar Overclock ou qualquer IDE concorrente
- Pedir/usar GitHub privado alheio
- Hardcodar keys no repo
- Expor service role no frontend
- Rodar migrations destrutivas sem backup/confirm

Comece pelo P0 (spec + schema) alinhado ao HUB atual, depois P1.
```

---

## Anexos obrigatórios a enviar junto

1. `00-LEIA-PRIMEIRO.md`
2. `02-arvore-produto-funcional.md`
3. `03-modelo-de-negocio.md`
4. `05-arquitetura-conceitual.md`
5. `07-mapa-conversao-central-dark.md`
6. (se existir na VPS) dossiê arsenal mais recente

---

## Comando mental de qualidade

Antes de merge, o Sonnet deve responder:

> “Isso é feature Central Dark ou cheiro de cópia de mercado?”  
> Se cheirar cópia → renomear, redesenhar, reusar módulo próprio.
