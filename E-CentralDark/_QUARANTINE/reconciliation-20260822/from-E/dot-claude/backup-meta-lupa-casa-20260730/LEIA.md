# Backup — versões da Casa dos 2 arquivos meta-lupa (30/07/2026)

## O que é isto

Ao sincronizar o clone da Casa (`E:\CentralDark\Pivete\CentralDark`) com a
`origin/main`, estes 2 arquivos tinham modificações locais que conflitaram
com a versão do GitHub. As cópias da Casa foram salvas aqui antes de aceitar
a versão da fonte da verdade.

- `uso-ledger.jsonl`               — versão da Casa: 19 linhas (GitHub: 54)
- `test_autolupa_conformance.py`   — versão da Casa: 96 linhas (GitHub: 102)

Em ambos os casos a versão do GitHub é MAIOR e mais recente. A da Casa era
uma edição local sobre uma base antiga.

## ERRATA — correção de um erro de diagnóstico

A primeira versão deste arquivo afirmava que os 2 arquivos tinham sido
DELETADOS em `origin/main`. **Isso era falso.** A verificação
(`git cat-file -e origin/main:<path>`) produziu um falso negativo enquanto a
árvore estava em estado de conflito de merge.

Confirmado depois por `git ls-tree HEAD`, que lista os dois blobs
explicitamente:

```
100644 blob dddb86eb...  .agents/skills/meta-lupa/references/uso-ledger.jsonl
100644 blob 43c04dce...  .agents/skills/meta-lupa/testes/test_autolupa_conformance.py
```

Agindo sobre o diagnóstico errado, os 2 arquivos foram apagados do disco do
clone. Foram restaurados na sequência com `git checkout HEAD --`, e a
identidade foi verificada por hash — `git hash-object` do disco bate
exatamente com o blob do HEAD nos dois casos.

**Lição:** não confiar em resultado negativo de `git cat-file`/`git show`
enquanto o índice está em conflito. Confirmar com `git ls-tree`, que lê a
árvore do commit direto.

## Rede de segurança adicional

`git stash@{0}` no clone, com a mensagem
`casa-antes-do-sync-20260730 (meta-lupa ledger+teste)`.

Se nada aqui for útil em 30 dias, pode apagar a pasta.
