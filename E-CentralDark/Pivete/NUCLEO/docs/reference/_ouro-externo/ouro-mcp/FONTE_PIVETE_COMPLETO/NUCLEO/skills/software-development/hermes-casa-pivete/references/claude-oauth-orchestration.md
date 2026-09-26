# Claude OAuth + house orchestration (pivete)

Condensed from mission `20260718_040020_c23e466e` / Desktop continuity 2026-07-18.

## Minimal live prove (no secrets)

```python
import os, sys
sys.path.insert(0, r"C:\Users\danda\AppData\Local\hermes\hermes-agent")
os.environ.pop("ANTHROPIC_BASE_URL", None)
os.environ["HERMES_HOME"] = r"C:\Users\danda\AppData\Local\hermes\profiles\pivete"

from agent.anthropic_adapter import (
    resolve_anthropic_token,
    build_anthropic_client,
    _is_oauth_token,
)

tok = resolve_anthropic_token()
assert tok and _is_oauth_token(tok)
client = build_anthropic_client(tok)
assert "api.anthropic.com" in str(client.base_url)

# Prefer Opus, then Sonnet
for model in ("claude-opus-4-6", "claude-sonnet-4-6"):
    try:
        msg = client.messages.create(
            model=model,
            max_tokens=8,
            messages=[{"role": "user", "content": "oi"}],
        )
        text = "".join(getattr(b, "text", "") for b in msg.content)
        print(model, 200, text[:40])
        break
    except Exception as e:
        print(model, "FAIL", str(e)[:120])
```

HTTP path (same OAuth headers Hermes uses): `Authorization: Bearer <oat>`, `anthropic-version: 2023-06-01`, betas including `claude-code-20250219,oauth-2025-04-20`, User-Agent `claude-code/<ver> (external, cli)`.

## Decision table

| Live Claude Opus/Sonnet | Action |
|-------------------------|--------|
| HTTP 200 | ORCHESTRATOR = that model; UI default still Grok |
| HTTP 429 | ORCHESTRATOR live = Grok 4.5 CONDICIONADO; keep designated Claude |
| HTTP 401 | Fix OAuth/env (Bearer, no local base URL); do not setup-token if token resolves |

## Observability files (NÚCLEO)

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
  PROVA-OI-MODELOS-ORQUESTRACAO.json
  PROVA-POS-LIMPEZA-ENV.json
  PROVA-REVALIDACAO-ORDEM-CHATGPT.json
  PROVA-ORQUESTRACAO-CLAUDE-ORQUESTRADOR.json
  PLANO-EXECUCAO-ORDEM-CHATGPT.md
  HANDOFF-FECHAMENTO-10-10-MISSAO-MULTI-FASE.md
  REVISAO-TECNICA-DA-LUPA.md          # append-only §15+
  resultado-canonico-fase2.json
```

## Continuity rule

Do not reopen green phases (voice OGG/Opus, STT anti-.bin, cards, dedupe update_id, casa/curadoria/memória/FTS). Only revalidate orchestration and patch real gaps.