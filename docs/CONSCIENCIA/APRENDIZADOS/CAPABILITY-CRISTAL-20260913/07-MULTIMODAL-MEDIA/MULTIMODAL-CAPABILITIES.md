# Multimodal / Media capabilities

A CentralDark deve tratar texto, imagem, áudio e vídeo como sources com provenance.

```text
VIDEO
→ source hash
→ transcript
→ frame extraction
→ timestamps
→ frame hashes
→ scene dedupe
→ image embeddings
→ chapter semantic index
→ trace
→ evidence
→ graph projection
```

Do inemaVOX, os candidatos úteis são:

- download job;
- ASR;
- tradução;
- TTS;
- voice clone;
- dublagem;
- diarização;
- sync;
- job queue;
- WebSocket progress;
- model manager;
- GPU/CPU fallback;
- checkpoint/resume.

Nada disso cria outro media-core: são adapters/capabilities do owner de mídia.
