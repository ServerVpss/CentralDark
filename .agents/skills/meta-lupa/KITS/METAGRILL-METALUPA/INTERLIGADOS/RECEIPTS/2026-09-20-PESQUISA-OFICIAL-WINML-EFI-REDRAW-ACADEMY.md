# 👑🪬 PESQUISA OFICIAL — WinML/DirectML + EFI Stub + Redraw Academy

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Windows GPU

Fonte oficial Microsoft/ONNX Runtime:
- WinML é o caminho recomendado para novos deployments ONNX Runtime no Windows.
- WinML pode selecionar dinamicamente o execution provider conforme hardware.
- DirectML continua suportado, porém em sustained engineering.
- DirectML exige dispositivo DirectX 12.
- ONNX Runtime documenta suporte amplo, incluindo AMD GCN 1st Gen e posteriores.

## Implicação para Casa

GPU medida: Radeon RX 580 / ~4 GB.

RX580_WINML_DIRECTML=CANDIDATE.
PERFORMANCE_PASS=UNKNOWN_UNTIL_BENCHMARK.
NO_CUDA_DEPENDENCY=true.
BACKEND_SHOULD_BE_HARDWARE_ADAPTIVE=true.

## UEFI

Documentação oficial do kernel Linux:
- CONFIG_EFI_STUB permite kernel como executável PE/COFF;
- firmware UEFI pode carregar o kernel diretamente;
- também pode existir bootloader separado;
- initrd pode ser fornecido no fluxo UEFI.

## Implicação para CentralDark OS

FIRMWARE_FLASH_REQUIRED=false.
USE_EXISTING_UEFI_STANDARD=true.

Cadeia candidata:
UEFI firmware
→ EFI entry / UKI or EFI-stub-capable kernel
→ kernel
→ initramfs
→ userspace CentralDark
→ CENTRALDARK_AI_BOOT
→ agentic runtime.

## Redraw Academy

Fonte oficial descreve módulos:
- primeiros passos;
- prompts eficientes;
- iluminação e atmosfera;
- otimização de modelo 3D;
- refinamento/distorção/realismo;
- tutoriais em vídeo.

ACADEMY_KNOWLEDGE_SOURCE=true.
ACADEMY_RUNTIME_DEPENDENCY=false.
KNOWLEDGE_TO_SKILL_MINING_CANDIDATE=true.

## NEXT_CURSOR

Pesquisar implementação atual de bootc/UKI/image factory apropriada ao owner OS e definir menor binding executável no repo.
