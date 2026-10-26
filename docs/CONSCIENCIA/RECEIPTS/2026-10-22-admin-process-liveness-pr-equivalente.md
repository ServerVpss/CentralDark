# Recibo equivalente — liveness por PID no admin existente

**PR-mãe:** [#1757](https://github.com/ServerVpss/CentralDark/pull/1757) — ledger preservado, não mergear.
**PR equivalente:** este recibo. O código já entrou na `main`. Não abri PR filho.
**Commit:** [`2145591101b3a5b4bdac34fe1aa536dc94ac3ce4`](https://github.com/ServerVpss/CentralDark/commit/2145591101b3a5b4bdac34fe1aa536dc94ac3ce4)
**Quando:** 2026-10-22T05:22:20Z
**Estado:** `SOURCE_ON_MAIN` · `FIXED_POINT=no` · `MERGED != DEPLOYED`

## O que a main ganhou

Uma tool só, `admin_process_liveness`, no array `adminPm2Tools` de `apps/modulos/mcp/src/modes/admin/tools/admin-pm2.js`.

- `preset`: `vscode`, `cline` ou `terminal`
- `match`: nome ou PID
- não devolve a linha de comando
- ausência medida = `NAO_ENCONTRADO`
- `scope=MCP_HOST_ONLY`

O `tsc` reemitiu o `dist` porque o fonte da `main` já divergia e o gate recusa `dist` parcial. Isso materializa código que já estava no fonte, inclusive `consumeRefreshToken(client_id)`. Não é outro owner.

## O que este recibo não fecha

| PR aberto | Dono | Relação |
|---|---|---|
| [#1880](https://github.com/ServerVpss/CentralDark/pull/1880) | VS Code remoto pareado, PID de terminal | continua aberto; esta tool não o substitui |
| [#1900](https://github.com/ServerVpss/CentralDark/pull/1900) | catálogo Casa SSH/PID | continua aberto; Casa não foi medida |
| [#1903](https://github.com/ServerVpss/CentralDark/pull/1903) | Cline/ZENDRIVE tool call | continua aberto; não é liveness de processo |

Não prova Casa, openKylin nem PC local `:8080`.

## Deploy

Canônico no momento deste recibo: [run 39727634748](https://github.com/ServerVpss/CentralDark/actions/runs/39727634748), `pending`, SHA `2145591`.

`SOURCE != LOAD` até o `/health` do MCP listar `admin_process_liveness`.

## NEXT_CURSOR

Ler a conclusão do run `39727634748`. Se passar, `mcp_catalog_diff` tem de achar `admin_process_liveness`. Casa e VS Code pareado continuam em [#1880](https://github.com/ServerVpss/CentralDark/pull/1880) e [#1900](https://github.com/ServerVpss/CentralDark/pull/1900).
