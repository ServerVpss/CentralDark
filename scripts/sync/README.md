# Sync Linear ↔ docs/PENDENCIAS.md

## O que faz

- **Linear → MD**: quando uma issue `SEG-*` é marcada como `Done`/`Canceled` no Linear, o item correspondente no `docs/PENDENCIAS.md` recebe `✅ SINCRONIZADO via Linear`.
- **MD → Linear**: quando um item é marcado como `✅ ENTREGUE/FECHADO/CONCLUÍDO` no MD, a issue `SEG-*` correspondente é fechada no Linear (status `completed`).
- **Relatório sanitizado** em `/tmp/linear-sync-report.md` (sem token).

## Como funciona

- O **número** do item no MD (`#N` ou `N.`) é o ID interno do projeto.
- O **link SEG-N** no cabeçalho (`· [`SEG-N`](https://linear.app/segredo/issue/SEG-N)`) é a ponte com o Linear.
- O script lê os dois lados, compara e aplica.

## Como rodar local

```bash
export LINEAR_API_KEY=lin_api_...          # Personal API Key, escopo write
node scripts/sync/linear-pendencias.mjs    # dry-run
node scripts/sync/linear-pendencias.mjs --apply
```

## CI

`.github/workflows/linear-pendencias-sync.yml`:

- **cron `*/30 * * * *`** → apply automático.
- **push na main** que mexa em `PENDENCIAS.md` → apply.
- **PR** → dry-run (sem mexer em nada).
- **`workflow_dispatch`** → escolhe via input.

Requer secret `LINEAR_API_KEY` em Settings → Secrets.

## Bloqueios

- Não cria issues novas — só sincroniza status. Pra criar nova issue, adicione no MD com cabeçalho `### #N título` e use o MCP/Linear pra criar SEG-N, depois cole `· [\`SEG-N\`](https://linear.app/segredo/issue/SEG-N)`.
- Não muda título/descrição (evita sobrescrever edição humana).
- Não toca em issue sem link SEG-N no MD.
