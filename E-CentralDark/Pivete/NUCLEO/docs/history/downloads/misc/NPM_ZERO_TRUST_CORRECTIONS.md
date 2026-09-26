# NPM — CORREÇÕES ZERO TRUST

## Claim derrubado
`omit=dev É O DEFAULT DO NPM 12+` → **FALSO como regra geral**.

Documentação oficial atual: `omit` usa `dev` por padrão quando `NODE_ENV=production`; caso contrário o default é vazio. O lockfile pode conter dependências omitidas que não foram fisicamente instaladas.

## Claim derrubado
`--legacy-peer-deps` como correção universal → **NÃO**.

A documentação oficial diz que `legacy-peer-deps` ignora completamente `peerDependencies` na montagem da árvore e **não é recomendado** como padrão.

## Cristal correto
```text
DECLARED != INSTALLED
LOCKED != INSTALLED
INSTALLED != WORKING
```

Para cada falha, primeiro medir `NODE_ENV`, origem de config, manifest, lock, estado instalado e binário. Só então escolher a menor correção. Flags específicas são remediações condicionais, não mantras universais.

Fontes oficiais consultadas nesta execução:
- https://docs.npmjs.com/commands/npm-ls/
- https://docs.npmjs.com/using-npm/config/
