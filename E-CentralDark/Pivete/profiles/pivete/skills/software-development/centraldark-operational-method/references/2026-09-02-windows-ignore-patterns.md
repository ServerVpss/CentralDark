# Windows Ignore Patterns Analysis — 2026-09-02

## Contexto
Usuário forneceu lista de patterns de ignore:
```
/node_modules/|/\.devtools|/\.git/|/\.sass-cache|/\.hg|/\.idea|/\.svn|/\.cache|/\.project|/\.next|/Thumbs.db$|/ehthumbs.db$|/Desktop.ini$|/\$RECYCLE.BIN/
```

## O que existe no `.gitignore` raiz do CentralDark
```
node_modules/ ✅
.idea/ ✅
.vscode/ ✅ (exceto extensions.json)
__pycache__/ ✅
.venv/ ✅
venv/ ✅
dist/ ✅
dist-ssr/ ✅
*.local ✅
.cache/ ✅
.DS_Store ✅
*.log ✅
actions-runner/ ✅
bun.lock/bun.lockb ✅
yarn.lock ✅
pnpm-lock.yaml ✅
infra/guardiao/fila/*.jsonl ✅
revisoes/ ✅
quarantine/ ✅
```

## FALTANDO — Patterns Windows Específicos
| Pattern | Status | Por que importa |
|---------|--------|-----------------|
| `Thumbs.db` | ❌ | Cache de miniaturas do Windows Explorer |
| `ehthumbs.db` | ❌ | Cache de miniaturas de mídia |
| `Desktop.ini` | ❌ | Configuração de pasta personalizada do Windows |
| `$RECYCLE.BIN/` | ❌ | Lixeira do Windows (pode vazar em repos) |
| `.devtools` | ❌ | Não usado no projeto |
| `.sass-cache` | ❌ | Não usa Sass |
| `.hg` | ❌ | Não usa Mercurial |
| `.svn` | ❌ | Não usa SVN |
| `.project` | ❌ | Não usa Eclipse |
| `.next` | ❌ | Não usa Next.js na raiz |

## Veredito
**O pattern do usuário é MAIS COMPLETO para ambiente Windows.** O repo ignora lixo de build mas **não ignora lixo do Windows Explorer**. Isso beneficia — evita commit acidental de metadados do SO.

## Ação Recomendada
Patch mínimo no `.gitignore` raiz adicionando:
```
# Windows Explorer metadata
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
```

## Princípio Aplicado
- **REUSE_BEFORE_CREATE**: Estender `.gitignore` existente (owner canônico)
- **MINIMAL_DELTA**: Só adicionar o que falta, não reescrever
- **LOCAL_REALITY = JUDGE**: Medido o `.gitignore` real vs pattern proposto