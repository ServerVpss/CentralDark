---
name: centraldark-multiplexed-duplication
category: centraldark
description: "Duplicate concurrency for Zendrive, Rabbit, Hermes."
---
# CentralDark – Multiplexed Duplication

## Visão geral
Esta skill implementa a duplicação de funções e workflows, permitindo que múltiplas janelas
executem paralelamente as tarefas de Zendrive (REVIEW_ONLY), Rabbit (REVIEW_ONLY), e Hermes
(PROVA + TESTE) sem causar regressões ou escrever inadvertidamente no mesmo branch.

## Regras Chave
- **PRINCIPAL WRITER**: a primeira janela que chegar assume a função WRITER_PRIMARY; só essa pode `git add`, `commit`, `push` e `reclassificar` o PR.
- **READER**: todas as outras janelas funcionam como READER; elas coletam e reportam `delta`, mas nunca tentam escrever.
- **ZERO HACK**: nenhuma janela pode alterar HEAD já existente sem o provedor oficial chegar.
- **SINGLE WRITER**: não há mais de um escritor por escopo.
- **NÃO V1/V2/V3**: nenhuma mutação de versão de código; apenas arquivos novos ou patch.
- **DELETE OF STALE**: se um worktree/branch ficar desatualizado, remova e recrie semanticamente.

## Fluxo de Trabalho
1. **Inicialização** – `centraldark-multiplex init` preenche repositório, cria branches, e determina segmentos.
2. **Detecção de janela** – script avalia `git rev-parse --abbrev-ref HEAD` e marca a janela.
3. **Execução paralela** – cada tarefa Zendrive, Rabbit, Hermes roda em subprocesso, coletando seus próprios delta.
4. **Commit do WRITER** – apenas a janela WRITER_PRIMARY faz commit de todo o delta final depois de passar a CI.
5. **Merge** – após aprovação de *copy, *reviewer* e CI, o PR é mergeado squash e o branch fechado.

## Uso
```bash
centraldark multiplex
```
para iniciar a duplicação.

## Referências
- **Rules** – `centraldark-multiplexed-duplication/references/duplication-rules.md`
