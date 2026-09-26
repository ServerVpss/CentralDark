---
name: edr-zero-trust-hunter
description: Hunt EDR/Zero Trust/MITRE ATT&CK on Windows native tools.
---

# EDR Zero Trust Hunter — Endpoint Detection & Response + MITRE ATT&CK Hunting

**Owner conceitual:** `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md` + `E:/CentralDark/_MAPA_CASA/Y_CYBERSEC-REF/` (300+ skills MITRE/NIST/OWASP mapeados)
**Modo operacional:** Meta Lupa proporcional (FRIA → MÉDIA → QUENTE)
**Ferramentas base:** PowerShell 5.1+/7+, Windows Defender (MpCmdRun, Get-Mp*), Event Logs (Security, System, Microsoft-Windows-*/Operational), Sysmon (se instalado), Volatility 3 (memória), autoruns, sigcheck

---

## Princípios Inviáveis

```
EDR_NATIVO != EDR_ENTERPRISE
VISIBILIDADE_PARCIAL > CEGUEIRA_TOTAL
MITRE_ATT&CK = LINGUAGEM_COMUM
ZERO_TRUST = NUNCA_CONFIAR_SEMPRE_VERIFICAR
TELEMETRIA_LOCAL = JUIZ_FINAL
FALSO_VERDE_EDR = ALERTA_NAO_EVIDENCIA
```

---

## Estrutura de Investigação (Meta Lupa Aplicada)

### FRIA — Prova do que aconteceu (R0/R1)
```
OBJETIVO: Separar SIM/NÃO, antes/depois, mudou/não mudou
FERRAMENTAS: Get-MpThreat, Get-MpThreatDetection, Get-WinEvent (Defender), Get-Process, Get-Service
SAÍDA: Fato binário + evidência + lacuna
EXEMPLO: "Defender detectou VirTool:Win32/DefenderTamperingRestore em 22/08 16:42 — REMOVIDO — ProcessName=Unknown"
```

### MÉDIA — Localizar por que aconteceu (R2, 401/404/contradição)
```
OBJETIVO: Hipóteses distinguíveis, uma variável por vez
FERRAMENTAS: Get-WinEvent Security (4688,4672,4698,4699,4702), Scheduled Tasks, Registry (Run/RunOnce), Sysmon (1,3,7,8,10,11,13,15)
SAÍDA: Hipótese + variável alterada + canal + resultado binário + delta + prova contrária + camada localizada
EXEMPLO: "Tentativa de desabilitar BlockAtFirstSeen via HKLM\Policies\Microsoft\Windows Defender\Spynet — vetor: processo desconhecido com privilégios — correlação: EventID 4688 nas proximidades"
```

### QUENTE — Tornar achado repetível e seguro (R3/R4, produção, persistência)
```
OBJETIVO: Fixar alvo e SHA; combinar tela, log, processo, ação; revisão adversarial; rollback
FERRAMENTAS: Volatility 3 (memória), dump de processo, timeline completa, IOC extraction, MITRE mapping
SAÍDA: Contratos + observadores + testes (positivo/negativo/limite) + rollback + registro + autorização + ponto fixo
EXEMPLO: "Confirmação de persistência via Scheduled Task 'OneDrive Sync' (falso) executando PowerShell encoded — MITRE T1053.005 — remediação: desabilitar task + bloqueio AppLocker + hunt lateral"
```

---

## Mapeamento Telemetria Windows → MITRE ATT&CK (Core)

| Fonte Windows | EventIDs Chave | MITRE Táticas/Técnicas Cobertas |
|---------------|----------------|----------------------------------|
| **Security Log** | 4624/4625 (logon), 4672 (privilege), 4688 (process create), 4698/4699/4702 (tasks), 4719 (audit policy), 5156/5158 (network) | T1078, T1068, T1059, T1053, T1562, T1021 |
| **Defender (MpCmdRun/Get-Mp*)** | ThreatID, DetectionTime, Resources, ActionSuccess | T1497, T1055, T1027, T1562.001 |
| **Sysmon (se ativo)** | 1 (process), 3 (network), 7 (image load), 8 (CreateRemoteThread), 10/11 (process access), 13/14 (registry), 15 (file stream) | T1059, T1021, T1055, T1547, T1562 |
| **PowerShell Operational** | 4103 (script block), 4104 (command) | T1059.001, T1027 |
| **WMI/Registry** | Run/RunOnce, Services, Drivers, WMI subscriptions | T1547, T1543, T1546 |
| **Memory (Volatility)** | pslist, pstree, netscan, malfind, hollowfind, cmdline, dlllist | T1055, T1059, T1021, T1003 |

---

## Referências de Casos Reais

- `references/virtool-defender-tampering-case.md` — VirTool:Win32/DefenderTamperingRestore + separação forense de incidente composto
- `references/csp-chrome-freeze-investigation.md` — CSP eval block + CSS @property no Chrome/ChatGPT

---

## Y_CYBERSEC-REF — Skills Prontos (300+)

Local: `E:/CentralDark/_MAPA_CASA/Y_CYBERSEC-REF/skills/`

Categorias principais (use `skill_view` do repo se precisar):
- **Analyzing**: `analyzing-windows-event-logs-in-splunk`, `analyzing-powershell-script-block-logging`, `analyzing-malware-persistence-with-autoruns`, `analyzing-memory-dumps-with-volatility`, `analyzing-windows-registry-for-artifacts`, `analyzing-windows-prefetch-with-python`, `detecting-evasion-techniques-in-endpoint-logs`, `detecting-credential-dumping-techniques`, `detecting-dll-sideloading-attacks`
- **Detecting**: `detecting-aws-cloudtrail-anomalies`, `detecting-azure-lateral-movement`, `detecting-container-escape-attempts`, `detecting-ransomware-network-indicators`, `detecting-business-email-compromise`
- **Performing**: `performing-endpoint-forensics-investigation`, `performing-memory-forensics-with-volatility3`, `performing-threat-hunting-with-yara-rules`, `performing-windows-artifact-analysis-with-eric-zimmerman-tools`, `performing-ransomware-response`, `triaging-windows-with-kape`
- **Implementing**: `implementing-mitre-attack-coverage-mapping`, `configuring-windows-event-logging-for-detection`, `configuring-windows-defender-advanced-settings`, `deploying-edr-agent-with-crowdstrike`, `deploying-osquery-for-endpoint-monitoring`
- **Mappings**: `mappings/mitre-attack/`, `mappings/nist-csf/`, `mappings/owasp/` + `attack-navigator-layer.json` + `ATTACK_COVERAGE.md` (256KB)

---

## Checklist de Investigação (Executável)

### Fase 0 — Baseline Imediato (FRIA, < 5 min)
```powershell
# 1. Status Defender
Get-MpComputerStatus | Select-Object AMRunningMode, AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated, AntivirusSignatureVersion, BehaviorMonitorEnabled

# 2. Ameaças ativas/históricas
Get-MpThreat
Get-MpThreatDetection | Select-Object DetectionID, ThreatName, InitialDetectionTime, LastThreatStatusChangeTime, ActionSuccess, Resources, ProcessName

# 3. Processos suspeitos (unsigned, temp paths, encoded commands)
Get-Process | Where-Object {$_.Path -like "*\Temp\*" -or $_.Path -like "*\AppData\*" -or $_.Path -notlike "C:\Windows*" -and $_.Path -notlike "C:\Program Files*"} | Select-Object Id, ProcessName, Path, CPU, StartTime

# 4. Conexões de rede ativas
Get-NetTCPConnection -State Established | Where-Object {$_.OwningProcess -notin (Get-Process -Name "System", "svchost").Id} | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess, @{n="Process";e={(Get-Process -Id $_.OwningProcess).ProcessName}}
```

### Fase 1 — Correlação Temporal (MÉDIA, 15-30 min)
```powershell
# 5. Eventos de criação de processo nas proximidades da detecção
$dt = (Get-MpThreatDetection | Sort-Object InitialDetectionTime -Descending | Select-Object -First 1).InitialDetectionTime
Get-WinEvent -LogName Security -FilterXPath "*[System[TimeCreated[@SystemTime>='$($dt.AddMinutes(-10).ToString("o"))'] and TimeCreated[@SystemTime<='$($dt.AddMinutes(10).ToString("o"))'] and EventID=4688]]" | Select-Object TimeCreated, @{n="NewProcess";e={$_.Properties[5].Value}}, @{n="CommandLine";e={$_.Properties[8].Value}}, @{n="CreatorProcessId";e={$_.Properties[4].Value}}

# 6. Tarefas agendadas não-Microsoft
Get-ScheduledTask | Where-Object {$_.TaskPath -notlike "\Microsoft*" -and $_.TaskPath -notlike "\User_Feed_Synchronization*"} | Select-Object TaskName, TaskPath, State, @{n="Actions";e={($_.Actions | ForEach-Object {$_.Execute + " " + $_.Arguments}) -join " | "}}

# 7. Run/RunOnce keys
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run", "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce", "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run", "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce" -ErrorAction SilentlyContinue

# 8. Serviços não-Microsoft rodando
Get-Service | Where-Object {$_.Status -eq 'Running' -and $_.Name -notlike "*Microsoft*" -and $_.Name -notlike "*Windows*" -and $_.Name -notlike "*DcomLaunch*" -and $_.Name -notlike "*RpcSs*"} | Select-Object Name, DisplayName, StartType, Status
```

### Fase 2 — Deep Hunting (QUENTE, se Fase 1 achar algo)
```powershell
# 9. PowerShell script block logging (se habilitado)
Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" -FilterXPath "*[System[EventID=4104]]" -MaxEvents 50 | Select-Object TimeCreated, @{n="Script";e={$_.Properties[0].Value}}

# 10. Binários não-assinados em execução
Get-Process | Where-Object {$_.Path} | ForEach-Object { $sig = Get-AuthenticodeSignature $_.Path -ErrorAction SilentlyContinue; if ($sig -and $sig.Status -ne "Valid") { $_ | Select-Object Id, ProcessName, Path, @{n="SigStatus";e={$sig.Status}} }}

# 11. WMI Event Subscriptions (persistência stealth)
Get-CimInstance -Namespace root\subscription -ClassName __EventFilter, __EventConsumer, __FilterToConsumerBinding

# 12. Drivers não-Microsoft
Get-WindowsDriver -Online | Where-Object {$_.ProviderName -notlike "*Microsoft*" -and $_.ProviderName -notlike "*Windows*"} | Select-Object DriverName, ProviderName, Date, Version
```

---

## Volatility 3 — Memory Forensics (se QUENTE)

```bash
# Instalação (uma vez)
pip install volatility3

# Plugins essenciais
python -m volatility.framework -f memory.dmp windows.pslist.PsList
python -m volatility.framework -f memory.dmp windows.pstree.PsTree
python -m volatility.framework -f memory.dmp windows.netscan.NetScan
python -m volatility.framework -f memory.dmp windows.malfind.Malfind
python -m volatility.framework -f memory.dmp windows.hollowfind.HollowFind
python -m volatility.framework -f memory.dmp windows.cmdline.CmdLine
python -m volatility.framework -f memory.dmp windows.dlllist.DllList
python -m volatility.framework -f memory.dmp windows.filescan.FileScan
python -m volatility.framework -f memory.dmp windows.registry.hivelist.HiveList
python -m volatility.framework -f memory.dmp windows.registry.printkey.PrintKey -o "ControlSet001\Control\Session Manager\AppCertDlls"
```

---

## Geração de IOCs + Mapeamento MITRE

```powershell
function Get-IOCsFromFindings {
    param($Findings)
    $iocs = @()
    foreach ($f in $Findings) {
        if ($f.Path -and (Test-Path $f.Path)) {
            $hash = Get-FileHash $f.Path -Algorithm SHA256, MD5
            $iocs += [pscustomobject]@{Type="file"; SHA256=$hash.Hash; Path=$f.Path; Context=$f.Context}
        }
        if ($f.RemoteAddress) { $iocs += [pscustomobject]@{Type="ip"; Value=$f.RemoteAddress; Context=$f.Context} }
        if ($f.CommandLine -match 'https?://([\w\.-]+)') { $iocs += [pscustomobject]@{Type="domain"; Value=$matches[1]; Context=$f.Context} }
        $iocs += [pscustomobject]@{Type="mitre"; Technique=Get-MITREForFinding $f; Context=$f.Context}
    }
    $iocs | ConvertTo-Json -Depth 3
}

function Get-MITREForFinding {
    param($f)
    switch -Wildcard ($f.Type) {
        "*DefenderTampering*" { return "T1562.001 - Disable Security Tools" }
        "*ScheduledTask*" { return "T1053.005 - Scheduled Task" }
        "*RunKey*" { return "T1547.001 - Registry Run Keys" }
        "*WMI*" { return "T1546.003 - WMI Event Subscription" }
        "*Service*" { return "T1543.003 - Windows Service" }
        "*PowerShell*Encoded*" { return "T1059.001 - PowerShell; T1027 - Obfuscated Files" }
        "*ProcessInjection*" { return "T1055 - Process Injection" }
        "*LSASS*" { return "T1003.001 - LSASS Memory" }
        "*NetworkConnection*" { return "T1071 - Application Layer Protocol" }
        default { return "UNKNOWN - requires analysis" }
    }
}
```

---

## Integração com Ecossistema CentralDark

| Skill | Papel na Investigação |
|-------|----------------------|
| `meta-lupa` | Governança da investigação (FRIA/MÉDIA/QUENTE), AutoLupa, falsificação |
| `knowledge-compiler` | Cristalizar achados em regras/gates/IOCs reutilizáveis |
| `session-intelligence-harvester` | Extrair intel de sessões de hunting anteriores |
| `audit-rls` | Verificar se dados de telemetria expostos no Supabase |
| `auditoria-pr` | Code review de scripts de coleta/remoção |

---

## Zero Trust Checklist (Contínuo)

```
[ ] Nenhum binário executa sem assinatura válida OU aprovação explícita
[ ] Nenhum script PowerShell roda sem Script Block Logging ativo
[ ] Nenhuma tarefa agendada persiste sem owner identificado
[ ] Nenhuma chave Run/RunOnce existe sem justificativa documentada
[ ] Nenhum serviço roda com SYSTEM sem necessidade comprovada
[ ] Nenhuma conexão de saída não-mapeada persiste > 5 min
[ ] Nenhum driver não-Microsoft carrega sem validação
[ ] Nenhuma WMI subscription persiste sem ticket de mudança
[ ] Telemetria Defender enviada para nuvem (BlockAtFirstSeen=ON)
[ ] Logs de Security/System/PowerShell/Sysmon preservados > 90 dias
```

---

## Saída Padrão (Handoff Determinístico)

```json
{
  "investigation_id": "EDR-YYYYMMDD-HHMMSS",
  "mode": "FRIA|MEDIA|QUENTE",
  "trigger": "Get-MpThreatDetection|ScheduledTask|UserReport|ScheduledHunt",
  "findings": [
    {
      "type": "threat|persistence|anomaly|ioc|mitre",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
      "evidence": "verbatim command output + timestamp",
      "mitre": ["T1562.001", "T1053.005"],
      "iocs": [{"type":"file","sha256":"...","path":"..."},{"type":"ip","value":"..."}],
      "status": "CONFIRMED|SUSPECTED|FALSE_POSITIVE|UNKNOWN",
      "remediation": "specific action taken or recommended",
      "rollback": "how to undo if wrong"
    }
  ],
  "gaps": ["what couldn't be verified", "tool missing", "permission denied"],
  "next_actions": ["specific next step", "tool to run", "approval needed"],
  "fixed_point": true|false
}
```

---

## Ferramentas Necessárias (Se Faltarem, Peça)

| Ferramenta | Verificação | Instalação |
|------------|-------------|------------|
| **Volatility 3** | `python -m volatility.framework --version` | `pip install volatility3` |
| **Sysmon** | `Get-Service Sysmon` | Download Sysinternals + `sysmon -i sysmonconfig.xml` |
| **Sigcheck** | `sigcheck -h` | Sysinternals Suite |
| **Autoruns** | `autoruns.exe /?` | Sysinternals Suite |
| **PowerShell 7+** | `pwsh --version` | `winget install Microsoft.PowerShell` |
| **Windows Defender Offline** | UI: Windows Security > Scan options | Built-in (trigger via UI ou `MpCmdRun -Scan -ScanType 3`) |

---

## Exemplo de Uso (Cenário Real: VirTool Detectado Hoje)

```powershell
# 1. FRIA - Confirmar
Get-MpThreatDetection | Where-Object {$_.ThreatName -like "*DefenderTampering*"} | Format-List

# 2. MÉDIA - Correlacionar
$dt = (Get-MpThreatDetection | Where-Object {$_.ThreatName -like "*DefenderTampering*"} | Sort-Object InitialDetectionTime -Descending | Select-Object -First 1).InitialDetectionTime
Get-WinEvent -LogName Security -FilterXPath "*[System[TimeCreated[@SystemTime>='$($dt.AddMinutes(-15).ToString("o"))'] and EventID=4688]]" | Select-Object TimeCreated, @{n="Process";e={$_.Properties[5].Value}}, @{n="CmdLine";e={$_.Properties[8].Value}}, @{n="ParentPID";e={$_.Properties[4].Value}}

# 3. QUENTE - Se achar processo pai suspeito → memory dump + Volatility
# 4. Cristalizar via knowledge-compiler → rule/gate/IOC
# 5. Registrar no MITRE mapping local (Y_CYBERSEC-REF/mappings/mitre-attack/)
```

---

## Anti-Padrões (O que NÃO fazer)

- ❌ Rodar ferramenta "limpeza/otimização" de fonte duvidosa (vetor comum do VirTool)
- ❌ Desabilitar Defender "temporariamente" para instalar algo
- ❌ Confiar em "painel verde" sem verificar logs brutos
- ❌ Ignorar `ProcessName=Unknown` — é lacuna de telemetria, não ausência de ator
- ❌ Assumir que remediação automática = erradicação (pode ser apenas sintoma)
- ❌ Não preservar evidência (logs, memory dump) antes de remediar
- ❌ Mapear MITRE sem evidência concreta da técnica

---

## Evolução (Meta Lupa QUENTE → Knowledge Compiler)

Quando um padrão se repete 2+ vezes com evidência:
1. `knowledge-compiler` cristaliza → regra/gate/IOC
2. `meta-lupa` valida contra falso verde
3. Skill evolui: adiciona teste automatizado no pipeline
4. Zero Trust checklist atualizado

**NUNCA crie skill v2 — refine a canônica.**