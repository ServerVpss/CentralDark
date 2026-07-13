# Mapa da Árvore — CentralDark (frontend Lovable) — Fase 2

> Atualizado após Fase 2. `src/apps/` e `src/lib/` **eliminados**. Backend, Supabase, VPS, workflows e áreas 🔒 intocados.

## Árvore atual

```
src/
├─ app/                        ← entry React (App.tsx + configuracao.ts + âncoras)
├─ admin/
│  └─ cockpit/                 ← Cockpit oficial (rota /admin/cockpit)
│
├─ paginas/
│  └─ portal-publico/          ← antes: src/apps/web/
│     └─ pages/                   (LandingCentralDark, Portal, Auth, Status)
│
├─ funcionalidades/
│  ├─ telepainel/              ← antes: src/apps/modulos/telepainel/
│  ├─ hermes/                  ← antes: src/apps/modulos/hermes-panel/
│  ├─ bot-whatsapp/            ← antes: src/apps/modulos/bot-whatsapp/
│  ├─ crm/                     ← antes: src/apps/modulos/crm/
│  └─ financeiro/              ← antes: src/apps/modulos/financeiro/
│
├─ compartilhado/
│  ├─ interface/               (antes: shared/ui — shadcn)
│  ├─ comportamentos/          (antes: shared/hooks)
│  ├─ utilitarios/             (antes: shared/lib)
│  ├─ servicos/                ← notifications-events.ts vive aqui agora
│  ├─ auth/  theme/  transitions/  layout/  aprovacao/  pwa/  assets/  test/
│  └─ tipos/  dados-de-exemplo/  (esqueleto)
│
├─ sistema-visual/             (esqueleto — fundamentos/componentes/estilos)
├─ estruturas-de-pagina/       (esqueleto)
├─ recursos-visuais/           (esqueleto)
│
├─ integrations/               ← client Supabase auto-gerado (não mexer)
├─ main.tsx  index.css  vite-env.d.ts
```

## Rotas

Inalteradas. Mesmas de antes: `/`, `/auth`, `/telepainel/*`, `/whatsapp`, `/crm`, `/financeiro`, `/portal`, `/docs`, `/admin/cockpit`, `/preview/cockpit` (redirect), `/dev/transitions`, `*`.

## Aliases de compatibilidade

Nenhum import legado foi reescrito. Todos continuam funcionando via aliases:

| Import legado                            | Resolve para                             |
|------------------------------------------|------------------------------------------|
| `@/shared/ui/*`                          | `src/compartilhado/interface/*`          |
| `@/shared/hooks/*`                       | `src/compartilhado/comportamentos/*`     |
| `@/shared/lib/*`                         | `src/compartilhado/utilitarios/*`        |
| `@/shared/*`                             | `src/compartilhado/*`                    |
| `@/preview/cockpit-hero`                 | `src/admin/cockpit`                      |
| `@/apps/web/*`                           | `src/paginas/portal-publico/*`           |
| `@/apps/modulos/telepainel/*`            | `src/funcionalidades/telepainel/*`       |
| `@/apps/modulos/hermes-panel/*`          | `src/funcionalidades/hermes/*`           |
| `@/apps/modulos/bot-whatsapp/*`          | `src/funcionalidades/bot-whatsapp/*`     |
| `@/apps/modulos/crm/*`                   | `src/funcionalidades/crm/*`              |
| `@/apps/modulos/financeiro/*`            | `src/funcionalidades/financeiro/*`       |
| `@/lib/notifications-events`             | `src/compartilhado/servicos/notifications-events` |
| `@/*`                                    | `src/*`                                  |

## Build

`npm run build` → 🟢 13.94s, 3971 módulos, `index-lesRdIY0.js` 2043 kB.

## Pendências (não bloqueiam)

1. Reescrever imports `@/apps/...` e `@/lib/...` gradualmente e depois remover os aliases-ponte.
2. Split real de `App.tsx` em `rotas.tsx` + `provedores.tsx` (hoje ambos reexportam App).
3. Preencher `sistema-visual/`, `estruturas-de-pagina/`, `recursos-visuais/`.
4. Aviso Vite: `useIsAdmin.ts` importado dinâmica e estaticamente (herdado).
5. Aviso Vite: `@import` de Google Fonts em `index.css` deve vir antes de `@tailwind` (estético).
6. Bundle > 500 kB — considerar code-split via dynamic import (fora do escopo desta faxina).

## O que **não** foi tocado

- `main`, backend, Supabase, migrations, Edge Functions
- VPS, PM2, Caddy, workflows GitHub Actions, scripts, secrets, `.env`
- `apps/modulos/hub/` (app HUB independente na raiz)
- Áreas 🔒 listadas em `CLAUDE.md`
- Nenhuma regra de negócio, componente, hook, estilo, asset ou contrato de API
