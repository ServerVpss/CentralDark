---
title: "04 ESTRUTURA VPS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 04 — Estrutura da VPS

VPS: `root@vmi3256920` (IP `89.117.78.124`).

## Estrutura ANTIGA (ainda em uso, migração gradual)

```
/root/Multizap/
├─ apps/
│  ├─ clone-deck/    ← repo principal (segredounlock/clone-deck)
│  ├─ bot/
│  ├─ crm/           ← NÃO MEXER sem confirmação
│  ├─ portal/
│  └─ web/
├─ api/
│  ├─ gateway/
│  ├─ whatsapp/qrcode/
│  ├─ webhooks/
│  └─ integrations/
├─ guarda/
│  ├─ scripts/
│  ├─ scans/
│  ├─ status/
│  └─ incidentes/
├─ quarantine/
└─ revisoes/         ← relatórios de cada ciclo de trabalho
```

## Estrutura NOVA OFICIAL (CentralDark — coisa nova já entra aqui)

Validado direto na VPS em 2026-06-05:

```
/root/CentralDark/
├─ apps/
│  ├─ install-callback/   ← landing + docs + bootstrap (install.centralldark.com)
│  └─ mcp/                ← servidor MCP CentralDark (porta 9100)
├─ infra/
│  ├─ caddy/              ← snippets de proxy (mcp.Caddyfile etc.)
│  └─ pm2/                ← ecosystems (mcp.pm2.json etc.)
├─ scripts/
│  └─ installer/
├─ logs/
│  └─ mcp/
├─ secrets/               ← mcp.env, lovable.env, cloudflare.env
├─ revisoes/              ← relatórios de operações na nova árvore
└─ memoria-consciencia/   ← memória privada do agente ChatGPT
```

**ATENÇÃO:** tudo minúsculo, SEM `APP/`. Versões antigas da doc falavam em `/root/CentralDark/APP/{site,modulos,servidor-whatsapp,gateway,...}` — aquilo era um plano que nunca virou realidade. A árvore acima é a que existe de fato.

E também:

```
/root/CentralDark/memoria-consciencia/   ← memória privada do agente ChatGPT
```

## Regra de migração

**NÃO mover** pastas antigas (`/root/Multizap/...`) sem confirmação do usuário. Migração é gradual e manual.

## Repo principal na VPS

```
/root/Multizap/apps/clone-deck
```

É clone do `segredounlock/clone-deck`. Sincronizado pelo cron `gh-pull` a cada 5 min.

## Docs por pasta (regra)

TODA pasta (no repo e na VPS) precisa ter:
- `README.md` — o que é
- `PLANO.md` — o que falta

Criar junto com a pasta. Ler antes de mexer. Atualizar ao terminar.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
