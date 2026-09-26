# Memória Operacional da IA — CentralDark

## Estado atual

- Repo principal: `ServerVpss/CentralDark`.
- Espelho: `segredounlock/clone-deck`.
- Git root na VPS: `/root`.
- Projeto na VPS: `/root/CentralDark`.
- Pasta principal de apps: `/root/CentralDark/apps`.

## Workflows

Limpeza feita:

- `deploy.yml` fica no push como guard verde temporário.
- Todos os outros workflows ficam `workflow_dispatch` manual-only.
- Mirror automático fica pausado até existir `MIRROR_PAT`.
- Run-once antigos não rodam mais em push.

## Migração de apps

Método validado: “arquivo mais recente vence”.

Resultado observado:

```txt
Criados: 3034
Atualizados: 0
Erros: 0
Protegidos pulados: 819
PM2 continuou online
```

## Armadilha

Na VPS atual, o topo real do Git é `/root`. Nunca usar `git add .`.
Sempre usar pathspec seguro.
