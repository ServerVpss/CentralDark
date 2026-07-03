# 🗺️ Mapa Telegram — Bots, Chats, Usuários

> Snapshot vivo. Atualizar rodando a AULA-014 (`mapa-telegram-refresh`).
> Última atualização: 03/07/2026

---

## 🤖 Bots do ecossistema

| Bot | ID | Papel | Vive em | Edge function | Banco |
|---|---|---|---|---|---|
| `@srver1bot` | (HUB) | Central CentralDark, alerts admin, Grupo Evolução | HUB Supabase + VPS PM2 27 | `telegram-webhook` | HUB (`lyoigsqluyktoclwdaft`) |
| `@SEGREDOPUXADASBOT` (🩸FISCAL🩸) | `7634758557` | TelePainel — puxadas/consultas | Lovable Cloud atual | `telepainel-webhook` | Projeto atual (`kagejpghnwdfymddwxuf`) |

---

## 👥 Grupos e Canais conhecidos

### Do `@srver1bot` (via `getUpdates`)
| chat_id | tipo | título | uso |
|---|---|---|---|
| `-5365750004` | group | **Central Dark - Grupo Da Evoluçao** | Debate multi-IA (AULA-013) |
| `1901426549` | private | @segredounlocker (Admin) | Card completo pós-ação |
| `-1003669176367` | channel | Status CentralDark | Linha curta pós-ação (`TELEGRAM_STATUS_CHANNEL_ID`) |

### Do `@SEGREDOPUXADASBOT` (via banco local)
| chat_id | tipo | msgs | observação |
|---|---|---|---|
| `-1002205387838` | supergroup | 790 | Grupo principal (título não salvo em `raw_data`) |
| `-1003994854326` | supergroup | 9 | Grupo secundário |

Privados: **129 chats distintos** de usuários (top 30 vistos hoje).

---

## 📊 Totais atuais (projeto Lovable Cloud)

| Métrica | Valor |
|---|---|
| Usuários cadastrados (`telegram_users`) | **2.741** |
| Chats distintos (`telegram_messages`) | **129** |
| Bots ativos | 1 (`SEGREDOPUXADASBOT`) |
| Dono (admin) | `1901426549` @segredounlocker |

---

## 🔄 Como refrescar esse mapa

Ver **AULA-014-mapa-telegram-refresh.md**. Resumo:

1. `getUpdates` do connector (com deleteWebhook + religa depois) → captura grupos/canais recentes onde o `@srver1bot` está.
2. `psql` local → `telegram_bots`, `telegram_users`, `telegram_messages` (bot TelePainel).
3. HUB → `telegram_users` do `@srver1bot` (via `HUB_SUPABASE_DB_URL` — tarefa VPS/Fabler).
4. Consolidar aqui e commitar com `🧠 Hermes/ROTAS-FIXAS: NNN mapa telegram refresh`.

---

## ⚠️ Regras

- Nunca misturar bots (ver `docs/CONSCIENCIA/DARKAI/` e memória `bots-separacao`).
- Título de grupo só é capturado se o webhook salvar `raw_data.chat` completo — hoje o `raw_data` do TelePainel não guarda `title`. **SUG-003**: melhorar payload salvo.
- `getChat` no gateway só funciona pra chats onde o `@srver1bot` está. Para chats do `@SEGREDOPUXADASBOT`, usar o token dele direto (tarefa VPS).
