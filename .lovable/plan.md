# Bridge vNext.1 — auth híbrido + player de áudio que toca no Windows

## Por que precisa mudar

**1) Auth híbrido (baseado na doc oficial + CodeRouter):**
O Claude Code manda a chave em **dois headers diferentes** dependendo do modo:
- `ANTHROPIC_API_KEY` (modo direto) → envia `x-api-key: <chave>`
- `ANTHROPIC_AUTH_TOKEN` (modo gateway/proxy) → envia `Authorization: Bearer <chave>`

Hoje o bridge só aceita um dos dois — quem configurar do "jeito errado" leva 401. O painel do usuário já tem o seletor "Esquema de autenticação do gateway", mas o servidor precisa aceitar **os dois ao mesmo tempo** pra ser tolerante.

**2) Áudio não toca no Claude Code Desktop Windows:**
Confirmado na fonte do Claude Code (`@anthropic/ink` = renderizador TUI de terminal): **não existe player de áudio embutido**. Ele só renderiza texto, markdown, tool_use, tool_result e imagem. Áudio inline é impossível pelo cliente.

O caminho real é o **link clicável** que abre no navegador do Windows. Se hoje "não toca", é porque:
- a URL pode estar chegando sem `https://` absoluto (Windows Terminal não linkifica);
- o MP3 servido pode estar vindo com `Content-Disposition: attachment` (força download em vez de tocar);
- não existe fallback quando o terminal não é clicável (PowerShell antigo, `cmd.exe`).

## O que fazer (patch único no `server.mjs` da VPS)

Branch: `feat/bridge-auth-hibrido-player-audio`. Backup: `server.mjs.bak-auth-<timestamp>`.

### A) Auth híbrido nas rotas `/v1/*`

Middleware `extrairChave(req)` que aceita, nesta ordem:
1. `x-api-key: <chave>`
2. `Authorization: Bearer <chave>`
3. `Authorization: <chave>` (fallback tolerante)

Compara em tempo constante contra `WEBUI_LOVABLE_KEY`. 401 só se **nenhum** dos headers bater. Header de resposta `X-Bridge-Auth-Scheme: x-api-key|bearer` pra auditoria.

### B) Áudio que realmente toca no Windows

Três melhorias na rota TTS:

1. **Rota nova `GET /play/<uuid>`** — devolve uma página HTML mínima com `<audio controls autoplay src="/audio/<uuid>.mp3">` + botão "baixar". Isso resolve terminal que não sabe tocar MP3 direto: abre o navegador padrão do Windows, autoplay dispara, funciona em qualquer versão.

2. **Rota `GET /audio/<uuid>.mp3` ajustada** — headers explícitos:
   - `Content-Type: audio/mpeg`
   - `Content-Disposition: inline; filename="fala.mp3"` (nunca `attachment`)
   - `Accept-Ranges: bytes` (Windows Media Foundation exige pra streaming)
   - `Cache-Control: public, max-age=86400`

3. **Resposta do modelo `voice`/`auto-voice`** volta em markdown com **duas linhas**:
   ```
   🔊 [▶️ Tocar agora](https://bridge.centralldark.com/play/<uuid>)
   ⬇️ [Baixar MP3](https://bridge.centralldark.com/audio/<uuid>.mp3)
   ```
   `BRIDGE_PUBLIC_BASEURL` garante URL absoluta com `https://` (Windows Terminal / Claude Code Desktop só linkificam URL absoluta).

### C) Detecção automática de intenção de voz (mantém o "auto" esperto)

Router `auto` já existe. Só ajustar heurística: se o prompt tiver `"fala", "leia", "narre", "áudio", "voz", "tts"` → roteia pra pipeline TTS **sem** o usuário precisar trocar o modelo. Header `X-Bridge-Router: auto->voice` pra auditoria.

## Validação (o AI roda antes de entregar)

- `curl -H "x-api-key: $K" .../v1/models` → 200
- `curl -H "Authorization: Bearer $K" .../v1/models` → 200
- `curl -H "x-api-key: errada" .../v1/models` → 401
- `POST /v1/chat/completions` com `model: "voice"` → resposta contém `/play/` e `/audio/`
- `curl -I .../audio/<uuid>.mp3` → `Content-Type: audio/mpeg`, `Content-Disposition: inline`, `Accept-Ranges: bytes`
- Abrir `/play/<uuid>` no navegador Windows → toca sozinho

## Fora de escopo

Frontend, Open WebUI, MCPO, áreas 🔒, novos PM2, novos domínios, novos secrets. Reuso total da infra existente.

## Deploy

```bash
pm2 restart CentralDark-LovableBridge --update-env
```

Confirma **"PERMITO PIVETE"** e eu abro o PR + deploy no mesmo fluxo (Lovable → GitHub → VPS).
