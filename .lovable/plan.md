
# Consertar conexão do ChatGPT no MCP CentralDark

## O que tá acontecendo (em português de gente)

Você tá colando a URL `http://mcp.centralldark.com/admin/mcp` no conector MCP do ChatGPT. Aí ele tenta logar, redireciona errado, e volta pro chat com aquele erro vermelho de "tente mais tarde".

Três problemas empilhados:

1. **URL é HTTP puro** — o ChatGPT (e qualquer conector MCP sério) só aceita conexão por HTTPS. Sem cadeado, ele corta a conversa.
2. **Path errado** — `/admin/mcp` é o endpoint de teste interno do painel admin (aquele botão "simular ChatGPT"). O endpoint público de verdade é `/mcp` (na raiz do domínio).
3. **Tela de login OAuth exige senha admin no POST** — o ChatGPT não sabe disso. Ele espera uma telinha de "Autorizar / Recusar" onde clica um botão. Do jeito atual, o `/authorize` só aceita senha via form escondido, então o ChatGPT nunca consegue completar.

## O que vou fazer

### 1. Garantir HTTPS no domínio `mcp.centralldark.com`
Verificar o Caddy da VPS. Se já tem TLS, ótimo. Se não, ajustar o `Caddyfile` pra emitir cert automático e forçar redirect HTTP→HTTPS. Sem HTTPS, nada disso funciona.

### 2. Corrigir a URL que você cola no ChatGPT
A URL certa passa a ser:
```
https://mcp.centralldark.com/mcp
```
(sem `/admin`, com `https`)

Vou confirmar isso batendo no `/.well-known/oauth-authorization-server` e vendo o `issuer` que o próprio MCP anuncia — se ele tiver anunciando `http://`, também conserto ali pra sair `https://`.

### 3. Trocar o `/authorize` por uma tela de consent de verdade
Hoje o `/authorize` exige senha admin embutida no POST (isso serve pro teste E2E do painel, não pro ChatGPT).

Vou fazer o seguinte fluxo:
- ChatGPT bate em `/authorize` → mostra uma **página HTML com botão "Autorizar ChatGPT"** (protegida pelo cookie do admin — se você não tiver logado ainda, cai no `/admin/login` normal e volta pra tela de consent depois).
- Você aperta "Autorizar" uma única vez → o MCP emite o `code` e redireciona de volta pro ChatGPT.
- ChatGPT troca o `code` por Bearer no `/token` e conecta.

Isso preserva a segurança (só quem tem a senha do admin consegue autorizar novos clientes) e faz o ChatGPT parar de quebrar.

### 4. Teste ao vivo
Depois do patch:
- Abro `https://mcp.centralldark.com/.well-known/oauth-authorization-server` e confirmo que todas as URLs saem em HTTPS.
- Rodo o teste E2E do próprio painel (DCR → authorize → token → tools/list) pra confirmar que não quebrei nada.
- Te aviso pra colar `https://mcp.centralldark.com/mcp` no ChatGPT e conectar de novo.

## Arquivos que vou tocar

- `apps/modulos/mcp/src/admin.js` — trocar handler do `/authorize` por página de consent HTML + POST de aprovação.
- `apps/modulos/mcp/src/` (arquivo do OAuth server, provavelmente `oauth.js` ou dentro do `server.js`) — forçar `issuer` e endpoints em HTTPS mesmo quando request chega via proxy Caddy (usar `X-Forwarded-Proto`).
- **Verificar** (não necessariamente alterar) `infra/caddy/Caddyfile` — só ajusto se `mcp.centralldark.com` não tiver HTTPS ativo.

## O que NÃO vou mexer (áreas protegidas)

- Não mexo em `apps/modulos/HERMES-CORE/`, `elite-gateway/`, `hub/`, `Bolt/` — só no MCP.
- Não mexo no fluxo de login admin humano (`/admin/login` + cookie) — ele continua igual, só passa a servir também como gate pra tela de consent OAuth.
- Não crio migration, edge function nem toco em Supabase.

## Rollback

Antes de qualquer edit, faço backup do `admin.js` atual em `admin.js.bak.consent.<timestamp>`. Se algo quebrar, `mv` de volta e `pm2 restart CentralDark-MCP` em 10 segundos.

---

Manda "PERMITO PIVETE" (ou só "toca") que eu saio do plano e executo.
