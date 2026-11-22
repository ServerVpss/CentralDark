# Limpa total dos workflows vermelhos — 2026-06-07

## Objetivo

Remover a causa dos workflows vermelhos recorrentes.

## Ação

- `deploy.yml` mantido em push como guard verde temporário.
- Todos os demais workflows transformados em `workflow_dispatch` manual-only.
- Mirror automático pausado até existir `MIRROR_PAT`.
- Memória operacional corrigida para `ServerVpss/CentralDark`.
- Nenhum histórico de Actions foi apagado.

## Observação

Histórico vermelho antigo ainda pode aparecer na tela do GitHub. Isso não significa que a correção falhou. O objetivo desta etapa é impedir novos vermelhos.
