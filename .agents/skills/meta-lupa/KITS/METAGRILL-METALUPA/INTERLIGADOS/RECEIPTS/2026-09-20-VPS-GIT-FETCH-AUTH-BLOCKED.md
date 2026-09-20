# MICRO-HANDOFF — VPS git fetch bloqueado por autenticação

Data: 2026-09-20
PR-mãe: #1562

## Medição

```text
gh auth status = NOT_LOGGED_IN
origin = https://github.com/ServerVpss/CentralDark.git
credential.helper = NONE
git fetch origin main = RC 128
error = could not read Username for https://github.com
```

## Classificação

`TARGET_FAILURE=false`
`PROVIDER_FAILURE=false`
`TEST_ENVIRONMENT_FAILURE=false`
`TOOL_WRAPPER_FAILURE=false`
`RUNTIME_GIT_AUTH_BINDING_MISSING=true`

O checkout VPS não pode alcançar a main viva por `git fetch` enquanto a autenticação runtime do Git não estiver ligada. Não pedir/expor segredo; reutilizar mecanismo de credencial já existente se houver.

Próximo cursor: localizar no source/runtime o mecanismo canônico de autenticação/deploy que já existe e reutilizá-lo.
