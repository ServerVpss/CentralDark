---
name: centraldark-linux-vmware-rawdisk
description: "CentralDark: migrar Linux openKylin num SSD fisico para VMware Workstation com raw disk partitionedDevice, GParted Live, SYSBOOT/SYSROOT/DATA/SWAP e NTFS VMWARE no proprio SSD. Metodo hibrido CHEFE + SOL/Hermes: GUI, SSH, Windows, Cua, provas e recibo. Acionar para Kingston, VMware, discos fisicos, NTFS de 10 GiB, swap, boot e testes simultaneos."
version: 1.0.0
author: CentralDark
metadata:
  hermes:
    category: devops
    tags: [centraldark, linux, openkylin, vmware, raw-disk, partitionedDevice, gparted, ntfs, swap, ssh, hybrid-computer-use]
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
related_skills: [centraldark-hermes-visual-computer-use, centraldark-hermes-operations, centraldark-ops, michelin-3-estrelas]
---

# CentralDark | Linux no SSD fisico + VMware Raw Disk


<!-- REVALIDACAO_CASA_VMWARE_VPS_20261103 -->
## CURRENT verificado — Casa → VMware NAT → VM; VPS em diagnostico

**Regra antes de tentar SSH:** nao confiar em IP, caminho VMX, PID ou endereco Tailscale de receipts antigos. Ler primeiro o processo `vmware-vmx.exe` corrente na Casa, obter seu **VMX real**, consultar `vmrun.exe -T ws getGuestIPAddress <VMX_CORRENTE>` e so entao consultar o alias SSH protegido. Nao reabrir GParted nem repetir particionamento.

**Medição viva em 03/11/2026, nova sessão:**
- `SEGREDO`: Remote Desktop Commander 0.3.1 ONLINE; `vmware-vmx.exe` PID 20892 respondeu com VMX **`E:\VMs\CENTRALDARK-OS\CENTRALDARK-OSh.vmx`**. A receita antiga com VMX `D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx` continua válida como **receipt HISTÓRICO**, nao deve ser tratada como VM ativa automaticamente.
- Casa VMnet8 `192.168.35.1/24`; NAT/DHCP VMware executando. `vmrun getGuestIPAddress` respondeu **`192.168.35.130`**, enquanto `C:\Users\Administrador\.ssh\config_openkylin` (alias `openkylin-vm`) ainda apontava para **`192.168.35.128`**; a primeira tentativa por alias retornou **timeout**, nao `SSH_AUTH_FAIL`.
- **Contraprova PASS**: teste TCP `192.168.35.130:22=True`; `ssh.exe` com `-F C:\Users\Administrador\.ssh\config_openkylin -o HostName=192.168.35.130 -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=yes`, usando temporariamente o **HostKeyAlias confiado da rota antiga** nesta prova, retornou `VM_OK`, hostname `CentralDark-OS`, `Linux`, usuário `CentralDark-OS`. HostKeyAlias nao deve ser transplantado para outra VM sem identidade de host validada. Nenhuma chave privada foi copiada, nenhum `StrictHostKeyChecking=no`.
- Dentro da VM: `ens33=192.168.35.130/24`; `tailscale0=100.81.207.32/32`, mas `tailscale status` retornou **`Machine is not yet approved by tailnet admin.`**. IP Tailscale atribuído nao significa peer autorizado.
- `Segredo-VPS` Windows tentou `100.90.199.124:22` e deu timeout; VM → VPS público `89.117.78.124:22` deu `PUBLIC_VPS_TCP22_UNREACHABLE` no limite de 5 s. **VPS_RUNTIME=UNKNOWN**, pois timeout nao prova serviço parado.
- A VM foi acessada por SSH **sem alterar** `config_openkylin`, `.ssh/config`, `known_hosts`, firewall, VPN, disco ou serviço.

**Receita mínima (somente leitura, antes de qualquer fallback):**
1. Selecionar VMX **pelo processo `vmware-vmx.exe` atual**, nao por caminho D:/E: histórico; confirmar resultado com `vmrun list` quando necessário.
2. `& 'C:\Program Files\VMware\VMware Workstation\vmrun.exe' -T ws getGuestIPAddress <VMX_ATUAL>` → `IP_ATUAL`; comparar com `HostName` de `C:\Users\Administrador\.ssh\config_openkylin` e `F:\CentralDark\.ssh\config_openkylin` se essa segunda cópia existir no host. Escolher **arquivo realmente lido pelo SSH**, sem trocar aliases protegidos.
3. `Test-NetConnection -ComputerName <IP_ATUAL> -Port 22`; verificar a identidade SSH de host já confiada, depois invocar `ssh -F <CONFIG_CONFIRMADO> -o HostName=<IP_ATUAL> -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=yes openkylin-vm 'hostname; uname -s; id -un'`. Na prova desta sessão foi usado `HostKeyAlias=192.168.35.128` para a chave de host **previamente confiada**; nao impor como política universal.
4. Se Casa→VM passar, testar `tailscale status` **dentro da VM** antes de concluir que a ponte VM→VPS funciona. Se `Machine is not yet approved`, classificar **TAILSCALE_APPROVAL=PENDING**, sem fazer login novo ou autorizar a máquina automaticamente. Testar endpoint da VPS separadamente e anotar a rota.
5. Guardar saída, HEAD da receita e `NEXT_CURSOR`; nunca converter `VM_SSH=PASS` em `VM_VPS=PASS`.

**Resultado atual:** `CASA_VM_SSH=PASS`; `VMWARE_IP_DRIFT=FOUND`; `VM_VPS=BLOCKED/UNPROVEN`; `TAILSCALE_APPROVAL=PENDING`; `CONFIG_MUTATIONS=0`; `VMWARE_DISK_MUTATIONS=0`. Próximo passo: aprovar a VM na tailnet pelo controle autorizado, então remedir VM→VPS; reconciliar alias somente com backup, gate de host key e readback.
<!-- /REVALIDACAO_CASA_VMWARE_VPS_20261103 -->

<!-- LAUNCHER_PATH_CORRECTED_20261103 -->
### Corrigido: seleção de configuração do launcher XRDP

Readback na Casa: os dois caminhos existem. A configuração em F: resolve o alias `openkylin-vm` para `192.168.35.130` e autenticou com sucesso; a cópia do perfil Windows ainda resolve para `.128`. Logo, substituir F por C causaria regressão.

No owner `scripts/Open-CentralDarkForjaRDP.ps1`, o seletor mantém F como primeira opção e verifica a conexão antes de aceitá-la. A configuração do perfil Windows é fallback condicionado à verificação SSH. Não houve alteração dos arquivos de configuração na Casa. `-CheckOnly` e reutilização do túnel existente foram preservados.

Provas: `PARSER_ERRORS=0` no PowerShell Windows; `SELECTED=F:\CentralDark\.ssh\config_openkylin` na execução isolada do seletor. A sessão XRDP do script atualizado não foi aberta neste delta.

`NEXT_CURSOR=VALIDATE_XRDP_HANDSHAKE_WITH_EXISTING_LAUNCHER_WHEN_GUI_NEEDED`.
<!-- /LAUNCHER_PATH_CORRECTED_20261103 -->



## Acionamento
CHEFE fala "Linux no Kingston", "VMware no proprio SSD", "particao VMWARE", "GParted", "SWAP", "fullDevice", "PhysicalDrive", "boot + SSH", "partitionedDevice" ou solicita replay da operacao concluida em 2026-11-03. Esta Skill propria fica na biblioteca da Skill Mae existente, sem segundo executor, driver, plugin ou organismo. Sempre reutilizar Skill Mae, Kimetsu, Michelin, Hermes Visual Computer Use/Cua e os owners reais.

## Modalidade: EXECUCAO HIBRIDA GUI + CLI + CONTRAPROVA
- CHEFE: etapas manuais de risco em GUI offline, especialmente particionamento no GParted quando a ponte nao permite observar ou executar com seguranca; compartilha resultado visual. A confirmacao de GParted em 03/11/2026 demonstrou shrink de DATA em 10 GiB e criacao de NTFS 10 GiB.
- SOL/Hermes: investiga rotas existentes, inventaria fisico, le estado, valida backup, usa Cua na GUI com janela atual, gera descriptor do VMware pela interface, inicia VM e prova por SSH, log, processo, volumes e console.
- Passagem de bastao apenas quando a etapa exigir. Havendo prova suficiente, seguir direto a proxima etapa sem pedir confirmacao repetida. Uma caneta por escopo. Nao automatizar destruicao cega de particao.
- Cua: obter PID/HWND e snapshot atuais. Controle acessivel antes de coordenada. Na caixa de particoes do VMware, clicar item seleciona linha, nao necessariamente marca checkbox: pressionar Space no item focado e conferir imagem com marca. effect=unverifiable nao certifica efeito. PowerShell 5.1 passa JSON ao cua-driver por stdin, nao por argumento mal escapado.

## Fluxo reutilizavel e gates
1. IDENTIDADE: mapear modelo/capacidade/serie do SSD, host PhysicalDriveN, guest /dev/sdX, tabela MBR/GPT, boot, root, DATA, SWAP, labels/UUIDs, .vmx/.vmdk atuais e processos VMware. Nunca fixar numeros historicos.
2. PARTICIONAMENTO: se DATA esta montada, nao reduzir online. GParted Live offline, backup/layout antes, CHEFE opera se necessario, comprovar duas operacoes completas. Se particoes ja existem, NAO REFAZER.
3. HOST: Windows reidentifica tabela com Update-HostStorageCache (nao modifica particoes). Conferir Get-Disk, Get-Partition e Get-Volume. NTFS VMWARE e para os arquivos pequenos da VM no host; NUNCA mapear a propria NTFS ao convidado em execucao.
4. QUIESCE: desligar guest e confirmar vmrun list = 0 e ausencia de vmware-vmx.exe. Preservar originais e comparar copia de VMX/VMDK descriptor/NVRAM/VMXF via SHA-256. Backup de configuracao nao equivale a backup integral DATA.
5. STAGING: copiar a configuracao para a NTFS, abrir a COPIA do VMX no VMware. Na copia remover a referencia ao disco antigo, nao apagar o disco. Add -> Hard Disk -> controlador original -> Use a physical disk -> verificar fisico correto -> Use individual partitions.
6. SELECAO: capturar tabela GUI de particoes e respectivos tamanhos. Marcar so SYSBOOT, SYSROOT, DATA e SWAP, sem NTFS. Numeracao Partition 1..4 da GUI pode ser diferente de /dev/sda1,5,6,7. Confirmar as quatro marcas VISUALMENTE antes de Next.
7. DESCRIPTOR: gerar VMDK no diretorio da NTFS, com auxiliar -pt.vmdk. Ler VMDK e exigir createType="partitionedDevice", extents corretos e regioes nao selecionadas como ZERO, inclusive NTFS, sem inventar offsets. O VMDK referencia o SSD fisico, mas so expõe as particoes selecionadas.
8. VMX: salvar novo .vmx referenciando VMDK relativo. Original .vmx nao muda. Iniciar apenas a copia. Aviso "I Moved It" para mesma VM migrada preserva identidade; aviso cache do raw disk informa que descriptor deve ser recriado se layout/bootloader mudar.
9. CONTRAPROVA: vmrun list retorna caminho VMX na NTFS; cmdline vmware-vmx.exe retorna MESMO VMX; console chega ao Linux; SSH id/hostname; lsblk -f, findmnt, swapon --show mostram sistema e UUIDs; Windows Get-Volume confirma NTFS Healthy acessivel DURANTE boot convidado. So entao FIXED_POINT.
10. RECEIPT: INTENCAO, OWNER, CURRENT, DELTA, PROVA VISUAL, PROVA CLI, CONTRAPROVA, ROLLBACK, NEXT_CURSOR e STATUS PASS|PARTIAL|UNKNOWN|FAIL. Nenhum clique isolado, arquivo novo ou vmware-vmx.exe isolado prova o boot.

## Limites e seguranca operacional
Nao repetir shrink, nao formatar, nao abrir fullDevice e partitionedDevice juntos, nao editar LBA manualmente sem inventario e teste, nao escrever nos setores usados simultaneamente por host e guest. A NTFS anfitria deve ficar fora dos extents do guest. Caso erro, desligar copia, restaurar via VMX/VMDK originais verificados; nao apagar estado anterior. Sem commit/push/deploy implicito.

## Referencias
- Caso real, mapeamento e recibo 2026-11-03: references/RECEITA-KINGSTON-20261103.md
- Probe parametrizado somente leitura, sem mudar disco ou VM: scripts/Verify-CentralDarkVmware.ps1
- Skill visual existente: ../centraldark-hermes-visual-computer-use/SKILL.md
- SSH/Hermes existente: ../centraldark-hermes-operations/SKILL.md

## Estado comprovado do exemplo
Em 2026-11-03: VMware rodando D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx; VMDK partitionedDevice no mesmo Kingston; quatro particoes Linux e swap montadas; SSH root uid=0; Windows D: rotulo VMWARE NTFS Healthy acessivel durante a VM; original em E: preservado. O backup SHA-256 verificado foi somente dos arquivos de configuracao, NAO da DATA integral.


## 2026-11-03 | Desktop remoto da Forja por SSH + XRDP

**Intencao:** Windows Casa operar graficamente o UKUI do openKylin 3.0 no VMware, sem depender da VPS, sem expor RDP na internet e sem criar outra ponte MCP. A tela XRDP e uma sessao Xorg virtual, nao o espelho do console VMware.

**Rota comprovada:** Windows mstsc -> 127.0.0.1:13390 -> SSH por chave existente (alias openkylin-vm, arquivo F:\CentralDark\.ssh\config_openkylin) -> XRDP local 127.0.0.1:3389 no Linux -> Xorg -> UKUI. O alias SSH resolve a IP guest NAT 192.168.35.130 nesta medicao e pode mudar; nao codificar IP no launcher. Nao usar chave root para forwarding: a chave root tem opcao restrict e o tunel nao passou RDP; a chave do usuario normal CentralDark-OS passou. Preservar root.

### Implementacao observada
- Pacotes openKylin instalados: xrdp 0.10.1-ok1 e xorgxrdp 1:0.10.2-ok1, apenas 2 pacotes, sem recomendações; servicos xrdp e xrdp-sesman ativos e habilitados.
- Configuracao /etc/xrdp/xrdp.ini: port=tcp://127.0.0.1:3389 (antes port=3389; backup xrdp.ini.centraldark-before-loopback-20261103). Readback ss -lntp PASS: nenhuma escuta RDP em 0.0.0.0.
- Usuario /home/CentralDark-OS/.xsession foi criado com owner certo para iniciar /usr/bin/ukui-session. Boot continua multi-user.target, sem ativar LightDM; disco e particoes VMware nao foram tocados.
- Windows 11 Pro estava sem mstsc.exe. Cliente nativo foi restaurado pelo instalador oficial Microsoft Learn, Authenticode Valid assinado por Microsoft Corporation; mstsc.exe voltou ao System32.
- Tunel SSH usuario comum 127.0.0.1:13390 -> 127.0.0.1:3389 respondendo X.224 (19 bytes; prefixo 03-00-00-13, resposta X.224 Confirm) => RDP_HANDSHAKE=PASS.
- Janela Windows MSTSC exibiu visualmente Login to CentralDark-OS, Session Xorg e campos username/password. Isso comprova acesso ao LOGIN RDP, nao autenticação do UKUI. CHEFE informa usuario CentralDark-OS e senha Linux somente na janela grafica, sem compartilhar senha no chat.
- O tunel preliminar root na porta local 13389 foi interrompido apos verificar que o tunel valido do usuario normal estava funcionando. Nao codificar PIDs da sessao historica.
- Launcher proprio: scripts/Open-CentralDarkForjaRDP.ps1, dentro desta Skill. Modo -CheckOnly somente leitura. Reusa tunel existente ou cria novo via SSH e abre o mstsc. Testado PowerShell parser 0 erros; -CheckOnly retornou RDP_HANDSHAKE=PASS.
- Atalho Windows C:\Users\Administrador\Desktop\CentralDark - Forja Remota.lnk apontando para o launcher, sem guardar credenciais. O atalho e local ao Windows, nao parte do Git.

### Tailscale: segunda rota, nao confundir com VMware NAT
- Casa Windows Tailscale IPv4 observada 100.123.93.25, online.
- openKylin: Tailscale 1.104.5 ativo e IP atribuido 100.81.207.32, mas estado Machine is not yet approved by tailnet admin. IP atribuido != peer aprovado.
- So apos aprovacao explicita pelo dono e readback do peer permitido, a opcao oficial para acesso privado remoto e Tailscale Serve com forwarding TCP 3389 para o XRDP local: tailscale serve --tcp=3389 tcp://localhost:3389. NAO usar Funnel, nao abrir porta publica nem ativar Serve antes do gate. Serve ainda nao foi configurado; TAILSCALE_RDP_E2E=UNKNOWN.
- A VPS continua ambiente opcional do mesmo produto e NAO participa desta rota do VMware. O controle MCP CentralDark e o OAuth do Desktop Commander sao rotas distintas, nao trocar tokens ou refazer login para o RDP.

### Gates e replay
- XRDP_SERVICE=PASS; XRDP_LOCAL_BIND=PASS; WINDOWS_MSTSC=PASS; SSH_USER_TUNNEL=PASS; RDP_X224=PASS; RDP_LOGIN_VISUAL=PASS.
- UKUI_DESKTOP_AUTH=WAITING_FOR_HUMAN_PASSWORD; TAILSCALE_DEVICE_APPROVAL=PENDING; TAILSCALE_SERVE_RDP=NOT_CONFIGURED.
- Replay: executar o launcher no Windows, conferir seu handshake, na tela RDP escolher Xorg, usuario CentralDark-OS e senha local. Para erro de sessao, consultar journalctl xrdp / xrdp-sesman e preservar os demais servicos.
- NEVER claim fixed point da sessao grafica autenticada ou conexao tailnet ate provas especificas. Uso da VPN nunca substitui senha do usuario Linux.
