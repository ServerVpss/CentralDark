---
title: "12 PASTA OFICIAL BOT"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 12 — Pasta oficial do Bot WhatsApp (REGRA INQUEBRÁVEL)

**Decisão registrada:** 2026-06-10

## Regra

A pasta oficial do bot WhatsApp (frontend que serve `bot.multizap.dev` / `bot.centralldark.com`) é:

```
CentralDark/apps/bot/
```

No repo: `CentralDark/apps/bot/`
Na VPS: `/root/CentralDark/apps/bot/`

## O que NÃO é oficial

- `apps/bot/` (raiz do repo) — DEPRECATED, mantida só por compatibilidade temporária. Tem arquivo `DEPRECATED.md` na raiz dela.
- `/root/apps/bot/` (VPS) — vestígio do legado `/root/Multizap/apps/`. Não usar.
- Qualquer pasta com sufixo `.aposentada-*` — lixo de migração mal feita. Mover pra `/root/CentralDark/quarantine/`.

## Por quê

- Estrutura nova oficial é `CentralDark/apps/` (registrada em `04-ESTRUTURA-VPS.md`).
- Caddy em produção: `bot.multizap.dev { root * /root/CentralDark/apps/bot/dist }`.
- Manter duas pastas paralelas causou divergência grave em 2026-06-10 (relatório: `docs/RELATORIOS/2026-06-10-bot-duplicado-vps.md`).

## Regras operacionais

1. **Toda feature nova do bot vai em `CentralDark/apps/bot/`.** Nunca em `apps/bot/`.
2. **Build oficial:** `cd CentralDark/apps/bot && npm ci && npm run build`. Caddy serve o `dist/`.
3. **Nenhum script pode renomear pasta de app oficial sem registrar no repo.** Se precisar aposentar uma pasta, o script tem que: (a) commitar a mudança no repo, (b) atualizar Caddy se necessário, (c) criar relatório em `docs/RELATORIOS/`, (d) atualizar pendência.
4. **Working tree da VPS NÃO é staging.** Qualquer mudança real vai no repo primeiro, VPS só reflete via `git pull`.
5. **Se `git status` na VPS mostrar `D` em arquivos de pasta oficial:** PARAR, auditar (não apagar, não commitar). Restaurar via `git checkout --`.

## Como remover `apps/bot/` no futuro

Quando o `bot.multizap.dev` rodar estável servindo de `CentralDark/apps/bot/dist` por 7 dias:

1. Apagar `apps/bot/` no repo.
2. Mover `/root/apps/bot/` pra `/root/CentralDark/quarantine/apps-bot-legacy-AAAAMMDD/`.
3. Apagar `apps/bot/DEPRECATED.md`.
4. Atualizar este arquivo removendo a seção "O que NÃO é oficial → `apps/bot/`".
5. Fechar pendência em `docs/PENDENCIAS.md`.

## Aprendizado complementar

Ver `docs/CONSCIENCIA/APRENDIZADOS.md` — entrada de 2026-06-10 sobre "pasta paralela na VPS".
