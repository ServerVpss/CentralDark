# HANDOFF — Trabalho via SOL Tauri (2026-09-03)

## Arquitetura travada
```
CHEFE → SOL (Tauri UI/coordenação) → HERMES-CASA/Pivete (motor CLI)
       → modelos via http://127.0.0.1:8099/v1
       → GitHub via `gh` já autenticado (segredounlock)
```

## Config aplicada (perfil pivete)
- model.provider = centraldark-router
- model.default = auto
- model.base_url = http://127.0.0.1:8099/v1
- fallback_providers = ["centraldark-router"]
- tts.provider = edge
- tts.edge.voice = pt-BR-FranciscaNeural

## Regras pro Sol
- NÃO instalar segundo conector GitHub se `gh` já funciona
- NÃO criar segundo cérebro / V2
- PT-BR sempre
- Writer único por escopo
- ONE_SYSTEM_ONLY

## Pendências conhecidas
- PR #1381 CONFLICTING + merge local sujo
- PR #1393 UNSTABLE
- Multi-SOUL AppData residual (não apagar backup ainda)
- Hermes leves precisam admin kill
- Screenpipe pode estar degraded

## App AI externo (Grok Bot etc.)
- Opcional como chat humano
- NÃO é motor da Casa
- Motor = Hermes pivete + router 8099
