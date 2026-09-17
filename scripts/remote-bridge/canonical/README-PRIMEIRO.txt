CENTRALDARK REMOTE TRAY · PACOTÃO FINAL

ARQUIVOS PRINCIPAIS
1. REMOTE-TRAY-STATUS-CANONICO.md
2. remote-tray-status.json
3. MENU-OPERACIONAL-TRAY.ps1

ATALHOS
- ABRIR-MENU-TRAY.cmd       -> executar em Casa/Windows
- INSTALL-VPS.sh            -> copiar o contrato para o diretório canônico da VPS

CASA / WINDOWS
1. Baixe/clone esta pasta.
2. Dê duplo clique em ABRIR-MENU-TRAY.cmd.
3. Use o menu.
4. O runtime local esperado é:
   %LOCALAPPDATA%\CentralDark\Remote-Tray

VPS / LINUX
Na pasta canônica execute:

  chmod +x INSTALL-VPS.sh
  sudo ./INSTALL-VPS.sh

Destino:
  /root/CentralDark/runtime/remote-tray

IMPORTANTE
- Não contém secrets.
- Não contém tokens/cookies.
- Não copia node_modules/cache Windows.
- Não cria segundo owner.
- O pacote instala o CONTRATO + receipt base.
- O runtime Linux real deve ser medido e ligado pelo owner/systemd existente.

LEIS
UNKNOWN != PASS
DOCUMENTED != EXECUTED
PROCESS_ALIVE != DEVICE_ONLINE
ONE_REMOTE_PROCESS_PER_PROFILE=true
