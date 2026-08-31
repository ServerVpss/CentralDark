# Operação

## Casa

1. Copie `config/centraldark.fixed-point.example.json` para `config/centraldark.fixed-point.json`.
2. Defina `CENTRALDARK_HOME`, `CENTRALDARK_VPS_HEARTBEAT_URL`,
   `CENTRALDARK_HEARTBEAT_SECRET` e `GITHUB_TOKEN` no secret store do Windows.
3. Execute `deploy/windows/install.ps1` como usuário do serviço.
4. Rode `centraldark-fp --config config/centraldark.fixed-point.json doctor`.
5. Rode `centraldark-fp --config config/centraldark.fixed-point.json watch`.

## VPS

Instale com `sudo deploy/linux/install.sh`. O agente escuta em `127.0.0.1:9119` por padrão;
publique-o apenas por túnel/Tailscale/reverse proxy autenticado. Não exponha o heartbeat cru à internet.

## Promoção

Somente um receipt com `reached=true`, cadeia válida e gates do PR verdes autoriza merge. O receipt
local não substitui os checks do GitHub. O PR deve usar `Refs #<issue>`; nunca `Closes` no tracker.

