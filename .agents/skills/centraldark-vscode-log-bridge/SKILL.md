---
name: centraldark-vscode-log-bridge
description: Enviar sinais do VS Code Casa ao funil unico CentralDark via SSH/Tailscale, sem transportar texto bruto ou duplicar o owner.
---

# VS Code — Logs: receita da Forja (não instalar na VPS)

## Donos: cada coisa no lugar

- GitHub: fonte canônica da skill, scripts, testes e histórico de mudanças.
- Casa: K:\TEMP\logs\LOGS-VS-CODE.log é o bruto. K:\TEMP aponta para F:\TEMP\CentralDark; os bytes não ficam na raiz K:.
- Casa/script: scripts/casa/vscode-log-bridge.ps1 lê lotes completos; transmite apenas nível, componente, offset e SHA-256 da linha.
- VPS/script: scripts/vps/ingest-vscode-log.mjs recebe via SSH/STDIN e chama o MESMO apps/modulos/mcp/src/log-funnel.js.
- API: GET /admin/api/logs/LOGS-VS-CODE.log autentica usuário admin e projeta estado/eventos sanitizados.
- GH CLI: inspeciona código, PR, SHA e checks; NUNCA serve para publicar logs ou credenciais.

## Ordem reprodutível

1. Conferir origem, tamanho e último registro sem expor conteúdo pessoal.
2. pwsh -NoProfile -File scripts/casa/vscode-log-bridge.ps1 -DryRun
3. Materializar apenas script aprovado na VPS; conferir hash e integridade do owner sem git pull/reset.
4. Rodar uma vez, validar ACK do script VPS, cursor da Casa e um mesmo evento em logs/events, logs/sectors/vscode e logs/services/vscode.
5. Conferir GET /admin/api/logs/LOGS-VS-CODE.log com autenticação, filtro e status. Sem 200 real não há rota web provada.
6. Agendar na Casa: pwsh -NoProfile -File scripts/casa/vscode-log-bridge.ps1 -InstallTask somente depois do teste pontual.
7. Citar commit/SHA, rotas atuais, último recebimento, fallback exercitado e contraprova.

## Atenção suave

Preferir Tailscale SSH com BatchMode + StrictHostKeyChecking=yes; se não passar, usar alias SSH direto já aprovado.
Se SSH direto atender, state=ATTENTION amarelo e route=ssh-direct; uma rota quebrada não derruba as demais.
Se tudo cair: arquivo/cursor permanecem na Casa, sem descarte; estado vira ATTENTION, nunca PASS. Retomar do offset confirmado.
Sem heartbeat recente => ATTENTION; sem fonte => UNKNOWN. Não gerar alertas agressivos nem falsa confirmação.

## Limites

Não enviar log bruto, prompt, conversa, conta, token, email ou chave para GitHub/API.
Não duplicar coletores, skills em VPS, ou criar segunda arquitetura de logs. Skill ensina; scripts executam; a API observa.
Git commit não é deploy, e existência de script não prova agendamento; só rastro de execução fecha cadeado.

## Organização

skill = COMO / scripts Casa = COLETA / script VPS = INGERE / log-funnel = DONO / API = CONSULTA / TEMP = DADO VOLÁTIL / receipt = PROVA SEM SEGREDO

## Execução invisível na Casa (sem janela piscando)

- O Task Scheduler executa `C:\Windows\System32\wscript.exe //B //Nologo "K:\scripts\casa\vscode-log-bridge-hidden.vbs"`, e não `pwsh.exe` diretamente.
- O `vscode-log-bridge-hidden.vbs` chama o MESMO `vscode-log-bridge.ps1` com `WScript.Shell.Run(command, 0, True)` (janela oculta, exit code preservado).
- O `-InstallTask` já usa esse launcher; é preciso materializar os dois arquivos em `K:\scripts\casa` antes do agendamento.
- A flag `Settings.Hidden` do Task Scheduler oculta o item na interface do agendador; ela **não oculta janela do PowerShell**. O launcher é o que evita o piscar.
- A automação continua no usuário da Casa (LogonType Interactive) para preservar acesso a K:\TEMP e à chave SSH local; não migrar para SYSTEM às cegas.
- Testar execução e `LastTaskResult=0` com mesmo cursor/SSH antes de declarar PASS. Não afirmar observação direta da tela sem captura.
