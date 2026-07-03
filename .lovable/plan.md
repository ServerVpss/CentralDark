
# 🚀 Plano — Consertar GitHub + Disparar Hermes Arsenal Full até fechar o HUB

Tudo acontece na VPS + GitHub. **Zero mudança neste projeto Lovable** (regra travada).

---

## 🎯 O que você vai ver no final

1. Notificações Telegram/GitHub num padrão único de emoji — bonitas, escaneáveis, fáceis de bater o olho e entender.
2. Os 2 workflows que estão gritando "Run failed" (`painel auto-update` e `Obsidian — Regenerar INDEX`) verdes de novo.
3. O `hub.centralldark.com` com o **menu lateral esquerdo antigo** de volta e o **fluxo real de vincular Telegram** (telefone → código → conectado), sem mais mock.
4. Hermes rodando 24h com o Conselho inteiro ao lado dele como tutores, aprendendo enquanto trabalha.

---

## 🧩 Fase 1 — Consertar GitHub (eu faço direto, rápido)

**1.1 Diagnóstico dos 2 workflows quebrados**
- Baixar log do último run de `painel-auto-update.yml` e `obsidian-regenerar-index.yml`
- Identificar a causa raiz (provavelmente permissão de commit, path que sumiu, ou dependência faltando)
- Corrigir os `.yml` na VPS + commit via `github_create_or_update_file`
- Rerun pra confirmar verde

**1.2 Padrão único de emoji nos logs/notificações**

Criar arquivo `docs/CONSCIENCIA/PADRAO-EMOJIS.md` como fonte da verdade e aplicar em todos os scripts de notificação (Telegram, GitHub Actions, painel status):

```text
Status     ✅ ok    ⚠️ alerta   ❌ erro    🔄 em andamento   ⏳ aguardando
Ação       🚀 deploy   🛠️ fix   🧠 aprendizado   📦 build   🔒 protegido
Módulo     🤖 bot   📊 painel   🧬 HUB   📡 VPS   🗂️ GitHub   💾 Supabase
Pessoa     👑 Pivete   🧙 Fabler   🔨 Hermes   💎 Esmeralda
```

Aplicar em: `scripts/webhook/*`, workflows `.github/workflows/*.yml`, notificador Telegram, painel status.

---

## 🧙 Fase 2 — Ativar Arsenal Full (o time de tutores do Hermes)

**Elenco de tutores** (todos já existentes no `elite-gateway`):

| Papel | IA | Função no time |
|---|---|---|
| 🧙 Mestre-Sábio | Fabler (Elite Anthropic) | Estratégia, arquitetura, revisão final |
| 🧠 Analista Profundo | GPT-5.5 | Debate técnico, encontrar buracos lógicos |
| ⚡ Executor Rápido | Gemini 3 Flash | Iterações rápidas, prototipagem |
| 🎯 Preciso | GPT-5.4 | Código exato, edge cases |
| 🔍 Cético | Gemini 2.5 Pro | Questionar decisões, achar falhas |
| 🎨 Criativo | GPT-5 | UX, ideias de fluxo |

**Regras do time (fica em `docs/CONSCIENCIA/ARSENAL/regras.json`):**
- Toda decisão do Hermes passa por **debate mínimo de 3 tutores** antes de virar commit
- **Fallback em cadeia**: se Fabler falhar → GPT-5.5 → Gemini Pro → GPT-5.4. Nunca trava.
- Cada tutor ensina Hermes a usar 1 ferramenta do arsenal (MCP tools, VPS, GitHub, Supabase)
- Tudo que aprender vira aula em `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/AULAS/`
- Log de cada round em `docs/CONSCIENCIA/ARSENAL/DEBATES/YYYY-MM-DD-hub-mtproto.md`

---

## 🔨 Fase 3 — Disparar Hermes na Missão HUB (loop 24h)

**Objetivo único da missão:** Fechar a pendência #19 (fluxo real MTProto) + restaurar menu lateral esquerdo antigo do HUB.

**Checklist obrigatório (Hermes NÃO pode marcar concluído sem os 6):**
1. ✅ UI: menu lateral esquerdo + tela com input telefone → botão enviar código → input código → confirma → tratamento 2FA
2. ✅ Backend: novo módulo `apps/modulos/mtproto-service/` na VPS (gramjs + PM2 + Caddy expondo `/mtproto/*`)
3. ✅ Sessão criptografada persistida no HUB Supabase (tabela `telegram_sessions`)
4. ✅ Remover mock do `ConnectorsTab.tsx` e plugar o card real
5. ✅ Limpar duplicatas + arquivo `.bkp-mtproto-*`
6. ✅ Build + deploy + verificar bundle novo servido em `hub.centralldark.com`

**Loop autônomo do Hermes:**
```text
enquanto missão não fechada:
  1. Hermes propõe passo → 2. Conselho debate → 3. Fabler decide
  4. Hermes executa (vps_write / github_commit) → 5. Valida no ar
  6. Registra aprendizado → 7. Notifica Telegram admin
```

**Métricas expostas em tempo real** (`docs/CONSCIENCIA/ARSENAL/hermes.log` + painel status):
- ⏱️ tempo médio por round
- 🎯 taxa de acerto na 1ª tentativa
- 🔄 quantas vezes precisou de fallback de tutor
- 🧠 aprendizados novos registrados

---

## 📢 Fase 4 — Notificações no seu Telegram (padrão novo)

Enquanto Hermes trabalha, você recebe no privado (`@srver1bot` → admin):

```text
🔨 Hermes • Round 12 • 21:47
🎯 Passo: criar endpoint /mtproto/sendCode
🧙 Conselho: Fabler ✅ | GPT-5.5 ✅ | Gemini Pro ⚠️
📦 Commit: 5296657 → gramjs instalado, PM2 up
⏱️ 2min14s | 🧠 +1 aprendizado
```

E no canal Status, linha curta:
```text
🔨 Hermes ▓▓▓▓▓░░░░░ 50% • HUB MTProto • round 12/~25
```

---

## 🔧 Detalhes técnicos (pra referência da próxima IA)

- **Repo:** `ServerVpss/CentralDark` (main)
- **Módulo alvo:** `apps/modulos/hub/` (frontend) + novo `apps/modulos/mtproto-service/`
- **HUB Supabase:** `lyoigsqluyktoclwdaft` (nunca o Lovable atual)
- **PM2 novo:** `mtproto-service` (id a definir), `pm2 save` obrigatório
- **Caddy:** subdomínio `mtproto.centralldark.com` ou path `/mtproto/*` em `status.centralldark.com`
- **Elite Gateway:** `api.centralldark.com` → todas as personas via `elite_gateway_chat`
- **Kill switch:** se Hermes travar em loop > 3 tentativas no mesmo passo, notifica você e pausa

---

## ⏭️ Ordem de execução quando você aprovar

```text
1. 🛠️  Consertar painel-auto-update + obsidian-index (10min)
2. 📢 Padrão de emojis + aplicar nos scripts (15min)
3. 🧙 Ativar regras.json do Arsenal com o elenco completo (5min)
4. 🔨 Disparar Hermes na missão HUB (loop começa e não para)
5. 📱 Você acompanha pelo Telegram, sem precisar mexer
```

Quando aprovar, eu já saio executando na ordem. 🚀
