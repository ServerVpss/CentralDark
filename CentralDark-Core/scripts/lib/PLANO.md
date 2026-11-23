# PLANO - scripts/lib

## Objetivo

Centralizar helpers de scripts do CentralDark / MultiZap, com prioridade para o
Tema Netflix Centralizado.

## Regras

- `scripts/lib/theme.sh` e a fonte da verdade visual para scripts de VPS.
- Scripts novos devem carregar o tema e usar as funcoes `netflix_*`.
- Evitar estilos visuais manuais espalhados por scripts.
- Logs completos devem ir para `revisoes/`.
- Scripts com risco devem operar com `dry-run` e confirmacao explicita.
- Acoes sensiveis continuam dependendo de autorizacao humana.

## Proximos passos

- Migrar scripts novos para `scripts/lib/theme.sh`.
- Ao tocar scripts antigos, substituir cores/cabecalhos manuais pelo tema.
- Manter compatibilidade com terminais sem cor e execucoes nao interativas.
- Documentar excecoes quando um script nao puder carregar o tema.
