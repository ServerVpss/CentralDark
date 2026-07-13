# Mapa de Migração — Faxina Visual CentralDark

> Registro caminho-a-caminho do que mudou nesta faxina. Base: commit `4db6a1b`, branch `pivete/dev`. Só frontend do projeto Lovable atual foi tocado.

## O que foi movido fisicamente

| Antes                              | Depois                                  | Motivo |
|------------------------------------|-----------------------------------------|--------|
| `src/App.tsx`                      | `src/app/App.tsx`                       | Ponto de entrada oficial vai para `src/app/` |
| `src/preview/cockpit-hero/`        | `src/admin/cockpit/`                    | Cockpit deixa de ser preview e vira área admin oficial |
| `src/shared/`                      | `src/compartilhado/`                    | Nome oficial em PT-BR |
| `src/shared/ui/`                   | `src/compartilhado/interface/`          | Nome PT-BR (componentes shadcn e UI base) |
| `src/shared/hooks/`                | `src/compartilhado/comportamentos/`     | Nome PT-BR (hooks React) |
| `src/shared/lib/`                  | `src/compartilhado/utilitarios/`        | Nome PT-BR (utilitários) |

## O que foi criado (esqueleto oficial da árvore-alvo)

Todas as pastas abaixo foram criadas vazias (com `.gitkeep`) para ancorar a árvore-alvo. A próxima etapa vai preencher cada uma movendo o conteúdo hoje espalhado em `src/apps/`.

- `src/app/rotas.tsx` (âncora — reexporta App)
- `src/app/provedores.tsx` (âncora — reexporta App)
- `src/app/configuracao.ts` (queryClient, chave de tema, modo)
- `src/sistema-visual/{fundamentos,componentes,estilos}/`
- `src/estruturas-de-pagina/`
- `src/paginas/`
- `src/funcionalidades/`
- `src/recursos-visuais/`
- `src/compartilhado/{tipos,servicos,dados-de-exemplo}/`

## O que foi criado como ponte (aliases)

Nenhum arquivo antigo foi apagado enquanto imports apontavam para ele. As pontes vivem apenas em `tsconfig.json`, `tsconfig.app.json` e `vite.config.ts`:

- `@/shared/ui/*` → `src/compartilhado/interface/*`
- `@/shared/hooks/*` → `src/compartilhado/comportamentos/*`
- `@/shared/lib/*` → `src/compartilhado/utilitarios/*`
- `@/shared/*` → `src/compartilhado/*`
- `@/preview/cockpit-hero` → `src/admin/cockpit`

Por causa das pontes, **nenhum dos 175+ imports antigos precisou ser reescrito nesta etapa**, e o build passa (`npm run build` = 🟢).

## O que foi apagado

- `src/preview/` (pasta), depois que `cockpit-hero` migrou para `src/admin/cockpit`. Não havia mais nada dentro.

Nada mais foi apagado. Nenhum arquivo funcional foi removido.

## Rotas alteradas

- **Adicionada:** `/admin/cockpit` → aponta para `src/admin/cockpit` (Cockpit oficial).
- **Preservada por compatibilidade:** `/preview/cockpit` → agora **redireciona** para `/admin/cockpit` via `<Navigate>`.
- Nenhuma outra rota do sistema (`/telepainel/*`, `/whatsapp`, `/crm`, `/financeiro`, `/portal`, `/auth`, `/docs`, etc.) foi tocada.

## Arquivos editados (fora dos moves)

- `src/main.tsx` → `import App from "@/app/App"`
- `src/app/App.tsx` → import de Cockpit passou para `@/admin/cockpit`, rotas atualizadas.
- `tsconfig.json`, `tsconfig.app.json` → paths com aliases PT-BR + pontes.
- `vite.config.ts` → `resolve.alias` em array (ordem específica primeiro).

## Build

```
npm run build   →  🟢 built in 15.40s
```

Avisos (não bloqueiam):
- Aviso de `@import` em `index.css` antes de `@tailwind` (herdado, estético).
- Aviso de `useIsAdmin.ts` importado dinâmica e estaticamente (herdado, não introduzido aqui).

## Pendências (próxima etapa)

1. Migrar páginas de `src/apps/modulos/telepainel/pages/` → `src/paginas/`.
2. Migrar componentes de negócio → `src/funcionalidades/`.
3. Migrar `src/apps/web/pages/` (landings) → `src/paginas/`.
4. Mover `src/lib/notifications-events.ts` → `src/compartilhado/utilitarios/`.
5. Split real de `App.tsx` em `rotas.tsx` + `provedores.tsx`.
6. Remover pontes/aliases `@/shared/*` e `@/preview/cockpit-hero` quando todos os imports antigos tiverem sido reescritos para os novos caminhos PT-BR.

## Rollback

Histórico Git é o rollback. Cada rename foi feito com `mv` normal (sem `git mv`), então o Git verá "arquivo apagado + arquivo criado" — o histórico dos arquivos internos continua rastreável via `git log --follow`. Nenhum force-push, nenhuma reescrita de histórico, nenhum merge.
