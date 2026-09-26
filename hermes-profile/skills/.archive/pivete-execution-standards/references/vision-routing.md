# Vision Routing & Fallback — referência (28/07)

## Transporte da imagem (REGRAS #1)
- ✅ Anexo nativo no composer (botão de imagem) → pixels entram.
- ✅ URL pública direta → `vision_analyze` funciona.
- ❌ Path local (`C:\Users\...\composer-images\*.png`) → `404 Couldn't find that`.
- ❌ `@file` desktop-attachments → 404.
- ❌ base64 → não vira pixel.
- `vision_analyze` por path local dá erro `No LLM provider configured for task=vision` quando a sessão corrente não tem VISION roteado.

## Fallback chain (só multimodais do profile)
1. Primário: `nous/google/gemini-3.5-flash`
2. Fallback 1: `openrouter/x-ai/grok-4.5`
3. Fallback 2: `openrouter/openai/gpt-5.5`
Config: `profiles/pivete/config.yaml` → `auxiliary.vision.fallback_chain`.

## Banner "Applies to new sessions"
- Mudança de `VISION` no settings vale para NOVAS sessões.
- Sessão atual troca via model picker no composer (hot-swap) ou restart.
- O `vision_analyze` (tool) só pega o novo chain após reload/restart.

## Regra
Nunca declarar "não consigo ver" antes de esgotar TODAS as rotas multimodais do profile.
Sem falso verde: provar o fallback num caso real (simular primário offline) antes de cravar "VISION resiliente".
