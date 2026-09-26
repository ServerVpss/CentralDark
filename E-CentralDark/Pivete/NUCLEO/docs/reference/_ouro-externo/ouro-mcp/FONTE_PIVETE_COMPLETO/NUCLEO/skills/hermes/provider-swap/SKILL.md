---
name: provider-swap
description: Trocar modelo/provider do Hermes local (profile pivete) com segurança — snapshot do config, teste real do novo provider, rollback. Use quando o Pivete mandar "muda o modelo", "usa GPT", "troca pra X", ou reclamar que o modelo tá fraco. GATE-0 compatível (não mexe em VPS/nuvem, não restart automático).
category: hermes
---

# provider-swap — troca de modelo/provider com snapshot+restore

## Passo 1 — LER estado atual
```
hermes config get model.default --profile pivete
hermes config get model.provider --profile pivete
hermes auth status <provider>   # nous/gemini/openrouter/xai/openai-codex
```

## Passo 2 — snapshot antes de escrever
```
cp config.yaml E:/CentralDark/backups/HERMES-CFG-PRE-<timestamp>.yaml
sha256sum config.yaml
```
(O `patch` em config.yaml é BLOQUEADO pelo guardião — usar `hermes config set`.)

## Passo 3 — trocar via CLI nativa
```
hermes config set model.default <modelo> --profile pivete
hermes config set model.provider <provider> --profile pivete
```
Se o provider precisar de key:
- OpenRouter: `hermes auth add openrouter` OU gravar em auth.json (`providers.openrouter.logged_in=True` + `api_key`).
- Management Key NÃO é API key de inferência (testado: não autentica chat).
- API `/api/v1/keys` NÃO devolve o token (só hash) — peça o Reveal ao Pivete.

## Passo 4 — provar antes de declarar OK
Teste real (não chute):
```
timeout 50 hermes --profile pivete chat -q "digite: OK" -m <modelo> --provider <provider> 2>&1 | grep -i OK
```
Se der timeout/erro → não declarar funcionando.

## Passo 5 — restart manual (NÃO automático)
O gateway rodando mantém o modelo antigo. Pra nova sessão pegar:
```
env -u _HERMES_GATEWAY hermes --profile pivete gateway restart
```
Ou o Pivete fecha/abre o app.

## Rollback
```
hermes config set model.default <antigo> --profile pivete
hermes config set model.provider <antigo> --profile pivete
```

## Pitfalls
- openai-codex (ChatGPT OAuth) SÓ serve pra Codex, NÃO faz chat GPT livre (400 em gpt-4o).
- xAI/Grok: `xai logged out` no perfil → indisponível até OAuth.
- Anthropic: OAuth bloqueado pra org (403) → morto.
- OpenRouter free tier (`:free`) não consome saldo da conta ($0 ok). Subir limite = adicionar crédito no site, não tem API.
- `hermes config get fallback_providers` pode retornar valor antigo vs arquivo (DRIFT) — runtime usa o do arquivo.
