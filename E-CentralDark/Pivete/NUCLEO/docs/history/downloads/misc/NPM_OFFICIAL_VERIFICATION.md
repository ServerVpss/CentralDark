# VERIFICAÇÃO OFICIAL NPM — CONTRAPROVA DA SESSÃO

Fontes oficiais consultadas em 2026-08-24:

- https://docs.npmjs.com/using-npm/config/
- https://docs.npmjs.com/commands/npm-ls/
- https://docs.npmjs.com/cli/commands/npm-ci/

## Achados

### `omit`

A documentação oficial descreve o default como:

- `dev` quando `NODE_ENV=production`;
- vazio caso contrário.

Logo, a frase `omit=dev é default inevitável do npm 12+` foi rejeitada.

### lockfile vs disco

Dependências omitidas ainda podem ser resolvidas e registradas no lockfile, mas não instaladas fisicamente em disco. Portanto:

```text
LOCKED != INSTALLED
```

é correto; `lockfile mente` não é formulação técnica adequada.

### `include`

`--include=dev` / `--include=optional` vencem a omissão do mesmo tipo. Isso é mecanismo válido quando a omissão foi realmente medida.

### `legacy-peer-deps`

Default = false. A documentação diz que ignora `peerDependencies` e não é recomendada como padrão. Deve entrar somente quando um conflito de peer deps for a causa provada/aceita.
