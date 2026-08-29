---
title: "PLANO — Reconciliacao de Dominios (1 site + 1 API + 1 MCP)"
date: 2026-08-29
status: "PLANEJADO — Caddy/DNS aguardando veredito humano explicito"
---

# Reconciliacao de dominios — estado medido e plano de execucao

## Intencao do CHEFE

```text
1 DOMINIO RAIZ (centralldark.com)
├── SITE  -> https://centralldark.com/
├── API   -> https://api.centralldark.com/
└── MCP   -> https://mcp.centralldark.com/

Todo o resto = modulo/servico interno, sem virar dominio publico proprio.
```

## Estado medido (main @ 210782bb59e5b77e85ed2b8f1d06e45141c0c1e3)

- O SPA (`src/`) ja e **hibrido**, nao puramente host-based:
  - `src/compartilhado/utilitarios/hostRouting.ts` decide a landing da raiz
    `/` por `window.location.hostname` (`detectHostKind`).
  - `src/app/rotas/rotas-portal-publico.tsx` **ja expoe as mesmas landings
    por path**: `/whatsapp`, `/crm`, `/financeiro`, `/telepainel`.
  - Ou seja: o destino (produto acessivel por path dentro de um dominio so)
    ja existe no codigo. Falta so a raiz parar de depender do hostname.
- Hosts hoje detectados: `centralldark.com`/`www.` (portal),
  `telepainel.centralldark.com`, `whatsapp.centralldark.com`,
  `crm.centralldark.com`, `financeiro.centralldark.com`.
- Caddy serve o mesmo build estatico em cada subdominio com fallback SPA —
  nao ha logica de backend diferenciada por vhost, so roteamento de arquivo.
- Outros subdominios documentados em `docs/INSTALADOR/03-portas-e-rede.md`
  (`status.`, `app.`, `bot.`, `gateway.`, `webhook.`) sao superficies
  operacionais/infra, nao produto — entram numa segunda onda, prioridade
  menor que os hosts de produto (whatsapp/crm/financeiro/telepainel).
- Regra canonica ja existente em `docs/INSTALADOR/08-webhooks-e-deploy.md`:
  > "Nao aplicar Caddy reload nem cadastrar webhook real sem veredito
  > humano."

## Frentes de execucao

### 1. Frontend — baixo risco, reversivel via git revert

- `RaizPorHost` (em `rotas-portal-publico.tsx`) deixa de trocar de landing
  por hostname; passa a sempre renderizar `LandingCentralDark` na raiz.
- Hosts legados viram so uma tabela de redirect (host -> path), nao landing
  propria.
- Rotas por path ja cobrem o destino final — nao precisa criar nada novo,
  so parar de usar `detectHostKind` pra decidir o componente da raiz.

### 2. Caddy — alto risco, producao viva — REQUER VEREDITO HUMANO EXPLICITO

- Cada vhost de subdominio legado (`whatsapp.`, `crm.`, `financeiro.`,
  `telepainel.`) passa de "serve SPA build" para "redirect 301 para
  `https://centralldark.com/<path>`".
- `api.centralldark.com` e `mcp.centralldark.com` nao mudam — ja sao portas
  unicas, ja batem com a arquitetura alvo.
- Bloqueado pela regra canonica acima ate confirmacao explicita de humano
  antes de qualquer `systemctl reload caddy`.

### 3. DNS/Cloudflare — alto risco, quebra links em uso — REQUER VEREDITO HUMANO

- Nao remover registros DNS dos subdominios legados. Manter apontando pro
  mesmo servidor — o redirect 301 do Caddy resolve sem precisar mexer em
  DNS. Isso reduz o risco: da pra reconciliar sem cortar nenhum dominio
  nem quebrar bookmark/link externo.

## Fixed point desta rodada

- Estado medido, causa raiz identificada (SPA multi-host que ja tem
  caminho path-based pronto, nao falta construir nada novo).
- Plano registrado oficialmente, commitado em `main`.
- Nenhuma mutacao em Caddy/DNS/producao nesta rodada — respeitando a regra
  canonica de veredito humano ja existente no proprio projeto.
- Proxima rodada: aplicar a mudanca de `RaizPorHost` (frontend, baixo risco)
  como diff revisavel; so depois avancar pra Caddy com aprovacao explicita
  linha a linha.
