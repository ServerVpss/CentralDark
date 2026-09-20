# 23 — Auto-Update do Instalador

O `install.sh` se atualiza sozinho a cada execução, puxando do **domínio oficial** `install.centralldark.com` (com fallback no raw GitHub).

## Porta de entrada oficial

**TUDO sai de https://install.centralldark.com** — não é o GitHub. O domínio serve:

| Rota | Pra que serve |
|---|---|
| `/` (browser) | Landing oficial com os 3 comandos + índice da documentação |
| `/` (curl/wget) | Bootstrap shell (`curl … \| bash`) |
| `/docs` | Índice navegável de toda a documentação do instalador |
| `/docs/<slug>` | Página individual (renderiza `docs/INSTALADOR/<slug>.md` do repo) |
| `/install.sh` | Mesmo bootstrap do `/` (alias amigável) |
| `/raw/install.sh` | `install.sh` REAL do repo — usado pelo auto-update |
| `/installer.tar.gz` | Tarball com tudo que o instalador precisa |
| `/connect/<id>` | Wizard Cloudflare iniciado pelo SSH |
| `/health` | Status + se OAuth Cloudflare está configurado |

## Como o auto-update funciona

Toda vez que `./install.sh` roda, antes de qualquer coisa ele:

1. Baixa `https://install.centralldark.com/raw/install.sh` (ou fallback `raw.githubusercontent.com/segredounlock/clone-deck/main/install.sh`)
2. Compara hash com o arquivo local
3. Se diferente, valida sintaxe (`bash -n`), salva backup `install.sh.bak.<timestamp>`, sobrescreve e **reinicia** com `exec`
4. Se igual, segue normal

Falha silenciosa quando sem internet — nunca trava.

## Atualizar VPS já instalada

```bash
./install.sh --update
```

Faz `git fetch + reset --hard origin/main` no repo local em `/root/CentralDark/repo/clone-deck` **e** força re-download do `install.sh`.

Também tem botão no wizard: opção **10 — ATUALIZAR INSTALADOR**.

## Variáveis

- `CD_INSTALL_URL` — sobrescreve a URL do auto-update (default: `https://install.centralldark.com/raw/install.sh`)
- `CD_NO_UPDATE=1` ou `--no-update` — pula o auto-update desta execução
- `CD_SELF_UPDATED=1` — marcador interno anti-loop de re-exec

## 3 comandos oficiais

```bash
# 1. Instalar do zero
curl -fsSL https://install.centralldark.com | bash

# 2. Conectar Cloudflare pelo celular (QR)
curl -fsSL https://install.centralldark.com | bash -s -- --connect

# 3. Atualizar instalação existente
./install.sh --update
```
