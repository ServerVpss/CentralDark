# 20 — Bootstrap pela URL (`curl | bash`)

O `install.centralldark.com` agora é o ponto único de entrada do instalador.

## Como o usuário instala

```bash
curl -fsSL https://install.centralldark.com | bash
# ou direto no modo "conectar pelo celular"
curl -fsSL https://install.centralldark.com | bash -s -- --connect
```

Funciona em qualquer VPS Debian/Ubuntu/RHEL/Alpine. Sem precisar de git, sem
precisar clonar nada — só `curl` (o bootstrap instala se faltar).

## O que o servidor responde

| Rota | Quem chama | Devolve |
|------|-----------|---------|
| `GET /` (UA `curl/wget/httpie/...`) | `curl ... \| bash` | Script de bootstrap |
| `GET /` (navegador) | Pessoa abrindo no browser | Landing com instruções |
| `GET /install.sh` ou `/install` | Qualquer | Script de bootstrap |
| `GET /installer.tar.gz` | O próprio bootstrap | Tarball com `install.sh` + `CentralDark/scripts/installer/` + `docs/INSTALADOR/` + `central-horario/` |
| `POST /session/new` etc. | `install-connect.sh` | Fluxo OAuth/QR (já existia) |

## O que o bootstrap faz

1. Cria `/tmp/centraldark-XXX`.
2. Garante `curl` instalado (apt/dnf/apk).
3. Baixa `https://install.centralldark.com/installer.tar.gz`.
4. Extrai e roda `./install.sh "$@"` — argumentos passados via `bash -s --` chegam intactos.

## Bundle (`/installer.tar.gz`)

Construído na hora pelo `tar`, lendo de `REPO_DIR`
(env, default `/root/Multizap/apps/clone-deck`). Inclui só:

- `install.sh`
- `CentralDark/scripts/installer/`
- `docs/INSTALADOR/`
- `central-horario/`

Configurável via env `BUNDLE_PATHS` (lista separada por vírgula).

## Repo pode ficar privado

O servidor lê o tarball do **checkout local** na VPS — não depende de GitHub
público. Pra rodar em VPS nova, basta o `install.centralldark.com` estar no
ar. Quando o repo virar privado, o webhook/deploy continuam funcionando via
PAT (já configurado), então o `REPO_DIR` segue atualizado.

## Variáveis de ambiente (no `.env` do `install-callback`)

| Var | Default | Função |
|-----|---------|--------|
| `REPO_DIR` | `/root/Multizap/apps/clone-deck` | De onde o tarball é montado |
| `BUNDLE_PATHS` | `install.sh,CentralDark/scripts/installer,docs/INSTALADOR,central-horario` | O que entra no tarball |
| `INSTALL_SH` | `$REPO_DIR/install.sh` | (reservado) caminho do install.sh |
| `PUBLIC_URL` | `https://install.centralldark.com` | URL pública usada no bootstrap |

## Testando local

```bash
curl -fsS -A "curl/8" https://install.centralldark.com | head -5
curl -fsSI https://install.centralldark.com/installer.tar.gz
```
