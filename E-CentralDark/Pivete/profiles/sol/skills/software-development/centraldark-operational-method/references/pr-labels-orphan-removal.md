# PR Labels — Remoção de labels órfãs / inválidas

Todo PR em `ServerVpss/CentralDark` DEVE ter apenas labels que **existem no remoto**.
Outro executor (ou sessão) pode deixar labels que não existem no repo — elas quebram o
padrão canônico e podem falhar silenciosamente em `gh pr edit --add-label`.

## Sintoma
`gh pr view N --json labels` mostra labels como `🤖 IA-EXECUTAR`, `🤖 IA-VALIDAR`,
`BOT-XXX` etc. que NÃO aparecem em `gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'`.

## Passo 1 — listar labels válidas do remoto (nome EXATO com emoji)
```bash
gh api repos/ServerVpss/CentralDark/labels --jq '.[].name'
```
Nunca usar `gh label list` para isso: ele mente (mostra sem emoji e pode omitir).

## Passo 2 — confirmar se uma label suspeita existe
```bash
gh api repos/ServerVpss/CentralDark/labels --jq '.[] | select(.name | test("IA-EXECUTAR|IA-VALIDAR")) | .name'
# vazio = não existe no remoto → é órfã, remover
```

## Passo 3 — remover labels órfãs
`gh pr edit --remove-label` aceita **APENAS 1 label por chamada**. Não passar duas de uma vez.
```bash
gh pr edit 1203 --remove-label "🤖 IA-EXECUTAR"
gh pr edit 1203 --remove-label "🤖 IA-VALIDAR"
```

## Passo 4 — garantir o padrão canônico obrigatório
Todo PR precisa:
- `👑 PERMITO-SEGREDO`  (autorização humana canônica)
- `🧠 AGENTE-HERMES`    (executor PIVETE/Hermes)
- + 1 categoria válida existente no remoto (ex: `✨ MELHORIA`, `dependencies`, `🔧 SELF-HEAL`, `🛠️ INFRA`, `🐞 BUG`, `🔐 SEGURANÇA`)

Adicionar categoria que falta:
```bash
gh pr edit 1203 --add-label "dependencies"
```

## Verificação final
```bash
gh pr view 1203 --json labels --jq '.labels[].name'
# deve mostrar só labels que existem no remoto, com as 2 obrigatórias + categoria
```

## Pitfall
- `gh pr edit --remove-label A B` → erro "accepts at most 1 arg(s), received 2". Chamar uma vez por label.
- Label com emoji digitada errado → `gh` ignora ou cria órfã dependendo do subcomando. Sempre copiar o nome EXATO do `gh api`.
- Não assumir que label vista em `gh pr view` existe no remoto: outro executor pode ter criado local/órfã.
