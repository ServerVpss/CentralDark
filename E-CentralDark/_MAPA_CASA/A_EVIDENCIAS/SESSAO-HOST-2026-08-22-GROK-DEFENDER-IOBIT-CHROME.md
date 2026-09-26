# SESSÃO HOST 2026-08-22 — Grok (máquina SEGREDO / danda)

> Escopo: **host Windows**, não código CentralDark.
> Writer desta sessão: Grok Build. CHEFE autorizou leitura + correção cirúrgica no Defender/IObit/Chrome.
> Código da Casa **não** foi commitado. Y_CYBERSEC-REF em `E:\CentralDark\_MAPA_CASA\Y_CYBERSEC-REF` usado **só leitura**.

Próxima IA: leia isto **antes** de mexer em Defender, IObit, Chrome ou UAC neste PC.

Cópia canônica no git: `C:\CentralDark\_MAPA_CASA\A_EVIDENCIAS\SESSAO-HOST-2026-08-22-GROK-DEFENDER-IOBIT-CHROME.md`

---

## Canônico de paths

| Path | Papel |
|---|---|
| `C:\CentralDark` | **Repo git local** (tem `.git`). Código + `docs/CONTINUIDADE`. |
| `C:\CentralDark\Pivete\CentralDark` | Clone/local repo citado no mapa SOL. |
| `E:\CentralDark` | Árvore de trabalho / mapa. **Sem** `.git` na raiz. |
| `E:\CentralDark\_MAPA_CASA` | Mapa SOL. Este arquivo vive em `A_EVIDENCIAS/`. |
| Remoto | `ServerVpss/CentralDark` origin/main = canônico de **produto**. |

Não misturar forense do host com commit de produto.

---

## FEITO (com prova nesta sessão)

### 1. Forense Defender — ferida identificada
- `WinDefend` / `WdFilter` / `WdNis*` **Disabled** (`Start=4`). Motor `0.0.0.0`, `AMRunningMode: Not running`.
- Política GPO-style: `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender` `DisableAntiSpyware=1` `DisableAntiVirus=1` + Real-Time todo `1`. **Não** veio do `Registry.pol` (só Explorer).
- Log Defender **parou em 21/02/2025**.
- Huntress.reset.Defender.ps1 falhou: token médio + serviço morto (`0xc0000142` / `0x800106ba`).
- **Não** achado RAT/IFEO/WMI hostil/DLL sideload unsigned.

### 2. Cirurgia Defender (helper RunAs, UAC slider “nunca notificar”)
- **Removido e ficou:** flags em `Policies\Windows Defender` (DisableAnti* e Real-Time).
- Start type gravado Automatic/System/Boot.
- **NÃO subiu o motor:** `HKLM\SOFTWARE\Microsoft\Windows Defender\DisableAntiSpyware` é **reescrito para 1 em <2s** por processo vivo (watchdog). `sc start` = 1058. `MpCmdRun -wdenable` = `0x80070422`.
- Bitdefender **engine** desligado 22/08 04:45 (SCM 7040); sobrou Agent (`bdredline`, `ProductAgentService`). Assinatura Bitdefender SRL válida.
- Malwarebytes **é o único AV de fato** (serviço + drivers).
- Drivers Avast órfãos `asw*` ainda Running (WHQL). Explica “DLL em tempo real”.
- **PENDÊNCIA:** reboot + um AV só. Não instalar Avira (`Downloads\avira_pt-br_...exe`).

### 3. Monitores
- 4 telas: 2× AOC 24G2, LG Full HD, Dell S2421HN. GPU RX 580.
- Principal estava **1080×1920 retrato** → UI “gigante”. CHEFE deitou o principal → melhorou.
- **Não** é Eyefinity/Surround (4× `DISPLAY`). AppliedDPI=96 (100%).
- Suspeito visual “câmera/branco”: AMD Image Sharpening / Dynamic Contrast. CHEFE ia instalar driver **só** em amd.com.

### 4. IObit — REMOVIDO
- Driver Booster 13 + Unlocker + tarefas **Skip UAC** / Scheduler / Update.
- Apps & Recursos: sem IObit.
- Pastas PF/Roaming/ProgramData varridas.

### 5. Chrome / Edge
- Sem extensão **ativa** maliciosa. Componentes Google/Microsoft only no disco.
- **IDM CRX offline** no HKLM: `ngpampappnmepgilojfohadhhmbhlaek` → `C:\Program Files (x86)\Internet Download Manager\IDMGCExt.crx`. Native host `com.tonec.idm`.
- Hao123 em `Profile 14\Secure Preferences` `startup_urls`. **Removido** com Chrome fechado. Backup: `Secure Preferences.bak-hao123-20260822073525`.
- Residuais (não correm): Bitdefender Anti-tracker, FVD, Facebook junk.
- `external_extensions.json` vazio. Sem GPO forcelist.
- Chrome Remote Desktop native messaging instalado (superfície remota, não malware de extensão).

### 6. Superfície remota (não é prova de invasão)
- VS Code Tunnel no Run
- TeamViewer serviço Auto (parado)
- tarefa `cua-driver-serve` hidden
- Hermes Gateway VBS na Startup (agent Nous do CHEFE)
- Chrome Remote Desktop

---

## NÃO FEITO (de propósito)

- Não reabilitou UAC slider (CHEFE que mexeu).
- Não desinstalou Malwarebytes / Bitdefender Agent / CCleaner / IDM.
- Não reboot.
- Não commit git no produto.
- Não carregou bot CentralDark para “tunar” o conserto de AV (skills da casa são de código).
- Huntress não rerodado.

---

## PENDÊNCIA (quando CHEFE voltar)

1. Ligar UAC de volta (não deixar “nunca notificar”).
2. Reboot → conferir `Get-MpComputerStatus` (provável ainda off até sair o watchdog DisableAntiSpyware).
3. Um AV: Malwarebytes **ou** Defender, não os dois + resto BD + Avast órfão.
4. Driver AMD oficial → Sharpening/VSR/Dynamic Contrast OFF.
5. Opcional: desinstalar IDM; conferir `chrome://settings/onStartup` sem Hao123.
6. CCleaner 7 ainda tem Skip UAC.

---

## Evidência bruta (Downloads)

`C:\Users\danda\Downloads\_forensic_out*.txt`, `_surgical_fix*_log.txt`, `_iobit_uninstall_log.txt`, `_ext_scan2.txt`, `_chrome_offline_scan.txt`, `_chrome_hao_idm.txt`, `_agent_chrome_ext.txt`

UNKNOWN != PASS. Motor Defender **ainda morto** no fim da sessão.
