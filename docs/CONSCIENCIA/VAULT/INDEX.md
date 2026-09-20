# 🗂️ VAULT CentralDark — Índice Canônico

> Fonte única de paths + regras que TODA IA (Hermes, Fabler, Gemini, GPT) deve carregar antes de agir.
> Compatível com Obsidian (abrir esta pasta como Vault).

## 📍 Paths canônicos (fuzzy → absoluto)

| Apelido | Caminho absoluto | O que é |
|---|---|---|
| **hermes** | `/root/CentralDark/agente/hermes/` | Loop autônomo decisor→executor→validador (PM2 id 66) |
| **decisor** | `/root/CentralDark/agente/hermes/decisor.mjs` | Escolhe IA da chain (Flash→Pro→GPT5m→Elite) |
| **daemon** | `/root/CentralDark/agente/hermes/daemon.mjs` | Loop principal 5s/2s/10s |
| **stats** | `/root/CentralDark/agente/hermes/stats.mjs` | XP, balanceamento, tempo por IA |
| **aprendizados** | `/root/CentralDark/agente/hermes/aprendizados.json` | Skills auditadas |
| **missões** | `/root/CentralDark/agente/hermes/missoes/` | pendente/ · em-andamento/ · concluidas/ |
| **vault** | `docs/CONSCIENCIA/VAULT/` | ESTE Vault (regras vivas) |
| **consciência** | `docs/CONSCIENCIA/` | Cérebro vivo do projeto |
| **lembranças** | `docs/CONSCIENCIA/LEMBRANCAS/` | Memória curto prazo do Pivete |
| **arsenal** | `docs/CONSCIENCIA/ARSENAL/` | Conselho de IAs (/router, /debate, /refinar) |
| **darkai** | `docs/CONSCIENCIA/DARKAI/` | CLI `darkai` (proxy Gemini/GPT-5) |
| **webui** | `apps/modulos/WebUI/` | Open WebUI docker + custom CSS Esmeralda |
| **bolt** | `apps/modulos/Bolt/` | Construtor de site próprio |
| **status** | `apps/modulos/status/` | status.centralldark.com |
| **bot-hub** | `apps/bot-telegram/` | @srver1bot (protegido) |
| **telepainel** | edge `telepainel-webhook` | @SEGREDOPUXADASBOT |

## 📚 Regras (ler nesta ordem)

1. [REGRAS-AUTONOMIA.md](./REGRAS-AUTONOMIA.md) — o que pode/não pode fazer sozinho
2. [REGRAS-DOC-CHECK.md](./REGRAS-DOC-CHECK.md) — checar docs vivas antes de afirmar
3. [PROMPT-MESTRE.md](./PROMPT-MESTRE.md) — carrega no início de toda missão
4. [REFLEXOES/](./REFLEXOES/) — auto-avaliação semanal (`hermes-reflect`)

## 🔒 Áreas protegidas (nunca tocar sem "PERMITO PIVETE")

`apps/bot-telegram/` · `apps/modulos/status/` · `apps/modulos/Bolt/` · `apps/modulos/WebUI/` · `whatsapp-server` (PM2 id 1, estado `stopped` é o correto) · `infra/caddy/` · `secrets/` · `docs/CONSCIENCIA/LEMBRANCAS/`

## 🌐 Servir Vault localmente

```bash
cd tools/vault-server
npm install
npm run vault     # abre em http://localhost:5174
```
