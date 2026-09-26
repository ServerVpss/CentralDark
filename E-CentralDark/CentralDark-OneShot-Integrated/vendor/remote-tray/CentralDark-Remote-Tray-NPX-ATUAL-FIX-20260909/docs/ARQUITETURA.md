# CentralDark Remote Tray

Motor primeiro, design depois.

## Fluxo

capture -> verify -> operate -> re-capture/compare

## Entrada

`CentralDark-Remote-Tray.exe`

## Runtime

`%LOCALAPPDATA%\CentralDark\Remote-Tray`

## Regras

- PROCESSO_ATIVO != DEVICE_ONLINE
- UNKNOWN != PASS
- Sessao antiga invalida nao bloqueia codigo novo
- URL `/device/verify` abre automatico
- Codigo `XXXX-XXXX` vai para clipboard
