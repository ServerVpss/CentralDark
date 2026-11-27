# 16 — Cloudflare DNS + Caddy + HTTPS (Wizard)

Guia do **Cloudflare Connect Wizard** — o assistente que conecta a conta
Cloudflare ao instalador da CentralDark via SSH, sem login/senha, sem
abrir navegador na VPS.

> Se você quer só a referência rápida da API Cloudflare (formato do
> `cloudflare.env`, endpoints), veja [`15-cloudflare-api.md`](15-cloudflare-api.md).

## Pra que serve

Em **uma execução** o wizard:

1. Conecta sua conta Cloudflare via API Token (seguro e revogável)
2. Confirma a zona do domínio
3. Checa cada subdomínio (DNS + HTTPS + rota Caddy)
4. Cria/corrige DNS faltante (sempre pedindo `CONFIRMO`)
5. Gera snippets Caddy parametrizados
6. Salva relatório completo em `revisoes/`

## 🆕 Modo Navegador (recomendado pra leigos)

A partir de agora existe um caminho **sem precisar mexer em token a mão**:
o usuário roda um comando no SSH, o terminal mostra um link, ele abre no
celular/PC, clica em "Entrar com Cloudflare" (ou cria token em 1 clique),
e a VPS recebe a permissão sozinha.

```bash
./CentralDark/scripts/installer/cloudflare-browser-connect.sh
```

Como funciona por baixo:

1. Script chama `POST https://install.centralldark.com/session/new`
2. Imprime um link tipo `https://install.centralldark.com/connect/<id>`
3. Faz long-poll em `/session/<id>?wait=25` (até 10 minutos)
4. Página oferece dois botões:
   - **Entrar com Cloudflare** → OAuth Authorization Code + PKCE em `dash.cloudflare.com/oauth2/auth` (só ativa se `CF_OAUTH_CLIENT_ID`/`SECRET` estiverem no `.env` do install-callback)
   - **Criar token na Cloudflare** → abre `dash.cloudflare.com/profile/api-tokens` com `Zone:Read + DNS:Edit` pré-marcadas; usuário cola o token de volta
5. Servidor valida em `/user/tokens/verify`, grava em `/root/CentralDark/secrets/cloudflare.env` (chmod 600), terminal recebe confirmação e segue

**Configurar OAuth (uma vez por VPS):**
1. `dash.cloudflare.com/<account_id>/oauth_clients` → **Create client**
2. Tipo: **Confidential** · Grant types: `authorization_code`, `refresh_token`
3. Redirect URI: `https://install.centralldark.com/oauth/cloudflare/callback`
4. Scopes: `zone:read`, `dns_records:edit`, `user:read`, `account:read`
5. Cola `client_id` + `client_secret` em `/root/CentralDark/apps/install-callback/.env` e `pm2 restart Install-Callback`

Detalhes do backend: `CentralDark/apps/install-callback/README.md`.

## Modo Token (manual — sempre disponível)

Pelo menu:

```
./install.sh
→ 4. Configurar Cloudflare/DNS
```

Direto:

```bash
./install.sh --cloudflare        # wizard completo
./install.sh --cloudflare-check  # só valida token + lista DNS atual
./install.sh --cloudflare-apply  # aplica DNS sem perguntar (CI/re-run)
./install.sh --dns-check         # checker DNS+Caddy+HTTPS, read-only
```

## Fluxo passo a passo (no SSH)

```
╔══════════════════════════════════════════════════════════╗
║  🌩️   CENTRALDARK CLOUDFLARE SETUP                       ║
╚══════════════════════════════════════════════════════════╝

1. Banner + explicação do que vai acontecer
2. Detecta IP público da VPS e pede confirmação
3. Pergunta o domínio principal (default centralldark.com)
4. Reaproveita token salvo se ainda for válido
5. Se faltar token → mostra link do dashboard e pede pra colar
6. Valida token via API (verify + zone lookup + probe DNS:Edit)
7. Salva em /root/CentralDark/secrets/cloudflare.env (perm 0600)
8. Lista subdomínios padrão (editável)
9. Checker mostra tabela OK / ALERTA / ERRO
10. Pra cada ERRO: menu (criar auto / instrução manual / pular)
11. Confirmação CONFIRMO antes de qualquer mudança
12. Snippets Caddy gerados em /root/CentralDark/infra/caddy/
13. Resumo + caminho do relatório
```

## Como pegar o token Cloudflare

No seu navegador (não na VPS):

1. Abra <https://dash.cloudflare.com/profile/api-tokens>
2. **Create Token** → template **Edit zone DNS**
3. Em **Zone Resources**, escolha sua zona (ex.: `centralldark.com`)
4. **Continue to summary** → **Create Token**
5. **Copie o token** (Cloudflare só mostra uma vez)
6. Cole no terminal SSH quando o wizard pedir

Permissões mínimas:
- **Zone → Zone → Read**
- **Zone → DNS → Edit**

## Subdomínios padrão

| Nome      | Apontamento padrão |
|-----------|--------------------|
| `@`, `www`| IP VPS (proxied)   |
| `app`     | IP VPS (proxied)   |
| `crm`     | IP VPS (proxied)   |
| `bot`     | IP VPS (proxied)   |
| `api`     | IP VPS (proxied)   |
| `gateway` | IP VPS (proxied)   |
| `webhook` | IP VPS (proxied)   |
| `mcp`     | IP VPS (proxied)   |
| `status`  | IP VPS (proxied)   |

Lista editável durante o wizard ou direto na variável `CF_SUBDOMAINS` do env.

## Checker DNS — o que ele valida

Pra cada FQDN:

- `dig +short A <fqdn>` retorna IP esperado?
- HTTPS responde (200/301/302/401/403)?
- Existe rota no Caddyfile principal ou snippet em `infra/caddy/`?

Classificação:
- **OK** — DNS certo + HTTPS respondendo
- **ALERTA** — DNS certo mas serviço ainda não responde / Caddy faltando
- **ERRO** — DNS ausente ou divergente

## Caddy — regra de ouro

O wizard **nunca** altera o Caddyfile principal sozinho.
Ele gera snippets em `/root/CentralDark/infra/caddy/<nome>.Caddyfile` a
partir dos templates em `CentralDark/infra/caddy/templates/`.

Pra importar, adicione **uma linha** no Caddyfile principal:

```
import /root/CentralDark/infra/caddy/*.Caddyfile
```

Antes de mexer no Caddyfile real, faça backup:

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%Y%m%d%H%M%S)
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## MCP já existente

Se `mcp.centralldark.com/health` já retorna `{"ok":true,"service":"mcp-centraldark"}`,
o wizard reconhece como **OK** e não tenta recriar Caddy/DNS desse subdomínio.

## Segurança — o que o wizard NÃO faz

- ❌ não pede senha da Cloudflare
- ❌ não salva token no Git / README / log
- ❌ não mostra token completo em nenhuma saída
- ❌ não altera Caddyfile principal sem `CONFIRMO`
- ❌ não apaga registros DNS existentes
- ❌ não mexe em Docker, WuzAPI, WhatsApp, banco real
- ❌ nenhum `rm -rf`

## Relatórios

Cada execução gera:

```
/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/cloudflare-connect/
├── resumo.md            # visão executiva (10–20 linhas)
├── dns-report.md        # tabela OK/ALERTA/ERRO por subdomínio
├── checks.json          # mesmo conteúdo em JSON
├── acoes-executadas.md  # diff do que mudou
├── pendencias.md        # o que ainda precisa de atenção
└── logs-sanitizados.txt # stdout/stderr filtrados (token mascarado)
```

No terminal aparece só o resumo + caminho.

## Erros comuns

**Token inválido ou sem permissão**
- Recriar token com Zone:Read + DNS:Edit
- Confirmar que a zona escolhida no token é a do seu domínio

**Zona não encontrada**
- Adicionar o domínio no painel Cloudflare antes
- Confirmar nameservers do domínio apontando pra Cloudflare

**HTTPS dá 502/000**
- DNS pode estar ok mas serviço local não subiu
- Conferir se há rota Caddy importada e se o serviço PM2 está up

**Rodar de novo não muda nada**
- É o esperado. O wizard é **idempotente**.

## Fluxo OAuth pelo celular (2026-06-05)

Quando você escolhe **"Conectar pelo navegador"** no wizard, o instalador abre um QR code apontando pra `install.centralldark.com/connect/<sid>`. Você escaneia, autoriza no Cloudflare, e o instalador **emenda sozinho** no passo de aplicar DNS — sem você digitar nada no terminal.

### O que o instalador faz automaticamente depois do OAuth

1. Recebe `CF_API_TOKEN` + `CF_ACCOUNT_ID` no cofre (`/root/CentralDark/secrets/cloudflare.env`, `chmod 600`).
2. **Auto-detecta a zona** chamando a API Cloudflare:
   - 1 zona só na conta → usa direto.
   - 2+ zonas → mostra a lista e pergunta 1 vez (resposta salva no cofre).
   - 0 zonas → erro claro pedindo pra cadastrar o domínio no painel Cloudflare primeiro.
3. **Auto-detecta o IP público** da VPS via `ipify.org` ou `ifconfig.me`.
4. Aplica os A-records padrão (`@ www app api bot crm mcp gateway webhook status install`) apontando pra esse IP, com proxy Cloudflare ligado.
5. Escreve o relatório de revisão e mostra a lista de links no final.

### Variáveis do cofre (`/root/CentralDark/secrets/cloudflare.env`)

| Chave            | Obrigatório? | Quem preenche                                    |
| ---------------- | ------------ | ------------------------------------------------ |
| `CF_API_TOKEN`   | Sim          | OAuth ou colado manual                           |
| `CF_ACCOUNT_ID`  | Recomendado  | OAuth (descobre sozinho)                         |
| `CF_ZONE_NAME`   | Auto         | Detectado pela API se faltar                     |
| `CF_TARGET_IP`   | Auto         | Detectado por `ipify` se faltar                  |
| `CF_PROXIED`     | Não          | Default `true` (laranjinha ligada)               |
| `CF_SUBDOMAINS`  | Não          | Default `@ www app api bot crm mcp gateway webhook status install` |

### Pular o auto-apply

Se você quer só conectar e aplicar depois manualmente:

```bash
export CD_NO_AUTO_APPLY=1
./install.sh --cloudflare
# depois, quando quiser:
./install.sh --cloudflare-apply
```
