# 👑🪬 BUSCA MATERIAL — Redraw / Academy / GPU routing

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
SOURCE=user_attachment: Redraw - IA para Arquitetura

## Fatos observados na fonte

A fonte descreve capacidades:
- renderização arquitetônica em cerca de 20–40 segundos;
- melhoria de render preservando intenção;
- Brush para edição localizada;
- geração por texto;
- exploração de ideias/variações;
- render de esboços;
- múltiplos modelos de IA integrados;
- vídeo;
- upscale/melhoria;
- API para integrar modelos ao sistema;
- Academy/aulas práticas e suporte.

A fonte também afirma que o Redraw opera 100% em nuvem e não exige GPU local.

## Delta útil para CentralDark

ABSORB_CAPABILITIES_NOT_VENDOR_DEPENDENCY=true.

O ouro é a classe de capacidade, não a dependência do fornecedor.

Arquitetura-alvo subordinada ao contrato existente:

LOCAL_GPU_FIRST
→ VPS_GPU_IF_AVAILABLE
→ EXISTING_PROVIDER_ROUTER
→ OPTIONAL_EXTERNAL_PROVIDER

Capacidades a mapear para owners existentes:
- ARCH_RENDER
- RENDER_ENHANCE
- REGION_EDIT
- REFERENCE_STYLE_TRANSFER
- MULTI_VIEW_CONSISTENCY
- IMAGE_TO_VIDEO
- UPSCALE
- DESIGN_VARIATION
- SKETCH_TO_RENDER
- TRAINING_KNOWLEDGE_SOURCE

## Academy

Redraw Academy entra somente como SOURCE/KNOWLEDGE_MATERIAL para mineração de método.
ACADEMY_IS_NOT_RUNTIME_DEPENDENCY=true.
ACADEMY_IS_NOT_AUTHORITY=true.
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true.

## Guardrails

REUSE_BEFORE_CREATE=true.
ONE_SYSTEM_ONLY=true.
NO_VENDOR_LOCK_IN=true.
CAPABILITY_SURVIVES_PROVIDER_REMOVAL=true.
LOCAL_GPU_PREFERRED_WHEN_CAPABLE=true.
VPS_GPU_FALLBACK_WHEN_MEASURED=true.
EXTERNAL_PROVIDER_OPTIONAL=true.

## NEXT_CURSOR

Buscar no repo owners existentes de OS/kernel/UEFI/ISO/initramfs/GPU/render/provider router antes de criar qualquer pasta nova.
