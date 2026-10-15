# Rota comprovada: Desktop Commander → VS Code Windows da Casa

Data: 2026-10-15. Owner: centraldark-operational-method. Reutilizar antes de criar.

## Descoberta
Dois conectores Desktop Commander podem pertencer a contas distintas: `mcp__Remote_Desktop_Commander__` revelou `CENTRALDARK-OS` Linux, enquanto `mcp__CENTRALDARK__` revelou `SEGREDO` Windows. Invocar `list_devices` em ambos antes de concluir falta de acesso.

## Sequência
1. `list_devices` por namespace e selecionar dispositivo Windows online.
2. `get_config`: confirmar `systemInfo.platform=win32`, shell PowerShell.
3. `list_sessions`, `list_processes`; lista de sessões vazia não significa ausência de terminais integrados do VS Code.
4. Usar leitura de processos Windows (`Get-CimInstance Win32_Process`) para identificar `Code.exe` e `pwsh.exe`, com PID, parent PID e shellIntegration.
5. Evidência de 2026-10-15: terminais `pwsh.exe` PIDs 9872, 23332, 8224, 22680; são temporários, não IDs persistentes.
6. PID existente NÃO concede automaticamente escrita no STDIN. `interact_with_process` só em sessão controlada pelo conector. Para `/status`, vincular controle à sessão Hermes correta e obter saída fresca.
7. Alternativa medida: Tailscale `windows-casa` alcançável via ping; WinRM porta 5985 responde, mas isso NÃO comprova autenticação nem controle do terminal.

## Gates
Sem nova arquitetura; preservar sessões abertas; um escritor por escopo. UNKNOWN != PASS. Separar `DEVICE_ONLINE`, `OS_VERIFIED`, `PROCESS_FOUND`, `INTERACTIVE_INPUT_PROVEN`, `STATUS_OUTPUT_PROVEN`.

NEXT_CURSOR: demonstrar envio interativo ao Hermes do VS Code existente, sem iniciar sessão paralela.
