# Upgrade Hermes — cadeia de 4 IAs (pronto pra executar)

## Passo 0 — Descobrir rota do Elite (10s)

Testar em ordem via `curl` na VPS:
1. `POST https://api.centralldark.com/v1/messages` (formato Anthropic nativo)
2. Se 404 → `POST /v1/chat/completions` (formato OpenAI-compat)

Anotar rota vencedora + formato da resposta (`content[0].text` ou `choices[0].message.content`). Se pedir header de auth, extrair do PM2 do Elite (id 52).

## Passo 1 — `models-map.json` (documentação humana)

Criar `docs/CONSCIENCIA/ARSENAL/hermes-vivo/models-map.json` com os 4 níveis da cadeia, timeouts, tempo médio e uso de cada modelo. Não é lido pelo código — serve pra qualquer IA que abrir o repo entender de bate-pronto.

## Passo 2 — Editar `decisor.mjs` (só acréscimos)

Arquivo real: `docs/CONSCIENCIA/ARSENAL/hermes-vivo/decisor.mjs`.

**Preservar tudo:** assinatura `decidir(missao, historico)`, system prompt, schema JSON, `execFile` async com `maxBuffer 10MB`, ordem dos modelos.

**Adicionar:**
- **Cache in-memory** — `Map()`, chave = SHA-1(missao + histórico), TTL 10min, máx 100 itens.
- **Timeout por modelo** — 15s Gemini Flash, 30s Gemini Pro, 45s GPT-5 mini.
- **4º fallback Elite Anthropic** — `fetch()` com `AbortSignal.timeout(30000)`, retry 1x com backoff 2s. Prompt inclui: "Modelos anteriores falharam: [lista]".
- **Logs claros** — 💾 cache HIT, ✅ modelo respondeu, ⚠️ falhou, 🚨 caiu no Elite, 🔥 tudo falhou.

## Passo 3 — Testar

```bash
pm2 restart CentralDark-Hermes && sleep 3 && pm2 logs CentralDark-Hermes --lines 30 --nostream
```

Criar `missoes/pendente/teste-cache.md` com "me diga que dia é hoje em 1 linha". Duplicar pra confirmar cache HIT na 2ª rodada.

## Passo 4 — Commit + notificar

```bash
cd /root/CentralDark
git add docs/CONSCIENCIA/ARSENAL/hermes-vivo/
git commit -m "🤖 Hermes: cache 10min + timeouts por modelo + Elite Anthropic fallback (4 IAs)"
git push origin main
```

Telegram (via connector já linkado `@srver1bot`):
- Privado admin `1901426549`: card completo da cadeia final
- Canal Status `-1003669176367`: "Hermes agora tem 4 cérebros ✅"

## Intocado

- `daemon.mjs`, `executor.mjs`, `notify.mjs`
- Estrutura de pastas
- Nada em `apps/` (pasta não existe pra hermes)

## Estimativa

~2-3min de execução total.
