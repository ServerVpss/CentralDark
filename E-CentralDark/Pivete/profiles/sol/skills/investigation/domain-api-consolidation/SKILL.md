---
name: domain-api-consolidation
version: "1.0.0"
description: "Use when checking 1-domain-1-API setup."
author: Hermes Agent
license: MIT
tags: [domain, api, consolidation, investigation]
category: investigation
trigger:
  - 1-domino-1-api
  - investigation
metadata:
  hermes:
    tags: [domain, api, consolidation, investigation]
    related_skills: [centraldark-operational-method, forensic-recon, t0-integral-mapeamento, pivete-dialect-compact]
phases: "IDENTIFY → MAP → COMPARE → REPORT"
runtime_checks:
  - domain_catalog_complete
  - api_endpoint_catalog_complete
  - consolidation_opportunities_identified
  - local_data_cross_checked
failure_signature: "DOMAIN_API_CONSOLIDATION_INVESTIGATION_v1"
remediation_escalation: "n/a — investigação read-only"
provenance:
  sources:
    - "domain-api-consolidation/SKILL.md"
  tests: []
  receipts: []
counterproof: "N/A — investigação não altera estado"
fixed_point_contribution: "Resolves phase denominators: domain_catalog, api_catalog, consolidation_opportunities"
mantra: "MEDIR ANTES DE AFIRMARE. UNKNOWN != PASS. LISTAR TUDO QUE TÁ EXPPOSTO."
---

# Domain/API Consolidation Investigation

## Overview
Investigar se um site/apply opera com **1 domínio 1 API**, ou identificar oportunidades de consolidação de domains/APIs. Read-only: catalogar o que tá exposto, cruzar com configurações locais, relatar gaps.

## When to Use
- Usuário pergunta "meu site é apenas 1 domínio 1 API?"
- Precisa catalogar domains expostos e APIs/endpoints
- Planeja consolidar setup multi-domínio ou multi-API
- Checar se premissa arquitetural bate com realidade

## Phases

### 1. IDENTIFY — O que tá exposto
- Domínios registrados (DNS, subdomínios)
- Reverse proxies (Caddy, Nginx, PM2, Docker, etc)
- API endpoints expostos publicamente
- CORS origins declarados
- Portas abertas/escutas

### 2. MAP — Onde cada coisa mora
- Arquivos de config: docker-compose, ecosystem.config.js, Caddyfile, Nginx conf
- Docs de infra no repo
- Status panels, painel-data.json
- Arquivos com domínio (.env de DOMAIN, se não segredo)

### 3. COMPARE — 1:1 ou N:1?
- Conta de domains vs APIs
- Sobreposição: mesmo domínio expõe múltiplos backends?
- Múltiplos domains apontam para mesma API?
- Premissa "1 dominio 1 api" bate com o mapeado?

### 4. REPORT — O que encontrar
- Lista de domains encontrados
- Lista de APIs/endpoints encontrados
- Relação domain → backend
- Oportunidades de consolidação
- Gaps: o que não dá pra medir daqui

## Local-First Checks
Sempre começar pelo que tá no workspace antes de perguntar ou assumir:
- `docker-compose.yml` sob `apps/modulos` (escopo cirúrgico, não find solto)
- PM2 ecosystem/configs
- Arquivos de reverse proxy
- Docs de infra (ex: `docs/ARQUITETURA/INFRA-MAP.md`, `conselho-vivo.json`)

## External Checks (se disponível)
- `web_search` para DNS records, SSL certs, registros de domínio
- `curl`/`whois` se tiver acesso e não segredo
- OBS: web_search pode estar indisponível se `FIRECRAWL_API_KEY` não configurado

## Pitfalls
- **Não assumir 1:1 sem medir** — premissa do owner pode não bater com exposição real
- **Não confundir domínio interno com exposto** — localhost, docker internal, host.docker.internal não contam
- **Web search pode estar indisponível** — ter fallback read-only local
- **Não multiplicar problema novo por status repetido** — se domain já foi catalogado, não reler sem motivo

## Verification Checklist
- [ ] Domínios catalogados (expostos e internos separados)
- [ ] APIs/endpoints catalogados
- [ ] Relação domain → backend mapeada
- [ ] Oportunidades de consolidação identificadas
- [ ] Limitações de medição declaradas (UNKNOWN onde não alcançável)

## Baiano Dialect Notes (quando usuário usa Pivete)
- Dialeto fonético intencional ("supoeiror", "espançlaoa", "calaaibre") = **não erro**, interpretar intenção
- "OK" / "prossiga N" = **avançar**, não parar
- Ultra conciso, sem papagaio, sem tabela desnecessária
- Caminho completo clicável sempre que citar arquivo/pasta

## Formato de Resposta
```
DOMAIN_API_CONSOLIDATION — EXECUTADO
EVIDÊNCIA: <o que mediu>
FALTANTE: <o que não deu pra medir daqui>
CONSLIDÁVEIS: <oportunidades>
PRÓXIMO: <ação ou pergunta mínima>
```