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
