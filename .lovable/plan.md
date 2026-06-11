## Plano — Migração pra CentralDark

### O que vai acontecer (em linguagem simples)

Hoje o site inteiro roda em `/root/Multizap/apps/clone-deck` e responde só pela URL preview do Lovable. A gente vai:

1. **Criar duas pastas novas na VPS**, cada uma com o site buildado:
   - `/root/CentralDark/apps/portal/` → responde por `centralldark.com` e `www.centralldark.com` (mostra a landing + login + /portal de módulos).
   - `/root/CentralDark/apps/Telepanel/` → responde por `telepainel.centralldark.com` (mostra dashboard, bots, consultas, etc.).
2. **Caddy** passa a rotear cada domínio pra pasta certa, com SSL automático.
3. O **mesmo código** (este repo) alimenta as duas pastas — é o mesmo build copiado em dois lugares. Cada domínio enxerga o SPA inteiro, mas a porta de entrada (`/`) é diferente: o portal cai na landing, o telepainel cai direto no `/dashboard`.
4. O **cron `gh-pull` + webhook** já existente passa a atualizar as duas pastas automaticamente a cada push na main.
5. O diretório antigo `/root/Multizap/apps/clone-deck` fica intocado como backup até a gente validar tudo — depois vira legado.

### Passos detalhados

**1. Repo (commit único, este projeto Lovable)**
- Pequeno ajuste no `src/App.tsx`: detectar o hostname e, se for `telepainel.centralldark.com` e a rota for `/`, redirecionar pra `/dashboard` (ou `/auth` se não logado). Se for `centralldark.com`, mantém a landing atual.
- `docs/INSTALADOR/` ganha novo arquivo `13-centraldark-portal.md` com receita do deploy duplo + bloco Caddy.
- `install.sh` ganha função `setup_centraldark_portal()` que cria as duas pastas, clona o repo, builda e injeta o snippet Caddy.
- `docs/PENDENCIAS.md`: fecha item correspondente, abre acompanhamento de DNS.

**2. VPS (executado via `ssh-vps`)**
- `mkdir -p /root/CentralDark/apps/{portal,Telepanel}`
- Clonar `segredounlock/clone-deck` em cada uma (ou usar git worktree pra economizar).
- `npm ci && npm run build` em cada → serve a pasta `dist/`.
- Criar `/root/CentralDark/infra/caddy/portal.Caddyfile` com:
  ```text
  centralldark.com, www.centralldark.com {
      root * /root/CentralDark/apps/portal/dist
      try_files {path} /index.html
      file_server
      encode gzip
  }
  telepainel.centralldark.com {
      root * /root/CentralDark/apps/Telepanel/dist
      try_files {path} /index.html
      file_server
      encode gzip
  }
  ```
- Importar esse snippet no Caddyfile principal e recarregar (passo sensível → **vou pedir confirmação antes de mexer no Caddy**, conforme regra do workspace).

**3. Cron / sync automático**
- Estender `gh-pull` pra fazer `git pull && npm ci && npm run build` nas duas pastas novas além da antiga.

**4. DNS (você precisa confirmar)**
- `centralldark.com` → A record pro IP da VPS (`89.117.78.124`).
- `www.centralldark.com` → A record ou CNAME pro mesmo IP.
- `telepainel.centralldark.com` → A record pro mesmo IP.
- Se já estiver apontado, só esperar Caddy emitir SSL (alguns segundos).

**5. Validação**
- `curl -I https://centralldark.com` → 200 servindo a landing.
- `curl -I https://telepainel.centralldark.com/dashboard` → 200 servindo SPA.
- Logs sanitizados do Caddy sem erro.
- Relatório em `/root/CentralDark/revisoes/migracao-portal-AAAA-MM-DD.md`.

### Pontos que preciso confirmar antes de executar

- **Caddy**: regra do workspace diz pra pedir OK antes de editar Caddyfile/reload. Confirmar?
- **DNS**: você cuida do apontamento dos 3 hostnames ou quer que eu te passe o passo-a-passo no registrador?
- **Diretório antigo**: depois que validar, posso renomear `/root/Multizap/apps/clone-deck` pra `clone-deck.legacy` ou prefere deixar do jeito que tá?

### O que NÃO muda

- Banco, Edge Functions, bot do Telegram, gateways de pagamento — nada disso é tocado.
- O preview do Lovable continua funcionando igual.
- Código-fonte permanece único neste repo; só o destino na VPS é duplicado.
