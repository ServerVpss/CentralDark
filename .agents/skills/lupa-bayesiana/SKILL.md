---
name: lupa-bayesiana
description: Aplicar a MetaLupa Bayesiana (camada XP consolidada) — raciocínio bayesiano, entropia, valor da informação, preservação do existente, mapa canônico, consolidação, AutoLupa, contract_digest, candidate_ref e comitês independentes — para calibrar confiança, impedir duplicações e decidir o próximo teste. Usar em auditorias, investigações, decisões arquiteturais, fusões de arquivos, incidentes, avaliações de agentes, alegações conflitantes, criação de pastas/rotas/serviços ou qualquer situação em que evidências devam alterar uma hipótese sem transformar confiança em autorização.
---

# MetaLupa Bayesiana

Transformar a sequência `mapa → evidência → crença → teste → decisão → AutoLupa → consolidação` em análise explícita, reproduzível e proporcional ao custo do erro.

MetaLupa é a evolução da mesma Lupa Bayesiana, não outra técnica concorrente. Preservar o nome canônico `lupa-bayesiana`, seus cálculos e recursos; incorporar melhorias no mesmo artefato.

## Princípios inegociáveis

1. Separar fato, inferência, suposição e desconhecido.
2. Não inventar probabilidades, likelihood ratios ou precisão estatística.
3. Tratar nome, aparência, status verde e autoridade como evidência fraca até validação.
4. Não multiplicar evidências correlacionadas como se fossem independentes.
5. Separar confiança epistemológica de permissão operacional.
6. Manter bloqueios críticos acima de qualquer posterior ou nota.
7. Escolher o teste que mais reduz incerteza por custo e risco.
8. Registrar cálculo, proveniência, sensibilidade, lacunas e próximo passo.
9. Ensinar em duas camadas: primeiro linguagem concreta e visual; depois a notação matemática equivalente.
10. Nunca usar escolaridade formal como proxy de capacidade de raciocínio.
11. Preservar e evoluir o que já existe; não criar versão, pasta, rota, serviço, regra ou documento paralelo sem provar que o encaixe canônico é impossível.
12. Subordinar autoajuste a um mapa único. Autonomia sem mapa é drift, não evolução.
13. Tratar área consolidada como bloqueada por padrão; confiança alta não desfaz trava.
14. Executar AutoLupa sobre o próprio veredito até atingir ponto fixo evidencial, sem limite artificial de iterações e sem prometer certeza absoluta.

## Gate de Mapa Único

Antes de criar, mover, renomear ou duplicar qualquer estrutura:

1. localizar a Fonte da Verdade e o mapa canônico do ambiente;
2. buscar por função, consumidores, rotas, nomes equivalentes e legado ativo;
3. tentar encaixar a mudança no componente existente de mesma responsabilidade;
4. preferir extensão pequena e compatível a novo módulo;
5. somente criar caminho novo se o encaixe existente for tecnicamente impossível ou produzir acoplamento pior;
6. nesse caso, usar nome humano, estável e coerente com a árvore, registrar responsabilidade, dependências e caminho canônico;
7. atualizar o mapa único na mesma mudança; nunca deixar a estrutura nascer antes do mapa.

Classificar o resultado:

```text
ENCAIXE_EXISTENTE | EXTENSAO_CANONICA | NOVO_CAMINHO_JUSTIFICADO | BLOQUEADO_POR_DUPLICIDADE
```

Não inferir que a estrutura “se ajeita sozinha”. Ela se ajusta automaticamente apenas dentro das rotas e responsabilidades autorizadas pelo mapa.

## Gate de Consolidação e Trava

Separar `funcionando agora` de `consolidado e protegido`. Promover uma área a `CONSOLIDADA` somente quando existirem, para o mesmo alvo e SHA:

```text
CAMINHO_CANONICO:
RESPONSABILIDADE:
TESTES:
REVISAO/FALSIFICACAO:
AUTORIZACAO_DO_PIVETE:
COMMIT_OU_MERGE_SHA:
MECANISMO_DE_TRAVA:
ROLLBACK/RECUPERACAO:
```

Depois da promoção:

- bloquear edição automática por padrão;
- exigir reconhecimento do caminho pelo mapa e pelo gate determinístico;
- não tratar `CODEOWNERS`, comentário ou emoji como trava suficiente quando não houver check obrigatório;
- permitir mudança somente por autorização aplicável ao alvo exato, com nova revisão, testes e registro;
- preservar o histórico; não apagar a consolidação anterior para esconder regressão.

Áreas ainda não consolidadas permanecem operáveis dentro da autorização vigente, mas continuam submetidas a mapa, prova, rollback e ausência de regressão.

## Camada de tradução obrigatória

Antes de apresentar qualquer equação:

1. explicar em uma frase o problema que ela resolve;
2. nomear cada entrada em linguagem comum;
3. mostrar um exemplo pequeno com números inteiros ou percentuais;
4. mostrar o caminho `antes → evidência → depois`;
5. só então exibir a fórmula;
6. encerrar dizendo o que o resultado permite concluir e o que não permite.

Quando a pessoa não quiser ou não precisar operar a fórmula, executar o calculador e explicar o resultado sem exigir manipulação algébrica. Não remover a matemática: manter a fórmula como prova auditável, com tradução ao lado.

## Fluxo obrigatório

### 1. Fixar decisão e fonte da verdade

Registrar:

```text
DECISÃO:
HIPÓTESE PRINCIPAL:
HIPÓTESES ALTERNATIVAS:
FONTE DA VERDADE:
AMBIENTE/HEAD_SHA:
CUSTO DO FALSO POSITIVO:
CUSTO DO FALSO NEGATIVO:
AUTORIDADE NECESSÁRIA:
```

Formular hipóteses que possam ser diferenciadas por observação. Se não houver teste capaz de distingui-las, marcar `NÃO TESTÁVEL NO ESCOPO`.

### 2. Definir prior sem teatro numérico

- Usar frequência histórica ou base rate quando houver.
- Usar intervalo e análise de sensibilidade quando o prior for incerto.
- Usar `0,5` apenas como cenário neutro declarado, não como fato.
- Evitar `0` e `1`: tornam a crença dogmática e impedem atualização ordinária.
- Registrar quem escolheu o prior e com qual evidência.

### 3. Construir o ledger de evidências

Para cada item, registrar:

```text
ID:
OBSERVAÇÃO:
PROVENIÊNCIA:
REPRODUZÍVEL: sim | não
PERTENCE AO MESMO ALVO/HEAD_SHA: sim | não | desconhecido
DEPENDÊNCIA/CLUSTER:
P(E|H):
P(E|¬H):
LR = P(E|H) / P(E|¬H):
BASE DO LR: empírica | estimada | ordinal
LIMITAÇÃO:
```

Somente usar LR numérico quando houver base defensável. Quando não houver, classificar ordinalmente como `favorece H`, `neutro`, `favorece ¬H` e calcular uma faixa de sensibilidade, nunca um número decorativo.

### 4. Verificar dependência

Agrupar evidências derivadas da mesma fonte, execução ou narrativa. Não multiplicar separadamente, por exemplo:

- screenshot e texto copiado do mesmo screenshot;
- teste verde e relatório que apenas repete esse teste;
- duas IAs citando a mesma resposta original;
- tamanho e nome derivados do mesmo metadado de arquivo.

Para dependências desconhecidas, calcular dois cenários:

1. **conservador:** um LR por cluster;
2. **otimista:** independência explícita.

Se a decisão mudar entre os cenários, marcar `SENSÍVEL À DEPENDÊNCIA`.

### 5. Atualizar a crença

Usar odds para múltiplas evidências:

```text
odds_prior = p / (1 - p)
odds_posterior = odds_prior × LR1 × LR2 × ... × LRn
p_posterior = odds_posterior / (1 + odds_posterior)
```

Para cálculos numéricos, executar `scripts/lupa_bayesiana.py` em vez de calcular manualmente. Ler `references/matematica-e-calibracao.md` quando houver múltiplas hipóteses, dependência, sensibilidade ou necessidade de justificar o LR.

### 6. Medir incerteza e escolher o próximo teste

Calcular entropia binária:

```text
H(p) = -p log2(p) - (1-p) log2(1-p)
```

Priorizar testes por valor esperado da informação:

```text
VOI = perda esperada antes
    - perda esperada depois do teste
    - custo total do teste
```

Incluir em `custo total`: tempo, dinheiro, risco operacional, reversibilidade, exposição de dados e custo cognitivo.

Preferir observação read-only, hash, diff, call sites, teste isolado e restauração controlada antes de mudanças no sistema. Ação que muda estado sem reduzir incerteza é aposta, não investigação.

### 7. Converter posterior em decisão sem ultrapassar autorização

Calcular o limiar teórico quando existirem custos comparáveis:

```text
p* = C_falso_positivo / (C_falso_positivo + C_falso_negativo)
```

Usar o limiar apenas como apoio. Antes de agir, aplicar gates separados:

```text
POSTERIOR SUFICIENTE?
EVIDÊNCIA REPRODUZÍVEL?
MESMO HEAD_SHA/ALVO?
SEM BLOQUEIO CRÍTICO?
ROLLBACK COMPROVADO?
AUTORIZAÇÃO PRESENTE?
```

Um posterior alto não autoriza exclusão, deploy, restart, produção, acesso sensível ou outra ação crítica.

### 8. Executar o Gate de Falsificação

Antes do veredito, responder:

1. Que observação faria a hipótese perder força?
2. Qual evidência foi procurada contra a conclusão preferida?
3. O teste distingue as hipóteses ou apenas confirma a narrativa?
4. Qual resultado produziria `BLOQUEADO`?
5. A conclusão sobrevive aos priors mínimo e máximo plausíveis?

Se não houver resposta concreta para a primeira pergunta, a hipótese está protegida contra refutação e não está pronta para decisão técnica.

### 9. Executar a AutoLupa

Revisar a própria análise como se tivesse sido produzida por outro agente:

1. procurar evidência ignorada contra o veredito;
2. verificar se o mapa canônico foi realmente lido ou apenas presumido;
3. procurar duplicação de pasta, rota, serviço, documento, regra ou método;
4. verificar se evidências correlacionadas foram contadas mais de uma vez;
5. tentar produzir um caso de regressão, rollback falho, falso verde ou SHA divergente;
6. conferir se confiança foi usada indevidamente como autorização;
7. comparar a saída com a intenção humana, interpretando falta de vocabulário pelo contexto e pelas provas, não de forma literalista;
8. atualizar o ledger e repetir somente quando surgir contradição ou evidência material nova.

Encerrar em ponto fixo quando uma nova passagem não alterar materialmente hipóteses, bloqueios, risco residual, próximo teste ou veredito. Registrar `PONTO_FIXO_ATINGIDO: sim | não`. Se não atingir, manter `CORRIGIR` ou `BLOQUEAR`; nunca forçar fechamento por contagem de rodadas.

### 10. Selecionar revisão proporcional ao ambiente

- Em desenvolvimento sem clientes, automatizar teste, revisão, fallback determinístico, correção mínima e nova tentativa dentro da autorização vigente.
- Quando houver produção real, clientes, volume ou impacto material declarado, exigir revisão adversarial independente e simultânea das superfícies críticas antes da promoção.
- IA indisponível não encerra o fluxo: usar checks e scripts determinísticos. Falha determinística impede a tentativa defeituosa e retorna para correção; não vira falso verde.
- Não prometer `100%` de certeza. Buscar evidência suficiente para o custo do erro e declarar o risco residual que não pode ser eliminado.

## Saída obrigatória

```text
VEREDITO: APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR
TRADUÇÃO DIRETA:
DECISÃO:
HIPÓTESES:
FONTE DA VERDADE:
PRIOR OU FAIXA:
EVIDÊNCIAS:
CLUSTERS/DEPENDÊNCIAS:
LRs OU CLASSIFICAÇÃO ORDINAL:
POSTERIOR OU FAIXA:
ENTROPIA ANTES/DEPOIS:
SENSIBILIDADE:
FALSIFICADOR:
PRÓXIMO TESTE:
VALOR DA INFORMAÇÃO:
CUSTO DO ERRO:
BLOQUEIOS:
AUTORIZAÇÃO:
RISCO RESIDUAL:
ENCAIXE NO MAPA:
ESTADO DE CONSOLIDAÇÃO:
MECANISMO DE TRAVA:
AUTOLUPA:
PONTO FIXO ATINGIDO:
REGISTRO:
FIO DA MISSÃO:
```

Se faltarem dados para números honestos, emitir análise qualitativa e especificar o experimento necessário. `NÃO CALCULÁVEL COM A EVIDÊNCIA ATUAL` é um resultado válido.

## Recursos

- Ler `references/matematica-e-calibracao.md` para fórmulas, dependência, sensibilidade, múltiplas hipóteses e interpretação correta.
- Ler `references/casos.md` para padrões aplicados a arquivos, agentes e mudanças críticas.
- Executar `scripts/lupa_bayesiana.py --help` para cálculos determinísticos.
- Executar `testes/test_lupa.py` para validar o motor antes de cada uso crítico.

---

## Camada XP Consolidada (evolução no mesmo artefato)

Esta seção é extensão canônica (Princípio 11 + Gate Mapa item 4). Não cria V2.

### XP-1. contract_digest (resumo de contrato operacional)

Antes de executar uma missão longa, o executor emite um digest de 1 parágrafo
reforçando o contrato: fonte da verdade, autoridade final, gates de parada,
o que NÃO é permitido nesta rodada e o veredito mínimo aceitável.
O digest não substitui o mapa; é âncora de escopo. Se o digest contradiz o
mapa canônico, o mapa vence e o digest é CORRIGIDO.

### XP-2. candidate_ref (referência de candidato canônico)

Toda skill/arquivo citado por nome deve resolver para um caminho Git real
com `blob SHA`. Se houver duas candidatas conflitantes → `BLOCKED_SKILL_IDENTITY`.
Regra da missão: cópia baixada solta (ex: `METALUPA-BAYESIANA-CANONICA.md.lnk`)
NUNCA é fonte da verdade; só o repo conectado conta. Destino local canônico
desta skill: `E:\CentralDark\Pivete\CentralDark\.agents\skills\lupa-bayesiana\`.

### XP-3. Comitês independentes

Para decisão crítica (deploy, consolidação, área protegida):
- **Executor** propõe e implementa.
- **Crítico** revisa o MESMO SHA/HEAD sem herdar o veredito; pode ser Grok,
  Gemini ou DarkAI, desde que não seja o executor.
- **Síntese** (Arquiteto) consolida divergências em veredito único.
Modelo ≠ setor. Um cérebro não vira "novo time".

### XP-4. AutoLupa registrada (ponto fixo auditável)

A AutoLupa (Fase 9) deve produzir um bloco curto no fim do relatório:
`PONTO_FIXO_ATINGIDO: sim|nao` + lista das 15 verificações respondidas
(reaproveitar existente / duplicação / EF na VPS / demo como real / secret /
provider vs rota / sobrevive troca modelo / relatório sem chat / autossep /
crítico mesmo SHA / branch só escopo / rollback / PR evidências / autoridade
Pivete / contradição fechada). Sem o bloco, veredito não sela.

### XP-5. Matriz de existência de recursos

| Recurso | Caminho | Estado |
|---|---|---|
| script cálculo | `scripts/lupa_bayesiana.py` | CRIADO |
| ref math | `references/matematica-e-calibracao.md` | CRIADO |
| ref casos | `references/casos.md` | CRIADO |
| testes | `testes/test_lupa.py` | CRIADO (7/7) |

### XP-6. Versionamento implícito

Esta skill não usa semver. Maturidade = geração MetaLupa (pós-Lupa v1).
Toda evolução é correção mínima neste arquivo + recursos citados, nunca
novo arquivo paralelo. Blob atual de referência: `b71af825` (base recuperada).

