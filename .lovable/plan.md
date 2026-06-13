# Painel visual do MCP em `mcp.centralldark.com/` — tema Esmeralda do TelePanel

## A ideia em uma frase
Criar a tela bonita do painel **direto no monorepo da VPS** (`/root/CentralDark/apps/mcp/`), servida pelo próprio servidor MCP em `https://mcp.centralldark.com/`. Visual **inspirado** no tema Esmeralda do TelePanel (verde esmeralda, light default, sombras 3D táteis, cantos arredondados), mas **nada de código vem daqui** — o TelePanel fica intocado.

## O que já existe na VPS (confirmado agora via MCP)
- Servidor MCP em Express + TypeScript, pasta `/root/CentralDark/apps/mcp/`, PM2 `MCP-CentralDark`, porta interna `9100`.
- Rotas já tomadas: `/health`, `/status.json`, `/mcp`, `/.well-known/*`, `/authorize`, `/token`, `/register`, `/oauth/github/callback`.
- A raiz `/` está livre (404 hoje). É onde o painel entra.
- `/status.json` já entrega catálogo, conectores, grupos, OAuth, tokens, sugestões — fonte única de dados.

## O que vai ser criado (no repo `ServerVpss/CentralDark`)

```text
apps/mcp/
└── src/
    ├── painel.ts     ← NOVO: handler Express, devolve HTML único
    └── index.ts      ← PATCH curto: registra GET / e GET /painel
```

`painel.ts` devolve **um único HTML autocontido** (CSS + JS inline, ~20kb). Zero build extra, zero dependência nova no `package.json`. Só `npm run build` (tsc) + `pm2 restart`.

## Tema visual (inspirado no Esmeralda do TelePanel)

Reproduzo **só os tokens**, escritos do zero em CSS puro dentro do HTML:

- **Cores base (light default):** fundo `hsl(150 20% 98%)`, card branco, texto grafite escuro.
- **Primária:** verde esmeralda `hsl(160 84% 39%)` (botões, badges OK, acentos).
- **Estados:** sucesso = esmeralda, alerta = âmbar `hsl(38 92% 50%)`, erro = vermelho `hsl(0 84% 60%)`.
- **Cantos:** `border-radius: 14px` nos cards, `10px` nos botões.
- **Sombras 3D táteis:** sombra baixa difusa + linha sutil branca no topo (mesmo efeito do `shadow-3d-soft`). Botão primário tem realce esmeralda. Ao clicar, `transform: translateY(1px)` (efeito pressionado).
- **Tipografia:** stack do sistema (`-apple-system, Segoe UI, Roboto…`), pesos 500/600/700.
- **Espaçamento generoso** entre seções, micro-animações suaves nas transições.
- 100% PT-BR.

## Seções da tela (uma página só, scroll vertical)

1. **Cabeçalho ao vivo** — logo "MCP CentralDark", badge ONLINE/ATENÇÃO, uptime (`2d 18h`), versão, `toolCount`, `catalogVersion`, botão "Atualizar agora".
2. **Conectores** — cards com bolinha colorida (verde/âmbar/vermelho), nome, latência e detalhe. (GitHub API, OAuth GitHub, Supabase, VPS SSH, Persistência.)
3. **Catálogo de Tools (97)** — accordion por grupo, com contagem (GitHub 34, VPS/PM2 21, Supabase 4, Deploy 2, MCP interno 6, Skills 5, Pendências 6, Consciência 4, Aprendizado 2, Outros 13). Cada grupo abre a lista de tools.
4. **OAuth Clients & Sessões** — números grandes de clients, accessTokens, refreshTokens, sessions, e lista de logins GitHub já autenticados.
5. **Tokens** — tabela com tokens **mascarados** (`abc***xyz`, 3 primeiros + `***` + 3 últimos). Botão **Revogar** vermelho dispara um toast "Endpoint de revogação ainda não disponível" (placeholder).
6. **Sugestões & Recomendações** — `suggestedTools` e `recommendations` listados como cards leves.
7. **Rodapé** — links discretos `/status.json`, `/health`, `/mcp`.

## Comportamento

- `fetch('/status.json')` no load e a cada **30s**.
- Botão "Atualizar agora" força refresh.
- Estado de loading com skeletons antes do primeiro fetch.
- Tudo client-side, zero framework, zero CDN externa.

## Deploy (sequência via MCP — tudo automatizado)

1. `github_create_or_update_file` no repo `ServerVpss/CentralDark` → cria `apps/mcp/src/painel.ts` e atualiza `apps/mcp/src/index.ts`.
2. `vps_git_pull` → VPS sincroniza.
3. `vps_run_once_script` → `cd /root/CentralDark/apps/mcp && npm run build`.
4. `vps_restart_service` → `MCP-CentralDark` (PM2).
5. Smoke test: `curl https://mcp.centralldark.com/` devolvendo HTML do painel, `/status.json` e `/mcp` continuando iguais.

## O que NÃO vai mudar
- TelePanel: nada. Nenhum arquivo criado/alterado neste sandbox.
- Subdomínio: nenhum novo (continua em `mcp.centralldark.com`).
- DNS, Caddy, Cloudflare: intocados.
- Rotas existentes do MCP: intocadas.
- `package.json` do MCP: intocado.

## Pra você confirmar
- Rota: vou colocar nas duas — `/` e `/painel` (ambas servem a mesma tela).
- Botão Revogar: começa como toast placeholder. Quando quiser ligar de verdade, adiciono `POST /admin/revoke` autenticado depois.

Confirma e eu já mando o commit + build + restart via MCP.
