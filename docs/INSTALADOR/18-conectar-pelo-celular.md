# Conectar Cloudflare pelo celular (QR no terminal)

> **Caminho oficial pra leigo** — sem digitar token, sem copiar URL pro navegador do PC.

## Como funciona

1. Você roda no SSH:
   ```bash
   ./install.sh --connect
   ```
   (ou abre o wizard e escolhe **Cloudflare/DNS → 1. Conectar pelo celular**)

2. O terminal abre uma sessão em `https://install.centralldark.com/session/new` e desenha um **QR code** com o link curto pra autorização.

3. Você abre a câmera do celular, escaneia. A página `install.centralldark.com/connect/<id>` oferece dois caminhos seguros:
   - 🔐 **Entrar com Cloudflare** (OAuth — recomendado, exige `CF_OAUTH_CLIENT_ID/SECRET` configurados no install-callback)
   - 🔑 **Criar token 1-Click** (template pré-preenchido com `Zone:Read + DNS:Edit`)

4. **Melhoria de UX (jun/2026):** ao abrir no celular, a tela já fica visível sem sair pra fora da viewport e o caminho OAuth tenta abrir sozinho após poucos segundos. O áudio virou opcional e **não bloqueia mais** a continuação do fluxo.

5. Você autoriza no celular. O backend grava o cofre em `/root/CentralDark/secrets/cloudflare.env` (chmod 600).

6. O terminal SSH sai do long-poll, mostra o **fingerprint** do token e te lembra de rodar:
   ```bash
   ./install.sh --cloudflare-apply
   ```

## Requisitos

- `curl` (sempre obrigatório).
- `qrencode` (opcional, mas dá o QR mais bonito no SSH):
  ```bash
  apt install -y qrencode
  ```
  Sem `qrencode`, o script tenta um QR remoto via `qrcode.show` / `qrenco.de` e sempre imprime o **link curto** pra você abrir manual se quiser.

## Segurança

- Sessão **expira em 10 minutos** (TTL no install-callback).
- Token **nunca aparece em log** — só o fingerprint (`abc1…xy`).
- State OAuth assinado com HMAC anti-CSRF.
- Cofre gravado atomicamente com `chmod 600` em `/root/CentralDark/secrets/`.

## Variáveis úteis

| Variável | Default | O que faz |
|---|---|---|
| `INSTALL_PUBLIC_URL` | `https://install.centralldark.com` | Endpoint público do install-callback |
| `INSTALL_CONNECT_TIMEOUT` | `600` | Timeout total do long-poll (segundos) |

## Onde mora o código

- Script SSH: `CentralDark/scripts/installer/install-connect.sh`
- Backend: `CentralDark/apps/install-callback/server.js` (porta 9200, atrás do Caddy)
- Snippet Caddy: `/root/CentralDark/infra/caddy/install.Caddyfile`
- Checker: `scripts/checker/13-install-https.sh`
