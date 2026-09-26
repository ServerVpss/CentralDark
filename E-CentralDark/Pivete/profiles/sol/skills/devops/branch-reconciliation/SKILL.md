---
name: branch-reconciliation
description: Resolve merge conflicts using shared remote as truth.
---

# branch-reconciliation

## Gatilho

Use quando:
- PR está `DIRTY` / `CONFLICTING` no estado de merge.
- Dois branches tocaram os mesmos arquivos e o merge falha.
- Trabalho paralelo (agentes, threads, sessões) produziu divergência que precisa de reconciliação antes de avançar.
- precisar resolver conflitos preservando intenção de ambos os lados.

Não use para:
- conflito de dependabot trivial que só precisa de rebase.
- escolha de versão que é proprietária de um lado e não há intenção real do outro de preservar.

## Fonte de verdade

Regra principal: **o remoto compartilhado é a fonte de verdade**, não o disco local de nenhuma sessão, nem conversa, nem memória.

Operacionalizações:
- Medir estado real antes de qualquer resolução: branch, HEAD, base, diff, status do PR.
- Descrever conflitos pelo que o git diz, não por suposição.
- Após resolver, provar pelo mesmo alvo/HEAD remoto.
- Registrar o que subiu e o que ficou para trás.

## Método — laço estruturado

### 1. Mapear o estado real

Coleta mínima obrigatória:
- branch alvo, HEAD, último commit.
- base do merge (`git merge-base`).
- diferença commits-para-frente e commits-trás entre branch e main.
- lista de arquivos conflitantes (`git ls-files -u`).
- estado do PR via `gh pr view` e `gh pr checks`.
- runs recentes do branch e 상태 dos checks (queued/pending/fail/skip).

Saída: um quadro curto de "o que diverge, onde, e qual a intenção de cada lado".

### 2. Descobrir conflitos antes de tentar resolver

Antes de abrir o editor ou aplicar "nossa versão":
- rode `git merge-tree <base> <nosso> <remoto>` para ver conflitos de forma segura sem alterar worktree.
- rode `git ls-files -u` para saber quais arquivos estão em conflito e quais stages representam quais lados.
- se houver diffs grandes, foque nos conflitos reais, não no ruído de diff.

Se o `merge-tree` mostrar conflitos, leia a intenção de cada lado antes de decidir.

### 3. Ler a intenção de cada lado

Para cada arquivo conflitante, entenda o que cada commit pretendia:
- nosso lado: commits do branch desde a base, diff nosso-lado-vs-base.
- lado remoto: commits da main desde a base, diff remoto-vs-base.
- ambos: diff dos dois lados vs base para ver o que cada um mudou.

Regra: não resolver pelo nome do arquivo ou pelo tamanho do diff; resolver pela intenção documentada em cada commit.

### 4. Resolver por intenção, não por "nosso lado vence"

Critérios de decisão:
- se ambos os lados fizeram a mesma correção em lugares diferentes, escolher a versão mais completa e remover a duplicata.
- se os lados editaram partes não sobrepostas do mesmo arquivo, fundir as duas mudanças.
- se um lado mudou algo que o outro dependente, manter a mudança que preserva a dependência e ajustar o restante.
- se houver ambiguidade real, não inventar; marcar como UNKNOWN e pedir decisão humana antes de commit.

Para cada arquivo, a decisão deve ser justificável por um commit existente ou por uma regra explicitamente declarada.

### 5. Aplicar a resolução

- expor os markers de conflito com `git checkout --conflict=merge <arquivo>` quando precisar ver ambos os lados no arquivo.
- escrever a versão resolvida mantendo apenas o que sobreviveu à análise.
- evitar "ours" ou "theirs" cegos; se usar um deles, deve ser uma decisão documentada, não padrão.
- se o tool de leitura de arquivos falhar no worktree (ver Referência abaixo), use `git show :2:<caminho>` e `git show :3:<caminho>` para extrair as versões dos stages.

### 6. Verificar antes de push

- diff resolvido vs base e vs cada lado para confirmar que a intenção foi preservada.
- rodar testes/CI localmente quando aplicável e quando o ambiente dispõe disso.
- garantir que o commit de resolução tem mensagem que explica o que foi mantido de cada lado e por quê.
- não pushar resoluções silenciosas sem commit explicativo.

### 7. Consolidar no remoto

- pushar a branch resolvida.
- acordar CI quando necessário: rebase/sincronização do branch para despachar workflows QUEUED, ou `gh run rerun` dos runs falhados.
- aguardar estado de merge passando e checks verdes, não assumir sucesso pelo push.
- registrar o que foi resolvido, que lados foram preservados, e o que foi deixado para trás ou marcado UNKNOWN.

## Armadilhas

### Worktree em caminho MSYS/Windows e leitores de arquivo genéricos

Em hosts Windows com worktrees em caminhos do tipo `E:/...` ou `/e/...`, alguns leitores de arquivo genéricos falham em abrir arquivos dentro do worktree mesmo quando o git relata os arquivos como presentes e conflitantes.

Sintoma:
- git mostra os arquivos conflitantes e os stages, mas o leitor de arquivo devolve "file not found" para caminhos que o git conhece.

Workaround:
- use `git show :2:<caminho>` para a versão do nosso lado no stage 2 e `git show :3:<caminho>` para a versão do lado remoto no stage 3.
- use `git checkout --conflict=merge <arquivo>` para reescrever o arquivo no worktree com os markers visíveis, quando o caminho físico for acessível.
- evite confiar em leitores de arquivo arbitrários para worktrees; preface a extração por etapas do git.

Esta armadilha vale registrar, não recomendação de ambiente. O problema é de resolução de caminho do tool, não de git.

### CI QUEUED e sincronização

Checks QUEUED/Pending frequentemente só avançam quando o GitHub despacha um novo evento de sincronização do branch.

O que funciona:
- fazer um rebase ou sincronização delgada do branch para gerar o evento.
- reexecutar runs falhados individualmente com `gh run rerun`.
- verificar `gh pr checks` e `gh run list --branch <branch>` depois da ação, não assumir imediatamente.

Não confunda "push feito" com "CI executou". O push é necessário, não suficiente.

### DIRTY / CONFLICTING bloqueia merge

State `DIRTY` ou `CONFLICTING` no PR significa que o merge ainda não está resolvido; checks verdes parciais não contornam isso.

Non tratar "alguns checks verdes" como "PR aprovado". O estado de merge é gate separado.

## Estilo de resposta

- mínimo: estado real, o que diverge, decisão tomada, prova.
- sem papagaio, sem discurso de processo.
- se a lacuna muda alvo/autorização/risco, declare e continue o que for independente.
- mensagens de progresso ao remoto, não ao usuário, exceto quando há decisão humana real pendente.

## Referências

- `references/worktree-file-access-pitfall.md` — armadilha de leitura de arquivos em worktrees Windows e-workflow de extração por stages do git.
