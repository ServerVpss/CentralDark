---
name: env-file-handling
description: "Open .env in Notepad; never echo secrets to terminal."
version: 1.0.0
author: HERMES-CASA
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [env, secrets, notepad, windows, user-preference]
    related_skills: [cua-driver-windows-elevado, tailscale-remote-access]
---

# .env handling — regra do CHEFE

Quando a tarefa envolver arquivo `.env` (ler senha,confirmar valor, mostrar
conteúdo pro usuário):

**NÃO** leia/eco o conteúdo no terminal. **NÃO** use `cat`/`grep`+print de
`HERMES_WEBUI_PASSWORD` ou qualquer secret.

**ABRA NO NOTEPAD na tela do usuário:**

```text
cmd //c start notepad "C:\caminho\completo\.env"
```

O usuário vê o conteúdo na própria tela e edita/salva lá. Isso evita ida-e-volta
e exposição acidental no chat.

## Por que
Usuário correu: "quando for arquivo .env vc so abri na minha tela Notepad.exe
com o conteudo ai vc evita perca de tempo". É preferência de formato/fluxo, não
só fato — vai no SKILL.md, não só na memória.

## Quando aplicar
- `.env` do hermes-webui, gateway, qualquer projeto local
- qualquer arquivo de segredos que o usuário precise visualizar/conferir
- depois de editar `.env` via Write, abra no Notepad pra ele validar

## O que NÃO fazer
- Não ecoar senha/API key/token no terminal ou chat
- Não assumir que o usuário quer ver o valor no chat
- Não criar `.env` sem depois oferecer abrir no Notepad

## Após editar .env e relançar server
Se o server lê `.env` do repo (ex: hermes-webui `bootstrap.py` carrega
`REPO_ROOT/.env` automaticamente), só relançar o processo já pega a nova senha —
não precisa de flag. Matar PID, subir de novo, provar `/health`.
