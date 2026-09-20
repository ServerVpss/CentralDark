# Rollback inicial

## Escopo

Missão local no perfil `pivete` e branch
`test/desafio-omega-autolupa-2026-07-22`.

## Regras

- Nunca usar `git reset --hard`.
- Preservar alterações pré-existentes fora do escopo.
- Fazer backups explícitos antes de alterar jobs ou configuração Hermes.
- Reverter arquivos da missão por patch inverso ou `git revert` do commit final.
- Restaurar definições de jobs usando os backups sanitizados produzidos nesta pasta.
- Não reiniciar nem tocar em VPS/produção.

## Pontos de retorno

- HEAD inicial: `eb1bb7f6d5be401775a49a8b07ad8a9d13cafa38`.
- Config Hermes inicial: SHA-256
  `f5dc63370baf4ab7723f63c07ec0b641f7ca9230246aa32e61c4d0b1b6980942`.
- Skill inicial: `.agents/skills/lupa-bayesiana/`.
- Backup anterior da configuração:
  `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml.pre-codex-sol-20260726-115523.bak`.

## Recuperação proposta

1. Parar apenas novas execuções da missão, sem fechar Hermes.
2. Restaurar jobs individualmente a partir de seus backups.
3. Reverter o commit final com `git revert <SHA>` caso já tenha sido publicado.
4. Confirmar `hermes --profile pivete gateway status`.
5. Reexecutar os testes do baseline e comparar hashes.
