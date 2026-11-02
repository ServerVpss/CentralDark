# 19 — Dependências automáticas do instalador

O `install.sh` agora instala SOZINHO tudo que precisa pra rodar liso em VPS nova.
Antes de qualquer comando pesado (`--install`, `--connect`, wizard interativo) ele
chama `ensure_deps`, que:

1. Checa os comandos: `curl jq git openssl qrencode dig ss awk sed grep tar gzip date`.
2. Identifica o gerenciador de pacotes da máquina (apt, dnf, yum, apk, brew).
3. Instala em batch só o que falta — com `noninteractive`, sem perguntar nada.
4. Recheca e segue. Se algo opcional ainda faltar, só avisa.

## GitHub CLI na Forja/openKylin (2026-11-01)

O **owner `install.sh`** possui `--gh-auth`, acionado pelo menu canônico
(opção 12), pelo instalador determinístico (opção 13) e também como preflight
da instalação interativa. Reutiliza o `gh` instalado ou instala somente se
ausente pelo gerenciador de pacotes encontrado. Não executa `autoremove`.

Em sessão SSH sem ambiente gráfico, o comando usa
`GH_BROWSER=true gh auth login --hostname github.com --git-protocol https --web`.
O código único aparece **diretamente na TTY**, sem passar pelo log do
`install.sh`; o humano visita `https://github.com/login/device` no próprio
navegador e conclui a autorização. Não requer DISPLAY, X11 ou porta 1455.
Após a autorização, o mesmo owner verifica `gh auth status`, configura
`gh auth setup-git` e consulta `gh repo view ServerVpss/CentralDark`,
sem imprimir credenciais. Sem TTY, sinaliza PENDING e não tenta login
automático. `--gh-auth` evita self-update e alterações fora do escopo do
onboarding. A `main` só pode ser instalada após confirmação humana
e leitura do repositório; login não é prova de instalação ou deploy.

## Uso direto

```bash
./install.sh --deps        # só instala dependências (idempotente)
./install.sh --connect     # já chama ensure_deps antes do QR
./install.sh --install     # já chama ensure_deps antes da base
```

## Pacotes cobertos (mapa comando → pacote)

| Comando   | apt (Debian/Ubuntu) | dnf/yum (RHEL/Alma) | apk (Alpine)     |
|-----------|---------------------|---------------------|------------------|
| curl      | curl                | curl                | curl             |
| jq        | jq                  | jq                  | jq               |
| git       | git                 | git                 | git              |
| openssl   | openssl             | openssl             | openssl          |
| qrencode  | qrencode            | qrencode            | libqrencode-tools|
| dig       | dnsutils            | bind-utils          | bind-tools       |
| ss        | iproute2            | iproute             | iproute2         |
| awk       | gawk                | gawk                | gawk             |
| nc (opc.) | netcat-openbsd      | nmap-ncat           | netcat-openbsd   |

## Por que isso importa pro `--connect`

O QR no terminal usa `qrencode` quando disponível (saída UTF8 nítida). Sem ele,
o `install-connect.sh` cai pros fallbacks remotos (`qrcode.show`, `qrenco.de`),
que dependem de internet liberada. Com `ensure_deps` rodando antes, o caminho
local sempre funciona.

## Permissões

- Roda como root direto, ou com `sudo` se disponível.
- Sem root e sem sudo: o script avisa e segue (pode pedir pro usuário rodar com `sudo`).

## Idempotente

Pode rodar quantas vezes quiser. Se já estiver tudo instalado, ele só imprime
`Dependências básicas: OK` e segue.
