# Francisca + /voice topo — recibo 2026-08-04

Complementa `pivete-gateway-env-dashboard.md` e REGRAS #29. Zero regressão: melhorar canônico existente.

## Estado provado

```text
tts.provider = edge
tts.edge.voice = pt-BR-FranciscaNeural
display.language = pt
command_menu.priority = [voice, help, new, status, model, sessions, commands, approve, deny]
command_menu.priority_mode = prepend
gateway_voice_mode.json = {"telegram:1901426549":"all"}
gateway = running + telegram.connected
getMyCommands remote = /voice na posição 1 (desc EN: "Toggle voice mode")
```

## O que NÃO é

- Não é Open WebUI / dashboard 9119.
- Não é OpenAI `echo` (homem EN). Paste do Pivete: Francisca só com edge; openai no ativo foi regressão de recovery/setup.
- Sample `edge_francisca_mulher_BR.mp3` = amostra; bolha final = OGG/Opus (`audio_*.ogg` / `tts_reply_*.ogg`).
- `display.language=pt` NÃO traduz menu BotCommand.

## Pipeline bolha

```text
Edge TTS → MP3 → ffmpeg → OGG/Opus → sendVoice
```

Logs-âncora: `Generating speech with Edge TTS` + `transcoding to real Ogg/Opus` + `provider: edge`.
ffmpeg no PATH obrigatório para bolha Edge no Telegram.

## Menu após restart (timing)

1. `gateway restart`
2. Esperar `gateway_state=running` E `telegram.state=connected`
3. Confirmar log `set_my_commands OK`
4. Só então `getMyCommands` — se consultar cedo, ordem antiga (voice na pos ~44)

Local `telegram_menu_commands()` já mostra voice=1 antes do remoto atualizar.

## Config list pitfall

`hermes config set … priority "['voice',…]"` pode persistir string. Forçar lista YAML real e reparsear.

## Comandos (já existem)

`/voice` | `/voice tts` | `/voice status` | `/voice off`

## Onde já está documentado (não duplicar skill)

- `memories/USER.md` (linha TTS)
- profile skill filesystem: `profiles/pivete/skills/hermes/hermes-telegram-voice` (pode não aparecer no registry do profile default)
- NUCLEO 3T: HOJE/SEMANA 04/08 + REGRAS #29
- Umbrella: esta skill § TTS Francisca + refs gateway

## 3T update pattern (pedido do Pivete)

Antes de gravar: buscar menções. Se USER/skill já tem → melhorar linha/âncora. Append HOJE/SEMANA; REGRAS só se faltar regra fria. Backup `.bak-<ts>`. Nunca pasta/skill paralela de voz.
