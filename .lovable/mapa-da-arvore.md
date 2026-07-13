# Mapa da Árvore — CentralDark (frontend Lovable)

> Atualizado agora, na branch `pivete/dev`. Este é o **mapa oficial** de onde cada coisa vive no frontend depois da faxina. Backend, Supabase, Edge Functions, VPS, workflows e áreas 🔒 **não foram tocados**.

## Árvore-alvo (estado atual do repo)

```
src/
├─ app/                        ← ponto de entrada do app (React)
│  ├─ App.tsx                  ← componente raiz (rotas + provedores por enquanto juntos aqui)
│  ├─ rotas.tsx                ← âncora futura das rotas (por ora reexporta App)
│  ├─ provedores.tsx           ← âncora futura dos provedores (por ora reexporta App)
│  └─ configuracao.ts          ← queryClient, chave de tema, modo (full/web/portal)
│
├─ admin/
│  └─ cockpit/                 ← Cockpit oficial (antes: src/preview/cockpit-hero)
│                                 rota: /admin/cockpit
│
├─ sistema-visual/             ← futuro lar dos tokens/base de design (vazio, .gitkeep)
│  ├─ fundamentos/
│  ├─ componentes/
│  └─ estilos/
│
├─ estruturas-de-pagina/       ← futuros layouts (vazio, .gitkeep)
├─ paginas/                    ← futura consolidação de páginas (vazio, .gitkeep)
├─ funcionalidades/            ← futuras features de negócio (vazio, .gitkeep)
├─ recursos-visuais/           ← futuros assets globais (vazio, .gitkeep)
│
├─ compartilhado/              ← antes: src/shared
│  ├─ interface/               ← antes: shared/ui         (shadcn e afins)
│  ├─ comportamentos/          ← antes: shared/hooks
│  ├─ utilitarios/             ← antes: shared/lib
│  ├─ auth/                    ← preservado (AuthProvider, guards)
│  ├─ theme/                   ← preservado (ThemeProvider)
│  ├─ transitions/             ← preservado (splash, page transitions)
│  ├─ layout/                  ← preservado (Dashboard, Logo, etc.)
│  ├─ aprovacao/               ← preservado (ApprovalProvider)
│  ├─ pwa/                     ← preservado (InstallPrompt)
│  ├─ assets/                  ← preservado (imagens compartilhadas)
│  ├─ test/                    ← preservado (setup Vitest)
│  ├─ tipos/                   ← esqueleto (.gitkeep)
│  ├─ servicos/                ← esqueleto (.gitkeep)
│  └─ dados-de-exemplo/        ← esqueleto (.gitkeep)
│
├─ apps/                       ← mantido temporariamente (telepainel, web, módulos)
│                                 será dissolvido em `paginas/` + `funcionalidades/` na próxima etapa
├─ integrations/               ← client Supabase auto-gerado (não mexer)
├─ lib/                        ← utilitário mínimo (notifications-events) — a mover
│
├─ main.tsx                    ← bootstrap React (importa @/app/App)
├─ index.css                   ← estilos globais (Tailwind + tokens)
└─ vite-env.d.ts
```

## Rotas principais preservadas

- `/`                    → Landing CentralDark (ou WhatsApp/CRM/Financeiro por host)
- `/auth`                → Autenticação
- `/telepainel`          → Landing TelePainel (ou dashboard, se logado)
- `/telepainel/*`        → Todas as páginas do produto TelePainel
- `/docs`                → Documentação pública
- `/portal`              → Portal (protegido)
- **`/admin/cockpit`**   → **Cockpit oficial** (novo caminho canônico)
- `/preview/cockpit`     → Redireciona para `/admin/cockpit` (compatibilidade)
- `/dev/transitions`     → Bancada de transições
- `*`                    → NotFound

## Aliases de compatibilidade (bridge temporária)

Para não quebrar os **175+ arquivos** que ainda importam do caminho antigo, os aliases abaixo apontam nomes antigos para os novos — em `tsconfig.json`, `tsconfig.app.json` e `vite.config.ts`:

| Import antigo                | Resolve para                        |
|------------------------------|-------------------------------------|
| `@/shared/ui/*`              | `src/compartilhado/interface/*`     |
| `@/shared/hooks/*`           | `src/compartilhado/comportamentos/*`|
| `@/shared/lib/*`             | `src/compartilhado/utilitarios/*`   |
| `@/shared/*`                 | `src/compartilhado/*`               |
| `@/preview/cockpit-hero`     | `src/admin/cockpit`                 |
| `@/*`                        | `src/*`                             |

Esses aliases **funcionam**, o build passa (`npm run build` 🟢), e a árvore física já está em PT-BR. A remoção dos aliases fica para uma segunda etapa, quando trocarmos os imports antigos por escrito, aos poucos, sem risco.

## Pendências reais (registradas — não bloqueiam)

1. **`src/apps/` ainda existe.** Contém `web/`, `modulos/telepainel/`, `modulos/hermes-panel/`, `modulos/bot-whatsapp/`, `modulos/crm/`, `modulos/financeiro/`. Migrar para `paginas/` + `funcionalidades/` exige reorganização de dezenas de páginas e é a próxima grande etapa.
2. **`src/lib/notifications-events.ts`** deve migrar para `src/compartilhado/utilitarios/` ou `src/compartilhado/servicos/`.
3. **Split real de `App.tsx`** em `rotas.tsx` + `provedores.tsx`. Hoje os dois arquivos existem mas reexportam `App` (âncora oficial). O split é seguro fazer sozinho num próximo commit.
4. **Aviso Vite (não erro):** `useIsAdmin.ts` é importado dinamicamente em um lugar e estaticamente em outros. Herdado, não introduzido por esta faxina.
5. **`@import` de Google Fonts em `index.css`** aparece com aviso do Vite (deve vir antes de `@tailwind`). Estético, não quebra build.

## O que **não** foi tocado

- `main`, backend, Supabase, migrations, Edge Functions
- VPS, PM2, Caddy, workflows GitHub Actions, scripts, secrets, `.env`
- `apps/modulos/hub/` (app HUB independente na raiz)
- Áreas 🔒 listadas em `CLAUDE.md`
