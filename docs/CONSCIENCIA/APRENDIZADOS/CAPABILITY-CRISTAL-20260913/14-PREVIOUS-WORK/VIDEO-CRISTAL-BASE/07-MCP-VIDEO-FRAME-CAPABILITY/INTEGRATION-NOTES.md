# Integração no MCP existente

Não criar servidor separado.

Pseudo-wiring:

```js
import {
  tool as videoFramesTool,
  handleVideoFramesExtractLocal
} from "./video-frame-tool/mcp-tool-adapter.mjs";

registerTool(
  videoFramesTool.name,
  videoFramesTool,
  handleVideoFramesExtractLocal
);
```

## Gate de aceitação

```text
1. tool aparece no catálogo
2. tool aceita apenas caminho local
3. ffprobe mede vídeo
4. ffmpeg gera frames
5. frame-manifest.json existe
6. hashes de fonte/frames existem
7. chamada de teste retorna receipt
8. nenhum segundo MCP é criado
```

## Busca de owner antes do patch

Procurar primeiro por:

```text
registerTool(
tools/list
tool catalog
dispatcher
mcp_admin_catalog
youtube_transcript
```

e estender o owner encontrado.
