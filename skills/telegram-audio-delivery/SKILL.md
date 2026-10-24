---
name: telegram-audio-delivery
description: "Diagnóstico e fallback de áudio/voice no Telegram via Hermes"
---
# Entrega de Áudio no Telegram — Diagnóstico e Fallback

## Sequência de verificação (na ordem)

1. **Verificar gateway rodando**
   ```bash
   hermes gateway status
   ```
   Se não estiver rodando, nada mais vale. Reinicie antes de diagnosticar áudio.

2. **Verificar configuração básica do bot**
   - `TELEGRAM_BOT_TOKEN` no `.env` (formato: `123456789:ABCdef...`)
   - `TELEGRAM_ALLOWED_USERS` configurado com seu user ID
   - Bot conectado: teste com `python -c "from telegram import Bot; print(Bot(token='YOUR_TOKEN').get_me())"`

3. **Verificar status do gateway nos logs**
   ```bash
   tail -50 ~/.hermes/logs/gateway.log
   ```
   Procura por: `telegram connected`, `Telegram polling confirmed healthy`

4. **Verificar se áudio existe no cache**
   ```bash
   ls -la ~/.hermes/cache/audio/*.ogg
   ```
   File de áudio gerado mas não entregue indica falha na etapa de envio, não de geração.

5. **Buscar erro específico no log**
   ```bash
   grep -i "voice\|audio\|send_voice\|sendAudio" ~/.hermes/logs/gateway.log | tail -20
   ```

## Erros comuns e classificação

### Voice_messages_forbidden
- **O que é:** Telegram rejeita envio de voz/audio com erro 400 `Voice_messages_forbidden`
- **O que NÃO faz:** Não é problema de token, não é problema de gateway, não é problema de permissão do usuário
- **O que testar:** Todos os métodos de envio (voice, audio, document) retornam o mesmo erro → é restrição do bot/chat, não do método
- **Workaround testado:** Não há workaround via Bot API — se todos os métodos falham com o mesmo erro, o envio de áudio não é possível neste chat/bot
- **O que registrar:** Capturar o erro exato, timestamp, e métodos testados — não tentar métodos alternativos infinitos

### Connection conflict
- **O que é:** Dois processos tentando usar o mesmo token simultaneamente
- **Solução:** Garantir que só há uma instância do gateway rodando, ou usar `hermes gateway restart`

## Áudio alert quando envio falha

### Python (funciona imediatamente no Windows sem compilação)

```python
import winsound
import ctypes

def play_audio_alert(error_type: str = "generic"):
    configs = {
        "voice_forbidden": (1000, 500, 2),
        "gateway_error": (1200, 400, 2),
        "file_not_found": (1500, 200, 3),
        "generic": (800, 300, 1),
    }
    freq, dur, reps = configs.get(error_type, configs["generic"])
    for i in range(reps):
        winsound.Beep(freq, dur)
        if i < reps - 1:
            import time; time.sleep(0.1)
    try:
        ctypes.windll.user32.MessageBoxW(
            0,
            f"Hermes Audio Alert\n\nErro: {error_type}",
            "⚠️ ALERTA DE ENTREGA",
            0x4000
        )
    except:
        pass
```

## Scripts de apoio

Este skill pode invocar os seguintes scripts:

- `scripts/audio-monitor.py` — Monitor contínuo de falhas de entrega com bip sonoro
  - Uso: `python scripts/audio-monitor.py --once` (verificação única)
  - Uso: `python scripts/audio-monitor.py --loop` (loop contínuo)
- `scripts/telegram-audio-fallback.py` — Envio com fallback automático (voice → audio → document)
  - Uso: `python scripts/telegram-audio-fallback.py <caminho_arquivo> <chat_id>`
  - Uso: `python scripts/telegram-audio-fallback.py --list` (listar áudios)

## Pitfalls

- **Não diagnosticar áudio antes de verificar gateway:** Se gateway não tá rodando, nem adianta testar métodos de envio
- **Não repetir métodos já testados:** Se voice, audio e document todos retornam `Voice_messages_forbidden`, o problema é restritivo do Telegram, não do método. Parar e reportar.
- **Não assumir que é problema de permissão do usuário:** `Voice_messages_forbidden` é erro do Bot API, não do user allowlist
- **Não compilar com C se GCC não disponível:** Verificar `which gcc` antes. Python winsound funciona sem compilação.
