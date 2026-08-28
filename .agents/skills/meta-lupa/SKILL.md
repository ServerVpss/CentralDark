---
name: meta-lupa
description: Aplicar a META LUPA com três temperaturas operacionais — FRIA, MÉDIA e QUENTE — preservando Bayes, entropia, valor da informação, mapa canônico, AutoLupa, contract_digest, candidate_ref, comitês independentes, registro auditável e autorização humana. Usar em auditorias, investigações, debugging multimodal, decisões arquiteturais, incidentes, avaliações de agentes, alegações conflitantes ou situações em que evidência deva alterar uma hipótese sem transformar confiança em autorização.
---

# META LUPA

Transformar a sequência `mapa → evidência → crença → teste → decisão → AutoLupa → consolidação` em análise explícita, reproduzível e proporcional ao custo do erro.

META LUPA é a evolução do mesmo artefato e mantém o motor bayesiano. FRIA, MÉDIA e QUENTE são modos internos, não skills concorrentes.

## Invariante de falsificação

Uma alegação de sucesso apoiada apenas por painel verde, status `Scheduled`, HTTP 200, ausência de erro ou listagem de recurso é evidência insuficiente do funcionamento ponta a ponta.

Nesse caso, a saída obrigatória é `VEREDITO=BLOQUEAR` (ou `CORRIGIR` quando o formato não admitir bloqueio), `FALSO_VERDE_BLOQUEADO=SIM`, e uma prova contrária ou próximo teste concreto. É proibido combinar `VEREDITO=APROVAR/APROVADA` com evidência insuficiente. Se isso ocorrer, a própria saída é inválida e a AutoLupa deve corrigi-la antes de responder.

### Falso verde de instrumento

O instrumento que observa também mente. Um resultado vazio, um `404` ou um
"nenhuma ocorrência" descrevem **o que a ferramenta devolveu**, não o que
existe no sistema. Antes de concluir ausência, identificar se a ferramenta
tem allowlist, filtro de caminho sensível, escopo padrão, paginação ou índice
defasado — e repetir a busca por um segundo canal independente.

Regra: **ausência de resultado em um instrumento não é evidência de ausência
no sistema.** Só vale como prova quando dois canais de proveniência distinta
concordarem.

### Falso verde de versionamento

Casos em que o Git aparenta saúde e esconde o defeito. Cada linha traz o
teste que efetivamente separa as hipóteses:

| Aparência | O que pode estar por trás | Teste que resolve |
|---|---|---|
| `git status` limpo | gitlink órfão: submódulo sem `.gitmodules` apontando para commit inexistente — a pasta chega vazia em todo clone | `git ls-tree <ref> <caminho>`; modo `160000` é gitlink, `100644` é arquivo |
| blob local igual ao da ref remota | a ref remota é cache local, podendo estar defasada ou já deletada no servidor | `git ls-remote origin <branch>`; ou `git fetch` e reler |
| merge sem conflito, `exit=0` | conteúdo de um dos lados descartado silenciosamente | `git diff <merge-base> <outro-lado> -- <arquivo>`; se vazio, aquele lado nada trouxe |
| verificação passa no código novo | a checagem podia já falhar antes — não mede regressão | rodar a **mesma** checagem no código original e comparar contagem e identidade dos erros |
| arquivo existe no disco | pode não estar versionado nem alcançável por outros | checkout limpo em worktree detached e contagem dos arquivos entregues |

Regra: para provar que algo está versionado, medir **o que um checkout limpo
entrega** — não o que a árvore de trabalho exibe.

### Falso verde de conflito resolvido

Quando um PR aparece sem conflito após `resolve-conflicts.sh` mas o GitHub
ainda marca `CONFLICTING`, o branch remoto do PR precisa de um commit de
sincronia (`git merge --no-ff origin/main` + `git push --force-with-lease`)
antes do squash. `NO_CONFLICT` no script local NÃO prova que o PR remoto está
alinhado. O padrão único e determinístico de resolução de conflito da Casa
está em `.agents/skills/git-conflict-resolve-house-standard/SKILL.md` — não
criar segundo padrão, não V2/V3. Padrão se adapta à realidade atual (main
fresca), nunca congela.

## Três temperaturas operacionais

### FRIA — provar o que aconteceu

Use para R0/R1 e fatos locais. Separe SIM/NÃO, antes/depois, mudou/não mudou. Não explique mecanismo invisível.

Saída mínima: `MODO=FRIA`, fato, resultado, prova e lacuna.

### MÉDIA — localizar por que aconteceu

Ative em 401, 404, 429, timeout, contradição, evidência fraca, drift, falso verde ou R2. Formule hipóteses distinguíveis, mude uma variável por vez, use o canal correto, busque prova contrária e capture o delta do runtime.

Saída mínima: `MODO=MEDIA`, hipótese, variável alterada, canal, resultado binário, delta, prova contrária e camada localizada.

### QUENTE — tornar o achado repetível

Ative em R3/R4, produção, autenticação, dados, merge, alteração da própria skill, recorrência ou CAÇA_AO_ERRO. Fixe alvo e SHA; combine tela, log, processo e ação; use revisão adversarial; execute positivo, negativo, limite e rollback; valide autorização; registre BEGIN/FINAL e AutoLupa.

Saída mínima: `MODO=QUENTE`, contratos, observadores, testes, rollback, registro, autorização e ponto fixo.

Escalonamento: comece FRIA; contradição escala para MÉDIA; criticidade, recorrência ou promoção escala para QUENTE; ponto fixo resfria e encerra.

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
15. Nenhuma promessa de alinhamento, aprendizado ou comportamento permanente pode exceder a capacidade observável do agente. Sem mecanismo persistente comprovado, rebaixar `sempre`, `nunca mais`, `garanto`, `não repetirei` ou equivalente para uma alegação testável no escopo atual.
15. Tratar confronto útil como fonte de informação: sobreviver, cair ou permanecer UNKNOWN só vira aprendizado quando existe evidência nova e delta reutilizável de crença/regra/teste.

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
AUTORIZACAO_DO_SEGREDO_CHEFE:
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

Para cálculos e gates determinísticos, executar `scripts/meta_lupa.py`. Ler `references/matematica-e-calibracao.md` quando houver múltiplas hipóteses, dependência, sensibilidade ou necessidade de justificar o LR.

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

### 9.1 Converter confronto em ouro informacional

Confronto não é pontuação de ego. O ativo é o **ganho de informação** produzido pela diferença entre crença anterior e evidência nova.

```text
CONFRONTO
→ EVIDENCIA NOVA
→ DELTA_DE_CRENCA
→ CONSEQUENCIA REUTILIZAVEL
→ OURO
```

Classificar cada confronto material:

```text
HIPOTESE_SOBREVIVE + PROVA_NOVA       = OURO
HIPOTESE_CAI + CONTRAPROVA            = OURO
EMPATE + UNKNOWN_MELHOR_DEFINIDO      = OURO
AUTOFALSIFICACAO + FRAQUEZA_CORRIGIDA = OURO
REVISAO_EXTERNA + ACHADO_CAUSAL       = OURO
```

Só promover o aprendizado quando:

```text
EVIDENCIA_NOVA=SIM
DELTA_DE_CRENCA_OU_REGRA=SIM
REUTILIZAVEL=SIM
```

Se não houver informação nova nem mudança reutilizável, não abrir novo ciclo ornamental:

```text
MESMO_ERRO + MESMA_DISCUSSÃO + ZERO_INFORMACAO_NOVA + ZERO_MUDANCA
→ DESPERDICIO_DE_CICLO
```

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

## Gate operacional obrigatorio

Qualquer operacao que altere, promova ou declare estado do repositorio deve
carregar esta META LUPA e apresentar um recibo fresco, amarrado ao HEAD e a
identidade canonica da arvore. A prova minima e:

```text
META_LUPA_LOADED=SIM
META_LUPA_CANONICAL_SHA=<tree SHA de .agents/skills/meta-lupa>
META_LUPA_RECEIPT_VALID=SIM
META_LUPA_USAGE_ID=<usage_id deterministico>
META_LUPA_GATE=PASS
```

O gate executavel vive no motor existente, sem criar outra Lupa:

```text
python .agents/skills/meta-lupa/scripts/meta_lupa.py issue-gate-receipt \
  --repo-root . --repo ServerVpss/CentralDark --mission-id <id> \
  --workspace-head <HEAD> --output <TEMP>/meta-lupa-gate.json
python .agents/skills/meta-lupa/scripts/meta_lupa.py gate \
  --repo-root . --input <TEMP>/meta-lupa-gate.json --operation <operacao>
```

O recibo e rejeitado quando falta carregamento, SHA/skill divergente, HEAD
divergente, `usage_id` incorreto, hash do recibo invalido ou idade acima de
15 minutos. Operacoes, workflows e declaracoes verdes devem tratar qualquer
falha como `STATUS=BLOCKED`; uma declaracao verde sem recibo recebe
`REASON=BLOCKED_FALSE_GREEN`. A ausencia de branch protection auditavel no
GitHub nao autoriza relaxar este gate local ou no CI.

## Recursos

- Ler `references/matematica-e-calibracao.md` para fórmulas, dependência, sensibilidade, múltiplas hipóteses e interpretação correta.
- Ler `references/casos.md` para padrões aplicados a arquivos, agentes e mudanças críticas.
- Executar `scripts/meta_lupa.py --help` para cálculos e gates determinísticos.
- Executar `testes/test_lupa.py` para validar o motor antes de cada uso crítico.

## Modo ULTRA + META LUPA e evolução contínua

`ULTRA + META LUPA` é um modo interno da skill única. Ele combina as três
temperaturas, prova contrária, antes/depois, delta de runtime, regressão,
AutoLupa e revisão até ponto fixo. Não cria outra skill, versão ou ledger.

Toda execução abre `BEGIN` e encerra `FINAL` no ledger canônico
`references/uso-ledger.jsonl`. O `FINAL` deve registrar missão, HEAD, modo,
gatilhos, risco, erro, causa raiz, prova contrária, teste/regressão, falso
verde, guardrail, rollback, melhorias, risco residual, arquivos, hash de
evidência, XP, nível, tier, ponto fixo e veredito.

XP só é concedido a fatos comprovados e declarados por `--achievement`:

```text
erro_reproduzido=5
causa_raiz_provada=10
prova_contraria_encontrada=10
falso_verde_bloqueado=20
teste_negativo_criado=15
regressao_criada=20
guardrail_novo=20
rollback_provado=20
risco_critico_evitado=30
duplicacao_real_removida=15
ponto_fixo_atingido=25
```

Penalidades explícitas usam `--penalty`: `falso_verde_declarado=-25`,
`evidencia_inventada=-50`, `ledger_orfao=-15`, `sucesso_sem_teste=-10` e
`alteracao_sem_autorizacao=-30`. O total nunca fica abaixo de zero.

O fingerprint determinístico é SHA-256 de `MISSION_ID + causa raiz + teste +
evidência + HEAD_SHA`. Se já existir em um `FINAL`, `XP_GAINED=0` e
`NO_XP_REASON=EVENTO_JA_REGISTRADO`. Tempo ligado, texto, número de agentes,
repetição, HTTP 200 ou painel verde não geram XP.

O custo do próximo nível é `ceil(100 * 1.15^(LEVEL - 1))`; o cálculo consome
sucessivamente cada limiar e permite múltiplos níveis no mesmo evento. Tiers:
níveis 1-9 `OPACA`, 10-29 `MONOCULO`, 30-49 `PRISMATICA`, 50+
`OMNIVISOR`. A AutoLupa deve validar cálculo, deduplicação, BEGIN/FINAL e
proveniência antes de selar o recibo.

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
desta skill: `.agents/skills/meta-lupa/`.

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
SEGREDO/CHEFE / contradição fechada). Sem o bloco, veredito não sela.

### XP-5. Matriz de existência de recursos

| Recurso | Caminho | Estado |
|---|---|---|
| motor 3T e cálculo | `scripts/meta_lupa.py` | PRESENTE |
| guardrail | `guardrails/validar_meta_lupa.py` | PRESENTE |
| política | `approvals/politica.json` | PRESENTE |
| regressão 3T | `testes/test_meta_lupa_3t.py` | PRESENTE |
| ref math | `references/matematica-e-calibracao.md` | CRIADO |
| ref casos | `references/casos.md` | CRIADO |
| testes | `testes/test_lupa.py` | CRIADO (7/7) |

### XP-6. Versionamento implícito

Esta skill não usa semver. Maturidade = geração MetaLupa (pós-Lupa v1).
Toda evolução é correção mínima neste arquivo + recursos citados, nunca
novo arquivo paralelo. Blob atual de referência: `b71af825` (base recuperada).

## Guardrails de evidência experimental (Opus 5, 2026-07-28)

O ganho replicado de Opus 5 + Meta Lupa só pode ser promovido quando cada
execução apresenta recibo verificável: processo iniciado, PID observado,
processo encerrado com `exit_code=0`, log novo com SHA, stream completo,
recibo final, hashes de fixture e prompt, testes antes/depois no diretório
correto e `MODEL_ACTUAL` comprovado pelo stream real. Modelo solicitado nunca
substitui prova do modelo efetivamente usado; fallback silencioso é rejeitado.

Contagens de caracteres ficam separadas de tokens. `OUTPUT_CHARS` não é
`TOKEN_USAGE`; tokens só podem ser preenchidos por `modelUsage` real e, na
ausência dessa fonte, permanecem `UNKNOWN`. JSON primitivo, stream parcial,
log antigo, timeout, fixture contaminada, recibo incompleto, `exit 0` sem
execução e denominador que confunde falhas com testes são inválidos.

O denominador do laboratório congelado é `SEEDED_FAILURES_TOTAL=4` e
`TESTS_TOTAL=5`. O resultado é pontuado por ação correta e oráculo
independente, preservando módulos corretos e distinguindo falha encontrada de
falha apenas citada. Fable permanece `EXPERIMENTAL_FAIL_CLOSED`, fora do
roteamento padrão, até existir controle comparativo válido com a mesma
fixture, prompt, modelo, timeout, orçamento e manifesto de testes, com pelo
menos duas seeds válidas por braço.

## Percentual evidencial e fechamento de lacunas

Quando o pedido, gate ou relatório usar porcentagem, a Meta Lupa mede um
**escopo fechado**, nunca uma impressão geral. O medidor canônico desta skill é:

```text
scripts/percentual_evidencial.py
```

Contrato obrigatório:

```text
SCOPE=<escopo finito>
HEAD_SHA=<40 hex do mesmo candidato>
DECLARED_DENOMINATOR=<quantidade de checks required=true>
NUMERATOR=<checks required=true com status PASS + evidência>
DENOMINATOR=<DECLARED_DENOMINATOR validado contra os checks>
COVERAGE_PERCENT=NUMERATOR / DENOMINATOR * 100
```

Regras fail-closed:

1. o denominador é declarado antes do resultado e deve ser idêntico à quantidade de checks `required=true`;
2. `PASS` sem evidência não entra no numerador e bloqueia o manifesto;
3. `UNKNOWN`, `SKIPPED`, `BLOCKED` e `FAIL` continuam dentro do denominador e nunca viram PASS;
4. toda lacuna requerida deve trazer `next_test`: o teste/evidência que pode preenchê-la na próxima rodada;
5. `NOT_APPLICABLE` não pode retirar item requerido do denominador;
6. IDs duplicados bloqueiam a medição;
7. denominador zero ou ausente produz `NOT_MEASURED`/bloqueio, nunca `100%`;
8. `100%` só é alegável quando `NUMERATOR == DENOMINATOR`, todos os itens requeridos estão em PASS com evidência e não existe lacuna;
9. `resolution_plan_percent` mede somente quantas lacunas possuem um próximo teste explícito; não mede eficácia nem transforma UNKNOWN em conhecimento;
10. o manifesto recebe SHA-256 canônico para provar que o denominador e os checks medidos não mudaram depois do resultado.

Uso:

```text
python scripts/percentual_evidencial.py measure --input <manifest.json>
python scripts/percentual_evidencial.py self-test
```

A saída pode declarar `100%` **somente dentro daquele denominador fechado e reproduzível**. Isso não contradiz a proibição de prometer certeza universal: `100% do contrato medido` é diferente de `100% de certeza sobre o mundo`.
menos duas seeds válidas por braço.
