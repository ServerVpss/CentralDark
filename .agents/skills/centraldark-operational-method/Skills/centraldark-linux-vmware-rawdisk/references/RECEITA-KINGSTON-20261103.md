# Receita comprovada: Kingston + openKylin + VMware Workstation (2026-11-03)

## Escopo e propriedade
Operacao HIBRIDA, realizada pela Casa, com CHEFE responsavel pelo GParted Live e SOL/Hermes responsavel pela verificacao e migracao GUI/CLI. E um RECEIPT HISTORICO com FIXED_POINT naquela sessao, nao licenca para reparticionar outra maquina. VMware Workstation 26.0.1, fisico Kingston SA400S37480G 480103981056 bytes (447.1 GiB). Windows Disk 1 / \\.\PhysicalDrive1, Linux /dev/sda, MBR/dos. NUNCA derivar nome do disco somente do numero; revalidar modelo.

### Layout final (conferido com SSH)
- /dev/sda1: 2 GiB, ext4, SYSBOOT, UUID f120bf5c-a56a-47f5-bb80-20eceb5118cf, /boot.
- /dev/sda5: 40.5 GiB, ext4, SYSROOT, UUID 20f236d1-f1b1-4530-9796-392a218aeded, / /usr /var /sysroot.
- /dev/sda6: 385.4 GiB, ext4, DATA, UUID 27deeaad-8671-469f-a6c0-3c7225e96aa6, /data /home /root.
- /dev/sda7: 9.2 GiB, swap, SWAP, UUID 1cb9c7e1-7e91-4e12-87e4-18d4eb284373, [SWAP].
- /dev/sda8: 10 GiB, NTFS, VMWARE, UUID 6755B22D117A97E8; Windows D: quando host enxerga o fisico. **Nao aparece no guest apos descriptor particionado**, por design.
- MBR /dev/sda2 e particao estendida, nao filesystem. Get-Partition Windows identificou NTFS como PartitionNumber 5: os indices nao coincidem com Linux.

### Rota manual do CHEFE (historico ja concluido)
1. GParted Live pela ISO apenas durante manutencao, com particoes Linux offline.
2. Diminuir DATA do final em 10 GiB: 395.39 -> 385.39 GiB.
3. Criar nova particao logica NTFS 10.00 GiB sem deslocar SYSROOT ou SWAP.
4. CHEFE mostrou dois checks verdes na janela de operacoes concluidas; depois reiniciou, removeu boot automatico da ISO, openKylin iniciou. Nao repetir.
5. Windows precisou Update-HostStorageCache para enumerar D: VMWARE NTFS Healthy; nao formatar de novo.
6. Root SSH ja persistente por chave na Casa, restrito a origem 192.168.35.1. Sudo NOPASSWD:ALL para o usuario Linux foi confirmado no caso; e permissao elevada, deve ser revista ao mudar escopo/host.

### Rota automatizada SOL/Hermes (historico comprovado)
1. Conferir VM desligada: vmrun.exe list -> Total running VMs: 0; sem vmware-vmx.exe. Nao editar o descriptor antigo enquanto ativa.
2. Backup validado SHA-256 dos arquivos pequenos (.vmx, descriptor .vmdk, .nvram) em F:\CentralDark\backups\storage-20261103\vmware-before-partitioned-20261103. O backup DATA parcial anterior NAO era backup completo validado. Guardar original VMX: E:\VMs\CENTRALDARK-OS\CENTRALDARK-OSh.vmx; antigo descriptor: E:\VMs\CENTRALDARK-OSh\CENTRALDARK-OSh.vmdk com createType="fullDevice".
3. Staging inicial em D:\CENTRALDARK-OSh\ (VMX, NVRAM, VMXF copiados com hashes). Abrir D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx, segunda aba VMware, manter E: na primeira aba.
4. Em Settings da COPIA: remover Hard Disk (SCSI) da configuracao, sem deletar fisico nem arquivos. Add... > Hard Disk > SCSI > Use a physical disk (for advanced users) > Device = PhysicalDrive1 (evitar default PhysicalDrive0!) > Use individual partitions.
5. Wizard mostrou exatamente quatro caixas selecionaveis:
    Partition 1 Linux 2 GB = SYSBOOT
    Partition 2 Linux 40.5 GB = SYSROOT
    Partition 3 Linux 385.4 GB = DATA
    Partition 4 Linux swap 9.2 GB = SWAP
   A NTFS 10 GiB nao foi listada. Cada item foi selecionado por UIA/Cua e tecla Space; nova captura confirmou quatro caixas marcadas. CUA click sozinho apenas selecionava a linha, sem marcar checkbox!
6. Finish criou D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmdk com createType="partitionedDevice" e D:\CENTRALDARK-OSh\CENTRALDARK-OSh-pt.vmdk (128 KiB). O VMDK tinha 5 extents fisicos: um RDONLY de padding e 4 RW das particoes Linux; gaps e area NTFS como ZERO. O arquivo apontava ao PhysicalDrive1 so nos extents autorizados, nao ao disco inteiro como fullDevice.
7. Settings OK salvou D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx com scsi0:0.fileName = "CENTRALDARK-OSh.vmdk" e scsi0:0.deviceType = "rawDisk". E: original seguiu com caminho E: do antigo descriptor.
8. Iniciar com vmrun -T ws start D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx gui. VMware perguntou se movido ou copiado: escolheu I Moved It. Avisou raw disk cache: OK. VMware declarou Total running VMs: 1 com VMX em D:.
9. Evidencia visual de console: openKylin 3.0 CentralDark-OS tty1 e prompt login. VMware Tools getGuestIPAddress -> 192.168.35.130.
10. SSH por chave ao alias openkylin-root respondeu BOOT_SSH_OK, hostname CentralDark-OS, uid=0(root), lsblk e UUIDs das particoes /dev/sda1,5,6,7, findmnt / = ext4 em sda5, swapon --show sda7.
11. Windows Get-Volume -DriveLetter D respondeu VMWARE NTFS Healthy *durante vmware-vmx.exe ativo*. CommandLine do processo vmware-vmx.exe apontava para D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx. Arquivos D: .vmx/.vmdk/-pt.vmdk observados. Original E: nao foi alterado no escopo.

### Readback que qualquer executor pode repetir (somente leitura)
PowerShell no Windows, com VMware instalado, adaptando caminhos medidos:

    & 'C:\Program Files\VMware\VMware Workstation\vmrun.exe' -T ws list
    Get-CimInstance Win32_Process -Filter "name='vmware-vmx.exe'" | Select-Object ProcessId,CommandLine
    Get-Disk | Where-Object FriendlyName -Match 'KINGSTON'
    Get-Volume -DriveLetter D
    Select-String -Path 'D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmdk' -Pattern 'createType|PhysicalDrive|ZERO|pt.vmdk'
    Select-String -Path 'D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx' -Pattern '^scsi0:0\.(fileName|deviceType)'

SSH apos boot, com a chave ja instalada:

    ssh -T -o BatchMode=yes -o ConnectTimeout=6 -F F:\CentralDark\.ssh\config_openkylin openkylin-root 'hostname; id; lsblk -f /dev/sda; findmnt -no SOURCE,FSTYPE /; swapon --show'

Ou usar scripts/Verify-CentralDarkVmware.ps1 na mesma Skill, sem mudancas de estado.

### Receita GUI do CUA, detalhes raros reaproveitaveis
- Janela: titulo, PID e HWND atuais por cua-driver call list_windows; get_window_state fornece snapshot_id/element_token. Nao fixar indices/cotas.
- PS 5.1 nao preserva JSON com aspas em argv; usar pipe: '{"pid":2992,"window_id":331456}' | cua-driver call get_window_state. Valores PID/HWND acima sao so prova historica; nao copiar no replay.
- Eventual caixa do Wizard e list item: click -> focus, press_key key=space -> checkbox. Screenshot novo deve mostrar o check. Selecionar a linha NAO comprova checkbox.
- Ajustes visuais devem ser readback antes de Next e antes de Finish. Nao repetir comando devido a effect=unverifiable.
- Para outras maquinas consultar controladores (SCSI/IDE/SATA), BIOS e bootloader reais; nao assumir SCSI universal.

### Gates de rollback
Se novo descriptor falhar, desligar/fechar a copia e recuperar VMX/VMDK originais preservados; nao misturar dois descriptors ativos no mesmo SSD. Nunca escolher Format, Initialize, Clean, Create new virtual disk ou Replace sem cheque de identidade e escopo. O .vmdk -pt contem snapshot de metadata de particionamento; quando particionamento ou bootloader mudar e necessario recriar o descriptor pelo Wizard. Alteracoes na NTFS de host nao devem ser vistas pelo guest; se guest enxergar sda8, reprovar exclusao da NTFS e interromper.

### Receipt final
INTENCAO=VMWARE_RAW_PARTITIONED_ON_KINGSTON
EXECUCAO=HIBRIDA_MANUAL_GPARTED_AUTOMACAO_CUA_CLI
OWNER=centraldark-linux-vmware-rawdisk
HISTORICO=2026-11-03
GUI_PARTITIONS=4_LINUX_SELECTED
VMDK=partitionedDevice
VMX_RUNNING=D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx
GUEST_BOOT=openKylin_tty1_PASS
SSH_ROOT=uid0_PASS
SYSBOOT_SYSROOT_DATA_SWAP=UUIDS_PASS
NTFS_HOST=VMWARE_D_Healthy_CONCURRENT_PASS
ORIGINAL_VMWARE_E_PRESERVED=PASS
DATA_FULL_BACKUP=NOT_PROVEN
STATUS=FIXED_POINT_HISTORICO
NEXT_CURSOR=REPLAY_WITH_FRESH_DISK_ID_PATHS_ONLY_IF_NEW_INTENT
