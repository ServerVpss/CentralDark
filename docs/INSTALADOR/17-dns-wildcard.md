# 17 — DNS wildcard (caminho oficial)

> **Para o leigo:** você só cadastra **3 linhas** no painel do domínio.
> O resto (subdomínios, Caddy, HTTPS) o instalador faz sozinho.

## A regra única

No painel DNS do domínio (Cloudflare, Registro.br, GoDaddy, Hostgator,
Hostinger, qualquer um), cadastre **apenas estes 3 registros**:

```
www   A   IP_DA_VPS
@     A   IP_DA_VPS
*     A   IP_DA_VPS
```

Exemplo com a VPS atual:

```
www   A   89.117.78.124
@     A   89.117.78.124
*     A   89.117.78.124
```

Pronto. Qualquer subdomínio — `install`, `mcp`, `gateway`, `webhook`,
`api`, `bot`, `status` ou qualquer outro que você inventar no futuro —
já cai automaticamente na VPS por causa do `*`.

## Como o instalador valida

Rode:

```bash
./install.sh --wildcard
```

O wizard faz, em ordem:

1. **Pré-check da VPS** — SO, disco, memória, portas 80/443, dependências.
2. **Detecta o IP público** da VPS automaticamente.
3. **Pergunta o domínio** (padrão `centralldark.com`).
4. **Mostra a caixinha** com os 3 registros pra você cadastrar.
5. **Espera você confirmar** que cadastrou.
6. **Valida propagação** em vários resolvers (1.1.1.1, 8.8.8.8, 9.9.9.9):
   - `@` aponta pro IP?
   - `www` aponta pro IP?
   - **`*` aponta pro IP?** (testa um nome aleatório `probe-xxxx.<zona>`
     pra ter certeza que o wildcard tá vivo — não basta cadastrar `@` e
     `www`).
7. **Gera os snippets do Caddy** pra cada subdomínio oficial.
8. **Valida o Caddyfile** (`caddy validate`). Reload só com `CONFIRMO`.
9. **Testa cada subdomínio online** (HTTPS). Se algum falhar, avisa.
10. **Salva relatório** em `/root/CentralDark/revisoes/<data>/instalador-wildcard/`.

## Mapa de subdomínios oficiais → portas internas

| Subdomínio                    | Vai pra            | Serviço            |
|-------------------------------|--------------------|--------------------|
| `install.<zona>`              | `127.0.0.1:9200`   | install-callback   |
| `mcp.<zona>`                  | `127.0.0.1:9100`   | MCP CentralDark    |
| `gateway.<zona>`              | `127.0.0.1:3100`   | Gateway WhatsApp   |
| `api.<zona>`                  | `127.0.0.1:3100`   | API (mesma porta)  |
| `webhook.<zona>`              | `127.0.0.1:9003`   | Webhook GitHub     |
| `bot.<zona>`                  | `127.0.0.1:8080`   | Painel do bot      |
| `status.<zona>`               | `127.0.0.1:9200`   | Página de status   |

Pra editar essa lista, mexa em `CentralDark/scripts/installer/lib/caddy-auto.sh`
(função `ca_port_for` + array `CA_OFFICIAL_SUBS`).

## E o CRM?

`crm.<zona>` **não** entra na lista oficial. O CRM é tratado à parte e o
instalador nunca mexe nele sem `CONFIRMO`.

## Cloudflare API ainda funciona?

Funciona — virou **atalho opcional**. Se você não quiser cadastrar manualmente
no painel, rode:

```bash
./install.sh --cloudflare
```

Ele cadastra os 3 registros (`@`, `www`, `*`) via API automaticamente.
O resto do fluxo é igual.

## O que NÃO precisa instalar na VPS

- **Nameserver** (BIND, NSD, etc) — não, o DNS fica no painel do registrador.
- **Terraform / Kamal / Kubernetes** — nenhum desses.
- **Docker** pra DNS — não, é tudo `curl + jq`.

## Comandos úteis

```bash
./install.sh --wildcard         # wizard completo
./install.sh --wildcard-check   # só valida DNS (não toca Caddy)
./install.sh --online-check     # só testa subdomínios online
./install.sh --check-final      # checker end-to-end (inclui bloco wildcard-dns)
```
