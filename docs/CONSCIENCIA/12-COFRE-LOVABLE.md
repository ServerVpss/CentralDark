# 12 — Cofre de secrets do Lovable na VPS

> Espelho dos 4 secrets do Lovable guardado na VPS pra rehidratar conta nova
> sem ter que ficar gerando token novo e copiando chave SSH toda vez.

## Onde fica

```
/root/CentralDark/secrets/lovable.env   (chmod 600, root only)
```

## O que tem dentro

| Chave | Origem | Recuperável? |
|-------|--------|--------------|
| `VPS_HOST_LOVABLE` | hostname da VPS | sim, fixo |
| `VPS_USER_LOVABLE` | usuário SSH | sim, fixo |
| `VPS_SSH_KEY_LOVABLE` | `/root/.ssh/lovable_bot` | sim, mesmo md5 do secret atual |
| `GITHUB_PAT_PERFIL` | PAT do GitHub do perfil `segredounlock` | **não** — precisa colar 1x manual |

## Como usar em conta nova

### Problema do ovo e da galinha

Pra puxar QUALQUER coisa da VPS via SSH, precisa da chave SSH antes.
Então em conta zerada:

1. Cole UMA vez o secret `VPS_SSH_KEY_LOVABLE` no Workspace Settings > Secrets.
   (esse passo é manual, não tem como evitar)
2. A partir daí, eu (Lovable agent) rodo o script abaixo e puxo o resto.

### Comando

```bash
bash scripts/lovable-agent/pull-vault-from-vps.sh
```

O script:
- Baixa `/root/CentralDark/secrets/lovable.env` pra `/tmp/lovable-vault.env`
- Imprime os 4 valores formatados (chave SSH em bloco)
- Avisa se o `GITHUB_PAT_PERFIL` ainda estiver vazio

Depois é só copiar os valores no Workspace Settings > Secrets.

## Atualizar o cofre

### PAT novo
```bash
ssh-vps "sed -i 's|^GITHUB_PAT_PERFIL=.*|GITHUB_PAT_PERFIL=ghp_NOVO_AQUI|' /root/CentralDark/secrets/lovable.env"
```

### Chave SSH nova (raro)
```bash
ssh-vps 'KEY=$(cat /root/.ssh/lovable_bot); ...'  # regerar o arquivo todo
```

## Por que não populei o PAT automaticamente?

Porque o PAT não estava salvo na VPS — só existe como secret do Lovable.
Pra evitar duplicar segredo (e expor risco), deixei o campo vazio.
Na próxima vez que você gerar/rotacionar o PAT, atualiza o cofre na mesma hora
com o `sed` acima.

## Regras inquebráveis

- `chmod 600` sempre. Nunca world-readable.
- Nunca commitar `lovable.env` no repo.
- Nunca imprimir o conteúdo do cofre em log/output não-mascarado.
- Se rotacionar a chave SSH da conta `lovable_bot`, atualizar VPS + cofre + secret do Lovable juntos.
