# Veredicto de conteúdo vs missão — checar se o envelope entrega a missão ou só documenta

## Quando usar
Quandao se recebe uma missão longa, descritiva, com formato imposto e toda a arquitetura no enunciado, e há um envelope existente (PR, branch, commit, arquivo, worktree, item de tarefa) que aparentemente é dele.

Regra de ouro:
> Envelope existente != missão entregue.
> Commit/missão/diff tem que entregar a missão, não somente 문서는 ou inventário dela.

## Sinais de que o envelope não é a missão
- O commit existe e é legítimo, mas o diff medido é inventário, relatório, documento, canvas, nota, painel — e não transforma o contrato/porta/gate/área que a missão pediu.
- O PR tem title, labels e branch coerentes com a missão, mas o commit dentro dele não altera o que a missão pede.
- O PR afirma "tocou tudo" e ao medir os files o diff é menor do que a missão afirma.
- Há múltiplos PRs na mesma área e o envelope mais recente é o sobrevivente, mas o vível ainda não carrega o diff que a missão pediu.

## Verificação mínima
1. Medir o envolvope real (PR/branch/commit/arquivo).
   - PR: `gh pr view N --json files,commits,headRefName,baseRefName,headSha`
   - branch/commit: `git log --oneline`, `git diff origin/main...HEAD`, `git diff --name-only`
2. Ler o diff em termos de **o que foi alterado**, não em termos de o que a missão disse.
   - lista de arquivos
   - adições/remoções
   - hashes dos blobs afetados
3. Comparar o que foi alterado com o que a missão pediu.
   - Se a missão pede transformação de contrato A → B e o diff mostra inventário de C, o envelope não entrega a missão.
4. Se o envelope existe mas não entrega a missão, a decisão é:
   - rebasear/refixar o envelope com commits que entregam a missão, OU
   - abrir envelope novo com o diff certo, OU
   - informar que o envelope atual não é o ponto de entrega e aguardar direção/escopo.

## Anti-padrões observados
- Tratar PR aberto como prova de que a missão está sendo entregue.
- Tratar commit existente como confirmação de que o diff couberia na missão.
- Declarar PR "no caminho" porque ele existe e tem algo relacionado.
- Sumarizar a missão no chat e não medir o diff — isso é papagaio, não verificação.

## Regra de ouro
```
MISSÃO LONGA + ENVELOPE EXISTENTE
→ MEDIR O DIFF
→ SE O DIFF != A MISSÃO, NÃO DECLARAR "JÁ TÁ SENDO FEITO"
→ APONTAR QUE O ENVELOPE NÃO ENTREGA A MISSÃO
→ NÃO CRIAR SEGUNDO ENVELOPE SEM MEDIR GAP REAL
```

## Exemplo narrado (2026-08-29)
Missão: transformar o padrão de resposta atual em contrato global + gate de runtime obrigatório.

Envelope medido: PR #1369, branch `reconciliacao/casa-20260829-consolidacao`, 1 commit, 3 arquivos em `docs/BRAIN/*.canvas`, tudo add-only.

Conclusão medida: o envelope é inventário de canvas de brain, não é o commit que estende o contrato de resposta nem adiciona gate. Declarar "a missão tá sendo tratada pelo PR" seria afirmação não comprovada; a verificação mostra o contrário.

## Regra de não repetiçao
Se o gap já foi reportado e o CHEFE já rejeitou aberir um novo envelope ou já aprovou continuar no existente, não repetir a mesma observação. A observação vale até a decisão ser aplicada e comprovada pelo diff.

## Veredito
Use esse checado sempre que a missão for longa/estrutural e houver um envolvope que aparentemente a carrega. Medir o que foi alterado, não o que foi prometido.
