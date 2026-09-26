# Voice Catalog Inline — detalhe de implementação (2026-08-05)

Fonte canônica do catálogo: `E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\historico\index.html`
Backup do core: `E:\CentralDark\Pivete\NUCLEO\motor\scripts\audio\adapter_backup\adapter.py.bak_20260805_105211`
Proposta de patch: `E:\CentralDark\Pivete\NUCLEO\motor\scripts\audio\FIX_voice_catalog.patch`

## adapter.py — pontos verificados (R0)
- L237/416/434: `from telegram import InlineKeyboardButton, InlineKeyboardMarkup` já importado sob try/except.
- L3893/4024: `CallbackQueryHandler(self._handle_callback_query)` registrado.
- L5404-5544: `send_update_prompt` e `send_exec_approval` já usam `InlineKeyboardMarkup` + `reply_markup` — prova que o canal inline funciona no bot vivo.
- L5566 `send_clarify`: renderiza botões NUMERADOS (1,2,...,Other) — este é o "feio" que o Pivete rejeitou. Não usar para menu.
- L5648 `send_model_picker`: drill-down provider→model, edita mensagem in-place, estado em `_model_picker_state`. Molde para catálogo de 2 níveis.
- L5722 `send_choice_picker`: flat picker, 2 botões/linha, `callback_data=f"cp:{i}"`, estado em `_choice_picker_state`. É o que o catálogo de vozes deve usar.
- L5785 `_handle_choice_picker_callback`: autoriza via `_is_callback_user_authorized`, chama `on_choice_selected`, `edit_message_text` (limpa reply_markup), `query.answer()`.

## Assinatura exata (conferida)
```python
async def send_choice_picker(
    self, chat_id, title, choices, session_key,
    on_choice_selected, metadata=None,
) -> SendResult:
    # choices: [{"value": str, "label": str, "is_current": bool}, ...]
```

## Catálogo (13 vozes — fonte historico/index.html)
alloy(neutra), ash(firme), ballad(suave), coral(fem viva), echo(direta M),
fable(narrador), onyx(grave M), nova(energica F), sage(madura), shimmer(doce F),
verse(teatral), marin, cedar.

## Rota TTS CentralDark (para amostra/teste ao salvar)
POST https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/audio-speech
Headers: apikey: <chave publica do projeto>
Body JSON: {"input": "...", "voice": "coral", "response_format": "mp3", "instructions": "Fale em portugues brasileiro nativo, tom natural."}

## Ordem de aplicação (Modo Casa, R2)
1. backup (feito)
2. criar send_voice_catalog reusando send_choice_picker
3. branch /voice em _handle_command → send_voice_catalog
4. _persist_voice_selection grava config.yaml + TTS teste
5. ast.parse(adapter.py) syntax check
6. ativar no bot vivo só com ok do Pivete
