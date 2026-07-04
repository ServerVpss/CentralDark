---
name: DNS wildcard centralldark.com
description: Cloudflare tem wildcard *.centralldark.com → 89.117.78.124, então qualquer subdomínio novo já resolve sem cadastrar nada.
type: infra
---

# DNS wildcard `*.centralldark.com`

- **NS oficial:** `cruz.ns.cloudflare.com` + `isaac.ns.cloudflare.com` (Cloudflare é a fonte da verdade, não o painel "Área do Cliente / Meus Domínios" do registrador).
- **Registros ativos no Cloudflare:**
  - `@` → `89.117.78.124`
  - `www` → `89.117.78.124`
  - `*` (wildcard) → `89.117.78.124`
- **Consequência prática:** subdomínio novo (`telepainel`, `install`, `status`, `webhook`, `qualquercoisa`, etc.) **já resolve automaticamente** pra VPS. Não precisa criar record A/CNAME manual pra cada um.
- **O que ainda precisa por subdomínio:** só o **bloco no Caddy** (`infra/caddy/`) pra emitir TLS + rotear pro serviço interno. DNS é zero-trabalho.
- **Como validar rápido:** `dig +short <qualquer>.centralldark.com @1.1.1.1` — tem que devolver `89.117.78.124`.
- **Verificado em:** 04/07/2026 (7 subdomínios testados, todos ✅).
