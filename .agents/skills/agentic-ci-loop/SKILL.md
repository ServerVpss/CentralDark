---
name: agentic-ci-loop
description: Use whenever a PR, CI/CD check, test, review, automation, progress percentage, or failed gate is involved. Calibrate the exact GitHub state, compute only the remaining delta, read the failed check directly from the PR, repair the root cause, add a regression test, publish to the same branch, and let deterministic CI decide. Report progress in direct Pivete language with an auditable percentage.
trigger: /agentic-ci-loop
---

# Agentic CI Loop — cirurgia, prova e cicatriz

## Autoridade e encaixe

- `SEGREDO/CHEFE` define intenção, limite e autorização humana final.
- A IA investiga, escolhe a cirurgia e escreve apenas no escopo autorizado.
- O CI/CD decide deterministicamente se os gates objetivos passaram.
- Meta Lupa e Judge independente tentam falsificar a conclusão.
- Fable pode organizar o loop quando estiver disponível, mas não substitui a Meta Lupa nem o CI.
- Nome de modelo não concede autoridade.

## Quando iniciar

Use esta skill em qualquer situação com:

- PR, commit, branch ou workflow;
- check vermelho, teste falhando, lint, build ou segurança;
- CodeRabbit, Codex ou Judge;
- pedido de porcentagem, situação geral ou pendências;
- automação que deve continuar sem o CHEFE transportar logs manualmente.

## Boot mínimo

1. Execute `!CALIBRAR` uma vez no início da sessão, handoff, retomada ou drift.
2. Meça o GitHub remoto e identifique PR, branch, HEAD, Writer, checks, reviews e próximo gate.
3. Calcule `DELTA = necessário - já comprovado`.
4. Mesma sessão, mesmo HEAD, mesmo Writer e sem drift: não recalibre tudo; execute somente o delta.
5. Nunca trate `UNKNOWN`, `SKIPPED`, `PENDING`, timeout ou silêncio como `PASS`.

## Loop obrigatório

```text
PR RECEBE A MUDANÇA
→ CI/CD EXECUTA GATES DETERMINÍSTICOS
→ FALHA FICA PRESA AO HEAD EXATO
→ AGENTE LÊ O CHECK E O LOG DIRETAMENTE NO GITHUB
→ REPRODUZ A CAUSA
→ CORRIGE O MENOR PONTO CAUSAL
→ CRIA TESTE DE REGRESSÃO
→ EXECUTA TESTE LOCAL FRESCO
→ PUBLICA NA MESMA BRANCH
→ CI/CD RODA NOVAMENTE
→ JUDGE TENTA QUEBRAR
→ CICATRIZ FECHADA SOMENTE COM PROVA
```

O CHEFE não deve copiar erro de uma tela para outra quando o agente possui acesso ao PR e aos logs.

## Regra da cicatriz

Um erro só está fechado quando existem, no mesmo fio:

1. erro e HEAD exatos;
2. causa raiz reproduzida;
3. correção mínima;
4. teste que falha antes e passa depois;
5. CI fresco no novo HEAD;
6. Judge independente quando exigido;
7. receipt ou registro que aponta para a prova.

Não apagar a história. Limpar apenas scratchpads, cópias duplicadas e logs transitórios depois de consolidar a prova.

## Porcentagem obrigatória e honesta

Toda resposta de progresso deve declarar a lista completa de gates usados no cálculo.

Pontuação padrão:

- `PASS` = 100 pontos;
- `PARTIAL` = 50 pontos, somente com prova parcial explícita;
- `FAIL`, `BLOCKED`, `PENDING`, `UNKNOWN`, `SKIPPED`, `TIMEOUT` = 0 pontos.

```text
PROGRESSO = soma_dos_pontos / (quantidade_de_gates × 100) × 100
```

Não esconder gate para aumentar a porcentagem. Não usar “quase pronto” sem numerador, denominador e pendências visíveis.

## Saída obrigatória no Jeito Pivete

Comece pelo que importa, sem jargão solto:

```text
SITUAÇÃO=
PROGRESSO_GERAL=<n>% (<pontos>/<total>)
O_QUE_JÁ_FECHOU=
O_QUE_FALHOU=
CAUSA=
CIRURGIA=
TESTE_DA_CICATRIZ=
CI_NO_HEAD_ATUAL=
PENDÊNCIAS_BLOQUEANTES=
PENDÊNCIAS_NÃO_BLOQUEANTES=
PRÓXIMO_MOVIMENTO=
O_QUE_O_CHEFE_PRECISA_FAZER=NADA_AGORA|ação humana exata
```

Depois, quando necessário, informe os nomes técnicos entre parênteses.

## Falha de CI

Ao encontrar check vermelho:

1. leia o job e o step que falharam;
2. extraia somente a mensagem útil e o HEAD;
3. reproduza localmente com o mesmo comando;
4. diferencie defeito do produto, teste, fixture, runner ou workflow;
5. nunca desative regra, pule teste ou reexecute cegamente;
6. corrija a causa e adicione regressão;
7. publique e deixe o CI decidir novamente.

## Stop gates

Sem autorização aplicável ao alvo exato, pare antes de:

- merge ou Ready for Review;
- deploy, restart ou produção;
- alteração direta na `main`;
- exclusão, force-push ou limpeza de evidência;
- promoção baseada somente no relato do Writer.

## Relação com Fable e Meta Lupa

Quando `/fable:fable-loop` estiver realmente disponível, use-o para organizar fases e paralelismo útil. Se estiver indisponível, use este contrato determinístico sem fingir que a skill rodou.

A ordem final permanece:

```text
FABLE ORGANIZA (opcional)
→ WRITER CORRIGE
→ TESTES PROVAM
→ META LUPA/JUDGE REFUTAM
→ CI/CD DECIDE O GATE OBJETIVO
→ CHEFE DECIDE AÇÃO HUMANA CRÍTICA
```
