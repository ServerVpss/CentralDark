---
title: "Refatoração crítica — zero regressão"
status: "CANDIDATO_CANONICO"
scope: "Componentes críticos e mudanças de comportamento de alto risco"
---

# Refatoração crítica — zero regressão

## Entrada

Use quando a tarefa mencionar componente crítico, autenticação, pagamento, dados, infraestrutura, workflow, gate, roteamento, memória, produção ou refatoração sem mudança intencional de comportamento.

## Contrato

`ZERO_REGRESSÃO` não é promessa absoluta. É um gate operacional: nenhuma regressão conhecida nos comportamentos inventariados, testes de caracterização, negativos, limites, integração e CI do HEAD exato. Lacunas ficam explícitas.

## Fase 0 — congelar alvo

```text
REPOSITÓRIO=
BRANCH=
HEAD=
COMPONENTE=
CONSUMIDORES=
WRITER=
JUDGE=
ROLLBACK=
```

Sem HEAD e escopo, não escrever.

## Fase 1 — baseline

1. Ler implementação, testes, chamadas, contratos e histórico relevante.
2. Executar testes atuais antes da mudança.
3. Capturar comportamento público, erros, performance e side effects aplicáveis.
4. Criar teste de caracterização quando comportamento existente não estiver coberto.
5. Separar dívida preexistente de regressão nova.

## Fase 2 — hipótese

Definir uma causa falsificável e o menor teste que distingue as hipóteses. Não editar aleatoriamente.

## Fase 3 — vermelho

Para bug: criar teste que reproduz a falha no código anterior.

Para refatoração sem bug: criar/confirmar testes de caracterização que congelam o contrato externo.

Se o teste passa igualmente antes e depois, ele não prova a mudança.

## Fase 4 — cirurgia

- menor diff causal;
- sem renomeação ou limpeza paralela;
- sem nova arquitetura se extensão existente resolve;
- sem trocar contrato externo por conveniência interna;
- sem bypass de gate.

## Fase 5 — matriz de prova

```text
POSITIVO=
NEGATIVO=
LIMITE=
ERRO=
INTEGRAÇÃO=
COMPATIBILIDADE=
SEGURANÇA=
PERFORMANCE=
ROLLBACK=
```

Execute somente itens aplicáveis, mas declare os não aplicáveis com motivo.

## Fase 6 — CI e Judge

O mesmo HEAD deve ter:

- suíte local fresca;
- lint/format/typecheck/build aplicáveis;
- CI remoto;
- recibo fresco e válido da Meta Lupa;
- revisão adversarial independente;
- nenhum finding P0/P1 aberto;
- rollback executável ou restauração comprovada.

## Cicatriz

Todo defeito fechado deixa:

```text
DEFECT_ID=
TESTE_QUE_FALHA_ANTES=
TESTE_QUE_PASSA_DEPOIS=
CAUSA_RAIZ=
ARQUIVO_CORRIGIDO=
HEAD_CORRIGIDO=
CI=
RISCO_RESIDUAL=
```

Sem cicatriz, o sistema pode repetir o erro e a escola não aprendeu.

## Saída

Este módulo **não define formato de saída próprio**. Registre os dados específicos da cicatriz nos campos `DIAGNÓSTICO TÉCNICO E CICATRIZ`, `PROVA`, `GATES_MEDIDOS_JSON` e `PRÓXIMO GATE` da fonte única:

```text
.agents/skills/agentic-ci-loop/references/CONTRATO-UNIFICADO-RELATO-PIVETE.md
```

Qualquer bloco `Saída obrigatória` diferente do contrato unificado é uma definição concorrente e deve deixar a escola vermelha.
