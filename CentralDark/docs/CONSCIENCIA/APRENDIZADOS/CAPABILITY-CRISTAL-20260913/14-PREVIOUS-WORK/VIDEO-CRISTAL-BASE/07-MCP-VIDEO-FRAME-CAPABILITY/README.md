# MCP capability — video_frames_extract_local

## Finalidade

Adicionar ao MCP uma tool que extrai frames de arquivo de vídeo LOCAL e autorizado.

### Modos

- `all`: todos os frames disponíveis.
- `fps`: amostragem por FPS, por exemplo 1 frame/segundo.
- `timestamps`: somente instantes informados.

### Dependências

```bash
ffmpeg -version
ffprobe -version
node --version
```

### Exemplo de chamada

```json
{
  "input_path": "/tmp/meu-video.mp4",
  "output_dir": "/tmp/centraldark-video/aula-01",
  "mode": "fps",
  "fps": 1,
  "image_format": "png"
}
```

### Frame a frame

```json
{
  "input_path": "/tmp/meu-video.mp4",
  "mode": "all",
  "image_format": "png"
}
```

O tool gera `frame-manifest.json` contendo hash da fonte, probe do vídeo, contagem, timestamp estimado e SHA-256 de cada frame.

## Regra de arquitetura

```text
NEW_MCP=false
EXTEND_EXISTING_MCP=true
TOOL_OWNER=existing CentralDark MCP
REMOTE_DOWNLOAD=false
LOCAL_INPUT_ONLY=true
EVIDENCE_MANIFEST=true
```

A integração final deve registrar a tool no dispatcher/catálogo MCP já existente, sem abrir segundo servidor.
