# SSH reverso Casa ↔ VPS — one-shot de PIDs (2026-10-25)

Owner: scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1.
Missao: provar que a VPS openKylin consulta os processos da Casa Windows sem Desktop Commander no percurso SSH.
Escopo: transporte, autenticacao e leitura somente; sem escrita remota, sem reiniciar servico nem instalar identidade.

## Estado observado

- CASA -> VPS: alias SSH existente segredo-vpss, autenticado em root@CENTRALDARK-OS.
- VPS Tailscale: 100.90.199.124, online; Casa Tailscale: 100.123.93.25, online.
- Identidade de host SSH da Casa: ED25519 SHA256:LilWrZIAF+ugJ+mSbMaX9FuMSLIbgBkMIUXBuLnfUEA, ja conferida fora da conexao.
- Chave publica aprovada para Administrador na Casa: SHA256:UYVhuwigeIYOgnezudoEURf6BCXYz9CNajgmOO9MKEk.
- Origem do erro: o SSH automatico da VPS nao selecionava a chave ja presente em /root/.ssh/segredo_vps_ed25519; autenticacao por senha e autenticação sem -i retornavam Permission denied.
- Solucao MIN_DELTA: explicitar a identidade existente com ssh -i /root/.ssh/segredo_vps_ed25519 -o IdentitiesOnly=yes; exigir BatchMode e StrictHostKeyChecking. Nenhuma chave, senha ou perfil de servidor novo.
- whoami remoto via duas conexoes SSH: segredo\administrador — PASS, exit 0.
- Get-Process na Casa via VPS e SSH em modo somente leitura: PASS; 544 linhas de processos observadas na amostragem, incluindo PIDs 22360 (aioncore) e 1656 (AionUi); exit 0. Os PIDs sao dinamicos, nao contratos fixos.
- One-shot executado na Casa: VPS_TAILSCALE=PASS; REUSED_KEY=PASS; VPS_TO_CASA_SSH_AUTH=PASS; VPS_TO_CASA_PID=PASS COUNT=544; ONE_SHOT_EXIT=0.
- PowerShell Parser: 0 erros.
- Script SHA-256: 6f2bba0dfcc301709e69bcc84c0ee3ad323a7eb1da8acc03d88ed4216fe62e6c.

## Execucao reprodutivel

Na Casa, Windows PowerShell:

    powershell.exe -NoProfile -File K:\scripts\casa\CentralDark-VPS-Casa-PID-OneShot.ps1

O script usa o alias SSH ja aprovado, seleciona a chave ja existente na VPS, verifica o fingerprint publico, autentica e executa Get-Process da Casa. Nao usa Desktop Commander internamente, nao gera chaves e nao contorna checagens de host.

## Invariantes

- ONE_SYSTEM_ONLY / REUSE_BEFORE_CREATE / ONE_WRITER_PER_SCOPE.
- Valida entrada de VPS e fingerprint da identidade publica antes de enviar o comando de leitura.
- Host key valida por known_hosts existente; StrictHostKeyChecking=yes.
- VPS_TO_CASA_PID=PASS so depois de retorno material com Id e ProcessName.
- SHELL_DEFAULT=Windows PowerShell na Casa; nenhum novo servidor ou runtime.
- Prova de PIDs ≠ autorizacao para iniciar/parar processos.
- Aviso observado: servidor Windows negocia algoritmo KEX sem protecao pos-quantica; nao impediu o teste, mas permanece como limitacao de criptografia a avaliar pelo owner SSH.

## Fronteira do veredito

REVERSE_SSH_AUTH=PASS
REVERSE_PID_READBACK=PASS
MUTATION_ACCESS=NOT_TESTED
AUTOMATIC_BIDIRECTIONAL_SYNC=NOT_TESTED

Esta prova fecha o circuito de leitura de PIDs. Nao equivale a comprovar toda sincronizacao Obsidian/GitHub/VPS nem controle de GUI.
