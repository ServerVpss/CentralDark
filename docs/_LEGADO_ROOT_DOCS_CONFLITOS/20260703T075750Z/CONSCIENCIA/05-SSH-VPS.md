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
