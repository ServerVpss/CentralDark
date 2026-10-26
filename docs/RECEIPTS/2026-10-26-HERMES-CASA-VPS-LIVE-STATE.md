# Hermes Casa ↔ VPS — estado vivo por owner
Medição: 2026-10-26, aproximadamente 08:49 UTC / 05:49 America/Bahia. Origem: processo Windows Casa SEGREDO e SSH read-only para CENTRALDARK-OS.

## Casa Windows
- `Hermes.exe` estava em execução (processo principal observado PID 28664; subprocessos Electron presentes).
- Dois `pwsh.exe` eram filhos do processo principal Hermes.
- A tarefa agendada `Hermes_Gateway` estava em estado `Ready`, última execução observada às 05:14:45 locais; isso não comprova que o Gateway local da Casa esteja servindo.
- `sshd.exe`, `ssh-agent.exe` e `tailscaled.exe` estavam ativos.

## VPS
- `centraldark-hermes-core.service`: active/running.
- `hermes-gateway.service`: active/running.
- `centraldark-native-mcp-http.service`, `centraldark-oauth-broker.service` e o bridge Remote Desktop Commander existente também estavam active/running.
- A conexão Casa → VPS pelo alias SSH existente concluiu com exit 0 e identificou `CENTRALDARK-OS`.

## Veredito
- HERMES_DESKTOP_CASA: RUNNING.
- HERMES_CORE_VPS: RUNNING.
- HERMES_GATEWAY_VPS: RUNNING.
- HERMES_GATEWAY_CASA: UNKNOWN — a tarefa local estava `Ready`; é necessário testar o endpoint/contrato do gateway local, não inferir saúde pelo aplicativo Desktop.
- HOST+PID+SESSION+AUTH+TASK_ID+ACK: não declarado completo nesta leitura; esta evidência não contém ACK de uma missão Kanban correlacionada a um mesmo task_id.

Nenhum processo foi encerrado, nenhuma tarefa foi alterada e nenhuma credencial foi lida ou registrada.
