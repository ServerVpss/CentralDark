# CentralDark Remote Bridge — para que serve

Este é o fio único do bridge Casa/VPS. Ele não cria outro sistema.

## O que ele faz

1. Abre o Desktop Commander Remote.
   - Serve para a VPS/Hermes enxergar a Casa quando o dispositivo `SEGREDO` está online.
   - Prova esperada: `Device ready`, `Device ID`, `Device Name: SEGREDO`.

2. Mantém contexto local do Screenpipe.
   - Serve para deixar um resumo recente da tela em `GARIMPO-CHEFE/context/screenpipe-latest.json`.
   - Isso fica na Casa; não joga token no repo.

3. Usa GitHub pelo `gh` local/keyring.
   - Fluxo correto: `gh auth login` no próprio host, depois `gh auth status`.
   - Não copiar refresh token para `.env`, log ou arquivo.

4. Abre túneis Tailscale pelo próprio bridge.
   - MCP local: `tailnet:9100 -> 127.0.0.1:9100`.
   - Hermes dashboard: `https tailnet -> 127.0.0.1:8787`.
   - VSCode temporário: só quando `CENTRALDARK_VSCODE_TAILSCALE_PORT` e `CENTRALDARK_VSCODE_LOCAL_TARGET` estiverem definidos.

## Como rodar na Casa

PowerShell:

```powershell
cd E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\CentralDark-OneShot-Integrated-GIGANTE\CentralDark-OneShot-Integrated\vendor\desktop-commander-dist
npx @wonderwhy-er/desktop-commander@latest remote
```

Pelo owner do repo, preferir:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remote-bridge\CentralDark-Remote-Bridge.ps1
```

Para compilar o exe canônico no Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remote-bridge\Build-Remote-Bridge.ps1 -OpenAfterBuild
```

## Como ler o estado

- 🟢 `Device ready` = ponte remota conectada.
- 🔴 `Failed to reload config: Unexpected end of JSON input` = JSON local do Desktop Commander quebrado/vazio. A ponte pode estar online e ainda assim o config local estar doente.
- 🟢 `gh auth status` PASS = GitHub deve usar keyring local.
- 🟢 porta Tailscale aberta = túnel vivo; autenticação do app ainda é separada.

## Contraprova rápida

```powershell
gh auth status
gh repo view ServerVpss/CentralDark
gh pr list --repo ServerVpss/CentralDark --state open --limit 30
```

Sem `gh auth status` verde, não declare GitHub integrado.
