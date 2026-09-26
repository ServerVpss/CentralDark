# Gemini fallback (fallback-keyboard)

**Chave registrada:** `[REDIGIDO-PRESERVACAO]`  
**Provedor:** `gemini`  
**Modelo compatível:** `gemini-1.5-flash` (texto, NÃO TTS)  
**Limitação:** A chave `Generative Language API key` serve para completions de texto/gemini-1.5-flash, **não** para `text_to_speech` (audio). Tentativa de `text_to_speech` com `provider=gemini` retorna HTTP 400 "API key not valid".

**Uso como texto:**
```bash
hermes config set fallback.provider gemini
hermes config set fallback.key [REDIGIDO-PRESERVACAO]
```
Em jobs cron: `--provider gemini --model gemini-1.5-flash` (texto apenas).

**Não use para:** `text_to_speech` — o provider `edge` continua sendo o único para áudio no Desktop Hermes.