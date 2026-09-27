# Mapa de Migração — Fase 2

> Base: commit `221b931` (fim da Fase 1). Branch: `pivete/dev`. Somente frontend do projeto Lovable.

## Moves físicos executados

| Antes                                | Depois                                     |
|--------------------------------------|--------------------------------------------|
| `src/apps/web/`                      | `src/paginas/portal-publico/`              |
| `src/apps/modulos/telepainel/`       | `src/funcionalidades/telepainel/`          |
| `src/apps/modulos/hermes-panel/`     | `src/funcionalidades/hermes/`              |
| `src/apps/modulos/bot-whatsapp/`     | `src/funcionalidades/bot-whatsapp/`        |
| `src/apps/modulos/crm/`              | `src/funcionalidades/crm/`                 |
| `src/apps/modulos/financeiro/`       | `src/funcionalidades/financeiro/`          |
| `src/apps/modulos/README.md`         | `src/funcionalidades/README.md`            |
| `src/apps/web/README.md`             | (foi movido junto com portal-publico)      |
| `src/lib/notifications-events.ts`    | `src/compartilhado/servicos/notifications-events.ts` |

## Diretórios removidos (após ficarem vazios)

- `src/apps/modulos/`
- `src/apps/`
- `src/lib/`

## Aliases-ponte criados nesta fase

Em `vite.config.ts`, `tsconfig.json` e `tsconfig.app.json`:

- `@/apps/web/*` → `src/paginas/portal-publico/*`
- `@/apps/modulos/telepainel/*` → `src/funcionalidades/telepainel/*`
- `@/apps/modulos/hermes-panel/*` → `src/funcionalidades/hermes/*`
- `@/apps/modulos/bot-whatsapp/*` → `src/funcionalidades/bot-whatsapp/*`
- `@/apps/modulos/crm/*` → `src/funcionalidades/crm/*`
- `@/apps/modulos/financeiro/*` → `src/funcionalidades/financeiro/*`
- `@/lib/notifications-events` → `src/compartilhado/servicos/notifications-events`

Motivo: **nenhum dos 16 arquivos com imports `@/apps/...`** precisou ser reescrito. Reescrita fica para a fase 3.

## Nota técnica

Regex `find` no `vite.config.ts` para os novos aliases não estava casando no `configResolved` do Vite (comportamento diferente dos `@/shared` da fase 1). Substituído por aliases de string simples (casam por prefixo), padrão suportado e estável.

## Arquivos editados fora dos moves

- `vite.config.ts` — novos aliases adicionados.
- `tsconfig.json` — novos paths adicionados.
- `tsconfig.app.json` — novos paths adicionados.

Nenhum `.tsx`/`.ts` de negócio foi tocado.

## Módulos que não puderam ser movidos

Nenhum. Todos os cinco módulos de `src/apps/modulos/` migraram sem incidente.

## Build

```
npm run build   →  🟢 built in 13.94s
```

## Rollback

Histórico Git. Nenhum force-push, nenhuma reescrita de histórico. `git log --follow` acompanha cada arquivo interno.

## Próxima fase (sugerida, não executada)

1. Reescrita gradual dos imports `@/apps/...` e `@/lib/notifications-events` para os novos caminhos PT-BR.
2. Remoção dos aliases-ponte quando todos os imports antigos tiverem sido reescritos.
3. Split real de `App.tsx` em `rotas.tsx` + `provedores.tsx`.
4. Popular `sistema-visual/` extraindo tokens/estilos de `index.css`.
