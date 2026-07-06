
## Síntese final — Bridge vNext (Claude Code-ready)

Um PR só, um arquivo só, pronto pra Claude Code enxergar tudo no dropdown e o AUTO decidir sozinho — inclusive quando gerar áudio.

### O que muda

- **Arquivo:** `apps/modulos/lovable-openai-bridge/server.mjs` (único).
- **Branch:** `feat/bridge-router-hermes-tts`.
- **Fluxo:** Lovable → GitHub (PR) → merge → VPS (`pm2 restart`).
- **Fora de escopo:** frontend, Open WebUI, MCPO, áreas 🔒, novos PM2, novos domínios.

### Catálogo categorizado em `/v1/models`

Cada modelo com `id`, `name` bonito com emoji e `owned_by` pro Claude Code agrupar sozinho:

```text
🤖 AUTO       auto · auto-fast · auto-smart · auto-cheap · auto-voice
🏛️ HERMES     hermes · hermes-dispatch · hermes-status
🧠 CLAUDE     claude-opus-4-1 · claude-sonnet-4-5 · claude-haiku-4-5
🚀 OPENAI     gpt-5 · gpt-5.5 · gpt-5-mini · gpt-5-nano (+ variantes)
⚡ GOOGLE     gemini-3-flash-preview · 3.1-flash-lite · 3.5-flash · 2.5-pro · 2.5-flash
🎨 IMAGEM     gemini-3.1-flash-image · gpt-image-2
🔊 VOZ        voice · gpt-4o-mini-tts
🧬 EMBEDDING  gemini-embedding-001 · text-embedding-3-small · 3-large
```

### Roteador AUTO (heurística leve)

```text
auto-fast   → gemini-3-flash-preview
auto-smart  → gpt-5.5
auto-cheap  → gpt-5-nano
auto-voice  → responde em texto + gera áudio automático
auto        → detecta intenção:
              código/stack trace     → gpt-5
              prompt > 2000 chars    → gpt-5.5
              "desenha/gera imagem"  → gemini-3.1-flash-image
              "fala isso/áudio/voz"  → dispara TTS
              resto                  → gemini-3-flash-preview
```

Header `X-Bridge-Router: auto→gpt-5` sempre presente pro Pivete auditar.

### Hermes virtual

- `hermes` → cria missão com o prompt + devolve resumo.
- `hermes-dispatch` → mesma coisa, prioridade alta.
- `hermes-status` → só consulta estado (ignora prompt).

Bridge chama `HERMES_BASE_URL` (127.0.0.1) e devolve texto formatado. Se Hermes offline: `🏛️ Hermes indisponível agora — tenta em 30s.`

### TTS com "play nativo" possível

Claude Code (CLI + VSCode) só renderiza texto/markdown — não existe player embutido. O mais nativo que dá é:

1. Bridge chama `openai/gpt-4o-mini-tts` via Lovable AI Gateway.
2. Salva `mp3` em `/var/lib/lovable-bridge/audio/<uuid>.mp3` (700, TTL 24h, limpeza no boot).
3. Expõe `GET /audio/<uuid>.mp3` (Content-Type correto, cache 24h, nome UUID, sem listagem).
4. Devolve resposta com:

```text
🔊 Áudio (24h): https://bridge.centralldark.com/audio/<uuid>.mp3
▶️ Cmd/Ctrl+clique pra tocar no player nativo do sistema.

<texto da resposta, quando auto-voice>
```

VSCode, iTerm e Windows Terminal abrem o link no player padrão do OS (QuickTime/Media Player/mpv). Sem companion, sem hack.

### Ambas as rotas

`/v1/chat/completions` **e** `/v1/messages` passam pelo mesmo dispatcher, que trata `auto*`, `hermes*`, `voice` e `claude-*` antes de chamar o provider real. Resposta formatada no shape de cada rota (OpenAI-compat ou Anthropic-compat).

### Config (env)

```bash
BRIDGE_PUBLIC_BASEURL=https://bridge.centralldark.com
BRIDGE_AUDIO_DIR=/var/lib/lovable-bridge/audio
BRIDGE_AUDIO_TTL_HOURS=24
BRIDGE_TTS_ENABLED=true
BRIDGE_TTS_MODEL=gpt-4o-mini-tts
BRIDGE_TTS_VOICE=alloy
HERMES_BASE_URL=http://127.0.0.1:3299
HERMES_TIMEOUT_MS=10000
BRIDGE_RATE_LIMIT_RPM=120
```

`WEBUI_LOVABLE_KEY` continua sendo a chave upstream (já existe, nada novo).

### Segurança & observabilidade

- Nomes UUID v4, TTL 24h, sem listagem de diretório, sem logar URL completa em INFO.
- Rate limit por IP (RPM configurável).
- Header `X-Bridge-Router` em toda resposta.
- Métricas opcionais (req/modelo, tts_total, falhas, duração) — plugáveis no mesmo PR se quiser.

### Testes de aceitação (rodo no PR)

```bash
# Catálogo com pelo menos 30 modelos
curl -s $BRIDGE/v1/models | jq '.data | length'   # >= 30

# AUTO detecta código → gpt-5
curl -s $BRIDGE/v1/messages -d '{"model":"auto","messages":[{"role":"user","content":"```js\nconsole.log(1)\n```"}]}' -D - | grep X-Bridge-Router

# AUTO detecta voz → link de áudio
curl -s $BRIDGE/v1/messages -d '{"model":"auto","messages":[{"role":"user","content":"me responde falando isso"}]}' | jq -r '.content[0].text'

# Voice direto gera MP3 acessível
curl -s $BRIDGE/v1/messages -d '{"model":"voice","messages":[{"role":"user","content":"Olá"}]}' | jq -r '.content[0].text'
curl -sI https://bridge.centralldark.com/audio/<uuid>.mp3   # 200 + audio/mpeg

# Hermes status
curl -s $BRIDGE/v1/messages -d '{"model":"hermes-status","messages":[{"role":"user","content":""}]}' | jq
```

### Deploy (após merge)

```bash
sudo install -d -m 700 /var/lib/lovable-bridge/audio   # 1ª vez só; runtime também cria
pm2 restart CentralDark-LovableBridge --update-env
pm2 save
```

Backup automático: `server.mjs.bak-router-<timestamp>` no diretório do bridge.

### Resultado

Claude Code passa a mostrar dropdown organizado por categoria, AUTO escolhe modelo sozinho, Hermes vira modelo virtual e áudio gera link clicável que abre no player nativo do OS. Nada quebra do que já funciona.

---

Confirma **"PERMITO PIVETE"** que eu abro o PR no fluxo Lovable → GitHub → VPS.
