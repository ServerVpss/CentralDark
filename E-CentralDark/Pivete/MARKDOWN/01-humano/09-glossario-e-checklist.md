# 09 — Glossário + checklist de implementação

## Glossário (padrão → Central Dark)

| Termo de mercado | Significado | Nome sugerido CD |
|------------------|-------------|------------------|
| Cockpit | UI multi-agent | Mission Room |
| Pane | Janela/sessão de um agent | Agent Session |
| Piloto / Orchestrator | Decompõe missão | Hermes Conductor |
| Squad | Time de papéis | Squad / Arsenal Team |
| Role | Papel (scout, builder…) | Role |
| Mission | Unidade de trabalho | Mission |
| Cost tracker | $ live | Cost Ledger |
| Cost cap | Teto de gasto | Budget Guard |
| BYOK | User traz API key | BYOK |
| Provider | Anthropic, OpenAI… | Provider / Upstream |
| Gateway | Proxy OpenAI-compat | Arsenal Adapter |
| Entitlement | Direito do plano | Entitlement |
| Soft launch / Alpha | Produto instável cedo | Alpha CD |
| Roadmap / Direção | Plano de produto | Roadmap HUB |
| Grant / bolsa | Tokens grátis de 3º | (opcional; não base do $) |
| ClockVoice | Voz no cockpit | CentralDark Voice |
| Catalog | Agents/skills | MCP Catalog |

---

## Checklist: entendimento (você)

- [ ] Sei o que se vende (cockpit) vs o que o user paga fora (token)
- [ ] Sei as 5 páginas e o papel de cada no funil
- [ ] Sei papéis ≠ modelos
- [ ] Sei como o negócio se sustenta (assinatura + retenção + opcional usage)
- [ ] Sei o gap Central Dark (o que já tenho vs Mission Room)

## Checklist: implementação VPS (Sonnet)

### Dados
- [ ] `missions`
- [ ] `mission_agents`
- [ ] `mission_events`
- [ ] `cost_ledger`
- [ ] `price_table` versionada
- [ ] `plans` + `entitlements`

### Backend
- [ ] create/start/cancel mission
- [ ] chat via Arsenal
- [ ] metering token→$
- [ ] budget hard-stop
- [ ] policy hooks (approvals)

### UI HUB
- [ ] Dashboard
- [ ] Plans/Checkout
- [ ] Mission Room
- [ ] Keys
- [ ] Help (mínimo 5 artigos)
- [ ] Roadmap

### Ops
- [ ] audit ligado
- [ ] auth gateway planejado
- [ ] health endpoints
- [ ] docs para deploy

## Checklist: anti-cópia

- [ ] Zero naming de produto alheio na UI
- [ ] Zero copy colada da landing alheia
- [ ] Zero dependência de binário/repo alheio
- [ ] Features expressas com módulos CD

## Definition of Done (MVP negócio)

User consegue:
1. Entrar no HUB  
2. Ver/ativar plano  
3. Criar missão  
4. Ver ≥2 agents/roles  
5. Ver custo  
6. Estourar budget com stop  
7. Ler ajuda de primeiros passos  

Se 1–7 OK → o modelo está **aplicado**, não copiado.
