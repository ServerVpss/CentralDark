## Ideia geral

Reorganizar 100% do `src/` desse repo pra espelhar a árvore final da VPS. O app continua rodando idêntico (mesmo Vite, mesma Lovable, mesmas rotas, mesmo backend), só que olhar pra pasta vai ser igual olhar pra VPS — fica óbvio onde fica cada módulo, e migrar pra VPS vira "copia essa pasta pra lá".

## Restrição técnica que define o desenho

Lovable e Vite precisam de `src/`, `index.html`, `vite.config.ts` e `package.json` na raiz — se eu mover isso, o preview da Lovable quebra. Então a árvore "VPS-like" mora **dentro do `src/`**, não na raiz do repo. Funciona igual, e fica 1-pra-1 com a VPS.

## Árvore nova do repo

```text
/  (raiz — fica igual, exigência do Vite/Lovable)
├── index.html
├── vite.config.ts
├── package.json
├── tailwind.config.ts
├── INSTALACAO.md           ← guia mestre: o que é cada pasta, como migrar pra VPS
├── docs/
│   ├── INSTALADOR/         ← já existe, fica
│   └── PENDENCIAS.md       ← já existe, fica
└── src/
    ├── App.tsx             ← só roteador, importa de apps/
    ├── main.tsx
    ├── index.css
    ├── apps/
    │   ├── web/                          ← vira /root/CentralDark/apps/web
    │   │   ├── README.md
    │   │   ├── pages/
    │   │   │   ├── LandingCentralDark.tsx
    │   │   │   ├── Portal.tsx
    │   │   │   ├── Auth.tsx
    │   │   │   └── Status.tsx
    │   │   └── components/               ← só o que é exclusivo do portal/home
    │   └── modulos/                      ← vira /root/CentralDark/apps/modulos
    │       ├── README.md                 ← índice dos módulos
    │       ├── telepainel/               ← módulo completo, com produto real
    │       │   ├── README.md             ← instalação + status + portas + PM2
    │       │   ├── pages/                ← Index, Consultas, Bots, Plans, Pix, Security, ...
    │       │   └── components/           ← admin, bots, consultas, dashboard, pix, payments, security, settings, backup, gamification, devops, webapp, search
    │       ├── bot-whatsapp/
    │       │   ├── README.md             ← "só landing, produto pendente"
    │       │   └── pages/LandingWhatsapp.tsx
    │       ├── crm/
    │       │   ├── README.md
    │       │   └── pages/LandingCRM.tsx
    │       └── financeiro/
    │           ├── README.md
    │           └── pages/LandingFinanceiro.tsx
    └── shared/                           ← o que é usado por mais de um app/módulo
        ├── ui/                           ← shadcn (era src/components/ui)
        ├── layout/
        ├── auth/                         ← AuthProvider, ProtectedRoute, AdminRoute
        ├── theme/
        ├── transitions/
        ├── pwa/
        ├── hooks/
        ├── lib/
        ├── integrations/                 ← cliente Lovable Cloud (NÃO editar)
        ├── assets/
        └── test/
```

## Mapeamento (o que vai pra onde)

- `pages/LandingCentralDark.tsx` + `Portal.tsx` + `Auth.tsx` + `Status.tsx` → `src/apps/web/pages/`
- `pages/Index, Consultas, Bots, BotSettings, MigrateSubscriptions, Plans, Settings, TelegramUsers, QueryLogs, PixTransactions, Security, SubscriptionAudit, MenuTips, DatabaseInfo, WebAppResult, DevTransitions, TesteModulos, UsuariosPainel, UsuarioPerfil, Docs, NotFound, LandingTelePainel` → `src/apps/modulos/telepainel/pages/`
- `pages/LandingWhatsapp.tsx` → `src/apps/modulos/bot-whatsapp/pages/`
- `pages/LandingCRM.tsx` → `src/apps/modulos/crm/pages/`
- `pages/LandingFinanceiro.tsx` → `src/apps/modulos/financeiro/pages/`
- `components/{admin, bots, consultas, consultation, dashboard, pix, payments, security, settings, backup, gamification, devops, webapp, search, landing}` → `src/apps/modulos/telepainel/components/` (são todos do TelePainel)
- `components/{ui, layout, auth, theme, transitions, pwa}` + `hooks/`, `lib/`, `integrations/`, `assets/`, `test/` → `src/shared/`

## Como nada quebra

- Path alias `@/` (no `tsconfig` e `vite.config`) atualizado pra continuar resolvendo: `@/components/ui/*` vira `@/shared/ui/*`, etc. Eu rodo um find-replace global nos imports antes de salvar pra garantir que tudo continua compilando.
- `App.tsx` reescrito só pra importar dos caminhos novos — rotas permanecem idênticas (`/`, `/telepainel/*`, `/whatsapp`, `/crm`, `/financeiro`, `/portal`, `/auth`).
- Lovable Cloud (`src/shared/integrations/supabase/client.ts`) **não é tocado** — é arquivo auto-gerado.
- Tema, PWA, auth, splash, banner de "view as" — tudo continua funcionando.

## Documentação que entra junto

1. **`INSTALACAO.md` na raiz** — explicação pra leigo: o que é cada módulo, como buildar (`bun install && bun run build`), como copiar pra VPS, onde cada pasta vai parar em `/root/CentralDark/apps/`, quais portas / PM2 / Caddy, e o que ainda é só landing.
2. **`src/apps/web/README.md`** — portal + homepage, como roda.
3. **`src/apps/modulos/README.md`** — índice: lista os 4 módulos, status (produto real vs só landing), comando de build, link pra cada README interno.
4. **README por módulo** (`telepainel`, `bot-whatsapp`, `crm`, `financeiro`) — o que é, status, rotas, dependências, variáveis de ambiente, como instalar/atualizar.
5. **`docs/PENDENCIAS.md`** — adiciono o item "reestruturação do repo pra layout VPS-like" como concluído, e abro pendências novas (ex.: "bot-whatsapp, crm, financeiro são só landing, falta produto").

## Validação antes de fechar

- `bun run build` passa sem erro.
- Preview da Lovable abre `/` (CentralDark), `/telepainel` (landing) e `/telepainel/dashboard` (logado) iguais ao que tá hoje.
- Nenhum import órfão, nenhum arquivo "solto" fora da nova árvore.
- Confirmo no chat com print do antes/depois e te peço pra dar uma olhada em 2-3 rotas chave antes de marcar como pronto.

## O que NÃO faço

- Não mexo em Caddy, PM2, Docker, banco de produção.
- Não apago nada do `docs/INSTALADOR/` que já existe — só somo o novo.
- Não toco em `src/integrations/supabase/*` (auto-gerado).
- Não mudo nenhuma lógica de negócio, nenhuma query, nenhuma migration — é puro rearranjo de pastas + imports + README.

## Próximo passo se aprovar

Já começo: 1) crio a estrutura nova, 2) movo arquivos em lote, 3) atualizo todos os imports e o `App.tsx`, 4) rodo build, 5) escrevo os READMEs, 6) atualizo `PENDENCIAS.md`, 7) te chamo pra validar.
