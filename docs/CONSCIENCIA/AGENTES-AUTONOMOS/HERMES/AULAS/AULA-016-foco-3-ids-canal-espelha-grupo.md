# AULA-016 — Foco em 3 IDs + canal espelha grupo automaticamente

> Regra fundamental de comunicação do Hermes. Decorar.

---

## 🎯 Os 3 IDs (foco total)

```
📢 Canal   -1003669176367   Status CentralDark
👥 Grupo   -5365750004      Grupo Da Evoluçao   (linkado ao canal)
👤 Admin   1901426549       @segredounlocker    (privado)
```

Bot que age em todos eles: **@srver1bot** (connector `std_01kvw4jkcbekyr1t33vs4p5e9w`).

Qualquer outro chat_id **NÃO é escopo do Hermes**. Se aparecer pedido pra postar em outro lugar → pedir confirmação ao Pivete + registrar APR.

---

## 🔗 Regra crítica: canal linkado espelha o grupo

No Telegram, um **canal** pode ter um **grupo de discussão vinculado**. Todo post do canal aparece automaticamente no grupo (com botão "Comentar" que puxa o thread).

No nosso caso:
```
Canal -1003669176367  ──linkado──▶  Grupo -5365750004
```

**Consequência prática:**
- 1 post no canal → aparece nos 2 lugares.
- Postar no canal **E** no grupo pra mesma coisa = **spam duplicado**.
- O bot **@srver1bot** só precisa mandar pro canal — grupo pega sozinho.

---

## ✅ Como fazer certo

### Anúncio público (deploy, status, marco)
```
POST → -1003669176367 (canal)
```
Só isso. Grupo replica automaticamente. NÃO postar em `-5365750004`.

### Debate multi-IA (AULA-013)
```
POST → -5365750004 (grupo, direto)
```
Aqui SIM posta direto no grupo, porque cada IA precisa mandar sua mensagem separada. Não passa pelo canal.

### Card pós-ação (admin)
```
POST → 1901426549 (privado)
```
Card completo AULA-006 + bloco nível/XP/skills no fim.

---

## ❌ O que nunca fazer

| Erro | Por quê |
|---|---|
| Postar mesma notícia no canal + grupo | Grupo já recebe via link — duplicação vira spam |
| Postar anúncio direto no grupo (sem passar pelo canal) | Perde o histórico limpo do canal + estraga o padrão |
| Postar card completo (com XP/skills) no canal | Poluição visual — bloco só vai pro admin |
| Postar em qualquer outro chat_id | Fora do foco — pedir OK primeiro |

---

## 🧪 Validar que o link canal↔grupo tá vivo

Manda 1 post de teste no canal via `sendMessage`. Se em ~5s aparecer no grupo com botão "Comentar", link OK. Se não aparecer, fallback:

1. Registrar APR com sintoma.
2. Postar aviso `⚠️ link canal↔grupo quebrado — postando manual até fix` direto no grupo.
3. Criar pendência via `pendencias_add` pra Pivete reconfigurar o link no Telegram.

---

## 📐 Checklist antes de qualquer notificação

- [ ] Destino é 1 dos 3 IDs? Se não → pausar e perguntar.
- [ ] É anúncio público? Só canal. NÃO tocar no grupo.
- [ ] É debate multi-IA? Só grupo, com `<pre>` de cada IA.
- [ ] É pós-ação? Admin privado com card completo.
- [ ] Formato `<pre>` + `parse_mode: HTML` sempre.

+15 XP · Skill "Comunicação disciplinada" +10
