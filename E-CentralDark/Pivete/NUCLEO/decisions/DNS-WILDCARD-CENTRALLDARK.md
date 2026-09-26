# DECISAO - DNS-WILDCARD-CENTRALLDARK.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\DNS-WILDCARD-CENTRALLDARK.md
**SHA:** c9d873669edcc59d
**Timestamp:** 2026-08-28T02:56:48.501946
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Responsável pela decisão:** Pivete

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "DNS WILDCARD CENTRALLDARK"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# DNS Wildcard `*.centralldark.com` — Regra Oficial

**Data:** 04/07/2026
**Responsável pela decisão:** Pivete
**Categoria:** Infra / DNS
**Fonte da verdade:** Cloudflare (NS: `cruz.ns.cloudflare.com` + `isaac.ns.cloudflare.com`)

---

## Regra

Existe um **registro wildcard `*` no Cloudflare** apontando pra VPS `89.117.78.124`. Isso significa que **qualquer subdomínio novo de `centralldark.com` já resolve automaticamente** — sem precisar cadastrar record A/CNAME nenhum.

## Registros ativos no Cloudflare

| Nome | Tipo | Valor |
|------|------|-------|
| `@` | A | `89.117.78.124` |
| `www` | A | `89.117.78.124` |
| `*` | A | `89.117.78.124` |

## Consequência prática

- Subdomínio novo (`telepainel`, `install`, `status`, `webhook`, `qualquercoisa`, etc.) → **DNS já pronto, zero-trabalho**.
- O único passo restante por subdomínio é o **bloco no Caddy** (`infra/caddy/`) pra emitir TLS + rotear pro serviço interno correto.
- O painel "Área do Cliente / Meus Domínios" do registrador **não afeta nada** — a fonte da verdade é o Cloudflare.

## Como validar

```bash
dig +short <qualquer>.centralldark.com @1.1.1.1
# esperado: 89.117.78.124
```

Verificado em 04/07/2026 com 7 subdomínios (`www`, `telepainel`, `install`, `qualquercoisa`, `status`, `webhook`, `api`) — todos ✅.

## Referências cruzadas

- `infra/caddy/` — onde adicionar bloco por subdomínio novo
- `docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md` — este arquivo é a fonte oficial; espelho em `mem://` do Lovable é apenas cache

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

```