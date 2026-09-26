# Sol Tauri = superfície · Hermes/Pivete = motor (2026-09-03)

## Arquitetura desejada pelo CHEFE
```text
CHEFE (voz/intenção)
  → SOL Tauri (orquestra, PT-BR, UI)
  → HERMES-CASA / perfil pivete (CLI, tools, Writer)
  → http://127.0.0.1:8099/v1 (centraldark-omni-router)
  → gh já autenticado (segredounlock) · Casa E:\
```

## Config canônica (via `hermes config set`)
- model.provider=centraldark-router
- model.default=auto
- model.base_url=http://127.0.0.1:8099/v1
- fallback_providers=["centraldark-router"]
- tts.provider=edge · tts.edge.voice=pt-BR-FranciscaNeural

Paths: `E:\CentralDark\Pivete\profiles\pivete\config.yaml` · `E:\CentralDark\Sol\config.yaml` + SOUL coordenadora + BOOT-CASA.md

## Proibições
- Sem 2º conector GitHub no Sol sem gap
- Grok Bot / AIOS Watch / GARIMPO HTML ≠ motor/verdade
- Sem API keys no chat
- Skill hub building-adversary-* ≠ missão Casa
- ONE_SYSTEM_ONLY · REUSE_BEFORE_CREATE · UNKNOWN≠PASS

## Forense
- Tabela só 🟢🟡🔴 + nota curta
- GARIMPO read-only; sem unzip GB; sem .env
- Hermes leves ~5MB: reportar PIDs se taskkill falhar (admin)

## PRs (revalidar sempre)
- #1381: CONFLICTING + HEAD local≠remoto + merge dirty comum
- #1393: MERGEABLE UNSTABLE — não misturar Writer sem handoff
