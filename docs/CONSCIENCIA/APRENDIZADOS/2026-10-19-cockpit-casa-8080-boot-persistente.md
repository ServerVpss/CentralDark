# Aprendizado persistente — Cockpit Casa: porta 8080 fixa, recuperação no Windows

**Data:** 2026-10-19 (Casa SEGREDO, Windows)  
**Intenção:** CentralDark ONE_SYSTEM_ONLY; preservar Cockpit Instinto Superior ativo automaticamente quando o computador ligar e após falhas sem duplicar processos.  
**Fonte da verdade:** GitHub `ServerVpss/CentralDark` + owner do Cockpit; recibo corrente no PR #1873.  
**Estado:** `CONFIGURED_AND_RUN_PASS`; `REBOOT_E2E=UNKNOWN`; `AUTO_RECOVERY_AFTER_CRASH=UNKNOWN`.

## Lição causal

A porta não pode ser inferida do nome de um arquivo BAT, de texto histórico ou da mensagem "VITE INICIADO". Medir sempre **PID dono da porta + /sala-controle HTTP + URL Tailscale**, e distinguir `HTTP_200 != UI_E2E`.

- `3000` era a porta histórica/pretendida, mas o `tailscaled.exe` estava ocupando `100.123.93.25:3000` e IPv6 Tailscale quando medido.
- `8081` foi um fallback histórico documentado, mas no momento do diagnóstico **não possuía listener**; o browser do VS Code apresentou `ERR_CONNECTION_REFUSED (-102)`. O BAT `K:\EMERGENCIA\START-8081-NOW.bat` anunciava 8081, mas executava simplesmente `npm run dev` (sem fixar porta); nome/saída não eram prova.
- `8080` foi confirmada com `node.exe`/Vite `instinto-superior` e `GET /sala-controle` **HTTP 200** tanto em `http://127.0.0.1:8080` quanto em `http://100.123.93.25:8080` naquele instante. **Porta canônica da Casa definida: 8080 com `--strictPort`**. Não matar/alterar o Tailscale para liberar 3000.

## Owners persistentes, sem segundo sistema

- `apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat` (launcher manual existente; agora chama a receita única).
- `scripts/casa/instinto-cockpit-autostart.ps1` (receita de boot idempotente: `node.exe node_modules/vite/bin/vite.js --host 0.0.0.0 --port 8080 --strictPort` a partir de `K:\apps\instinto-superior`).
- `docs/LEMBRANCAS/instinto-superior-dev-server-3000.md` (contrato operacional atualizado, preservando o histórico em vez de reescrevê-lo).
- Agendador de Tarefas Windows local: **`CentralDark-Cockpit-8080`**, executada por `SYSTEM`, três gatilhos — ao iniciar Windows, ao logon, rechecagem a cada **5 minutos**; período de repetição configurado para **3650 dias** a partir de 2026, a renovar antes do vencimento. `MultipleInstances=IgnoreNew`. A tarefa pertence ao computador Casa e **não é versionada no GitHub**: o script é versionado, a instalação/recriação da tarefa noutra máquina exige execução e contraprova próprias.

A receita reutiliza o processo existente se ele pertence ao Instinto Vite e responde HTTP 200; não cria cópia, não encerra outro dono da porta, não reinicia Hermes, não executa `npm ci` ou `git reset`. Quando a 8080 está ocupada por outro processo ou com serviço Vite não saudável, retorna bloqueio local em vez de declarar verde. Logs stdout/stderr ficam em `F:\temp\centraldark-cockpit-8080-*.log`; sem escrever credenciais deliberadamente. O disco `K:\`, a instalação Node e dependências do Cockpit precisam estar disponíveis após o boot.

## Provas desta sessão — 2026-10-19

- PowerShell parse: `PARSE_ERRORS=0`.
- Leitura/execução com `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ...`: `COCKPIT=ALREADY_RUNNING_HTTP_200`; exit code **0**. A política do PowerShell da sessão padrão bloqueou `& script.ps1`, então o launcher/task usam `-ExecutionPolicy Bypass` apenas no processo correspondente.
- Task Scheduler registrada em `CentralDark-Cockpit-8080`; **3 triggers**, `State=Ready`, `Enabled=True`; repetição `PT5M`, duração `P3650D`.
- Execução imediata via `Start-ScheduledTask` e readback `Get-ScheduledTaskInfo.LastTaskResult=0`.
- HTTP local e HTTP pelo IP Tailscale: **200**; não é prova de login, botões, build ou navegação integral.
- Alterações publicadas no PR draft **#1873**, HEAD verificado `073818402af30252ae40b6c5809345c40465bc40` após o ajuste do watchdog; recibo original [#6277260744](https://github.com/ServerVpss/CentralDark/pull/1873#issuecomment-6277260744).
- Casa possuía outras três modificações tracked não relacionadas (Hermes/Jarvis/skill de delegação), preservadas. O PR **não foi mergeado** e o bootstrap ainda não foi provado após reboot.

## Regras que não podem ser esquecidas

1. `CURRENT > HISTORY`: se não responder, medir primeiro a 8080 e o owner do PID, nunca concluir pela 8081 histórica.
2. `REUSE_BEFORE_CREATE`: tarefa/programa existentes antes de iniciar outro; a execução do agendador é idempotente.
3. `FAIL_LOCAL != BLOCK_GLOBAL`: queda do Cockpit 8080 não significa queda do VS Code, Hermes, Tailscale ou CentralDark inteiro.
4. `BOOT_TASK_REGISTERED != REBOOT_PROVED`; `HTTP_200 != AUTH_PASS`; `COMMENTED != MERGED`; `UNKNOWN != PASS`.
5. PC **desligado** não executa Cockpit local. Ao ligar, a tarefa deve iniciar sem interação, sujeito a disponibilidade de discos, serviços e rede. Nunca prometer uptime contínuo durante desligamento.
6. Não sobrescrever uma configuração existente sem owner/contraprova; não publicar tokens, stdout bruto ou senhas em recibos.

## Critério de fechamento / NEXT_CURSOR

`BOOT_RESTART_PROOF_WHEN_APPROVED → VERIFY_TASK_PERSISTENCE_AND_K_DRIVE → FIVE_MIN_WATCHDOG_READBACK → UI_COCKPIT_8080_E2E → REVIEW_PR1873 → MERGE_GATE`.

Ao reiniciar o Windows numa janela autorizada, confirmar automaticamente `CentralDark-Cockpit-8080` em `Ready`, `LastTaskResult=0`, listener :8080 com processo Instinto Vite e HTTP 200 sem iniciar manualmente. Só então marcar `REBOOT_E2E=PASS`. Não forçar reboot durante trabalho ativo.
