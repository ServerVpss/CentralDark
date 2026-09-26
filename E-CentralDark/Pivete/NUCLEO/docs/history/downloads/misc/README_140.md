# scripts/lib

Biblioteca oficial de helpers reutilizaveis dos scripts CentralDark / MultiZap.

## Tema Netflix Centralizado

Fontes da verdade:

```txt
scripts/lib/theme.sh
scripts/lib/theme-node.mjs
```

Scripts Bash da VPS devem carregar `theme.sh`. Scripts Node devem importar
`theme-node.mjs`, que usa Chalk quando disponivel e mantem fallback seguro para
terminais sem dependencia instalada.

Funcoes Bash disponiveis:

- `netflix_header`
- `netflix_step`
- `netflix_success`
- `netflix_info`
- `netflix_warning`
- `netflix_error`
- `netflix_done`
- `netflix_confirm`
- `netflix_progress_bar`
- `netflix_loading`

Funcoes Node disponiveis:

- `netflixHeader`
- `netflixStep`
- `netflixSuccess`
- `netflixInfo`
- `netflixWarning`
- `netflixError`
- `netflixDone`
- `createSpinner`
- `runWithSpinner`
- `ensureNodeDependencies`
- `importNodeDependency`
- `sanitizeLog`
- `writeLog`

Regra: evitar cabecalhos, cores e estilos visuais manuais em scripts novos.
Logs completos devem ir para `revisoes/`; no terminal fica apenas o resumo limpo.
Nunca imprimir secrets, tokens, `.env`, sessoes ou cookies.

Dependencias Node:

- `theme-node.mjs` verifica `chalk` antes de importar definitivamente.
- Se faltar `node_modules` ou a dependencia nao resolver, instala automaticamente.
- Com `package-lock.json`, usa `npm ci`; sem lockfile, usa `npm install`.
- O log completo da instalacao vai para `revisoes/.../dependencies.log`.
- Se a instalacao falhar, o script para com erro claro e caminho do log.
- Para outras dependencias externas, usar `ensureNodeDependencies()` antes do import definitivo ou `importNodeDependency()`.

Exemplo Bash:

```bash
source "/root/CentralDark/scripts/lib/theme.sh"

netflix_header
netflix_step 1 4 "Validando ambiente"
netflix_success "Ambiente validado"
netflix_done
```

Exemplo Node:

```js
import {
  netflixHeader,
  netflixStep,
  netflixSuccess,
  netflixDone,
} from './theme-node.mjs';

netflixHeader();
netflixStep(1, 4, 'Validando ambiente');
netflixSuccess('Ambiente validado');
netflixDone();
```
