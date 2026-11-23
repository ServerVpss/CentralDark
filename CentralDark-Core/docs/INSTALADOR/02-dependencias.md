# 02 — Dependências

> Lista do que precisa existir na VPS antes do sistema rodar. Adicionar uma linha aqui sempre que uma nova dependência for introduzida.

## Sistema operacional suportado
- Debian 12 / Ubuntu 22.04+ (testado em VPS Contabo)

## Pacotes do sistema (apt)
| Pacote | Versão mínima | Função |
|---|---|---|
| `git` | 2.30+ | Clonagem e pull do repo |
| `curl` | qualquer | Downloads e healthchecks |
| `jq` | 1.6+ | Parse de JSON em scripts |
| `caddy` | 2.7+ | Reverse proxy + TLS automático |
| `docker.io` | 24+ | WuzAPI container |
| `docker-compose-plugin` | 2+ | Orquestração WuzAPI |
| `webhook` | 2.8+ | Listener GitHub→VPS |
| `python3` | 3.10+ | Scripts auxiliares |
| `python3-venv` | compatível com Python | venv do Fixed Point heartbeat |
| `rclone` | 1.60+ | transporte Google Drive da CentralDark |
| `util-linux` (`flock`) | qualquer | lock atômico do auto-ingest |
| `coreutils` (`sha256sum`) | qualquer | hash/dedupe/provenance |
| `openssl` | 3+ | geração local do segredo do heartbeat, sem expor valor |

## Runtimes
| Runtime | Versão | Onde | Como instalar |
|---|---|---|---|
| Node.js | 20 LTS | Sistema | nvm ou nodesource |
| npm | 10+ | Junto com Node | — |
| Bun | latest | Sistema | `curl -fsSL https://bun.sh/install \| bash` |
| PM2 | latest | global npm | `npm i -g pm2` |
| GitHub CLI (`gh`) | 2.40+ | Sistema | apt repo oficial |

## Serviços externos
| Serviço | Função | Tipo |
|---|---|---|
| GitHub (ServerVpss/CentralDark) | Repositório fonte canônico | sessão/chave autorizada na VPS |
| Google Drive (`gdrive:CentralDark`) | delta/memória/provenance; nunca autoridade de runtime | OAuth/config do rclone somente na VPS |
| Supabase (Lovable Cloud) | BD + Auth + Storage | URL + anon key + service role |
| WuzAPI | Engine WhatsApp | Docker local |
| Telegram | Bot operacional | Token bot |

> Quem instala o quê e em que ordem está documentado em `11-fluxo-do-installer.md`. A Forja Total/Drive está em `31-forja-total-drive-vps.md`.

<!-- CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
## Dependencias da fase opcional GitHub Actions runner Linux

`--runner-linux-install` requer Linux x86_64, `bash`, `curl`, `tar`, `sha256sum` (coreutils), `flock` (util-linux), `mktemp` e `mv`; acesso HTTPS ao release oficial. Versao fixada: `actions/runner v2.338.2`; SHA-256 `baebf204307bac6193480852732f0aba2ae97b6c5597c244f4d5558390147c40`. Docker, WSL e modelo de IA nao sao prerequisitos do runner Linux nativo.

`--runner-linux-activate` requer `sudo -n`, systemd, `CENTRALDARK_RUNNER_NAME` exclusivo e `CENTRALDARK_RUNNER_REGISTRATION_TOKEN` efemero obtido por fonte autorizada. Nao salvar token em Git, recibo, arquivo de receita ou log. Status `online` so pode ser confirmado pela API do GitHub.
<!-- /CENTRALDARK_RUNNER_LINUX_PHASE_20261112 -->
