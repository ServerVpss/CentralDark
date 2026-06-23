## Plano — Caddy com Origin CA (Cloudflare Full Strict)

Recebi o certificado e a chave privada. Não vou repetir o conteúdo no chat (segurança). Eis o que vou executar quando você liberar:

### 1. Subir os arquivos na VPS
Criar a pasta `/etc/ssl/cloudflare/` (permissão `700`, dono `root`) e gravar:
- `centralldark.com.pem` — certificado (permissão `644`)
- `centralldark.com.key` — chave privada (permissão `600`)

### 2. Backup e atualização do Caddyfile
- Backup do `/etc/caddy/Caddyfile` atual em `/etc/caddy/Caddyfile.bak-origin-ca-<data>`
- Adicionar um snippet `(cloudflare_origin)` que aponta pros dois arquivos acima
- Aplicar o snippet em **todos os hosts `*.centralldark.com` e `centralldark.com`** que já estão no Caddyfile, mantendo os `reverse_proxy` exatamente como estão hoje (não mexo em porta, rota, nem ordem)

### 3. Validar e recarregar
- `caddy validate --config /etc/caddy/Caddyfile` (se der erro, restauro o backup na hora)
- `systemctl reload caddy`
- `curl -vI https://install.centralldark.com` pra confirmar que o cert agora é "CloudFlare Origin CA" e não Let's Encrypt

### 4. Te avisar pra trocar na Cloudflare
Só depois de validado: você vai em **SSL/TLS → Visão geral** e troca **Completo** → **Completo (Estrito)**. Aí a cadeia fica 100% criptografada e validada ponta a ponta.

### Observações
- **Caddy está na lista de "precisa confirmação"** das nossas regras — por isso to pedindo seu OK antes de mexer.
- Depois que aplicar, recomendo trocar essa chave privada futuramente (já que passou pelo chat). Mas pra subir agora tá tranquilo, fica só entre a Cloudflare e seu servidor.
- Se algum host no Caddyfile não for `centralldark.com` (ex: domínio antigo do Multizap), eu **não** mexo nele — fica como está.

Posso seguir?
