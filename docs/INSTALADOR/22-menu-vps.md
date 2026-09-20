# 22 — Menu colorido da VPS (estilo cabrata/autoscript)

Painel de terminal pra operar a VPS rapidinho. Mesmo visual do `autoscript`
do cabrata (banners coloridos, painel de status `Running ( No Error )`,
menu numerado), mas adaptado pra **CentralDark / MultiZap / clone-deck**.

> **Sigilo:** IP público é **omitido de propósito**. O painel mostra só o
> domínio (`centralldark.com` ou o que estiver em `/root/CentralDark/secrets/domain.txt`).

## Como instalar

Na VPS, dentro do repo:

```bash
./install.sh --menu
```

Isso roda `scripts/installer/install-menu.sh`, que cria três atalhos em
`/usr/local/bin`:

- `cdmenu`   — menu colorido estilo cabrata (VPS INFO + SERVIDOR + BANDA + MENU)
- `cdstatus` — painel só de status dos serviços (PM2 + systemd)

> ⚠️ **Mudança 2026-06-05:** os atalhos curtos `menu`, `MENU` e `cd-menu`
> **NÃO** apontam mais pro `cdmenu` antigo. Agora abrem o **wizard oficial
> do `install.sh`** (CentralDark Installer V1.0). Quem quiser o painel cabrata
> continua usando `cdmenu` diretamente.
>
> Esses três atalhos são criados/atualizados automaticamente pelo
> `install.sh` na 1ª execução e re-linkados em toda execução se faltarem.
> O instalador também **neutraliza aliases legados** de `menu` em
> `~/.bashrc` / `/etc/bash.bashrc` (linhas tipo `alias menu=...` ou
> `menu() { ... }` apontando pro `/root/Multizap/...` viram comentário,
> backup `.bak-AAAAMMDD-HHMMSS`).

Idempotente: pode rodar de novo a qualquer hora.



## Trocar tema (skins)

O menu suporta skins. Hoje vem com dois temas em `scripts/menu/themes/`:

- `default` — paleta cabrata original (amarelo / azul / verde)
- `netflix` — vermelho Netflix `#E50914` + banner ASCII "NETFLIX" (inspirado em `shopeevpn/menu-themes`, sem copiar código de cliente)

Três formas de trocar:

```bash
cdmenu --netflix                 # roda uma vez no skin Netflix
CDMENU_THEME=netflix cdmenu      # idem, via env
# Ou, pelo próprio menu: opção 12 → "Trocar tema" → escolhe e salva em ~/.cdmenu-theme
```

Pra deixar fixo, adicione no `~/.bashrc`:

```bash
[ -f ~/.cdmenu-theme ] && source ~/.cdmenu-theme
```

Adicionar tema novo = criar `scripts/menu/themes/<nome>.sh` definindo as variáveis
`RULE / HEAD / LABEL / ITEM / OK / WARN / ERR` + função `print_banner`.

## Como usar

```bash
cdmenu      # abre o painel completo
cdstatus    # só o status dos serviços
menu        # mesma coisa que cdmenu
```

## O que o painel mostra

### `cdmenu`
- VPS INFO: OS, Uptime, Domínio, Data/Hora (America/Sao_Paulo)
- SERVIDOR: RAM usada/total, CPU, Disco
- BANDA: download/upload/total do dia (via `vnstat`, se instalado)
- MENU numerado:
  1. Status dos serviços (PM2)
  2. Reiniciar MCP CentralDark
  3. Reiniciar Supabase Sync
  4. Reiniciar Bot Telegram
  5. Ver logs (escolhe serviço)
  6. `git pull` no repo
  7. Rodar checker END-TO-END
  8. Atualizar instalador
  9. Ver `docs/PENDENCIAS.md`
  10. Limpar cache de RAM
  11. Reiniciar VPS (pede confirmação `SIM`)
  12–19. Tema, Caddy, portas, IP, banda, backup, docs
  20. **Abrir instalador ao logar no SSH (LIGA/DESLIGA)** — toggle tipo tomada.
      Quando LIGADO, toda sessão SSH nova cai direto no wizard colorido do
      `cdinstall` (instalador local). Marca persistente em `~/.cdmenu-autostart`
      + bloco no `~/.bashrc` (marcador `# >>> centraldark cdmenu autostart >>>`).
      Desligar = remove o arquivo + apaga o bloco.
  x. Sair

> **Por que abre `cdinstall` e não `cdmenu`?** O `cdinstall` é o wizard
> colorido do instalador (banner Netflix + menu completo de ações). O
> `cdmenu` é a telinha de status. O autostart antigo abria `cdmenu` e
> em sessões SSH novas as cores sumiam — corrigido forçando
> `TERM=xterm-256color` + `CD_FORCE_COLOR=1` e migrando o bloco do
> `.bashrc` automaticamente na próxima execução do `install.sh`.

### `cdstatus`
- Hostname, OS, RAM, Domínio
- Cliente / Versão / Expiração
- Status PM2 de cada serviço esperado (lista da pendência #9):
  `MCP-CentralDark`, `CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`,
  `MultiZap-Gateway`, `MultiZap-GitHub-Webhook`, `CloneDeck-CRM`,
  `wabot-bridge`, `whatsapp-server`, `webhook-bot`, `github-webhook`.
- Serviços systemd: `caddy`, `docker`, `cron`.

Quando um serviço tem `restart_time > 20` mostra `Running ( restarts=N )`
em amarelo — o mesmo padrão do checker.

## Lista branca de restart

O item de menu só reinicia os 3 serviços liberados (regra inviolável):

- `MCP-CentralDark`
- `CloneDeck-Supabase-Sync`
- `MultiZap-TelegramBot`

Tentar reiniciar qualquer outro pelo menu é bloqueado.
Pra Docker, WuzAPI, WhatsApp, Caddy: **continua exigindo confirmação humana**.

## Arquivos

- `scripts/menu/cdmenu.sh` — menu principal
- `scripts/menu/cdstatus.sh` — painel de status
- `scripts/installer/install-menu.sh` — instalador dos atalhos
- `install.sh` — gancho `--menu`

## Origem do design

Inspirado em `cabrata/autoscript` (público, sem criptografia). Pegamos:

- Banner com linhas amarelas `---`
- Cabeçalhos em azul claro
- Labels verdes, valores brancos
- Menu numerado em ciano
- Bloco final `Cliente / Expira em` + rodapé

E adaptamos pro nosso stack (PM2 ao invés de SSH/Vmess/Vless), em PT-BR, sem expor IP.
