# CENTRALDARK-OS Local AI Runtime Inventory

Data: 2026-10-02
Escopo: inventario local de IA/runtime na maquina `CENTRALDARK-OS`
Segredos: nenhum token/chave/valor sensivel exposto

## Sistema

- Hostname: `CENTRALDARK-OS`
- Usuario: `CENTRAKDARK-OS`
- Distro: `openKylin 3.0 (huanghe)`
- Kernel: `7.0.0-2-generic`
- Arquitetura: `x86_64`
- Ambiente: VMware
- Sessao grafica: Wayland / UKUI
- CPU: Intel Core i5-10400F, 4 vCPU visiveis
- RAM: 7.7 GiB
- Swap: 9.2 GiB
- GPU: VMware SVGA II Adapter

## IA e agentes no PATH

Provados: `codex`, `claude`, `gemini`, `kylin-bot`, `python3`, `node`, `npm`, `npx`.

Nao encontrados no PATH: `ollama`, `llama-server`, `llama-cli`, `llamafile`, `vllm`, `local-ai`, `lmstudio`, `docker`, `podman`, `rustc`, `cargo`.

Versoes provadas:

- KylinBot: 0.7.5
- Claude Code: 2.1.284
- Gemini CLI: 0.61.0
- Codex CLI: 0.159.0
- Node: v22.22.1
- npm: 9.2.0
- Python: 3.12.2
- pip: 25.1.1

## Runtimes ativos provados

- `kylin-bot daemon`, PID 3019
- `kylin-ai-runtime`, PID 3015
- `kytensor`, PID 754
- `kylin-ai-document-qa-service`
- `kylin-ai-knowledge-base-service`
- `kylin-ai-vector-engine`
- `codex app-server --managed-daemon`
- `node ./mcp/server.mjs`
- Remote Desktop Commander via Node

Nao provados como ativos: Ollama, llama.cpp server, vLLM, LocalAI, LM Studio, Docker/Podman, LLM local carregado.

## Modelos locais

Repositorio provado: `/usr/share/kylin-ai/model-repository`.

Formato principal: ONNX / Triton / kytensor.

Modelos observados:

- `matting_universal`: 378M
- `seg_sam-encoder`: 343M
- `embd_gte-base_uint8-text`: 324M
- `asr_encoder_nonstreaming`: 213M
- `embd_cn-clip_512-uint8-image`: 105M
- `tts_melo`: 87M
- `punc_ct-transformer_nonstreaming`: 70M
- `asr_encoder_streaming`: 51M
- `embd_cn-clip_512-uint8-text`: 41M
- `matting_portrait`: 35M
- `ocr_ppocr`
- `seg_sam-decoder`

Modelos carregados em processo via stubs Triton Python: ASR streaming/nonstreaming, TTS melo e ensemble ASR FSMN-VAD.

LLM classico local: `.gguf` relevante nao encontrado; `.safetensors` nao encontrado; LLM local carregado nao provado.

## KylinBot

- Binario: `/usr/bin/kylin-bot`
- Versao: 0.7.5
- Config: `/home/CENTRAKDARK-OS/.kylinbot/config.toml`
- Workspace: `/home/CENTRAKDARK-OS/.kylinbot/workspace`
- Runtime: native
- Memoria: sqlite
- Provider reportado pelo status: openrouter
- Modelo reportado: default / nao definido explicitamente
- `models status`: falha por falta de providers configurados para probe
- `doctor`: ausencia de `default_provider`, ausencia de `default_model`, ausencia de api_key no config

Gateway KylinBot:

- Config: `127.0.0.1:42617`
- Unix socket: `/home/CENTRAKDARK-OS/.kylinbot/gateway.sock`
- Prova: socket Unix existe e responde HTTP 503, dashboard web ausente
- Contraprova: TCP 42617 nao escuta

## Memoria

KylinBot:

- Backend: sqlite
- Banco: `/home/CENTRAKDARK-OS/.kylinbot/workspace/memory/brain.db`
- Health: healthy
- Total: 1 memoria
- Categoria: conversation

Kylin AI Assistant / Knowledge:

- `/home/CENTRAKDARK-OS/.config/kylin-aiassistant/knowledgeBase/knowledge_base.db`
- Tabelas: `knowledge_base`, `knowledge_file_base`

## Skills / SOPs / cron

KylinBot skills instaladas: `audio`, `keyboard`, `mouse`, `navigations`, `network-manager`, `osdserver`, `panel`, `power`, `shortcut-navigations`, `screen`, `touchpad`, `bluetooth`.

SOPs: nenhum encontrado.
Cron KylinBot: nenhuma tarefa agendada.

## Portas e endpoints

Portas escutando provadas:

- `127.0.0.1:8000`
- `127.0.0.1:8001`
- `127.0.0.1:8002`
- `100.67.163.91:8000`
- `100.67.163.91:8001`
- `127.0.0.1:45363`
- SSH: `22`
- DNS/mDNS/LLMNR: `53`, `5353`, `5355`

Configurados mas nao escutando: `127.0.0.1:42617`, `127.0.0.1:9515`, `127.0.0.1:8787`.

## Integracoes / MCP

- Codex app-server ativo
- `node ./mcp/server.mjs` ativo
- Claude MCP logs encontrados para CentralDark, Claude Docs, Figma, Gmail, Google Calendar, Google Drive, Linear, Lovable, Notion, Slack, Supabase e Vercel
- KylinBot: `mcp.enabled = false`, `mcp.servers = []`
- Remote Desktop Commander ativo via Node
- Tailscale observado como infraestrutura, nao IA

## Drift / contradicoes

- KylinBot status diz service stopped, mas `/usr/bin/kylin-bot daemon` esta ativo.
- `daemon_state.json` reporta componentes ok, enquanto TCP gateway 42617 nao escuta.
- Unix socket gateway responde HTTP 503 por dashboard web ausente.
- Codex CLI local 0.159.0 e app-server daemon 0.160.0 coexistem.
- Remote Desktop Commander apareceu duplicado.
- Provider KylinBot reporta openrouter, mas config/model probe estao inconsistentes.

## Resumo final

CURRENT_RUNTIME_SUMMARY=openKylin 3.0 com Kylin AI local ativo, KylinBot daemon ativo, Codex app-server ativo, Claude/Gemini/Codex CLI instalados; sem Ollama/llama.cpp/vLLM/LocalAI/LM Studio evidentes.
PRIMARY_LOCAL_AI=Kylin AI runtime + KylinBot. Para coding/agent externo, Codex app-server tambem esta ativo.
ACTIVE_MODEL=Modelos Kylin AI ONNX via Triton/kytensor, principalmente ASR/TTS/OCR/embedding/segmentation. LLM local ativo nao provado.
ACTIVE_PROVIDER=KylinBot reporta openrouter, mas configuracao efetiva esta inconsistente. Codex/Claude/Gemini sao CLIs remotos instalados.
MEMORY_BACKEND=KylinBot sqlite em `~/.kylinbot/workspace/memory/brain.db`; Kylin AI knowledge base em `~/.config/kylin-aiassistant/knowledgeBase`.
LOCAL_ENDPOINTS=`127.0.0.1:8000`, `127.0.0.1:8001`, `127.0.0.1:8002`, `100.67.163.91:8000`, `100.67.163.91:8001`, `127.0.0.1:45363`, SSH 22, KylinBot Unix socket.
BLOCKERS=Provider/model KylinBot nao configurado para probe; gateway TCP 42617 indisponivel; dashboard web KylinBot ausente; rotas health dos servicos 8000/8001/8002 nao identificadas.
NEXT_SMALLEST_PROBE=Identificar rotas/owners das portas 8000/8001/8002 e configurar provider/model do KylinBot somente quando autorizado.
