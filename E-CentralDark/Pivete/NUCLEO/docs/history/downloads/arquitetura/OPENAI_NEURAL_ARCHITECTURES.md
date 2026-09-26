# OPENAI — ARQUITETURAS NEURAIS E SISTÊMICAS PUBLICAMENTE DOCUMENTADAS

## Neural / model architecture

### GPT-4
**Publicado:** Transformer-style.  
**Não publicado no relatório:** topologia completa, tamanho, hardware, treinamento detalhado.

### gpt-oss
**Publicação aberta mais específica:**
- autoregressive Transformer;
- Mixture-of-Experts;
- 120b: 36 layers, 116.8B total, 5.1B active/token;
- 20b: 21B total, 3.6B active/token;
- alternating dense + locally banded sparse attention;
- grouped multi-query attention;
- RoPE;
- 128k context.

### Whisper
- encoder-decoder Transformer;
- áudio reamostrado → log-Mel spectrogram;
- encoder;
- decoder autoregressivo textual;
- tokens especiais para idioma, timestamps, transcription/translation.

### CLIP
- image encoder: ResNet ou Vision Transformer;
- text encoder: Transformer;
- projeção para embedding multimodal;
- objective contrastivo simétrico.

## System / agent architecture — NÃO neural

### Agents SDK
- Model
- Tools
- Instructions
- Handoffs
- Guardrails
- Tracing / Observability

### GPT-5.6 workflow primitives
Publicamente descritos em 2026:
- reasoning persistence;
- native compaction;
- native multi-agent orchestration;
- programmatic tool calling;
- agentic harness para reduzir context bloat e trabalho repetido.

## UNKNOWN obrigatório

Não declarar como fato:
- número de camadas do GPT-5.6;
- número de experts do GPT-5.6;
- hidden dimension;
- attention heads;
- exact routing topology;
- qualquer “animal brain blueprint” usado internamente.

Sem fonte oficial específica:
`UNKNOWN != PASS`
