# CentralDark Desktop — contrato de superfície única

Esta distribuição reaproveita o Bolt vendorizado como bancada da mesma CentralDark. Não cria segundo cérebro, segunda memória ou segundo Writer.

```text
SEGREDO/CHEFE
→ SOL (interface e janela flutuante)
→ CentralDark Desktop/Web (mesma aplicação Remix)
→ Hermes local em http://127.0.0.1:8787
→ owners/tools/memória/execução existentes
→ REALIDADE
```

## Superfícies

- Site: a aplicação Remix continua publicável como web.
- Windows: Electron empacota a mesma interface como `CentralDark`.
- Widget SOL: segunda janela do mesmo processo e da mesma sessão Electron.
- VS Code/CLI: continuam operando sobre a mesma Casa e o mesmo Hermes; não são clonados dentro do aplicativo.

## Casa local

No Windows, `CENTRALDARK_HOME` ou `APP_PATH_ROOT` define a Casa. Quando nenhum deles existe e `E:\CentralDark` está presente, esse caminho é adotado. Se o disco não existir, o aplicativo preserva o diretório padrão do sistema em vez de falhar ou mover estado destrutivamente.

## Hermes

`CENTRALDARK_HERMES_URL` permite substituir o padrão `http://127.0.0.1:8787`. A janela SOL mede `/health` e `/api/health`; `OFFLINE` é estado válido enquanto o runtime local ainda não foi iniciado.

## Atalhos

- `Ctrl+Shift+Space` no Windows/Linux ou `Cmd+Shift+Space` no macOS alterna o widget.
- Uma intenção enviada pelo widget abre a mesma conversa principal pelo parâmetro `prompt`, preservando cookies e armazenamento da sessão Electron.

## Build Windows local

```bash
cd apps/modulos/Bolt/source
corepack enable
pnpm install --frozen-lockfile
pnpm test:centraldark-desktop
pnpm electron:build:win
```

O instalador sai em `dist/`. Assinatura de código e publicação exigem credenciais externas próprias do owner; não ficam no repositório.

## Contraprova

```bash
node --test scripts/centraldark-desktop-contract.test.mjs
```

O teste bloqueia regressões de identidade, endpoint Hermes, widget, ponte Electron e isolamento do renderer.
