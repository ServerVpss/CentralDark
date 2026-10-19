# Instinto Superior - Cockpit Casa, porta fixa 8080

Atualizado em 2026-10-19. Owner: `apps/instinto-superior`.
`3000` era a porta pretendida historicamente, mas pertence ao `tailscaled.exe` na medicao de 19/10/2026. `8081` era uma porta de fallback historica, **nao fixa**. A porta do Cockpit Casa fica **8080 (strictPort)**. A referencia historica permanece neste arquivo para nao quebrar links antigos.

## Enderecos
- Casa: `http://127.0.0.1:8080/sala-controle`.
- Tailnet Casa: `http://100.123.93.25:8080/sala-controle` (somente se IP Tailscale atual e firewall permitirem).
- DNS Tailscale: usar DNS do dispositivo apenas depois de confirmar resolucao e acesso; nao presumir porta 3000.
- Tela instalada em `CentralDark.exe` e separada do servidor Vite de desenvolvimento; instalador/deploy exige provas proprias.

## Inicializacao persistente do Windows
- Task Scheduler: `\CentralDark-Cockpit-8080` - gatilhos boot + logon + rechecagem a cada 5 minutos (janela de repeticao 3650 dias, renovar ate 2036), conta SYSTEM, sem abrir janela.
- Script owner reutilizavel: `K:\scripts\casa\instinto-cockpit-autostart.ps1`.
- Atalho manual existente: `K:\apps\instinto-superior\INICIAR-COCKPIT-LOCAL.bat`, que usa o **mesmo script**.
- Guard: se Vite do Instinto ja escuta em 8080 e responde HTTP 200, sai sem duplicar; se ha outro processo ou porta saudavel nao comprovada, bloqueia sem matar.
- Dependencias instaladas sao requeridas; nao executa `npm ci`, `taskkill`, git reset, deploy nem novo executor Hermes.
- Logs de stdout/stderr: `F:\temp\centraldark-cockpit-8080-stdout.log` e `F:\temp\centraldark-cockpit-8080-stderr.log`; sem gravar credenciais intencionalmente.
- Quando Windows desliga o servidor local para; ao boot ou logon, a tarefa tenta recuperar. Falha se o disco K: ou Node ainda nao estiver disponivel; checar historico do agendador/port health.

## Readback e aceitaÃ§Ã£o
```powershell
Get-ScheduledTask -TaskName 'CentralDark-Cockpit-8080'
Get-NetTCPConnection -State Listen -LocalPort 8080
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/sala-controle).StatusCode
```
Esperado: task habilitada, PID Node/Vite owner Instinto, HTTP 200. `HTTP_200 != UI_E2E`.
Nao marcar BOOT_RESTART_PASS sem reiniciar fisicamente e medir depois do boot.