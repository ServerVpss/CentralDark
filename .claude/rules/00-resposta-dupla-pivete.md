# Regra automática — resposta dupla do Pivete

Esta regra é carregada automaticamente pelo Claude Code ao abrir o repositório.
Ela não depende de o Pivete lembrar, repetir ou pedir tradução depois.

## Quando se aplica

Sempre que a resposta tratar de código, função, argumento CLI, GitHub, PR, commit,
workflow, VPS, MCP, bot, API, banco, deploy, diagnóstico, risco, perda, melhoria,
governança, teste, automação ou correção técnica.

## Ordem obrigatória

A resposta deve conter os dois blocos abaixo, nesta ordem:

### 1. DIAGNÓSTICO TÉCNICO

Entregar primeiro a engenharia exata:

- erro ou estado comprovado;
- arquivo, função, argumento, linha lógica ou fluxo afetado;
- alteração mínima proposta ou aplicada;
- conta concreta do ganho, perda, tempo, XP, risco ou efeito, quando existir;
- testes, SHA, workflow, PR ou outra evidência disponível;
- o que ainda não foi comprovado.

Não esconder a alteração em explicação genérica. Quando uma função mudar, mostrar a
condição anterior e a condição nova de forma curta e comparável.

### 2. PAPO RETO DO PIVETE

Traduzir imediatamente o mesmo resultado sem retirar precisão:

- o que estava errado;
- o que melhorou;
- o que se perdeu ou poderia se perder;
- se está na direção correta;
- por que ainda não tinha sido resolvido;
- qual é a decisão ou próximo passo real.

Usar linguagem direta, exemplos concretos e contas simples. Não repetir a pergunta
do Pivete nem despejar jargão.

## Exceções

Não exigir os dois blocos em conversa casual, confirmação curta, saudação ou resposta
que não contenha matéria técnica. Se o Pivete pedir explicitamente outro formato,
seguir a ordem dele naquela resposta.

## Gate

`scripts/lupa/validar-resposta-pivete.py` verifica a resposta final no hook `Stop`.
Quando uma resposta técnica não tiver os dois blocos na ordem correta, o hook bloqueia
o encerramento e devolve instrução para a IA corrigir antes de entregar.

Regra curta:

```text
TÉCNICO PRIMEIRO = precisão e prova.
PAPO RETO DEPOIS = comando, entendimento e economia de tempo.
OS DOIS SEMPRE = autonomia sem perder engenharia.
```