# Catálogo Abacus RouteLLM — organizado

> Snapshot **ao vivo** · `2026-07-12T12:08:06.150Z` · **140** modelos no Abacus · base `https://routellm.abacus.ai/v1`
>
> Gerado por `scripts/abacus/gerar-catalogo-organizado.mjs` (regenerável).
> JSON espelho: [`abacus-catalog.json`](./abacus-catalog.json)

## 🧭 Como ler

| Camada | Qtd | Onde |
|--------|-----|------|
| Abacus RouteLLM (cru) | **140** | `GET https://routellm.abacus.ai/v1/models` |
| Adapter OpenAI-compat | **148** | `GET /v1/models` (Arsenal + aliases + catálogo) |
| Council (regras.json) | **5** papéis | só o default do Router/Parallel/Debate/Hermes |
| HUB aba Modelos | 140 ao vivo **ou** 10 fallback | `ModelsPanel` — lista ainda **plana** (UI 🔒) |

## 📊 Resumo por tipo

| Tipo | Qtd |
|------|-----|
| chat | **68** |
| image | **35** |
| video | **28** |
| multimodal | **5** |
| audio | **3** |
| router | **1** |
| **TOTAL** | **140** |

## 📊 Resumo por família

| # | Família | Tipo | Qtd |
|---|---------|------|-----|
| 1 | 🧭 Route-LLM | router | **1** |
| 2 | 🟣 Claude (Anthropic) | chat | **9** |
| 3 | 🧠 OpenAI Reasoning (o-series) | chat | **5** |
| 4 | 💻 OpenAI Codex / Code | chat | **4** |
| 5 | 🟢 OpenAI Chat (GPT) | chat | **19** |
| 6 | 🔵 Gemini / Gemma (Google) | chat | **13** |
| 7 | ⚫ Grok (xAI) Chat | chat | **2** |
| 8 | 🐋 DeepSeek | chat | **3** |
| 9 | 🦙 Llama (Meta) | chat | **3** |
| 10 | 🔶 Qwen | chat | **3** |
| 11 | 🌙 Kimi (Moonshot) | chat | **3** |
| 12 | 🔷 GLM (Zhipu) | chat | **6** |
| 13 | ⚡ MiniMax Chat | chat | **2** |
| 14 | ✨ Mimo | chat | **1** |
| 15 | 🔊 Áudio / TTS | audio | **3** |
| 16 | 🖼️ Imagem | image | **35** |
| 17 | 🎬 Vídeo | video | **28** |

## 🎯 Council ativo (`regras.json`)

| Papel | Modelo | No catálogo Abacus? |
|-------|--------|---------------------|
| `router` | `gemini-3-flash-preview` | ✅ |
| `voz1_pro` | `gemini-3.1-pro-preview` | ✅ |
| `voz2_gpt` | `gpt-5.5` | ✅ |
| `voz3_flash` | `gemini-3-flash-preview` | ✅ |
| `juiz` | `gemini-3.1-pro-preview` | ✅ |

## 📦 Catálogo completo por família

### 🧭 Route-LLM (1)

_tipo: `router`_

- `route-llm` · _regras.disponiveis_

### 🟣 Claude (Anthropic) (9)

_tipo: `chat`_

- `claude-fable-5`
- `claude-haiku-4-5-20251001` · _regras.disponiveis_
- `claude-opus-4-5-20251101`
- `claude-opus-4-6`
- `claude-opus-4-7`
- `claude-opus-4-8` · _regras.disponiveis_
- `claude-sonnet-4-5-20250929`
- `claude-sonnet-4-6`
- `claude-sonnet-5` · _regras.disponiveis_

### 🧠 OpenAI Reasoning (o-series) (5)

_tipo: `chat`_

- `o3`
- `o3-mini`
- `o3-pro`
- `o4-mini`
- `openai/gpt-oss-120b`

### 💻 OpenAI Codex / Code (4)

_tipo: `chat`_

- `gpt-5-codex`
- `gpt-5.1-codex`
- `gpt-5.2-codex`
- `gpt-5.3-codex`

### 🟢 OpenAI Chat (GPT) (19)

_tipo: `chat`_

- `gpt-4.1`
- `gpt-4.1-mini`
- `gpt-4.1-nano`
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-5`
- `gpt-5-mini`
- `gpt-5-nano`
- `gpt-5.1`
- `gpt-5.2`
- `gpt-5.4` · _regras.disponiveis_
- `gpt-5.4-mini` · _regras.disponiveis_
- `gpt-5.4-nano`
- `gpt-5.5` · _council, regras.disponiveis_
- `gpt-5.6-luna`
- `gpt-5.6-sol`
- `gpt-5.6-terra` · _regras.disponiveis_
- `gpt-audio-1.5`
- `gpt-audio-mini`

### 🔵 Gemini / Gemma (Google) (13)

_tipo: `chat`_

- `gemini_omni_flash`
- `gemini-2.5-flash`
- `gemini-2.5-flash-image`
- `gemini-2.5-flash-preview-tts`
- `gemini-2.5-pro`
- `gemini-2.5-pro-preview-tts`
- `gemini-3-flash-preview` · _council, regras.disponiveis_
- `gemini-3-pro-image-preview`
- `gemini-3.1-flash-image-preview`
- `gemini-3.1-flash-lite` · _regras.disponiveis_
- `gemini-3.1-pro-preview` · _council, regras.disponiveis_
- `gemini-3.5-flash` · _regras.disponiveis_
- `google/gemma-4-31b-it`

### ⚫ Grok (xAI) Chat (2)

_tipo: `chat`_

- `grok-4.3`
- `grok-4.5`

### 🐋 DeepSeek (3)

_tipo: `chat`_

- `deepseek-ai/DeepSeek-V3.2`
- `deepseek-ai/DeepSeek-V4-Flash`
- `deepseek-ai/DeepSeek-V4-Pro`

### 🦙 Llama (Meta) (3)

_tipo: `chat`_

- `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`
- `meta-llama/Meta-Llama-3.1-8B-Instruct`
- `meta-llama/Meta-Llama-3.3-70B-Instruct`

### 🔶 Qwen (3)

_tipo: `chat`_

- `Qwen/Qwen3-32B`
- `Qwen/Qwen3-Coder-480B-A35B-Instruct`
- `Qwen/Qwen3.6-27B`

### 🌙 Kimi (Moonshot) (3)

_tipo: `chat`_

- `moonshotai/Kimi-K2-Instruct`
- `moonshotai/Kimi-K2.6`
- `moonshotai/Kimi-K2.7-Code`

### 🔷 GLM (Zhipu) (6)

_tipo: `chat`_

- `zai-org/GLM-4.5`
- `zai-org/GLM-4.6`
- `zai-org/GLM-4.7`
- `zai-org/GLM-5`
- `zai-org/GLM-5.1`
- `zai-org/GLM-5.2`

### ⚡ MiniMax Chat (2)

_tipo: `chat`_

- `MiniMaxAI/MiniMax-M2.7`
- `MiniMaxAI/MiniMax-M3`

### ✨ Mimo (1)

_tipo: `chat`_

- `mimo-v2-pro`

### 🔊 Áudio / TTS (3)

_tipo: `audio`_

- `elevenlabs`
- `hume`
- `openai_tts`

### 🖼️ Imagem (35)

_tipo: `image`_

- `dalle`
- `dreamina`
- `flux_kontext`
- `flux_kontext_edit`
- `flux_pro`
- `flux_pro_canny`
- `flux_pro_depth`
- `flux_pro_ultra`
- `flux2`
- `flux2_pro`
- `gpt_image_edit`
- `gpt_image15`
- `gpt_image2`
- `gpt_image2_edit`
- `grok_imagine_image`
- `grok_imagine_image_quality`
- `hunyuan`
- `hunyuan_image`
- `ideogram`
- `ideogram_character`
- `imagine_art`
- `magnific`
- `midjourney`
- `nano_banana`
- `nano_banana_lite`
- `nano_banana_pro`
- `nano_banana2`
- `qwen_image_edit`
- `recraft`
- `recraft_svg`
- `recraft_vectorize`
- `seedream`
- `seedream5_lite`
- `seedream5_pro`
- `topaz`

### 🎬 Vídeo (28)

_tipo: `video`_

- `grok_imagine_video`
- `grok_imagine_video15`
- `kling_ai`
- `kling_ai_o1`
- `kling_ai_o3`
- `kling_ai_v2`
- `kling_ai_v21`
- `kling_ai_v25`
- `kling_ai_v26`
- `kling_ai_v26_motion`
- `kling_ai_v3`
- `luma_labs`
- `minimax`
- `muse-spark-1.1`
- `runway`
- `seedance`
- `seedance_pro`
- `seedance15_pro`
- `seedance20`
- `seedance20_mini`
- `sora`
- `veo`
- `veo3`
- `veo31`
- `veo31_lite`
- `wan`
- `wan25`
- `wan27`

## ➕ Só no Adapter (não vêm do /models Abacus)

- `arsenal-router`
- `arsenal-parallel`
- `arsenal-debate`
- `arsenal-hermes`
- `claude-3-5-sonnet-latest`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-latest`
- `claude-3-opus-20240229`

## 🛠️ Regenerar

```bash
node scripts/abacus/gerar-catalogo-organizado.mjs
```

## ⚠️ Notas operacionais

1. **Catálogo 200 ≠ chat liberado** — billing Abacus pode retornar “no remaining credits”.
2. **IDs sem prefixo vendor** — Abacus rejeita `google/`, `openai/`, `anthropic/` em vários casos; IDs aqui são os oficiais do RouteLLM.
3. **HUB** — fallback estático de 10 modelos antigos só aparece se a API falhar; não é o catálogo real.
4. **Passthrough** — no Adapter, qualquer `id` deste catálogo pode ir em `model` (além dos modos `arsenal-*`).
