
# 📊 Relatório Vault (últimas 24h) + Mapa Gateways

## 1. O que ficou pronto e rodando ✅

- `docs/CONSCIENCIA/VAULT/` criado com INDEX, REGRAS-AUTONOMIA, REGRAS-DOC-CHECK, PROMPT-MESTRE, REFLEXOES/.
- `vault-loader.mjs` carrega os 4 arquivos, faz sha256, log de métricas (bytes, hash, arquivos, force) e invalida cache quando INDEX muda.
- `daemon.mjs` (PM2 id 66 Hermes) patchado (backup `.bak4`): importa vault-loader e prepende `vaultHeader()` no início de toda missão (força reload na 1ª etapa).
- Missão de teste `vault-teste-…` executou, Hermes leu o Vault, respondeu e concluiu (foto que você mandou = etapa 2 dessa missão).
- Vault local em `tools/vault-server/` (Express + marked, `npm run vault` → http://localhost:5174).
- Aprendizado #272 registrado.

## 2. Por que a foto mostra "❌ Flash · ❌ Pro · ❌ GPT5m · ✅ Elite"

A cadeia do Hermes é: **Flash → Pro → GPT5m → Elite (fallback pago)**.
Os 3 primeiros caem em **12–30ms** com erro `DARKAI_URL not configured`. Motivo:

- `decisor.mjs` do Hermes tenta Flash/Pro/GPT5m via variável de ambiente `DARKAI_URL` (que deveria apontar pro edge `ai-proxy` da Lovable Cloud, que usa `LOVABLE_API_KEY` e roteia Gemini/GPT free).
- Essa variável **nunca foi injetada no PM2** do Hermes (`pm2 env 66` não tem). O `.env` do `/root/CentralDark/` também não expõe.
- Sem `DARKAI_URL`, os 3 primeiros falham na hora e o Hermes vai direto pro **Elite** (Sonnet 4.5 via `api.centralldark.com`), que é o caro. Por isso o "Balanço: Elite 100%" na foto.

**Resultado prático:** Hermes está funcionando, mas gastando Sonnet em toda etapa. Precisa setar `DARKAI_URL=https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy` no ecosystem do Hermes e `pm2 restart 66 --update-env`.

## 3. Mapa dos Gateways (o que é cada um / quem mora onde)

| Gateway | Onde vive | Chave/Auth | Modelos que atende |
|---|---|---|---|
| **Elite HTTP (`api.centralldark.com`)** | VPS PM2, porta 8080, status atual: online 46ms | Bearer fixo interno | **Anthropic Sonnet 4.5, Opus 4** (via Zendriver/Anthropic proxy). É o "caro" — usado como último fallback. |
| **Elite Anthropic Proxy (ap7)** | VPS `apps/modulos/elite-anthropic-proxy/` | Session Anthropic | Alias interno pra Sonnet/Opus, mesmo mundo do Elite HTTP. |
| **DarkAI / `ai-proxy` (edge Lovable Cloud)** | Edge function no projeto `kagejpghnwdfymddwxuf` | `LOVABLE_API_KEY` (auto) | **Gemini 3 Flash, Gemini 2.5 Pro, Gemini 3.5 Flash, GPT-5, GPT-5-mini, GPT-5-nano** — todos os "grátis do Cloud". É o gateway que o Hermes DEVERIA estar usando 90% do tempo. |
| **Arsenal OpenAI Adapter** | VPS `apps/modulos/arsenal-openai-adapter/` | Interno | Adapta o Conselho (`/router`, `/debate`) pra formato OpenAI. Consome DarkAI + Elite. |
| **Lovable AI Gateway** (nativo) | `ai.gateway.lovable.dev/v1` | `LOVABLE_API_KEY` | Backend do próprio `ai-proxy` — não é chamado direto pelo Hermes, sempre via edge. |

**Família por gateway (fica salvo pra você não perder):**

- **Cloud/Free (Gemini + GPT-5 família):** vivem no **DarkAI (ai-proxy)** → Lovable AI Gateway.
- **Anthropic Sonnet 4.5 / Opus 4:** vivem no **Elite HTTP** (`api.centralldark.com`).
- **Conselho de IAs (router/refinar/debate):** Arsenal Adapter → escolhe entre DarkAI e Elite conforme `regras.json`.
- **Fabler (mestre_sabio):** `anthropic/claude-sonnet-4-5` via **Elite Anthropic**.

## 4. Pendências abertas (o que falta pra fechar 100%)

1. 🔴 **Setar `DARKAI_URL` no PM2 do Hermes** (bloqueador — sem isso, 100% das etapas caem no Sonnet caro).
2. 🟡 Testar cadeia Flash→Pro→GPT5m→Elite depois do restart e confirmar `Balanço` distribuído.
3. 🟡 Criar skill `hermes-verify` (valida se INDEX mudou antes de reagir a missão).
4. 🟡 Criar skill `hermes-reflect` (auto-avaliação semanal em `REFLEXOES/YYYY-WW.md`).
5. 🟡 Aba "Vault" no WebUI com 1-click dispatch de missão pré-formatada.
6. 🟢 Escrever conteúdo de `REFLEXOES/.gitkeep` (primeiro placeholder).
7. 🟢 Publicar `tools/vault-server/README.md` com instruções pt-BR completas.

## 5. Próxima ação proposta (modo bruto)

Fase A — desbloquear cadeia grátis:
- Adicionar `DARKAI_URL` no ecosystem do Hermes (`/root/CentralDark/agente/hermes/ecosystem.config.cjs`) apontando pro edge `ai-proxy`.
- `pm2 restart 66 --update-env && pm2 save`.
- Rodar missão-teste e conferir se pelo menos Flash responde ok (esperado: 1–3s, Balanço Elite < 20%).

Fase B — skills:
- Implementar `hermes-verify` + `hermes-reflect` como módulos em `agente/hermes/skills/`.
- Registrar no `regras.json`.

Fase C — WebUI:
- Aba "Vault" lendo `docs/CONSCIENCIA/VAULT/*.md` via `tools/vault-server` + botão "Dispatch missão".

Aprovar essa fase A pra eu setar o `DARKAI_URL` e reiniciar o Hermes?
