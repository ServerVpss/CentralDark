## Objetivo

Tornar a **VPS** a casa oficial do TelePanel (rodando em `https://telepainel.centralldark.com`), e deixar o **Lovable só pra desenhar/visualizar**. Toda alteração que você fizer no Lovable cai automaticamente na VPS, sem você precisar mexer em nada.

Banco continua o mesmo (`kagejpghnwdfymddwxuf` no Supabase) — não muda nada lá. Bot de consultas continua respondendo via edge functions, como já é hoje.

---

## Etapas

### 1) Atualizar a pasta da VPS com o código de hoje
A pasta `/root/CentralDark/apps/modulos/telepainel/` está congelada em 20/jun. Vou fazer ela puxar o estado atual do GitHub do projeto (`telegram-zen-panel`):

```
cd /root/CentralDark/apps/modulos/telepainel
git fetch origin && git reset --hard origin/main
bun install
bun run build
```

Resultado: `dist/` atualizado com o código de hoje.

### 2) Caddy passar a servir o `dist/`
Criar `/etc/caddy/conf.d/telepainel.centralldark.com.Caddyfile`:

```
telepainel.centralldark.com {
    root * /root/CentralDark/apps/modulos/telepainel/dist
    encode zstd gzip
    try_files {path} /index.html
    file_server
}
```

Importar no `/etc/caddy/Caddyfile` principal e dar `caddy validate && systemctl reload caddy`. SSL Let's Encrypt sai automático.

Teste: `curl -I https://telepainel.centralldark.com` tem que devolver 200 com conteúdo (não vazio).

### 3) Apontar o bot pra esse domínio
No banco:
```sql
update bot_settings set webapp_url = 'https://telepainel.centralldark.com';
```
Pronto: o Mini App passa a abrir pelo seu domínio próprio em vez do `*.lovable.app`.

### 4) Sincronização automática Lovable → VPS
Aqui está o pulo do gato — o que vai te deixar editar no Lovable e a VPS atualizar sozinha:

**Como funciona:**
- Lovable já tem sync bidirecional com o GitHub `telegram-zen-panel`. Toda alteração que você faz vira commit automático.
- Vou criar na VPS um pequeno processo PM2 chamado `telepainel-deploy-listener` (porta interna), que recebe webhook do GitHub.
- A cada `push` no `main`, GitHub avisa o listener, que roda: `git pull && bun install && bun run build && systemctl reload caddy`.
- Tempo total: ~30-60 segundos entre você salvar no Lovable e a VPS estar atualizada.

**Vantagem:** você continua editando no Lovable do jeitinho que gosta (chat com a IA, preview ao vivo), mas o site real que seus clientes usam roda na sua VPS, sem custo extra de hospedagem, no seu domínio.

### 5) Lovable vira só preview
- O domínio público `*.lovable.app` continua existindo (não dá pra desligar), mas só você usa pra preview/design.
- O bot e o público acessam só `telepainel.centralldark.com`.

---

## O que **não** muda
- Banco Supabase (`kagejpghnwdfymddwxuf`) — continua igual.
- Bot de consultas (edge functions) — continuam serverless, sem virar processo VPS.
- Bot DevOps `CentralDark-TelegramBot` (PM2 id 11) — intocado.
- Pasta `/root/CentralDark/apps/bot-telegram/` — intocada.

## O que muda
- Pasta `telepainel/` na VPS deixa de ser placeholder e vira a cópia viva do código.
- Caddy passa a servir o subdomínio (hoje devolve 200 vazio).
- Novo processo PM2 `telepainel-deploy-listener` (~50 linhas Node, sem deps).
- Sem migrations de banco. Sem código novo no projeto Lovable.

## Detalhes técnicos
- Listener: Node nativo (`http` + `child_process`), valida assinatura HMAC do GitHub usando secret.
- Build via `bun` (já instalado na VPS).
- Caddy reload é gracioso (zero downtime).
- Se o build falhar, a versão anterior continua servindo (só atualiza `dist/` se `bun run build` der exit 0).
- Logs em `/var/log/telepainel-deploy-*.log`.

---

Confirma que pode mandar bala?
