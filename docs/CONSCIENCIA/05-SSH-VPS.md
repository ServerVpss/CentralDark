---
title: "05 SSH VPS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 05 — SSH na VPS

## Regra inviolável

**NUNCA** usar `$VPS_SSH_KEY_LOVABLE` direto com `printf` / `echo` + `ssh`.

A chave chega em linha única e o OpenSSH rejeita com `error in libcrypto` / `Permission denied`. **Falha 100% das vezes.**

## Sempre usar o script

```bash
export PATH="/nix/store/a8q1aypk785ari2q2a3xr0c2agpwkxb2-openssh-10.2p1/bin:$PATH"
source scripts/lovable-agent/setup-vps-ssh.sh
ssh-vps "comando aqui"
```

O script:
- Lê `VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`
- Reconstrói a chave em `/tmp/vps_key` com quebras de linha certas
- Expõe duas funções: `ssh-vps` e `scp-vps`

## Se o caminho do openssh mudar

```bash
ls /nix/store/*-openssh-*/bin/ssh | head -1
```

E atualiza o `export PATH`.

## Regra de ouro

**Nunca pedir SSH ou comando manual ao usuário.** O agente faz tudo daqui.

## Onde rodar isso

- No ambiente do Lovable (sandbox), o script já existe em `scripts/lovable-agent/setup-vps-ssh.sh`
- Pro Custom GPT, o MCP CentralDark já tem acesso autenticado à VPS — não precisa rodar esse script, ele usa SSH interno do MCP

---

## Aliases SSH — clone-deck (subprojeto)

O subprojeto `apps/clone-deck` usa aliases SSH próprios na VPS.

### Read-only (deploy)

```sshconfig
Host github-clone-deck
  HostName github.com
  User git
  IdentityFile /root/.ssh/clone_deck_deploy_key
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

Uso:

```bash
git remote set-url origin git@github-clone-deck:segredounlock/clone-deck.git
```

### Write (branch/PR)

```sshconfig
Host github-clone-deck-write
  HostName github.com
  User git
  IdentityFile /root/.ssh/arena_clone_deck_write
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

### Arquivos locais na VPS

```txt
/root/clone-deck-webhook/.env          # WEBHOOK_SECRET — nunca expor
/root/clone-deck-webhook/              # listener PM2 CloneDeck-GitHub-Webhook (porta 9003)
/usr/local/bin/clone-deck-gh-pull      # script de pull
/var/log/clone-deck-webhook.log        # log do webhook/pull
/var/log/clone-deck-cleanup.log        # log da quarentena
/root/Multizap/quarantine/             # arquivos movidos (não apaga definitivamente)
```

### Limpeza segura de untracked

A limpeza automática move arquivos não rastreados para:

```txt
/root/Multizap/quarantine/clone-deck-untracked-YYYYMMDDHHMMSS
```

Validar após limpeza:

```bash
cd /root/CentralDark/apps/clone-deck
git status --short --branch
tail -n 80 /var/log/clone-deck-cleanup.log
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
