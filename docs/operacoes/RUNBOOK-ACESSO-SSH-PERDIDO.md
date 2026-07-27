---
title: "RUNBOOK — Perdi o acesso SSH da VPS"
date: 2026-07-27
tags: ["operacoes", "runbook", "acesso", "fail2ban", "guardiao"]
from: "Sessão de diagnóstico 2026-07-27 — acesso perdido de casa, timeout na porta 22"
---

# 🔑 Perdi o acesso SSH — o que fazer

Runbook de recuperação. Escrito depois de um bloqueio real em 27/07/2026.
**Leia o diagnóstico antes de mexer em qualquer coisa** — na metade das vezes o
problema não é o servidor, é o comando digitado errado.

---

## ⚡ Diagnóstico em 3 passos

Rode na sua máquina, nessa ordem. Cada passo elimina uma causa.

### 1. A VPS está viva?

Pergunte o `mcp_status` ou `deploy_status` pelo MCP. Se responder, a VPS está
ligada e com rede. **Servidor caído não é a causa** — pule pro passo 2.

### 2. Sua internet chega na VPS?

```powershell
Test-NetConnection -ComputerName <IP-da-VPS> -Port 443
Test-NetConnection -ComputerName <IP-da-VPS> -Port 22
```

Interprete assim:

| 443 | 22 | Significa |
|---|---|---|
| ✅ | ✅ | A rede está ok — o problema é chave/usuário/alias |
| ✅ | ❌ | **Você foi bloqueado.** Fail2ban ou firewall. Vá pro caminho A |
| ❌ | ❌ | Firewall geral, VPS fora, ou sua operadora |

> A porta 443 abrir e a 22 não é a **assinatura clássica de ban**. Se fosse
> problema de rede ou de servidor, as duas cairiam juntas.

### 3. Você está digitando o comando certo?

⚠️ **Armadilha real que já custou tempo:** a máquina de casa **se chama `SEGREDO`**.
Se você digitar `ssh dandan@segredo`, o SSH tenta conectar **na própria máquina**
(rede local), não na VPS. Dá timeout e parece bloqueio — mas não é.

O alias correto está no `~/.ssh/config`:

```
ssh Segredo-VPS
```

Sem `usuario@`. O alias é `Segredo-VPS` (com `-VPS`) e o usuário já é `root`.

---

## 🅰️ Caminho A — Desbloquear pelo Telegram (preferido)

Funciona **mesmo com o SSH trancado**, porque não passa pela porta 22.

1. Abra o **`@Guardiaonotify_bot`** no Telegram
2. Mande `/start`
3. **🔓 Liberar acesso**
4. **🌐 Liberar IP**
5. Cole o seu IP público e envie

Para descobrir seu IP público:

```powershell
(Invoke-RestMethod "https://api.ipify.org?format=json").ip
```

### 🌐 Liberar IP vs ♻️ Só unban IP

Os dois aparecem. A diferença importa:

- **🌐 Liberar IP** → tira o ban **e** põe na lista de confiança (`ignoreip`).
  Não bane de novo. **Use este.**
- **♻️ Só unban IP** → só tira o ban agora. Errou a chave 2×, bane de novo.

> O bot só obedece o **ADMIN_CHAT_ID**. Ninguém além do dono consegue liberar IP —
> nem outra IA, nem por fora. Por isso a ordem tem que sair do Telegram do dono.

---

## 🅱️ Caminho B — Console do provedor (se o bot não responder)

Se o `CentralDark-GuardiaoBot` estiver fora do ar, sobra o terminal via navegador:

1. **hPanel da Hostinger** → seu VPS → **Browser terminal** / Console
2. Entra direto no servidor **sem usar a porta 22**
3. Lá dentro dá pra soltar o IP e revisar o firewall

Confira também se o **Firewall da Hostinger** (no painel) não está bloqueando a 22.
Às vezes o bloqueio está lá, e resolve em dois cliques — sem terminal nenhum.

---

## 🔁 Por que isso vai acontecer de novo

O IP de internet residencial é **dinâmico** — muda sozinho de tempos em tempos.
Quando muda, o IP novo não está na lista de confiança e você trava igual.

Não é defeito. É o esperado. O caminho A resolve em 30 segundos.

---

## 🧭 Pegadinhas que já queimaram tempo

| Armadilha | Realidade |
|---|---|
| `ssh segredo` | Conecta na **própria máquina** — o PC de casa se chama `SEGREDO` |
| `dandan@` | O usuário da VPS é **`root`** |
| `api.centraldark.com` | O domínio tem **dois L**: `centralldark.com` |
| "PM2 diz online, logo tá bom" | `online` ≠ respondendo. Teste a porta de verdade |
| "A VPS caiu" | Se `/health` da API responde 200, ela não caiu |

---

## 🩺 Sinais de saúde que valem checar junto

Quando recuperar o acesso, confira — nesta ordem:

1. **`CentralDark-WebhookDeploy`** — se estiver `stopped`, **nenhum deploy chega
   na VPS**. É a causa-raiz de "commitei e não mudou nada". Comece por aqui.
2. **Quantos commits atrás** a VPS está do `main` (`deploy_status`).
3. **Processos com restart alto** — `ArsenalProxy` e `EliteHTTP` já bateram +5000.
   Restart nessa ordem de grandeza é crash-loop crônico, não instabilidade.
4. **Healthcheck do gateway** — ele testa a porta `8080`, mas o processo sobe na
   `8082`. O painel acusa erro mesmo com a API pública funcionando (falso alarme).

---

## ✅ Teste final

Depois de liberar, confirme que abriu **antes** de comemorar:

```powershell
Test-NetConnection -ComputerName <IP-da-VPS> -Port 22
ssh Segredo-VPS
```

Se a porta 22 voltar a responder, acabou.

---

**Regra de ouro:** o Guardião é a última porta de entrada quando o SSH cai.
Nunca mexa nele sem ter o SSH funcionando — se ele quebrar junto, não sobra caminho.
