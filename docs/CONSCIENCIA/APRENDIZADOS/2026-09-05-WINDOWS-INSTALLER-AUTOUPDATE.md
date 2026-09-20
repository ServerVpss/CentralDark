---
title: "2026 09 05 WINDOWS INSTALLER AUTOUPDATE"
date: 2026-09-07
tags: ["consciencia"]
updated: 2026-09-07
---

# 📦 CentralDark Windows Installer — contrato persistente

📜 **“Tudo seja feito com ordem.”**

## Intenção

Transformar a capacidade já existente do Desktop em um instalador Windows simples, padrão e repetível sem criar outro motor de empacotamento.

## Owners canônicos

- Desktop: `apps/modulos/Bolt/source/`
- Instalador: `apps/modulos/Bolt/source/electron-builder.yml`
- Auto-update: `apps/modulos/Bolt/source/electron/main/utils/auto-update.ts`
- Ícone Windows: `apps/modulos/Bolt/source/assets/icons/icon.ico`
- Build local: `scripts/windows/build-centraldark-installer.ps1`
- CI: `.github/workflows/centraldark-desktop-windows-installer.yml`
- Contraprova determinística: `scripts/ci/verify_windows_installer_contract.py`

## Lei

```text
REUSE_BEFORE_CREATE=true
INSTALLER_ENGINE=electron-builder
WINDOWS_TARGET=NSIS
SETUP_FORMAT=.exe
INSTALLER_ICON=assets/icons/icon.ico
AUTO_UPDATE_ENGINE=electron-updater
UPDATE_METADATA=latest.yml
PACKAGE_HASH=SHA256
ONE_INSTALLER_OWNER=true
NO_INNO_SETUP_PARALLEL=true
NO_VELOPACK_PARALLEL=true
NO_SECOND_UPDATER=true
```

## Funcionamento persistente

O sistema não é uma receita de uma execução única.

Toda alteração material no Desktop, no contrato de instalador ou no workflow entra no mesmo mecanismo:

```text
main
→ installer contract
→ Windows runner
→ pnpm --frozen-lockfile
→ Desktop contract tests
→ NSIS build
→ CentralDark-Setup-<version>-x64.exe
→ latest.yml / blockmap
→ SHA256SUMS.txt
→ artifact
```

Tags `desktop-v*` podem promover os mesmos artefatos para GitHub Releases, que é a fonte já declarada pelo updater existente.

## Zero regressão

- `BUILD_CREATED != INSTALLED`
- `ARTIFACT_UPLOADED != AUTO_UPDATE_DELIVERED`
- `latest.yml` sem release consumível não prova update E2E.
- auto-update de repositório privado depende da autenticação disponível ao runtime; token/cookie nunca entra no código ou no pacote.
- erro de build vira minério/receipt; não é apagado.
- mudança no instalador deve melhorar o owner existente, não criar `installer-v2`.

## Varredura autônoma

O contrato do instalador é determinístico. Se qualquer owner desaparecer ou deixar de conter os marcadores mínimos, `verify_windows_installer_contract.py` falha e bloqueia o build.

A autonomia deve repetir apenas o cone causal ainda falho:

```text
DETECT_FAIL
→ OWNER
→ MINIMUM_DELTA
→ VERIFY
→ BUILD
→ HASH
→ RECEIPT
→ FIXED_POINT
```

Claim já provado só reabre com causa material nova.

## Estado na cristalização

Já existia antes deste delta:

- Electron Desktop;
- `electron-builder`;
- NSIS Windows;
- ícone `.ico`;
- `electron-updater`;
- `centraldark:build:win`;
- feed GitHub privado configurado.

Este delta adiciona somente o que faltava para operação repetível: build CI, receipt, hash, contrato e script local Windows.
