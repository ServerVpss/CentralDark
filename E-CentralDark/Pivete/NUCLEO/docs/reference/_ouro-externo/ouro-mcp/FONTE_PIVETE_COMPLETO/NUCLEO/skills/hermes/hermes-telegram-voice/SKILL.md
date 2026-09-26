---
name: hermes-telegram-voice
description: Enviar e receber texto + voz do Pivete via Telegram com o Hermes gateway (profile pivete). Cobre o fluxo completo de áudio (Edge pt-BR), o modo voice_mode persistente, e os pitfalls reais de envio (hermes send é texto-only, voz só em sessão viva, porta 8643 do api_server). Usar quando o Pivete mandar "faz o Telegram funcionar", "manda pro lá", ou quiser conversar por voz no celular.
---

# Hermes Telegram Voice (profile pivete)

Pipeline de texto + áudio pro Telegram do Pivete (chat_id `1901426549`, nome `SEGREDOUNLOCK`).

## Estado canônico (confirmado 2026-07-22)

- Gateway: `hermes --profile pivete gateway run` (sobe via `gateway-service/Hermes_Gateway_pivete.vbs` no Startup). PID em `gateway_state.json`.
- `tts.provider: edge` → voz **pt-BR-FranciscaNeural** (gratuito, nativo). NÃO usar `openai/echo` (inglês, quebra sem `VOICE_TOOLS_OPENAI_KEY`).
- `voice_mode` (arquivo `gateway_voice_mode.json`): `{"telegram:1901426549": "all"}` = texto + áudio. Modos válidos: `off` | `voice_only` | `all`.
- **O `gateway_voice_mode.json` é PERMANENTE** — relê do disco a cada restart (`gateway/run.py` linha 3569 `_load_voice_modes`). Reiniciar NÃO reseta o modo.

## Fluxo de envio

### Texto (qualquer shell, sem gateway rodando)
```bash
hermes --profile pivete send -t telegram:1901426549 "🟢 sua mensagem aqui"
```
Retorna `sent` (EXIT=0) quando chega. **É texto-only.** Não gera voz.

### Voz (só em sessão viva do gateway)
A voz (OGG Edge pt-BR) só é gerada quando o **agente responde numa sessão ativa** — disparada por `auto_tts` quando `voice_mode=all`.
- Pivete responde no Telegram → gateway cria sessão → agente responde → TTS gera OGG → `sendVoice`.
- OU: Pivete manda mensagem aqui (desktop) e o Hermes responde com `auto_tts` ligado.

### api_server (OpenAI-spec, porta 8643 — NÃO usar direto)
```text
POST /v1/chat/completions   (precisa header de auth/sessão — curl direto dá "Invalid API key")
POST /v1/responses
GET  /v1/models
```
**Pitfall:** `curl http://127.0.0.1:8643/api/v1/message` → `404`. O endpoint não é `/message`. E `/v1/chat/completions` sem sessão válida dá `Invalid API key`. **Não martela curl no api_server** — use `hermes send` (texto) ou deixe o Pivete responder no Telegram (voz).

## Recebimento de mídia do Pivete (FOTO / DOCUMENTO / VOICE) — 2026-07-24

O adapter Telegram (`plugins/platforms/telegram/adapter.py`) já trata TODA mídia inbound nativamente — o agente NÃO precisa fazer nada manual:

- **FOTO** (`msg.photo`): download → `cache_image_from_bytes` → `event.media_urls` + `event.media_types` (MessageType.PHOTO).
- **IMAGEM COMO DOCUMENTO** (`msg.document` com `image/*` ou extensão `.png/.jpg/.jpeg/.webp/.gif`): roteado como `MessageType.PHOTO` → **mesmo** `cache_image_from_bytes` (não limitar a "enviar como FOTO").
- **TXT / MD** (documento pequeno): `cache_document_from_bytes` → injetado em `event.text`.
- **VOICE / AUDIO** (`msg.voice`, `msg.audio`): `cache_audio_from_bytes` → `event.media_urls`. STT automático se habilitado; senão o caminho do áudio bruto é entregue ao agente.
- **Modelo com visão** recebe os pixels nativamente via `event.media_urls`. **Modelo text-only** dispara `vision_analyze` automaticamente como fallback.

**HARD RULE (erro cometido e corrigido nesta sessão):** NUNCA passar caminho de disco local (`C:\Users\...\cache\images\img.jpg`) nem data-URI base64 manual para a ferramenta `vision_analyze`. Ela só aceita **URL pública** ou anexo nativo do Telegram. Path local → `404 "Couldn't find that"`; base64 → `invalid base64`. O 404 NÃO é bug de modelo/provider — é uso errado da ferramenta. O pipeline nativo já populou `media_urls`; deixe o modelo ler, não re-alimente o caminho no fallback.

Cache (gerenciado pelo Hermes, permitido): `<HERMES_HOME>/cache/images`, `/cache/audio`, `/cache/documents`, `/cache/videos`. TTL de limpeza = 24h (`cleanup_image_cache` em `gateway/platforms/base.py`). "Sem arquivos no PC" = sem arquivos soltos/manuais; cache transitório gerenciado é ok.

## STT gerenciado validado — 2026-08-02

**Separação obrigatória:** TTS e STT são rotas independentes. A voz das minhas respostas permanece `tts.provider: edge` com `pt-BR-FranciscaNeural`. O gateway Nous + `gpt-4o-mini-transcribe` é usado somente para STT de áudios recebidos; nunca substituir a Francisca por esse modelo.

O teste isolado aprovado usou o gateway Nous `openai-audio` com `gpt-4o-mini-transcribe` e idioma `pt`: português preservado em 4,703 s, sem mudança em configuração, áudio ou cache local. `whisper-1` foi rejeitado nessa rota por devolver tradução em inglês.

Procedimento reproduzível, invariantes e evidência: [`references/managed-stt-validation.md`](references/managed-stt-validation.md).

A configuração persistente continua separada do teste e exige autorização aplicável. Enquanto o fluxo normal puder chamar `transcribe_audio_local_fallback()` com `stt.local.model: large-v3`, não afirmar que ele está protegido contra download.

## Catálogo de Vozes por botão inline (mapeado 2026-08-05)

**Objetivo:** substituir o `/help`/`/voice` de texto seco por botões reais no Telegram (catálogo de 13 vozes da CentralDark, amostra + salvar no perfil).

**Erro cometido e corrigido (2026-08-05):** usar a ferramenta `clarify` do agente para montar menu de escolha gera (1) botões numerados feios no teclado em vez de InlineKeyboard grudado na mensagem, e (2) "pendência de tool call" — o turno do agente fica preso esperando o clique, travando o gateway. **NUNCA use `clarify` para menu de UI.** Use o botão inline nativo do adapter.

**O adapter JÁ TEM botão inline nativo** — não reinventar:
- `send_choice_picker(chat_id, title, choices, session_key, on_choice_selected, metadata)` em `plugins/platforms/telegram/adapter.py` (~L5722). Cada `choice = {"value": slug, "label": texto, "is_current": bool}`. Dois botões por linha (legível no mobile).
- `_handle_choice_picker_callback` (~L5785) já captura o toque (`cp:<idx>`), autoriza, chama `on_choice_selected(chat_id, value)`, edita a mensagem in-place e limpa o estado. **Reusa esse callback — não crie handler novo.**
- `send_model_picker` (~L5648) é o exemplo de drill-down (provider → model) que edita a mesma mensagem; usar como molde se precisar de 2 níveis.

**Rota de TTS da CentralDark (já documentada em `historico/index.html`):**
`POST https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/audio-speech` com header `apikey: <chave pública>`, body `{input, voice, response_format, instructions}`. Vozes: alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse, marin, cedar. É a fonte canônica do catálogo — não duplicar a lista.

**Fluxo de encaixe (Modo Casa, R2):**
1. Backup do `adapter.py` → `motor/scripts/audio/adapter_backup/`.
2. `send_voice_catalog` chama `send_choice_picker` com as 13 vozes (marca `is_current` = voz atual do config).
3. Branch no `/voice` (em `_handle_command`) → abre o catálogo.
4. `on_voice_selected` grava `voice: <slug>` no `config.yaml` do profile + dispara TTS de teste via rota acima + responde "Pronto, Pivete. Esta agora é minha voz."
5. `ast.parse` no `adapter.py` antes de ativar (syntax check), pois é core de 10k linhas.

Proposta de patch já escrita e testada de sintaxe em `motor/scripts/audio/FIX_voice_catalog.patch` (não aplicada no bot vivo — aguarda autorização de ativação). Detalhe de implementação: `references/voice-catalog-inline.md`.

## Pitfalls (tirados de erro real 2026-07-22)

1. **`hermes send` é texto-only.** Não espere áudio dele. Voz exige sessão viva.
2. **Porta do api_server é 8643**, não 8000. `curl :8000` → connection refused (EXIT=7).
3. **Endpoint `/api/v1/message` não existe** → 404. Use `hermes send` CLI.
4. **`hermes chat` CLI não aceita `-t telegram:ID "texto"`** → "unrecognized arguments". O `-t` no `chat` é `--toolsets`, não target. Use `hermes send -t` pra envio simples.
5. **Trocar `tts.provider` direto no config.yaml é BLOQUEADO** (segurança). Use: `hermes config set --profile pivete tts.provider edge`.
6. **Restart do gateway de dentro dele é bloqueado** (anti-loop `_HERMES_GATEWAY`). Use: `env -u _HERMES_GATEWAY hermes --profile pivete gateway restart` num shell filho.
7. **`voice_mode` só faz efeito no próximo restart** (lê do disco na subida). Se trocou `all` mas o gateway tá no ar desde antes, ainda tá `voice_only` na memória — reinicie.

## Verificação (prova, não promessa)

```bash
# Gateway online?
python -c "import json;d=json.load(open('gateway_state.json'));print(d['platforms']['telegram']['state'])"
# TTS ativo?
grep -A2 "^tts:" config.yaml | grep provider
# Voz chegou? Pergunte ao Pivete — ele é a prova. Não afirme "chegou" sem ele confirmar.
```

## Autoridade (PERMITO PIVETE standing)
Pivete deu "PERMITO PIVETE SEM AÇÃO DESTRUTIVA" como autorização standing pra leitura/ajuste local/reversível (trocar tts.provider, voice_mode, restart do gateway). Deploy/force/delete ainda exigem ok literal.

## Ver também
- `references/visual-spoken-sanitizer-regression.md` — TDD e gate E2E para manter emojis/caminhos no texto sem verbalizá-los.
- `references/voice-catalog-inline.md` — catálogo de vozes por botão inline nativo (não use `clarify` p/ menu), pontos do adapter.py e rota TTS CentralDark.
- `VOZ.md` (profile pivete) — tom de fala, o que NÃO dizer na voz.
- `motor/01-identidade/04-COMUNICACAO.md` — formato-card canônico.
- `meta-lupa` — AutoLupa obrigatória sobre qualquer veredito (declarar GAP se não confirmado).
- **`references/voice-forbidden-anexo-doc.md`** — PITFALL CRÍTICO 07/08: `Voice_messages_forbidden` faz `hermes send` retornar "sent" sem entregar nada. Solução: áudio sempre como DOCUMENTO (anexo MP3), nunca bolha de voz. Detecção de falso verde via log.
- **`hermes-pivete-local-ops` §26 "Áudio-resumo pro Pivete"** — preferência confirmada 07/08: empacotar resultado grande num TTS Edge Francisca (60-90s) + `hermes send --to telegram:1901426549 MEDIA:<path>`. Gatilhos: Pivete pede, tá de boa, ou acabou de acordar. Não substituir texto — anexar áudio como resumo ouvível.
