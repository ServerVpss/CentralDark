# CentralDarkBot · Limpeza definitiva e sincronização — recibo de execução

**Data:** 2026-11-16
**Executor:** Hermes
**Autoridade:** CHEFE
**Repositório canônico:** `ServerVpss/CentralDark@main`

## 1. O que já estava feito na `main`

A consolidação do CentralDarkBot como interface única de agentes **já estava publicada** na `main` antes desta rodada:

- `b6024ec7b5a` — aposentadoria do código ativo AionUI/Rakazo e integração do CentralDarkBot no Cockpit.
- `e8c7e1591b5` — reconciliação final (8 arquivos legados removidos, 5 arquivos de UI atualizados).

Arquivos legados removidos na `main`:

```
experiments/aionui-centraldark-instinto-superior/apply-overlay.py
experiments/aionui-centraldark-instinto-superior/build-prototype.sh
experiments/aionui-centraldark-instinto-superior/centraldark-bootstrap.ts
experiments/aionui-centraldark-instinto-superior/centraldark-bots-page.tsx
experiments/aionui-centraldark-instinto-superior/centraldark-cockpit-page.tsx
experiments/aionui-centraldark-instinto-superior/centraldark-maps-page.tsx
experiments/aionui-centraldark-instinto-superior/install-rakazo.sh
scripts/vps/aionui-native-integrate.py
```

## 2. Destino Samba e serviço consumidor — COMPROVADOS

- `V:\` → `\\192.168.35.130\CentralDark` (VM VMware/openKylin), sem `.git`.
- O consumidor real é o **dev server Vite do Cockpit na VM, porta 8080**.
- Prova: `GET http://192.168.35.130:8080/src/lib/modulos-cockpit.ts` devolvia o conteúdo **do disco em `V:`** (2 ocorrências de `aionui`), não o da `main`.

## 3. Delta aplicado

### 3.1 Casa (`F:\CentralDark`)

- Checkout estava em **detached HEAD** em `0b3d4179b91`, 57 commits atrás, com 38 entradas sujas.
- `.git/index.lock` órfão (0 bytes, 1 dia) de processo morto — removido após confirmar que nenhum `git.exe` rodava.
- Trabalho local preservado: `git stash push` apenas do arquivo em sobreposição, `merge --ff-only origin/main`, `stash pop`. O `SKILL.md` local voltou **byte-idêntico** (sha256 `909fc839…`).
- `main` local religada ao `origin/main`; HEAD final `af3601883f7`, 38 entradas sujas intactas.

### 3.2 VM (`V:`)

Backup em `V:/.auto-sync/backup-20261116/` antes de qualquer escrita.

- 8 arquivos legados copiados para backup e removidos.
- 5 arquivos de UI sobrescritos com a versão da `main` (verificado antes que `V:` era **mais antigo**, sem trabalho próprio nesses arquivos).
- 2 arquivos do fix de build sincronizados depois do merge.

### 3.3 `main` — PR #2078

`fix(cockpit): restore admin gate in github.functions and unblock SSR build`
Squash merge → `af3601883f7e207d00a67c33a88ac2c87c70eebf`

**Causa:** `github.functions.ts` importava `exigirAdmin` de `admin.functions.ts`, que não exporta esse símbolo. O build SSR quebrava com `"exigirAdmin" is not exported`. O Cockpit **não compilava na `main`**.

**Correção:** helper local fail-closed (403) no mesmo padrão de `maquina.functions.ts:86`. A verificação de segurança foi **restaurada**, não removida.

**Segundo item:** `DesignCenter.tsx` anunciava `fonte 0.2.1` com o manifesto em `0.2.5`, quebrando `verify:hud` (gate do `prebuild`).

## 4. Contraprovas

| Verificação | Resultado |
|---|---|
| `npm run build` (prebuild + vite + nitro) | exit 0 |
| `node --test scripts/verify-hud-zone.mjs` | 36 testes, 35 pass, 0 fail |
| `GET :8080/src/lib/modulos-cockpit.ts` | `centraldarkbot` ×2, `aionui` ×0 |
| `GET :8080/src/components/central/CockpitShell.tsx` | `CentralDarkBot` ×8, `AionUI` ×0 |
| `V:` vs `origin/main` (7 arquivos) | MATCH byte-exato |
| Readback remoto `main` | `github.functions.ts` e `DesignCenter.tsx` confirmados |

## 5. Pendências conhecidas

- `V:/.auto-sync/status.json` continua `conflict` (`Resolver seguro cd40.v1 · ↓375 ↑0 · dirty=90 · overlap=72 · auto=45 · conflitos=27`). Os 27 conflitos são de **outros arquivos**, fora do escopo desta missão; o reconciliador existente é o owner e não foi substituído.
- Restam 3 referências textuais a `aionui` em `V:` (`HudDeterministico.tsx`, `hud-migration.snapshot.json`, `styles.css`), **idênticas às da `main`**. São rótulos/snapshots históricos, não dependências executáveis. Alterá-las exige delta novo na `main`.
- O hook `pre-commit` falhava por ausência de PyYAML no `python3` do ambiente; instalado (`pyyaml 6.0.3`).

## 6. Regra aprendida

**Antes de escrever em `V:`, provar que o arquivo em `V:` é uma versão antiga da `main` e não trabalho próprio da VM.** Comparar `sha256` de `V:` contra `git show <commit>:<path>` em vários commits; se não casar com nenhum, inspecionar o diff antes de sobrescrever. Backup em `V:/.auto-sync/backup-<data>/` é obrigatório.
