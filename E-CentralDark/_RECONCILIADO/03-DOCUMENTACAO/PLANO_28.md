# PLANO — install-callback

## Feito
- [x] Servidor Node puro (sem deps) com sessões em memória
- [x] OAuth Cloudflare com Authorization Code + PKCE (S256)
- [x] State HMAC anti-CSRF
- [x] Fallback 1-Click API Token (URL pré-preenchida)
- [x] Validação via `/user/tokens/verify`
- [x] Gravação atômica em `/root/CentralDark/secrets/cloudflare.env` (chmod 600)
- [x] Long-poll `/session/:id?wait=25` pro terminal SSH
- [x] Página HTML com tema verde neon (consistente com Central)
- [x] Log sanitizado (token vira fingerprint)
- [x] Wrapper `start.sh` versionado no repo pra PM2 não quebrar após sync/restart

- [x] DNS `install.centralldark.com → 89.117.78.124` ativo + cert Let's Encrypt válido (validado pelo checker 13)
- [x] Integração SSH ↔ `/session/new` + long-poll via `CentralDark/scripts/installer/install-connect.sh` (`./install.sh --connect`)
- [x] QR code no terminal (qrencode local ou fallback remoto qrcode.show / qrenco.de)

## A fazer
- [ ] Criar OAuth Client na Cloudflare (manual, uma vez) e cadastrar `CF_OAUTH_CLIENT_ID` + `CF_OAUTH_CLIENT_SECRET` em `cloudflare.env`
- [ ] Refresh token automático (já guardado em `cloudflare.env` quando OAuth)
- [ ] Métrica de sessões expiradas vs concluídas (opcional)
- [ ] Página `/connect/:id` com botão "Tô no celular" mostrando deep-link pro app Cloudflare (opcional)

