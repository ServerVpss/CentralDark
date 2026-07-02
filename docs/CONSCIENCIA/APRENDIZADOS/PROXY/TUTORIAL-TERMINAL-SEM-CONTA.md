---
title: "TUTORIAL — Claude Code no terminal sem conta (via proxy)"
date: 2026-07-01
tags: ["tutorial", "proxy", "terminal", "claude-code", "contingencia", "switch-model"]
updated: 2026-07-01
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
║   Switch modelo: embutido no script — sem instalar nada   ║
╚══════════════════════════════════════════════════════════╝
```

> **Pra que serve:** se sua conta principal "cair" (bater o limite), você liga o proxy
> e continua trabalhando no terminal — leve e rápido (bem mais que o Cline).

---

## 🚀 Jeito 1 — INSTALADOR automático (recomendado)

**Único comando — faz tudo sozinho:**

```bash
bash /root/CentralDark/docs/APRENDIZADOS/PROXY/INSTALADOR.sh
```

O que ele faz automaticamente:
1. ✅ **Verifica dependências** (bash, curl, python3) — instala o que faltar
2. ✅ **Localiza o script** `claude-proxy.sh` e o cofre de credenciais
3. ✅ **Instala atalhos** no `~/.bashrc` (proxy-on, proxy-off, proxy-status, proxy-models, proxy-switch, claude-proxy)
4. ✅ **Abre painel interativo** — escolhe ligar, desligar, ver status, listar modelos, trocar modelo, ou abrir o Claude

Depois da instalação, é só digitar no terminal:

| Comando | O que faz |
|---------|-----------|
| `claude-proxy` | Liga proxy + abre Claude Code |
| `proxy-on` | Só liga o proxy |
| `proxy-off` | Desliga o proxy |
| `proxy-status` | Mostra status + modelo ativo |
| `proxy-models` | Lista modelos disponíveis |
| `proxy-switch` | Menu pra trocar modelo |

---

## 🟢 Jeito 2 — LIGAR e abrir o Claude (1 comando direto)

No terminal da VPS:

```bash
bash /root/CentralDark/secrets/claude-proxy.sh run
```

Isso liga o proxy **e** já abre o Claude Code usando ele. Pronto pra trabalhar.
Suas Lembranças e a Consciência continuam funcionando (a memória é a mesma).

**Com modelo específico:**

```bash
bash /root/CentralDark/secrets/claude-proxy.sh run sonnet-4.6
```

---

## 🔧 Jeito 3 — Ligar/desligar manual (controle total)

```bash
# LIGAR (vale só neste terminal):
source /root/CentralDark/secrets/claude-proxy.sh on
claude                       # agora roda via proxy

# VER se está ligado e qual modelo está ativo:
source /root/CentralDark/secrets/claude-proxy.sh status

# DESLIGAR (volta pra sua conta normal):
source /root/CentralDark/secrets/claude-proxy.sh off
```

> ⚠️ Use **`source`** (não `bash`) nos comandos `on`/`off`/`status` — é o que faz a
> mudança valer no seu terminal. Pra fechar tudo, é só fechar a janela: o proxy
> some sozinho (não fica ligado pra sempre).

---

## 🔄 Trocar de modelo no proxy

O proxy tem **6 modelos disponíveis**. Você pode escolher qualquer um:

```
╔══════════════════════════════════════════════════════════════╗
║   🤖 MODELOS DISPONÍVEIS NO PROXY                           ║
╠══════════════════════════════════════════════════════════════╣
║   1. Claude Opus 4.8                      (opus-4.8)        ║
║   2. Claude Opus 4.8 [1m]                 (opus-4.8[1m])    ║
║   3. Claude Sonnet 4.6                    (sonnet-4.6)      ║
║   4. Claude Sonnet 4.6 [1m]               (sonnet-4.6[1m]) ║
║   5. Claude Haiku 4.6                     (haiku-4.6)       ║
║   6. Claude Haiku 4.6 [1m]                (haiku-4.6[1m])  ║
╚══════════════════════════════════════════════════════════════╝
```

### 🔹 Direto (sabe o ID do modelo)

```bash
source /root/CentralDark/secrets/claude-proxy.sh switch sonnet-4.6
source /root/CentralDark/secrets/claude-proxy.sh switch opus-4.8[1m]
source /root/CentralDark/secrets/claude-proxy.sh switch haiku-4.6
```

### 🔹 Menu interativo (não sabe o ID)

```bash
source /root/CentralDark/secrets/claude-proxy.sh switch
```

Vai aparecer um menu numerado. É só digitar o número do modelo desejado.

### 🔹 Listar modelos disponíveis

```bash
source /root/CentralDark/secrets/claude-proxy.sh models
```

### 🔹 Ver modelo ativo

```bash
source /root/CentralDark/secrets/claude-proxy.sh status
```

Mostra se o proxy está ligado, a URL e qual modelo está ativo.

---

## ⚡ (Opcional) Criar atalho curto `claude-proxy`

Se quiser digitar só `claude-proxy` em vez do caminho todo, **cole este bloco uma vez**
no terminal (você autoriza a mudança no seu `.bashrc`):

```bash
cat >> ~/.bashrc <<'EOF'

# === CentralDark proxy aliases ===
alias proxy-on='source /root/CentralDark/secrets/claude-proxy.sh on'
alias proxy-off='source /root/CentralDark/secrets/claude-proxy.sh off'
alias proxy-status='source /root/CentralDark/secrets/claude-proxy.sh status'
alias proxy-models='source /root/CentralDark/secrets/claude-proxy.sh models'
alias proxy-switch='source /root/CentralDark/secrets/claude-proxy.sh switch'
alias claude-proxy='bash /root/CentralDark/secrets/claude-proxy.sh run'
EOF
source ~/.bashrc
```

Depois disso, é só:

| Comando | O que faz |
|---------|-----------|
| `claude-proxy` | Liga proxy + abre Claude Code |
| `proxy-on` | Só liga o proxy |
| `proxy-off` | Desliga o proxy |
| `proxy-status` | Mostra status + modelo ativo |
| `proxy-models` | Lista modelos disponíveis |
| `proxy-switch` | Menu pra trocar modelo |
| `proxy-switch sonnet-4.6` | Troca direto pro modelo |

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

---

## 📂 Para usar em QUALQUER VPS (universal)

Se quiser levar este script pra outra máquina:

1. **Copie o script:**
   ```bash
   scp /root/CentralDark/secrets/claude-proxy.sh usuario@outravps:/caminho/
   ```

2. **Crie o cofre de credenciais** em qualquer lugar:
   ```bash
   nano /caminho/secrets/anthropic.env
   ```
   Conteúdo:
   ```env
   ANTHROPIC_AUTH_TOKEN=sua-key-aqui
   ANTHROPIC_BASE_URL=https://claude.ap7.site
   ```

3. **Edite a linha 18 do script** apontando pro novo cofre:
   ```bash
   COFRE="/caminho/secrets/anthropic.env"
   ```

4. **Pronto.** Todos os comandos funcionam igual.

---

## Conexões Rápidas

- [[APRENDIZADOS_PROXY]] — diagnóstico de autenticação do proxy
- [[METODO-SWITCH-MODEL]] — método técnico de como o switch foi implementado
- [[MCP-EXPLICADO]] — o que é o MCP
