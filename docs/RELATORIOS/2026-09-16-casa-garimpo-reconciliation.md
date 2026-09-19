# Reconciliação Casa → GitHub main → VPS

Data: 2026-09-16
Fonte canônica: `ServerVpss/CentralDark@main`
Casa medida: `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE`
VPS canônica: `/var/lib/centraldark/canonical-main`
VPS runtime operacional: `/root/CentralDark`

## Regra aplicada

Casa é fonte de deltas, não autoridade automática. A autoridade de publicação é o GitHub oficial `origin/main`, validado antes de microdeploy.

```text
SOURCE_CASA != AUTHORITY
CURRENT_GITHUB_MAIN = AUTHORITY
UNKNOWN != PASS
SECRET != MAIN
RUNTIME_ONLY != RESET
```

## Lote 1 promovido

Owner: Remote Desktop Commander / CentralDark Remote MCP Gateway.

Promovido para `main`:

- `infra/systemd/centraldark-desktop-commander.service`
- `infra/systemd/centraldark-desktop-commander-watchdog.sh`
- `infra/systemd/centraldark-desktop-commander-watchdog.service`
- `infra/systemd/centraldark-desktop-commander-watchdog.timer`
- `infra/systemd/centraldark-desktop-commander-conta2.service`
- `infra/systemd/centraldark-desktop-commander-conta2-watchdog.service`
- `infra/systemd/centraldark-desktop-commander-conta2-watchdog.timer`
- `apps/modulos/Bolt/source/resources/runtime/manifest.json`
- `apps/modulos/Bolt/source/scripts/centraldark-desktop-contract.test.mjs`
- `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md`
- `docs/HANDOFF/2026-09-09-remote-auth-observability-receipt.md`

Prova runtime:

- `centraldark-desktop-commander.service = active`
- `centraldark-desktop-commander-conta2.service = active`
- `centraldark-desktop-commander-watchdog.timer = active`
- `centraldark-desktop-commander-conta2-watchdog.timer = active`
- Conta 2: `Device ID assigned`, `Channel subscribed`, `Device marked as online`, `Device ready`.

## Casa / GARIMPO — classificação inicial

### USEFUL_DELTA já absorvido

- `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909/MANIFEST.json`
- `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909/README-PRIMEIRO.txt`
- `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909/RECEIPT*.md`
- `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909/receipts/VERIFY.json`

Absorção: não foi promovido o ZIP/EXE; foi promovido o contrato canônico: pin provado `@wonderwhy-er/desktop-commander@0.2.48`, login URL, multi-conta por `HOME` isolado e watchdog por perfil.

### SECRET / VAULT_ONLY

Não promover para Git:

- `.env`
- `.ssh/`
- `.claude*/`
- `.codex/`
- `.grok/`
- `.hermes/`
- `.config/`
- `.pm2/`
- qualquer arquivo de sessão, token, chave, conta ou cofre local.

### GENERATED / CACHE / DEPENDENCY

Não promover sem owner explícito:

- `.cache/`, `.cache.zip`
- `.cargo/`
- `.bun/`
- `.gradle/`
- `.dotnet/`
- `node_modules/`
- `target/`, `dist/`, `build/`
- pastas `_files` exportadas de navegador
- ZIPs grandes e pacotes extraídos duplicados.

### UNKNOWN preservado

Material de pesquisa e pacotes extraídos em `GARIMPO-CHEFE` ficam preservados na Casa até classificação por owner. Não limpar nem copiar em massa.

## VPS runtime

`/root/CentralDark` está com deltas runtime e checkout detached; não usar `reset --hard` nem `git pull` cego ali.

Microdeploy aplicado somente por arquivo, com backup em:

```text
/root/CentralDark-Recovery/microdeploy-runtime-contract-20260916T175551Z
```

## Próximo lote recomendado

1. Classificar próximos owners por nome/raiz, não por cópia total.
2. Para cada owner: comparar Casa ↔ `origin/main` ↔ runtime.
3. Promover só delta pequeno com teste.
4. Microdeploy sequencial por arquivo/serviço.
5. Revalidar GitHub Actions, issues e PRs antes de declarar fixed point.
