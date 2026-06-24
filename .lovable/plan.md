## Resposta rápida

**Sim, está aplicado — mas só no `telepainel.centralldark.com`.** Ontem, quando configurei o subdomínio, usei o mesmo snippet `cloudflare_origin` que você já tinha pronto (o cert + chave em `/etc/ssl/cloudflare/`). Então o TelePanel já está servido com o cert Cloudflare Origin CA válido até 2041, igual o `install.centralldark.com`.

**O que falta protegido pelo mesmo cert:** o `deploy.centralldark.com` (o endpoint que recebe o webhook do GitHub). Esse eu não tinha colocado o snippet, então ainda usa cert "self-signed" e o GitHub está enviando com `insecure_ssl: 1` (funciona, mas é gambiarra).

## Plano

### 1) Adicionar `import cloudflare_origin` no `deploy.centralldark.com`
Editar `/etc/caddy/deploy-centraldark.Caddyfile` e incluir `import cloudflare_origin` dentro do bloco, igualzinho ao install. Recarregar o Caddy.

### 2) Desativar o `insecure_ssl` do webhook GitHub
Atualizar via API o webhook id `645867939` para `insecure_ssl: "0"` — assim o GitHub passa a validar o cert de verdade.

### 3) (Manual, 1 clique seu) Cloudflare → nuvem laranja
No painel Cloudflare, em DNS → `centralldark.com`, ligar o proxy (nuvem laranja) em:
- `telepainel`
- `deploy`

Sem isso, o cert Origin CA não vale (precisa do CF na frente). Os outros subdomínios que já estão protegidos (`install`, etc.) já estão com laranja ligada.

### 4) Confirmar SSL/TLS = Completo (Estrito) na Cloudflare
Você já tinha avisado ontem que dava pra virar pra "Completo (Estrito)". Se ainda não virou, virar agora — fica ponta a ponta criptografado com validação.

## O que **não** muda
- Cert do `telepainel.centralldark.com` — já está usando o Origin CA correto.
- Pipeline de auto-deploy GitHub → VPS — continua igual.
- Banco, bot, PM2 — intocados.

## Detalhes técnicos
- O snippet `cloudflare_origin` em `/etc/caddy/centralldark-origin.Caddyfile` aponta pra `/etc/ssl/cloudflare/centralldark.com.pem` e `.key` (SAN `*.centralldark.com`, validade 2041).
- Caddy faz hot-reload, zero downtime.
- A mudança no webhook é uma chamada PATCH na API do GitHub usando o token que já temos.

Confirma que pode aplicar?
