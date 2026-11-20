# Receipt — CentralDark runtime pausado

- INTENÇÃO: pausar o runtime CentralDark antes da migração para o openKylin nativo.
- OWNER: `K:\` / `K:\apps\instinto-superior` / `K:\apps\modulos\mcp` / `openKylin`.
- DATA_LOCAL: 2026-10-31T16:34:00-03:00
- ESCOPO: somente runtimes CentralDark e WSL; Windows, ChatGPT e o agente desta sessão não foram desligados.

## Estado antes

- `127.0.0.1:8080`: Cockpit Vite, PID 30604.
- `127.0.0.1:9101`: CentralDark Casa Commander, PID 11960.
- `127.0.0.1:8642`, `127.0.0.1:8644`, `127.0.0.1:9900`: Hermes Gateway, PID 22276.
- `127.0.0.1:11435` e `127.0.0.1:49734`: Screenpipe, PID 23864.
- Script CentralDark temporário: PID 17456.
- Processo auxiliar `centraldark-casa-commander.py`: PID 29744.
- `docker-desktop` e `openKylin`: WSL registrado.

## Ação

- Encerrados os PIDs 30604, 11960, 22276, 29744, 23864 e 17456.
- Executado `wsl.exe --shutdown`.
- Nenhum arquivo, partição, VHDX ou configuração foi apagado ou movido.

## Readback

- `8080`: sem listener.
- `8099`: sem listener.
- `8642`: sem listener.
- `8644`: sem listener.
- `8742`: sem listener.
- `8790`: sem listener.
- `9101`: sem listener.
- `9119`: sem listener.
- `3030`: sem listener.
- `9900`: sem listener.
- Único listener relacionado observado: Tailscale em `9100`; não foi parado.
- `openKylin`: `Stopped`.
- `docker-desktop`: `Stopped`.

## Não incluídos

- Processos MCP auxiliares do Supabase/GitHub ficaram ativos porque pertencem ao host de ferramentas, não ao runtime CentralDark local.
- Processos internos do Codex/ChatGPT ficaram ativos para manter esta sessão.

## Rollback

Religar cada owner pelo launcher existente, sem criar novo serviço:

1. iniciar o WSL `openKylin`;
2. iniciar `centraldark-tunnel.service`;
3. iniciar o launcher existente do Commander;
4. iniciar Omni Router, Cockpit e Hermes Gateway pelos launchers existentes;
5. validar cada porta e serviço antes de promover estado `PASS`.

## Resultado

`CENTRALDARK_RUNTIME_PAUSED=PASS`

`FILES_PRESERVED=PASS`

`MIGRATION_TO_NATIVE_OPENKYLIN=NOT_STARTED`

`UNKNOWN != PASS`
