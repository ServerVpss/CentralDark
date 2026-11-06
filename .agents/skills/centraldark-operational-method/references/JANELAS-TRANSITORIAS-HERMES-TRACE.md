# Diagnóstico sob demanda — janelas transitórias, CLI, Hermes :9119 e provenance

**Owner:** [Skill-Mãe](../SKILL.md). **Classe:** diagnóstico read-only pontual; não é monitor permanente, serviço residente ou autorização para reiniciar aplicativo.
**Artefato operacional:** [Trace-TransientConsoleWindows.ps1](../scripts/Trace-TransientConsoleWindows.ps1).

## Reconhecimento automático, sem palavra mágica

Se a missão corrente trouxer relatos/prints de janelas `[]`, CMD/PowerShell piscando, terminais abrindo e fechando, `conhost.exe` em rajada, Hermes/CLI/dashboard `:9119` suspeito ou reinício de gateway: o agente que **já estiver executando a missão** deve reconhecer `TRANSIENT_CONSOLE_DIAGNOSTIC` e carregar esta receita **sem o CHEFE pedir o nome da ferramenta**. Não procurar durante outras missões, não fazer polling perpétuo ou alegar observação contínua fora de uma chamada ativa.

## Ordem operacional

1. **Preservar o contexto:** Casa `SEGREDO`, horário local com fuso, tela informada, sintoma e ação humana em andamento. Perguntar só se informação essencial faltar. Preferir MCP Remote Desktop Commander existente como canal, não instalar novo monitor.
2. **Estabelecer owners (read-only):** `Get-NetTCPConnection -LocalPort 9119` + PIDs via `Get-CimInstance Win32_Process`, árvore `ParentProcessId`, `CreationDate`, nome e linha de comando **somente quando necessária** (nunca registrar segredos). `/health` e `/` com timeout curto só provam HTTP, não execução do agente. Verificar `Get-ScheduledTask`, `Get-ScheduledTaskInfo`, `Actions`, `Triggers`, `Settings.Hidden`, `Principal.LogonType`; diferenciar último logon de execução durante o flash.
3. **Rastrear criação:** `Win32_ProcessStartTrace` (WMI, eventos de início) observa `ProcessName`, `ProcessID`, `ParentProcessID` e timestamp. Não confundir `conhost.exe` com malware nem com janela necessariamente visível. Separar processos nascidos de chamadas **do próprio observador/Remote Desktop Commander** de eventos preexistentes; marcar `OBSERVATION_SELF` e filtrar causalmente.
4. **Rastrear GUI:** API Win32 `EnumWindows` + `IsWindowVisible` + `GetClassName` + `GetWindowText` + `GetWindowThreadProcessId`; amostragem finita de ~200 ms em sessão gráfica, correlacionar `HWND -> PID -> pai -> start timestamp`. Um `ConsoleWindowClass`, `CASCADIA_HOSTING_WINDOW_CLASS` ou título exato `[]` é candidato; visibilidade não prova que foi o flash visto. **Zero janelas encontradas != ausência do fenômeno**, porque pode durar menos que a amostra, pertencer a outra sessão desktop ou não aparecer na enumeração.
5. **Correlação :9119:** distinguir Hermes Desktop/Electron `hermes-agent.exe`, seus filhos `pythonw.exe` (sem console), `python.exe` (pode ter console), `hermes.exe`, gateway e ferramentas MCP/CLI. Cruzar horários das conexões TCP e dos logs existentes em `%LOCALAPPDATA%\hermes\logs\gui.log`, `gateway.log`, `gateway-exit-diag.log`, `errors.log`; **não despejar tokens, mensagens ou conteúdo sensível**. `mcp login` sem token e falha de adaptador são avisos de auth/configuração, não prova de janela; `previous_unclean_exit` não prova crash espontâneo se houve intervenção humana.
6. **Evitar falso culpado:** tarefa `CentralDark-Casa-Cockpit-Hermes-One` pode ter múltiplas ações PowerShell e `Hidden=false`, mas é acionada no logon; não atribuir flashes atuais sem `LastRunTime`, evento ou janela vinculada. `conhost.exe` de `git`, `bash`, `ssh` e ferramentas remotas é normal como processo transitório.
7. **Decisão/ação:** primeiro relatar `OBSERVED`, `CORRELATED`, `CAUSE_PROVEN` ou `UNKNOWN` com evidência e PID/horário. **Não matar conhost, não trocar porta, não ocultar todas as janelas globalmente, não desativar tarefa, não reiniciar Hermes/9119** por diagnóstico. Só editar launcher owner existente mediante intenção/autorização e com teste antes/depois; minimizar efeito em sessão humana.
8. **Saída:** `TRIGGER, WINDOW_HITS, PROCESS_EVENTS, OWNER_PID, SOURCE(9119|other|unknown), HUMAN_ACTION, OBSERVER_SELF, PROOF, VERDICT, NEXT_CURSOR`. Sem correspondência simultânea `HWND + PID + pai + horário`, classificar hipótese, não causa.

## Uso do script único sob demanda

```powershell
powershell.exe -NoProfile -NonInteractive -File 'K:\.agents\skills\centraldark-operational-method\scripts\Trace-TransientConsoleWindows.ps1' -DurationSeconds 12 -SampleMs 200
```

A instrumentação é temporária, somente leitura e remove a assinatura de eventos no bloco `finally`. Ela relata metadados de processo/janela, **não** screenshot nem conteúdo de chat. Podem existir processos muito rápidos cujo `CommandLine` já não esteja consultável; não inventar comando. Não executar em ciclo automático.

## Evidência histórica (29/10/2026, não extrapolar)

- Casa `:9119` respondeu `/` e `/health` HTTP 200 e estava atendida pelo `python.exe` filho de `pythonw.exe` da interface Hermes; navegador Edge tinha conexão local. Isso prova dashboard acessível, não causa dos flashes.
- Observações WMI mostraram `conhost.exe` e filhos `python.exe`, `node.exe`, `bash.exe`, `ssh.exe`; chamadas do próprio Desktop Commander também criaram PowerShell/`conhost.exe`.
- Uma amostra Win32 de ~12 s não capturou janela visível candidata; sem conclusão sobre a janela específica `[]`.
- Tarefa `CentralDark-Casa-Cockpit-Hermes-One`: `Settings.Hidden=false`, quatro ações PowerShell, `LastRunTime=19:55` (logon), **sem** prova de disparo durante os flashes noturnos.
- Hermes `gateway-exit-diag.log` relatou `previous_unclean_exit` e reinício perto de 23:58. CHEFE esclareceu que intervenções humanas/outra sessão ChatGPT estavam ajustando a porta; não classificar como falha espontânea.
- `mcp login` não concluído, erros de Buzz/WhatsApp e warnings de conectores: problemas distintos; não são atribuição causal da janela.

**NEXT_CURSOR:** quando reaparecer `[]`, executar trace pontual + correlacionar `HWND/PID/PPID` e eventos de início em mesmo intervalo; caso falhe capturar, marcar `UNKNOWN` e preservar o cenário.
