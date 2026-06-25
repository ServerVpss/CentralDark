# scripts/notion-sync

Script oficial que espelha o conteúdo de `docs/CONSCIENCIA/` para os databases do Notion.

## Lei

- **Git é fonte da verdade** (`docs/CONSCIENCIA/`).
- **Notion é painel humano** (databases na página `CentralDark • Consolidação`).
- O script é **estritamente downstream**: Git → Notion. Nunca o contrário.

Ver: [`docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`](../../docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md).

## Como roda

Automaticamente pelo workflow [`.github/workflows/notion-sync.yml`](../../.github/workflows/notion-sync.yml) em todo push na `main` que toque os arquivos espelhados, ou manualmente via **Actions → Notion Sync → Run workflow**.

### Modo validação (dry-run)

No Run workflow, deixar `dry_run: true` (padrão). O script imprime o que **faria** sem escrever no Notion. Use sempre antes da primeira execução real.

### Modo execução

`dry_run: false` — escreve de verdade.

## UPSERT (anti-duplicação)

Para cada item:

1. Calcula um título determinístico.
2. Consulta o database por esse título (`databases.query` com filtro `title.equals`).
3. Se existir → `pages.update` (atualiza propriedades).
4. Se não existir → `pages.create`.

Resultado: rodar 100 vezes não duplica nada.

## Targets

- `all` (padrão) — tudo
- `regras` — só `📜 Regras do Projeto`
- `pendencias` — só `🔥 Pendências Ativas`
- `decisoes` — só `⚖️ Registro de Decisões`
- `aprendizados` — só `🧠 Aprendizados`

## Logs

Cada execução escreve um relatório em `docs/RELATORIOS/notion-sync/`:
- `latest.md` — última execução
- `YYYY-MM-DDTHH-MM-SS.md` — histórico imutável

O workflow commita esses arquivos automaticamente (apenas em execução real, não em dry-run).

## Secret necessário

`NOTION_API_KEY` no repositório (Settings → Secrets → Actions). Token de integração interna do Notion com acesso aos 4 databases listados em [`docs/CONSCIENCIA/NOTION-MAPA.md`](../../docs/CONSCIENCIA/NOTION-MAPA.md).
