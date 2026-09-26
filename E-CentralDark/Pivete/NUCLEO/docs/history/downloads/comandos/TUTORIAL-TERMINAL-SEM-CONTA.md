---
title: "TUTORIAL — Claude Code no terminal sem conta (via proxy)"
date: 2026-06-30
tags: ["tutorial", "proxy", "terminal", "claude-code", "contingencia"]
updated: 2026-06-30
---

# 🖥️ Usar o Claude Code no terminal SEM conta (modo proxy)

```
╔══════════════════════════════════════════════════════════╗
║   🔌 MODO PROXY — terminal sem depender de conta logada    ║
╠══════════════════════════════════════════════════════════╣
║   Pra quê:  rodar o Claude Code (CLI, leve) pelo seu       ║
║             proxy claude.ap7.site quando a conta cair      ║
║   Script:   secrets/claude-proxy.sh  (testado 🟢 HTTP 200) ║
║   Key:      mora no cofre secrets/anthropic.env 🔒         ║
║   Liga/desliga: por terminal — fechou, voltou ao normal   ║
╚══════════════════════════════════════════════════════════╝
```

> **Pra que serve:** se sua conta principal "cair" (bater o limite), você liga o proxy
> e continua trabalhando no terminal — leve e rápido (bem mais que o Cline).

---

## 🟢 Jeito 1 — LIGAR e abrir o Claude (1 comando)

No terminal da VPS:

```bash
bash /root/CentralDark/secrets/claude-proxy.sh run
```

Isso liga o proxy **e** já abre o Claude Code usando ele. Pronto pra trabalhar.
Suas Lembranças e a Consciência continuam funcionando (a memória é a mesma).

---

## 🔧 Jeito 2 — Ligar/desligar manual (controle total)

```bash
# LIGAR (vale só neste terminal):
source /root/CentralDark/secrets/claude-proxy.sh on
claude                       # agora roda via proxy

# VER se está ligado:
source /root/CentralDark/secrets/claude-proxy.sh status

# DESLIGAR (volta pra sua conta normal):
source /root/CentralDark/secrets/claude-proxy.sh off
```

> ⚠️ Use **`source`** (não `bash`) nos comandos `on`/`off`/`status` — é o que faz a
> mudança valer no seu terminal. Pra fechar tudo, é só fechar a janela: o proxy
> some sozinho (não fica ligado pra sempre).

---

## ⚡ (Opcional) Criar atalho curto `claude-proxy`

Se quiser digitar só `claude-proxy` em vez do caminho todo, **cole este bloco uma vez**
no terminal (você autoriza a mudança no seu `.bashrc`):

```bash
cat >> ~/.bashrc <<'EOF'

# === CentralDark proxy aliases ===
alias proxy-on='set -a; source /root/CentralDark/secrets/anthropic.env; set +a; echo "🟢 proxy LIGADO ($ANTHROPIC_BASE_URL)"'
alias proxy-off='unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY; echo "🔴 proxy DESLIGADO"'
alias proxy-status='[ -n "$ANTHROPIC_BASE_URL" ] && echo "🟢 LIGADO ($ANTHROPIC_BASE_URL)" || echo "🔴 DESLIGADO"'
alias claude-proxy='set -a; source /root/CentralDark/secrets/anthropic.env; set +a; echo "🟢 Claude via proxy"; claude'
EOF
source ~/.bashrc
```

Depois disso, é só: **`claude-proxy`** (liga e abre), **`proxy-off`** (desliga),
**`proxy-status`** (ver estado).

---

## 🌟 Deixar SEMPRE no proxy (terminal + extensão do VSCode juntos)

Ideal quando a conta principal está acabando (ex.: 92% do limite). Faz **tudo** —
o terminal E esta barra de chat da extensão — usar o proxy sozinho. Cole este bloco
**uma vez** no terminal da VPS:

```bash
cat >> ~/.bashrc <<'EOF'

# CentralDark — Claude Code sempre via proxy (terminal + extensão)
set -a; [ -f /root/CentralDark/secrets/anthropic.env ] && . /root/CentralDark/secrets/anthropic.env; set +a
EOF
```

Depois de colar:
- **Terminal:** abra um terminal novo → já está no proxy.
- **Extensão (esta barra):** `Ctrl+Shift+P` → **Reload Window** → passa a usar o proxy.

**Pra VOLTAR pra sua conta** (quando o limite resetar): abra `~/.bashrc`, apague essas
2 linhas do CentralDark, e recarregue a janela.

> 🔒 Seguro: o comando só faz `source` do cofre `anthropic.env` (gitignored). A key
> nunca é escrita no `.bashrc` — só carregada de lá na hora.

---

## 🔒 Segurança

- A key fica **só** no cofre `secrets/anthropic.env` (gitignored — nunca vai pro GitHub).
- O script/atalhos **nunca** escrevem a key na tela nem em arquivo versionado.
- ⚠️ A key antiga `sk-lab-xlZDW…` foi exposta no Git → **considere queimada**, use só a NOVA.

---

## 🧠 Sua rede de segurança (continuidade)

Trocou de conta/IA? Qualquer terminal novo continua de onde parou:
1. liga o proxy (Jeito 1 ou 2)
2. roda `/contexto` (calibra com seu jeito — lê Lembranças + Consciência)
3. segue o trabalho, sem re-explicar nada.

## Conexões Rápidas

- [[APRENDIZADOS_PROXY]] — diagnóstico de autenticação do proxy
- [[MCP-EXPLICADO]] — o que é o MCP
