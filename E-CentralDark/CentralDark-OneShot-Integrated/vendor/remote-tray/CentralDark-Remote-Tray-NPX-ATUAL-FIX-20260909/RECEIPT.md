# RECEIPT · CentralDark Remote Tray Oficial

Feito: pacote reconstruído a partir do Tray que funcionava com ícone ao lado do relógio.

Inclui:
- `CentralDark-Remote-Tray.exe`
- `ABRIR-CENTRALDARK-REMOTE-TRAY.cmd`
- `engine/CentralDark-Remote-Tray.ps1`
- `engine/CentralDark-Remote-Parser.psm1`
- `assets/CentralDark-Remote-Tray.ico`
- harness e fixtures de autenticação.

Correção de direção:
- abandonar ONE-EXE pelado como caminho oficial;
- reusar Tray existente;
- manter login/code flow;
- bloquear V2/V3/V4/V5.

Estado:
`FILE_READY=PROVED`
`CASA_RUNTIME=UNKNOWN`
`PING_PONG=UNKNOWN`


## Regressão corrigida em 2026-09-09
- REUSE_BEFORE_CREATE=true
- Owner preservado: CentralDark Remote Tray
- Pacote Desktop Commander alinhado ao comando atual provado `@wonderwhy-er/desktop-commander@latest` porque esse foi o fluxo visto online ao fluxo de autorização/device-code observado anteriormente.
- Não cria V2/V3/V4/V5.
- O Tray continua responsável por detectar `verification_url` + `user_code`, copiar o código e abrir o navegador.
- UNKNOWN != PASS: conexão atual só vira verde após PING/PONG real.
