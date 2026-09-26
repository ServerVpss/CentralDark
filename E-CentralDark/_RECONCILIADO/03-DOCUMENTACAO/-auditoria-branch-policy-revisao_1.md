# Diagnóstico de Bloqueio: Repository Rule Violations

## Causa Raiz
O repositório `clone-deck` ativou Branch Protection Rules exigindo "Changes must be made through a pull request" na `main`. Isso significa que qualquer "push direto" para `main` será bloqueado (Error GH013).

## Como Contornar de Forma Segura e Lógica
Não devo usar `git push origin main`.
Devo:
1. Criar uma nova branch local: `git checkout -b fix/docs-auto-orquestrador`.
2. Fazer push para a branch remota: `git push origin fix/docs-auto-orquestrador`.
3. Informar o usuário e deixar que a automação (ou o usuário) proceda com o PR `gh pr create` -> `gh pr merge`.

Assim obedeço à proteção sem depender de tokens vazados.
