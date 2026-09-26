---
name: Repo GitHub real deste projeto Lovable
description: CORREÇÃO 2026-06-07 — este projeto Lovable empurra pra ServerVpss/CentralDark, não clone-deck
type: reference
---

# Repo real conectado ao Lovable

**Projeto Lovable ID:** `1e645027-6776-4ba2-954e-bd146816b67d`
**Repo GitHub conectado:** `ServerVpss/CentralDark` (branch `main`)
**Status:** Connected (verificado por screenshot da UI Lovable em 2026-06-07)

## Correção importante

A memória `mem://vps-git-origin-real` dizia que o Lovable empurra pra `ServerVpss/clone-deck`. **Isso está errado pra ESTE projeto.** O print de 2026-06-07 da tela `Git / GitHub` mostra:

- Repository: `ServerVpss/CentralDark`
- Branch: `main`
- Clone URL: `https://github.com/ServerVpss/CentralDark.git`

## Implicações operacionais

- A VPS deve puxar de `ServerVpss/CentralDark` (não de `clone-deck`).
- O fallback Lovable↔GitHub (`scripts/deploy/lovable-sync-fallback.sh`) precisa apontar pra `ServerVpss/CentralDark`.
- Espelho `segredounlock/clone-deck` segue sendo só pro GitHub farm/medalhas.
- Conferir origin atual da VPS em `/root/.git/config` — se ainda apontar pra `clone-deck`, está desincronizado da fonte real.

## Como confirmar sem print

Abrir a UI Lovable do projeto → Settings → Git/GitHub. O remote real só aparece lá; o `git remote -v` do sandbox mostra apenas o storage interno `git.private.lovable-gcp.code.storage`.
