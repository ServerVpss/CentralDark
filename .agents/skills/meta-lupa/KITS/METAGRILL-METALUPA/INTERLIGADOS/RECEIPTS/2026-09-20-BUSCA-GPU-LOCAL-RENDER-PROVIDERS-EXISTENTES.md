# 👑🪬 BUSCA — GPU local / render / providers existentes

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Peças existentes encontradas

### Local model providers
- Bolt possui provider Ollama.
- Bolt possui LMStudio/OpenAI-like.
- localModelHealthMonitor já existe.
- UI de local providers já existe.
- SetupGuide menciona aceleração NVIDIA/CUDA e detecção de GPU.

### Runtime/GPU contracts
- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RUNTIME-PLUG-CONTRACT.yml mede CPU/RAM/GPU/VRAM/DISK/NETWORK.
- CAPABILITY-READINESS-POLICY.yml conhece GPU_RUNTIME.
- LIVE_STATE já registra GPU_LIVE_PROBE como residual/yellow.

### IA/imagem existentes
- WebUI tem image_generation configurável.
- Hub já lista connectors de Replicate, Stability AI e fal.ai.
- Catálogo possui modelos de geração/edição de imagem.
- elite-gateway usa onnxruntime.

### Outros sinais
- OLHO-BIONICO-ANTI-FLASH já declara GPU=CUDA|MPS quando disponível e medido.
- WebGPU existe em lab visual, não como prova de compute AI runtime.

## Ausências não provadas como implementação canônica

COMFYUI_IMPLEMENTED=false_by_search.
ROCM_IMPLEMENTED=false_by_search.
DIRECTML_IMPLEMENTED=false_by_search.
VULKAN_AI_RUNTIME_IMPLEMENTED=false_by_search.
STABLE_DIFFUSION_LOCAL_IMPLEMENTED=false_by_search.

Ausência por busca continua subordinada a nova evidência; não é prova absoluta.

## Arquitetura derivada

EXISTING_LOCAL_PROVIDER_LAYER
+ RUNTIME_PLUG_GPU_TELEMETRY
+ OMNI_ROUTER
+ IMAGE_PROVIDER_CAPABILITIES
→ ADAPTIVE_GPU_EXECUTION_CANDIDATE

Sem vendor lock-in.

## Regra

CAPABILITY_FIRST=true.
PROVIDER_REPLACEABLE=true.
LOCAL_GPU_IF_MEASURED_AND_CAPABLE=true.
VPS_GPU_IF_MEASURED_AND_CAPABLE=true.
CLOUD_PROVIDER_ONLY_AS_OPTIONAL_FALLBACK=true.

## NEXT_CURSOR

Medir hardware GPU/VRAM e runtimes disponíveis na Casa e VPS antes de escolher CUDA/ROCm/DirectML/MPS ou qualquer engine.
