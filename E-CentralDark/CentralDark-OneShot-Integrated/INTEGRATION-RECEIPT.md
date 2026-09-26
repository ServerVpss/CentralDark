# CentralDark OneShot Integrated

Este pacote cristaliza, no mesmo envelope, as capacidades entregues nesta sessão:

- CentralDark Bridge builder/UI;
- CentralDark Remote Tray NPX;
- Desktop Commander `dist` (filesystem, terminal, process, search, remote-device/channel/auth);
- BridgeMind One state/capability snapshot;
- WebView2 Fixed Version Runtime fornecido pelo usuário;
- Microsoft Cognitive Services Speech core fornecido pelo usuário;
- detector/launcher de Screenpipe existente na Casa;
- payload VPS já preparado no builder.

## Regra

`RUN-EVERYTHING.cmd` não instala uma segunda cópia de Screenpipe. Ele reutiliza uma instalação existente quando encontrada, inicia o Remote Tray empacotado, mede a porta MCP 9100 e compila/abre o Bridge.

## Segurança / provenance

Arquivos `.key` e certificados enviados separadamente não foram copiados para o pacote integrado. Nenhum segredo novo foi criado. `UNKNOWN != PASS`.

## Estado

- PACKAGE_ASSEMBLY=PASS
- WINDOWS_RUNTIME_EXECUTION=REQUIRES_TEST_ON_SEGREDO
- VPS_DEPLOY=NOT_EXECUTED_HERE
