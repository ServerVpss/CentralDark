---
# Duplication Rules

> **Princípio**
> Funções que pertencem a Zendrive, Rabbit e Hermes não devem coexistir em diversas janelas sem um guardião de escritor.
>
## Decisão de Escrita
- A primeira janela que recebe escrita torna‑se *WRITER_PRIMARY*.
- Se outra janela tentar escrever, a operação é **cancelada** e a mensagem `Você já tem um escritor. Use a janela WRITER_PRIMARY` é devolvida.

## Zero‑Regressão
- Nenhum arquivo já no estado final (commit final) pode ser alterado por escritora não-primária.
- Alterações em arquivos já *committed* são detectadas com `git diff HEAD` e bloqueadas.

## Remoção de Worktrees Antigos
- Use `git worktree remove <path>` no projeto *CentralDark* para descartar worktrees antigos que não são mais válidos.

## Identificação de Janelas
- Execute `centraldark multiplex` e ele verifica `git rev-parse --abbrev-ref HEAD`.
  - Se a referência não existir, cria um novo branch `multij_{timestamp}`.
  - Se já existir, marca como READER.

## Uso de Concurrency
- O script `centraldark_multiplex.sh` (vinculado na skill) spawna subprocessos (`python -m multiprocessing`) para cada serviço.
- Cada sub‑processo grava `delta_{serviço}.txt` e, somente se ocorrerem ✅ CIs, dispara o commit.

## Ritmo de Mensagens
- Logs de progressão são mantidos em `centraldark_multiplex.log`.
- Pós‑merge, a skill exibe `PR#1425 mergeado. Branch criado: main`.

---