# `Voice_messages_forbidden` — áudio-anexo sempre como documento (achado 07/08)

## Sintoma

`hermes send --to telegram:1901426549 "MEDIA:<path>audio.mp3"` retorna `sent` (EXIT=0), mas o Pivete não recebe nada. O áudio continua no cache local, intacto.

## Causa raiz (provada via log `gateway-stdio.log`)

```
ERROR hermes_plugins.telegram_platform.adapter: [Telegram] Failed to send Telegram voice/audio,
  falling back to base adapter: Voice_messages_forbidden
WARNING gateway.platforms.base: [Telegram] send_voice fallback: native audio send unavailable for <path>
WARNING gateway.platforms.base: [Telegram] send_document fallback: native file send unavailable for <path>
ERROR tools.send_message_tool: Failed to send media <path>: Timed out
```

O `hermes send` (CLI) não tenta o caminho de voice nativo — é texto-only. Mas o **adapter subjacente** verifica a permissão do chat ANTES de aceitar o anexo. Se o Telegram tem "Mensagens de voz / video messages" desativado nas **Configurações de Privacidade** daquele chat/canal/bot, o adapter cai no fallback que não consegue mandar nada e **retorna `sent` mesmo assim** (falso verde do tipo mais perigoso: EXIT=0 não casa com a realidade).

**Outros erros silenciosos comuns no log** (mesmo padrão de "sent mas não chegou"):
- `httpx.ReadError` — gateway Telegram offline / DNS-over-HTTPS em resiliência
- `Persisted transcript lagged live cached history` — FTS write corruption
- `heartbeat: 1 update(s) queued but not consumed (stuck probe 1/2)` — evento preso no buffer

## Workaround universal (sem depender de TU ligar chat permissions)

Tratar `MEDIA:audio.mp3` SEMPRE como **documento** (anexo normal), nunca como bolha de voz. O Telegram SEMPRE aceita documentos; voice é opt-in do destinatário.

```bash
# CERTO (sempre funciona)
hermes send --to telegram:1901426549 "🎧 [resumo: <slug>]

MEDIA:C:/Users/danda/AppData/Local/hermes/profiles/pivete/cache/audio/tts_<timestamp>.mp3"
# O "🎧" no caption indica ao Pivete que é áudio, mesmo sendo documento.

# ERRADO (depende de permissão do destinatário)
# (não existe flag --as-voice confiável nessa versão; voice é nativo do gateway)
```

**Caveat:** o Pivete precisa **tocar o anexo** pra ouvir (não tem autoplay). Trade-off aceitável: recibo sempre > autoplay às vezes.

## Detecção de falso verde (sempre que enviar áudio)

```bash
# 1. checa log imediatamente após o send
tail -10 /c/Users/danda/AppData/Local/hermes/profiles/pivete/logs/gateway-stdio.log \
  | grep -E "Voice_messages_forbidden|Timed out|httpx.ReadError"
# 2. se aparecer → reenviar com caption sem MEDIA:, depois com MEDIA: de novo
# 3. se persistir → cair pra texto curto no Telegram, sem áudio
```

## Regra de ouro (REGRAS #30 Pivete 07/08)

**Áudio-resumo no profile pivete é documento MP3, nunca bolha.** Causa raiz provada, fix estável.

## Como invocar (passo a passo)

1. Gerar TTS com `text_to_speech(text=...)` → recebe `MEDIA:path` no retorno.
2. Compor mensagem com caption + `MEDIA:C:/caminho/absoluto.mp3`.
3. `hermes send --to telegram:1901426549 "<caption>\n\nMEDIA:<path>"`.
4. Checar log imediatamente (regra de detecção acima).
5. Se aparecer `Voice_messages_forbidden`, reenviar — o segundo geralmente passa porque o adapter aprende a rota de fallback de documento.

## Quando NÃO usar este workaround

- Se a sessão ativa já tem o gateway respondendo com `voice_mode=all` e o Pivete fez pergunta no Telegram → o TTS nativo é melhor (auto-play, sem precisar tocar).
- Se o destino NÃO é Telegram (Slack, Discord, etc.) → o problema não se aplica; checar cada plataforma.

## Ligações

- `SKILL.md` §26 — fluxo de áudio-resumo (gatilho, template, formato).
- `hermes-pivete-local-ops` §11 — fallback de provider quando TTS não está configurado.
- `motor/03-memoria/memoria/REGRAS.md` #30 — regra canônica travada pelo Pivete em 07/08.
- `motor/03-memoria/memoria/HOJE.md` — entrada de 07/08 tarde documenta a descoberta.
