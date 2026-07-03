# 00 — Como começar (do zero, sem saber nada)

> Este guia é pra quem **nunca** mexeu em servidor. Se você sabe SSH, pula direto pro passo 4.

---

## 1. Ter uma VPS

Contrate uma VPS Linux (Contabo, Hetzner, DigitalOcean, Hostinger VPS, etc.).

Recomendado:
- **Sistema:** Ubuntu 22.04 ou Debian 12
- **RAM:** 2 GB (mínimo 1 GB, mas vai ficar apertado)
- **Disco:** 20 GB (mínimo 8 GB)
- **Acesso:** usuário **root** + senha (ou chave SSH)

O provedor manda por e-mail: **IP**, **usuário** (`root`) e **senha**.

---

## 2. Abrir o terminal

**Windows:** baixa o [PuTTY](https://www.putty.org/) ou usa o **PowerShell** (já vem instalado).
**Mac/Linux:** abre o app **Terminal**.

---

## 3. Conectar na VPS

No terminal, digita (troca o IP pelo seu):

```bash
ssh root@SEU_IP_DA_VPS
```

Vai aparecer:
```
Are you sure you want to continue connecting (yes/no)?
```
Digita **`yes`** e Enter.

Depois pede a senha — **cola a senha do e-mail** (o terminal não mostra nada enquanto você digita, é normal) e Enter.

Pronto, você tá dentro da VPS.

---

## 4. UMA linha — escolhe o que quer fazer

Cola direto no terminal. Tudo passa por `https://install.centralldark.com` (porta de entrada oficial). Não precisa clonar nada manualmente — o instalador faz tudo dentro de `/root/CentralDark/` espelhando o repositório.

| Quer fazer | Comando |
|---|---|
| Só verificar o ambiente | `curl -fsSL https://install.centralldark.com \| bash -s -- --check` |
| Instalar a base CentralDark + checker no fim | `curl -fsSL https://install.centralldark.com \| bash -s -- --install` |
| Configurar Cloudflare pelo celular (QR) | `curl -fsSL https://install.centralldark.com \| bash -s -- --connect` |
| Wildcard DNS (@, www, *) + Caddy + online-check | `curl -fsSL https://install.centralldark.com \| bash -s -- --wildcard` |
| Subir o MCP CentralDark | `curl -fsSL https://install.centralldark.com \| bash -s -- --mcp` |
| Instalar o menu colorido (`cdmenu` / `cdstatus`) | `curl -fsSL https://install.centralldark.com \| bash -s -- --menu` |
| Rodar o checker end-to-end (12 blocos) | `curl -fsSL https://install.centralldark.com \| bash -s -- --check-final` |
| Atualizar o instalador | `curl -fsSL https://install.centralldark.com \| bash -s -- --update` |

Sem flag, abre o **wizard interativo** com todas as opções em menu:

```bash
curl -fsSL https://install.centralldark.com | bash
```

Depois da primeira execução, o comando global `centraldark` (ou `clonedeck`) fica disponível em qualquer pasta — não precisa mais do `curl`.

---

## 5. O que cada modo faz (resumão)

- **`--check`** — read-only. Só diz se a VPS aguenta (SO, RAM, disco, portas 80/443, Node 20+).
- **`--install`** — instalação base completa + roda `--check-final` no fim. Idempotente.
- **`--connect`** — gera QR no terminal pra você abrir no celular e autorizar Cloudflare via OAuth (PKCE). Grava o token em `/root/CentralDark/secrets/`.
- **`--wildcard`** — cria `@`, `www`, `*` apontando pro IP da VPS + ajusta Caddy + testa HTTPS.
- **`--mcp`** — sobe o MCP CentralDark (porta 9100, domínio `mcp.centralldark.com`).
- **`--menu`** — instala `cdmenu`/`cdstatus`/`menu` (atalhos coloridos pra status da VPS).
- **`--check-final`** — checker end-to-end de 12 blocos (pastas, PM2, webhook, bot, Supabase sync, WuzAPI, Caddy, CRM, segurança). Relatório em `/root/CentralDark/revisoes/<data>/checker-final/relatorio.md`.
- **`--update`** — `git pull` no repo local + auto-update do `install.sh`.

---

## 6. Problemas comuns

| Erro | Solução |
|---|---|
| `Permission denied` no SSH | Senha errada — copia de novo do e-mail do provedor |
| `command not found: curl` | `apt-get install -y curl` e tenta de novo |
| Falha na FASE 1 | Lê a mensagem em vermelho — diz exatamente o que falta |
| Travou no meio | Ctrl+C e roda de novo — é idempotente, não quebra |

---

## 7. Onde ficam os arquivos

Tudo dentro de `/root/CentralDark/` (espelho exato do repositório):

- Repositório clonado: `/root/CentralDark/` (raiz)
- Apps: `/root/CentralDark/apps/`
- Infra (Caddy, PM2): `/root/CentralDark/infra/`
- Secrets: `/root/CentralDark/secrets/`
- Logs: `/root/CentralDark/logs/`
- Relatórios e revisões: `/root/CentralDark/revisoes/<data>/`

Tudo idempotente — rodar 2x não quebra nada.

