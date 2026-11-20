# 15 — Cloudflare API (DNS automático)

O instalador usa a **API do Cloudflare** pra criar/atualizar todos os
subdomínios sozinho. Em VPS nova ou em conta nova, basta gerar um token e
rodar — o script faz o resto.

## O que o script garante

Para o domínio configurado (padrão `centralldark.com`), ele cria/atualiza
um registro `A` apontando pro IP da VPS, para cada subdomínio da lista:

| Nome      | Para que serve                                |
|-----------|------------------------------------------------|
| `@`       | Domínio raiz (site / landing)                  |
| `www`     | Atalho do raiz                                 |
| `app`     | Painel principal (login do clone-deck)         |
| `api`     | Gateway de API                                 |
| `bot`     | Bot Telegram (painel + webhook público)        |
| `crm`     | CRM                                            |
| `mcp`     | Servidor MCP CentralDark (porta 9100)          |
| `gateway` | Gateway alternativo / proxy raiz               |
| `webhook` | Webhook GitHub → VPS (deploy)                  |
| `status`  | Página pública de status do sistema            |

A lista é editável em `CF_SUBDOMAINS`.

O script é **idempotente** e **não destrutivo**: nunca apaga registro que
já existe — só cria o que falta e atualiza IP/proxy quando estiver diferente.

## Passo 1 — Pegar o token Cloudflare

1. Entra em <https://dash.cloudflare.com/profile/api-tokens>
2. Clica **Create Token**
3. Escolhe o template **Edit zone DNS**
4. Em **Zone Resources**, seleciona a zona (`centralldark.com` ou outra)
5. Clica **Continue to summary** → **Create Token**
6. **Copia o token na hora** (o Cloudflare não mostra de novo)

Permissões mínimas que o token precisa ter:

- **Zone → Zone → Read**
- **Zone → DNS → Edit**

## Passo 2 — Rodar o wizard do instalador

Forma recomendada (zero edição de arquivo):

```bash
./install.sh --cloudflare
```

O wizard vai:

1. Perguntar o token (digitação oculta, não fica em log)
2. Confirmar o domínio principal (default `centralldark.com`)
3. Detectar o IP público da VPS automaticamente (você só confirma)
4. Salvar tudo em `/root/CentralDark/secrets/cloudflare.env` com perm `0600`
5. Validar o token na API da Cloudflare
6. Mostrar simulação (dry-run) com o que será criado/atualizado
7. Pedir confirmação `SIM` antes de aplicar de verdade
8. Aplicar e gerar a lista final de links em `revisoes/<data>/cloudflare/links-do-usuario.md`

Modos não-interativos (depois que o env já existe):

```bash
./install.sh --cloudflare-check     # só valida token e lista o que já tem
./install.sh --cloudflare-apply     # aplica direto (pra CI ou re-run)
```

Se preferir editar o arquivo na mão (não precisa, mas dá pra fazer):

```bash
sudo nano /root/CentralDark/secrets/cloudflare.env
sudo chmod 600 /root/CentralDark/secrets/cloudflare.env
```



Ou pelo instalador:

```bash
./install.sh --cloudflare           # wizard guiado
./install.sh --cloudflare-apply     # aplica direto se o env tá pronto
./install.sh --cloudflare-check     # só valida
```

## O que aparece no fim

```
[ ok ]  Token válido
[ ok ]  Zona OK (abc123...)
[ ok ]  Registros A atuais: 4
[ ok ]  CRIADO   app.centralldark.com -> 89.117.78.124
[ ok ]  CRIADO   bot.centralldark.com -> 89.117.78.124
[cf]    OK       mcp.centralldark.com já aponta certo
[ ok ]  Resumo: mantidos=1 criados=2 atualizados=0 (modo=apply)
```

## Trocar de conta / domínio (uso futuro)

Pra usar em outra conta Cloudflare ou outro domínio, basta:

1. Gerar um token novo no perfil da nova conta (Passo 1)
2. Editar `cloudflare.env` com o novo `CF_API_TOKEN` e `CF_ZONE_NAME`
3. Rodar `./install.sh --cloudflare-apply`

Nenhuma outra mudança no código é necessária.

## Regras de segurança

- O arquivo `cloudflare.env` **NUNCA** vai pro Git (já coberto pelo
  `.gitignore` da pasta de secrets).
- Permissão **obrigatória** `0600`. O script recusa se estiver aberto.
- O token mostrado em log é sempre mascarado pelo `sanitize()` do instalador.
- Mudanças em DNS público continuam sendo **ação sensível**: o modo
  `--cloudflare-apply` só roda quando o usuário pediu explicitamente. O wizard
  sempre faz `--dry-run` primeiro e pede confirmação antes de aplicar.

## Integração com o checker final (pendência #14)

Depois que o `cf-sync.sh` aplica, o checker end-to-end (pendência #9) faz a
verificação cruzada:

- `dig +short app.centralldark.com` retorna o IP correto?
- HTTPS responde em cada subdomínio?
- Caddy tem rota pro `app`, `api`, `bot`, `mcp`, `webhook`?
- Cert SSL emitido?

Qualquer falha vira `ALERTA` ou `ERRO` no relatório final.
