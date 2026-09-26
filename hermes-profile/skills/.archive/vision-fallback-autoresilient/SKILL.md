---
name: vision-fallback-autoresilient
description: "PONTEIRO. Fallback de visão do profile Pivete agora vive na umbrella pivete-execution-standards (seção 3 + references/vision-routing.md + scripts/verify-vision-config.py). Skill mantida só por gatilho histórico; não editar aqui."
triggers:
  - "vision_analyze error"
  - "No LLM provider configured for task=vision"
  - "vision 404"
  - "imagem não lida"
---

# Vision Fallback Autoresilient — REDUNDANTE (ponteiro)

**Esta skill foi consolidada na umbrella `pivete-execution-standards`.**

Use aquela em vez desta. Detalhes:
- Chain: `nous/google/gemini-3.5-flash` → `openrouter/x-ai/grok-4.5` → `openrouter/openai/gpt-5.5`
- Transporte: anexo nativo ou URL pública (path local = 404, REGRAS #1)
- Validação pós-edição: `scripts/verify-vision-config.py` na umbrella
- Referência técnica: `references/vision-routing.md` na umbrella

Não duplicar lógica aqui. Se precisar mudar o fallback, edite `pivete-execution-standards`.
