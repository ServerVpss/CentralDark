# PR Labels Obrigatórias — Regra Canônica do CHEFE

TODO PR da CentralDark — aberto por CHEFE, Hermes, qualquer agente ou humano — DEVE receber labels existentes no repo remoto (`ServerVpss/CentralDark`). Nunca inventar nomes.

## Conjunto mínimo obrigatório
- Identificar executor: `🧠 AGENTE-HERMES` (ou label de agente aplicável: AGENTE-CODEX, AGENTE-CLAUDE, etc.)
- Categoria do delta: `✨ MELHORIA`, `🐞 BUG`, `📚 DOCS`, `🎨 FRONTEND`, etc.
- Ação da IA: `🤖 IA-EXECUTAR`, `🤖 IA-VALIDAR`, `🤖 IA-DOCUMENTAR` conforme o caso.

## PASSO OBRIGATÓRIO ANTES DE `gh pr create` / `gh pr edit`
1. `gh label list` NO REPO REMOTO → capturar nomes exatos (o repo é a fonte da verdade, não print, não Casa local)
2. Validar que cada label do conjunto existe antes de aplicar
3. Passar em `--label` comma-separated com nomes EXATOS
4. Se `not found`: confirmar repo com `gh repo view --json nameWithOwner` e PR com `gh pr view <n> --json labels` antes de concluir

## PITFALL (erro real — sessão 2026-08-26)
- PR #1191 aberto sem `--label` → ficou "None yet"
- Tentativa de corrigir com `AGENTE-HERMES,PERMITO-SEGREDO,CORREÇÃO-SEGURA,MELHORIA` falhou:
  `PERMITO-SEGREDO` e `CORREÇÃO-SEGURA` NÃO EXISTEM no remoto (vieram de print de outro contexto)
- `gh pr edit --add-label "MELHORIA"` também deu `not found` no mesmo momento →
  investigar se `gh` aponta outro repo ou se labels sumiram; não concluir sem checar `gh repo view`
- CHEFE mandou: "a imagem não te interessa, vai revisa o remoto git hub não casa" → print NUNCA é fonte de verdade

## CORREÇÃO NUNCA REPETIR
- Nunca abrir PR sem `--label` obrigatório
- Nunca usar nome de label que não veio de `gh label list` no repo remoto atual
- Nunca confiar em print/screenshot para nomes de label — remoto é autoridade
- Sempre validar repo + PR antes de aplicar etiqueta
