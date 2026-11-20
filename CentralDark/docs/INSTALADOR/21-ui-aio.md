# 21 — Interface do instalador (estilo AutoScriptVPN-AIO)

Inspirado em [praiman99/AutoScriptVPN-AIO](https://github.com/praiman99/AutoScriptVPN-AIO).
Pegamos só o **visual** (não o serviço VPN). O nosso backend continua sendo
CentralDark / Multizap.

## Como fica

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ◉ CentralDark Installer (V1.0) ◉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTALADOR                    PARA                     INICIANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operating System:      Ubuntu 22.04 (x86_64)
CPU Model:             AMD EPYC 7642 ...
Total Amount Of RAM:   3933 MB
DOMAIN:                centralldark.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 • Node.js             : Node.js Service is Running
 • PM2                 : PM2 Service is Running
 • Caddy               : Caddy Service is Running
 • Docker              : Docker Service is Stopped
 ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 ◉ CENTRALDARK PANEL MENU ◉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ 1 ] • VERIFICAR AMBIENTE    [ 6 ] • CHECKER END-TO-END
  [ 2 ] • INSTALAR BASE         [ 7 ] • CONECTAR PELO CELULAR (QR)
  [ 3 ] • ESTRUTURA DE PASTAS   [ 8 ] • WILDCARD DNS WIZARD
  [ 4 ] • CLOUDFLARE / DNS      [ 9 ] • DEPENDÊNCIAS (AUTO)
  [ 5 ] • MCP CENTRALDARK       [ 0 ] • EXIT MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 ◉ Modded By CentralDark · IA Ops ◉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT OPTION FROM 1-0 :
```

## Paleta

| Elemento | Cor |
|----------|-----|
| Barra de título | fundo vermelho (`\033[41m`) + branco bold |
| Separador | ciano bold (`\033[1;36m`) `━` |
| Label info | branco bold |
| Valor info | verde bold |
| Bullet `•` | verde bold |
| Texto status (Running) | verde bold |
| Texto status (Stopped) | vermelho bold |
| Prompt final | verde bold |

## Onde mora o código

- `install.sh` — funções `aio_*` (helpers) + `wizard()` (renderiza)
- `aio_collect_sysinfo` — detecta SO, CPU, RAM, uptime, domínio
- `aio_show_status_list` — lista 15 serviços (Node, PM2, Caddy, Docker,
  Git, Curl, Jq, Qrencode, Dig, Openssl, CentralDark FS, Cloudflare Env,
  MCP, Secrets, Webhook)
- `aio_menu_row` — linha de menu em duas colunas
- `aio_bar_red`, `aio_sep`, `aio_tagline`, `aio_kv`, `aio_status`, `aio_prompt`

## Regras

- Largura fixa: `AIO_WIDTH=64` colunas.
- Sem dependência extra — só `printf`/`awk`/`grep`/`free`/`nproc`.
- Fallback automático: se não houver TTY, todas as cores viram string vazia.
- O menu é **idêntico** ao fluxo antigo (mesma `case "$choice"` por trás).

## Manutenção

Mudou opção do menu? Atualiza:
1. `aio_menu_row` correspondente em `wizard()` no `install.sh`
2. O bloco de exemplo deste arquivo
3. O `case "$choice"` logo abaixo do menu
