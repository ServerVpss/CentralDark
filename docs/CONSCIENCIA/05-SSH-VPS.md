---
title: "05 SSH VPS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 05 — SSH na VPS

## Regra inviolável

**NUNCA** usar `$VPS_SSH_KEY_LOVABLE` direto com `printf` / `echo` + `ssh`.

A chave chega em linha única e o OpenSSH rejeita com `error in libcrypto` / `Permission denied`. **Falha 100% das vezes.**

## Sempre usar o script

```bash
export PATH="/nix/store/a8q1aypk785ari2q2a3xr0c2agpwkxb2-openssh-10.2p1/bin:$PATH"
source scripts/lovable-agent/setup-vps-ssh.sh
ssh-vps "comando aqui"
```

O script:
- Lê `VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`
- Reconstrói a chave em `/tmp/vps_key` com quebras de linha certas
- Expõe duas funções: `ssh-vps` e `scp-vps`

## Se o caminho do openssh mudar

```bash
ls /nix/store/*-openssh-*/bin/ssh | head -1
```

E atualiza o `export PATH`.

## Regra de ouro

**Nunca pedir SSH ou comando manual ao usuário.** O agente faz tudo daqui.

## Onde rodar isso

- No ambiente do Lovable (sandbox), o script já existe em `scripts/lovable-agent/setup-vps-ssh.sh`
- Pro Custom GPT, o MCP CentralDark já tem acesso autenticado à VPS — não precisa rodar esse script, ele usa SSH interno do MCP

---

## Aliases SSH — clone-deck (subprojeto)

O subprojeto `apps/clone-deck` usa aliases SSH próprios na VPS.

### Read-only (deploy)

```sshconfig
Host github-clone-deck
  HostName github.com
  User git
  IdentityFile /root/.ssh/clone_deck_deploy_key
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

Uso:

```bash
git remote set-url origin git@github-clone-deck:segredounlock/clone-deck.git
```

### Write (branch/PR)

```sshconfig
Host github-clone-deck-write
  HostName github.com
  User git
  IdentityFile /root/.ssh/arena_clone_deck_write
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

### Arquivos locais na VPS

```txt
/root/clone-deck-webhook/.env          # WEBHOOK_SECRET — nunca expor
/root/clone-deck-webhook/              # listener PM2 CloneDeck-GitHub-Webhook (porta 9003)
/usr/local/bin/clone-deck-gh-pull      # script de pull
/var/log/clone-deck-webhook.log        # log do webhook/pull
/var/log/clone-deck-cleanup.log        # log da quarentena
/root/Multizap/quarantine/             # arquivos movidos (não apaga definitivamente)
```

### Limpeza segura de untracked

A limpeza automática move arquivos não rastreados para:

```txt
/root/Multizap/quarantine/clone-deck-untracked-YYYYMMDDHHMMSS
```

Validar após limpeza:

```bash
cd /root/CentralDark/apps/clone-deck
git status --short --branch
tail -n 80 /var/log/clone-deck-cleanup.log
```

---

## Conexões Rápidas

## Receita observada — AnyDesk/openKylin 3.0 em 2026-10-01

Setor: `REMOTE_INTERACTIVE_GUI`; controle de reparo: SSH; transporte privado:
Tailscale; fallback de resgate: Contabo VNC. Reutiliza os owners existentes.
Este é um receipt datado, não uma promessa de compatibilidade geral ou estado
atual. AnyDesk 8.1.0, UKUI 4.24, Xorg :0, sessão gráfica root explicitamente
solicitada pelo CHEFE. Não recomendar root como desktop padrão para outros alvos.
Senhas, tokens, cookies e conteúdo do Vault não pertencem a esta receita.

### Sequência causal e contraprovas

1. Rede/ID alcançáveis não provaram desktop: `desk_rt_ipc_error` ocorreu depois
   da conexão. `7070/TCP` era AnyDesk direto; `41641/UDP` era Tailscale. Não usar
   a porta do transporte privado como endereço AnyDesk.
2. No greeter, `/var/lib/lightdm/.anydesk` estava root:root, modo 700. Após backup
   privado, restaurar ownership para lightdm fez o tray persistir e permitiu ver
   a tela de login. Aplicar somente se HOME/UID/permissões medidos confirmarem
   esse mesmo erro; não executar chown global.
3. A senha do acesso AnyDesk e a senha de login Linux são autenticações distintas.
   Login root foi confirmado pelo LightDM; nenhum usuário novo foi criado.
4. Depois do login, o backend abortava em `pa_context_send_simple_command`, com
   `Connection refused`. `pactl info` falhava; pipewire e pipewire-pulse não
   iniciavam porque suas units continham `ConditionUser=!root`. Isso localizou
   a falha de áudio; trocar Xorg ou abrir portas não corrigia essa condição.
5. Para a sessão root autorizada, drop-ins somente em
   `/root/.config/systemd/user/{pipewire.service,pipewire.socket,pipewire-pulse.service,pipewire-pulse.socket}.d/90-centraldark-root-session.conf`
   com `[Unit]` e `ConditionUser=` limparam a condição herdada. Após daemon-reload
   e start das sockets/wireplumber, `pactl info` respondeu
   `PulseAudio (on PipeWire 1.6.2)`; trace AnyDesk confirmou conexão ao áudio.
   Não modificar units do fornecedor nem aplicar esse override a todos os usuários.
6. Teste manual `anydesk --backend` passou pelo áudio mas encontrou conflito de
   slot IPC com backend existente. Esse teste não é prova de sessão completa;
   medir a conexão real. Na conexão real posterior o backend permaneceu vivo,
   registrou `Starting capture` e monitor 1280×800.
7. Captura direta do X11 também estava preta: falha do desktop remoto, não
   somente do transporte AnyDesk. KWin não estava ativo para root. Iniciar o
   `kwin_x11 --replace` existente com DISPLAY/XAUTHORITY/DBus/runtime da sessão
   correta criou `_NET_SUPPORTING_WM_CHECK`. Reiniciar somente ukui-panel e
   peony-qt-desktop nessa mesma sessão trouxe o papel de parede; a captura local
   e screenshot do CHEFE confirmaram imagem no AnyDesk.
8. Resultado parcial: ícones ausentes e painel caiu com SIGSEGV;
   backtrace em `Calendar::week` / `libukui-panel-calendar.so`.
   `QT_QPA_PLATFORM=xcb` em `.xsessionrc` não eliminou todos os erros Wayland de
   componentes UKUI. Não declarar desktop 100%, boot persistente ou root suportado.

### Operação reutilizável — medir antes de aplicar

```bash
loginctl list-sessions
loginctl show-session <sessao-medida> -p Type -p Active -p Name -p Desktop
systemctl is-active lightdm anydesk
journalctl -u anydesk -u lightdm --since '10 minutes ago' --no-pager
# Dentro do contexto correto do usuário da sessão, sem imprimir seu ambiente inteiro:
pactl info
systemctl --user status pipewire.socket pipewire-pulse.socket --no-pager
xprop -root _NET_SUPPORTING_WM_CHECK
```

Bindings DISPLAY, XAUTHORITY, XDG_RUNTIME_DIR e DBUS_SESSION_BUS_ADDRESS devem
vir da sessão medida, nunca do exemplo de outra máquina. Só reiniciar processos
que pertencem ao usuário/display comprovados e ao escopo autorizado.

Para reverter os overrides de áudio, remover somente os quatro drop-ins criados,
recarregar o user manager e reiniciar os serviços afetados. Restaurar ownership
do greeter pelo backup privado se necessário. A inicialização manual do KWin e
do desktop ainda não foi convertida em correção persistente: novo login/reboot
exige remedição. `.xsessionrc` tinha checkpoint privado anterior quando aplicável.

```text
SSH_COMMAND_EXECUTION=OBSERVED_PASS
ROOT_X11_LOGIN=OBSERVED_PASS
ROOT_PULSE_CONNECTION=OBSERVED_PASS
ANYDESK_CAPTURE_STARTED=OBSERVED_PASS
REMOTE_WALLPAPER_VISIBLE=USER_SCREENSHOT_PASS
PANEL_COMPLETE=FAIL_CALENDAR_SEGFAULT
ICONS_COMPLETE=UNKNOWN
NEXT_LOGIN_OR_REBOOT_REPLAY=UNKNOWN
COMPLETE_DESKTOP_RECIPE=PARTIAL
NEXT_CURSOR=REPAIR_PANEL_CALENDAR_AND_ICON_LOADING_THEN_VERIFY_NEW_LOGIN
```

Não mascarar essa incompletude com instalação de outro desktop. A marca
`This is a non-commercial session` é overlay AnyDesk, distinto da falha UKUI.


- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
