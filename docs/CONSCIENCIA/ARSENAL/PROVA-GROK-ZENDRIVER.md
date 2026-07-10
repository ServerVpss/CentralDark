# 🟢 PROVA — Grok Zendriver conectado ao HUB

**Data:** 2026-07-10
**Missao:** Trazer o ouro do Grok pra dentro do castelo CentralDark.
**Fluxo:** GitHub (cofre) → VPS (runtime) → Adapter (8090) → HUB card.

---

## 1. Catalogo `/v1/models` — Grok presente

```bash
$ curl -s http://localhost:8090/v1/models | jq -r '.data[].id' | grep -i grok
grok-4.5
grok-4.3
grok_imagine_image
grok_imagine_image_quality
grok_imagine_video
grok_imagine_video15

$ curl -s http://localhost:8090/v1/models | jq '.data | length'
161
```

✅ **6 modelos Grok** ja expostos via Abacus RouteLLM dentro dos **161 modelos** do catalogo dinamico.

Os aliases `grok-4` e `grok-beta` sao resolvidos pelo `modelMap` em `apps/modulos/hub/providers/grok-zendriver.js` → apontam pra `grok-4.5`.

---

## 2. Provider cofre (GitHub = fonte da verdade)

| Arquivo | Papel |
|---|---|
| `apps/modulos/hub/config/providers.json` | Declaracao do provider Grok (`web_session` + `zendriver` + fallback Bearer) |
| `apps/modulos/hub/providers/grok-zendriver.js` | Modulo JS com `modelMap`, `headers()`, `resolveModel()` |

---

## 3. Zendriver runner — status na VPS

| Item | Status |
|---|---|
| PM2 `zendriver` dedicado | ❌ Nao existe |
| Engine real | 🟢 **elite-gateway** Python — `humanizer.py`, `mapeamento_humano_v3.py`, `elite_http_gateway.py` |
| PM2 relacionado | 🟢 `CentralDark-EliteHTTP` (id 8) online 3D |
| Modo de operacao | Sob demanda via `run_zentinel.sh` + `venv` Python + Chromium |

**Comando pra rodar login web Grok** (1x manual pra capturar cookie):

```bash
cd /root/CentralDark/apps/modulos/elite-gateway
source venv/bin/activate
python3 scripts/mapeamento_humano_v3.py --provider grok --login-url https://grok.com/login
# Cookie capturado → secrets/grok-session.json (600 root:root)
```

---

## 4. Card do HUB esperado apos deploy

```
┌─────────────────────────────────────┐
│  [X]  Grok / xAI              [T1]  │
│  🔑 API KEY   🌐 WEB   🟢 conectado │
│  [       Conectar (OK)         ]    │
└─────────────────────────────────────┘
```

Antes: 🔴 nao conectado (screenshot `image-921.png`).
Depois: 🟢 conectado via Bearer fallback / 🟡 pendente cookie via web_session ate 1o login.

---

## 5. Placar

| Etapa | Status |
|---|---|
| Catalogo `/v1/models` com Grok | 🟢 6 modelos (161 total) |
| `providers.json` no GitHub | 🟢 branch `pivete/hub-provider-grok` |
| `grok-zendriver.js` no GitHub | 🟢 branch `pivete/hub-provider-grok` |
| Zendriver runner identificado | 🟢 elite-gateway Python (nao PM2) |
| Login web executado | 🟡 pendente 1x manual |
| Merge na main | 🟡 aguardando `PERMITO PIVETE MERGE` |

🔒 Ouro registrado. Castelo blindado.
