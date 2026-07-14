# MAPA-VIVO — Fio da missão Admin + Infra (Lovable / Sonnet / Grok)

**Atualizado:** 2026-07-14  
**Pivete:** dono · **Grok CLI (VPS):** executor de infra/estado · **Lovable (+ Sonnet):** designer do **painel admin**  
**Branch de trabalho design/admin:** `pivete/dev` (não confundir com `main` de produção cega)

> Lovable / Sonnet: leiam **este arquivo primeiro** antes de redesenhar admin.  
> Não apaguem este mapa. Atualizem a seção “Status do fio” quando avançarem.

---

## 1. Objetivo em 1 frase

Pivete precisa de **visão da VPS (simples, já)** + **Telegram só quando há movimento** + **admin bonito (Lovable)** encaixado depois — **sem** sistema paralelo V3, **sem** loop no Telegram, **sem** secret no front.

---

## 2. Split de missão (quem faz o quê)

| Trilha | Quem | O quê | Não fazer |
|--------|------|--------|-----------|
| **A — Visão infra simples** | **Grok / VPS** | Estado real: PM2, disco, RAM, load, health MCP, fail2ban resumo, “última movimentação”. Preferir **estender** `apps/modulos/status` / dados vivos. | Site cheio de cor; expor secrets; inventar `/opt/painel` do zero |
| **B — Tele movimento** | **Grok / VPS** | Notificação = **detector de movimento** (evento/webhook), **não** ping de loop. Origem identificável (`guardiao`, `hermes`, `deploy`…). | Heartbeat a cada minuto no Telegram; flood |
| **C — Hub notificação (alvo)** | Grok desenha → implementação com PERMITO | 1 módulo central: tudo entra no hub → distribui com **nome da origem**. Hoje Guardião/Hermes no mesmo canal = **ok provisório**. | Cada módulo com notify próprio eterno sem inventário |
| **D — Painel ADMIN (UI)** | **Lovable + Sonnet** | UI admin (login, abas, UX). Base já existe: `apps/modulos/mcp-admin-ui` (Vite/React, cookie `cd_admin`, tabs Overview/Tools/Audit/Keys/OAuth/Connector). | Reescrever backend MCP; tocar secrets; deploy cego na VPS sem Grok |
| **E — Encaixe** | Grok depois do design | API/estado real plugado no admin Lovable; Caddy/path se precisar | Quebrar MCP OAuth / admin password |

**Ordem desejada pelo Pivete:**  
1) Grok deixa **mapa + visão simples + tele por movimento** estáveis.  
2) Pivete manda **Lovable começar admin** com este mapa.  
3) Encaixe VPS no fim.

---

## 3. O que já existe (não reinventar)

| Peça | Path / URL | Nota |
|------|------------|------|
| Status / painel vivo | `apps/modulos/status/` · status.centralldark.com | 🔒 área protegida — **estender**, não substituir |
| MCP Admin UI | `apps/modulos/mcp-admin-ui/` | Login + AdminPage; API cookie `cd_admin` |
| MCP backend admin | `apps/modulos/mcp` rotas `/admin/*` | Auth senha admin (TEMP público **fechado** 2026-07-14) |
| Guardião | PM2 `CentralDark-GuardiaoConsciencia` · `infra/guardiao/` | Monitor; Telegram — alinhar a “movimento” |
| Hermes notify | `apps/modulos/HERMES-CORE/utils/notify.mjs` | 🔒 notify consolidação pendente |
| agent-notify | `scripts/agent-notify.mjs` | 🔒 |
| Canal / preferência Lovable | `.lovable/memory/architecture/canal-oficial-notificacao.md` | Preferência: edge `notify-telegram` + log no painel (validar se ainda é a via única — Grok inventaria no mapa de notifiers) |
| fail2ban | harden 24h + recidive (2026-07-14) | Já aplicado na VPS |
| Doutrina gaps | GitHub issue **#205** | Hermes agents / AGENTS.md MultiZap |
| OAuth ChatGPT | issue **#204** | Fora do escopo admin visual |

---

## 4. Alinhamento Lovable × plano admin

**Já alinhado o suficiente pra Lovable trabalhar UI:**

- Há app `mcp-admin-ui` com gate login + tabs (tools, audit, keys, oauth, connector, overview).
- Backend MCP já expõe `/admin` + APIs — Lovable **não** reimplementa OAuth server.
- Preferência de notificação documentada em `.lovable/memory/.../canal-oficial-notificacao.md`.

**Ainda NÃO alinhado / Lovable NÃO deve inventar sozinho:**

- “Admin = monitor de toda VPS” — **não**. Monitor simples = trilha Grok/`status`. Admin MCP = **outro painel** (ou abas futuras alimentadas por API de status).
- Secrets no admin: **só ações controladas** (emitir key se o backend já tiver); **nunca** listar `.env` / `secrets/*` no browser.
- Novo bot Telegram do Pivete: configurar via settings backend, não hardcode no React.
- Cloudflare Zero Trust / OTP no painel: **fase posterior**; não bloquear UI admin.

---

## 5. Contrato de dados (pra Lovable encaixar depois)

Lovable deve consumir **APIs**, não inventar filesystem da VPS.

| Dado | Fonte esperada | Trilha |
|------|----------------|--------|
| Tools MCP / OAuth clients / logs admin | `/admin/api/*` (cookie) | Admin UI (já) |
| PM2 / disco / RAM / health | endpoint ou JSON de status (Grok estabiliza) | Visão infra |
| Eventos “movimento” | log/tabela notifications (se edge) ou stream futuro do hub | Tele + painel |
| Secrets | **não no front** | — |

Se a API ainda não existir: Lovable usa **mock tipado** + interface; Grok pluga depois.

---

## 6. Telegram: regra de ouro (infravermelho)

```text
LOOP (ruim):   a cada N min → "ainda online?"
MOVIMENTO (bom): evento real → hub → Telegram com origem=
```

Hermes com webhook por movimentação = **referência**.  
Guardião no mesmo canal por enquanto = **ok**, desde que não vire sirene.

---

## 7. O que Lovable/Sonnet deve fazer agora (checklist)

- [ ] Ler este MAPA-VIVO inteiro  
- [ ] Trabalhar UI em `apps/modulos/mcp-admin-ui` (ou branch `pivete/dev` espelhando)  
- [ ] Manter login cookie `cd_admin`  
- [ ] Melhorar UX das abas existentes; não apagar tabs sem motivo  
- [ ] Separar visualmente **Admin MCP** vs futuro widget “Estado VPS” (dado virá da trilha Grok)  
- [ ] Zero secret no bundle front  
- [ ] Commit na branch de design (`pivete/dev` / fluxo Lovable) com mensagem clara  
- [ ] Atualizar seção 9 “Status do fio” abaixo  

## 8. O que Grok fará (VPS) — Lovable não espera pra desenhar

- Visão simples de estado (estender status)  
- Tele só em movimento (quando PERMITO de missão)  
- Inventário sanitizado de notifiers → GitHub  
- **Não** `cat` secrets para LLM  

---

## 9. Status do fio (atualizar)

| Data | Quem | Nota |
|------|------|------|
| 2026-07-14 | Grok | Criou MAPA-VIVO; TEMP MCP público fechado; fail2ban harden; issues #204 #205 |
| 2026-07-14 | Pivete | Quer Lovable no admin quando Grok deixar mapa; bot notify novo; hub central depois |
| — | Lovable | *(preencher)* |

---

## 10. Links rápidos

- Issue doutrina gaps: https://github.com/ServerVpss/CentralDark/issues/205  
- Issue MCP OAuth ChatGPT: https://github.com/ServerVpss/CentralDark/issues/204  
- Fail2ban: `docs/RELATORIOS/2026-07-14-fail2ban-harden.md`  
- GPT avaliação auditoria (Pivete colou): estratégia ok, comando mestre Gemini **não** executar  
- Governança mapa: `docs/GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md`  

---

## 11. Frase pro Sonnet (colar no Lovable)

```text
Leia missoes/MAPA-VIVO/00-LEIA-LOVABLE-SONNET.md e missoes/MAPA-VIVO/MISSAO-SPLIT-GROK-LOVABLE.md.
Você é trilha D: painel admin UI (mcp-admin-ui). Não invente monitor VPS do zero (trilha Grok/status).
Não exponha secrets. Não flood Telegram. Commit na pivete/dev. Atualize Status do fio no MAPA-VIVO.
```
