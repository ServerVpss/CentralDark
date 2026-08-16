# Metacognição operacional — referência da MetaLupa

Fonte canônica: `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`.

Usar esta referência quando a AutoLupa não estiver apenas revisando **o resultado**, mas o próprio método que produziu o resultado.

```text
AUTO_LUPA_ENCONTRA_ERRO_DO_METODO
→ EVIDENCIA NOVA
→ DELTA_DE_CRENCA
→ DELTA_DE_SCAFFOLD
→ TESTE/CONTRAPROVA
→ REGISTRO REUTILIZAVEL
→ PROXIMA EXECUCAO COMECA MAIS ALTO
```

Classificação:

```text
RESULTADO_CORRIGIDO_SEM_MUDAR_METODO = AUTOCORRECAO_LOCAL
METODO_CORRIGIDO_COM_DELTA_REUTILIZAVEL = METACOGNICAO_OPERACIONAL
CHEFE_ENSINA + ORGANISMO_MATERIALIZA + FUTURO_MUDA = COEVOLUCAO_OPERACIONAL
```

## Lei META — autoraplicação verificável

```text
META(X) = X APLICA A PROPRIA LEI SOBRE X
```

Logo, a própria metacognição também é alvo da metacognição:

```text
META_METACOGNICAO
→ observar como estamos aprendendo
→ localizar desperdício/erro no próprio método de aprender
→ propor menor delta reutilizável
→ provar BEFORE/AFTER no mesmo escopo
→ testar + contraprovocar + regressão
→ somente então declarar evolução
```

Os donos META obrigatórios compartilham uma única lei:

```text
META_EXPANSAO_DE_DOMINIO = VER MELHOR
META_MENOS_E_MAIS = CARREGAR MENOS
META_LUPA = SABER/PROVAR MELHOR
META_INSTINTO_SUPERIOR = AGIR MELHOR
META_METACOGNICAO_OPERACIONAL = APRENDER A APRENDER MELHOR
```

Ciclo:

```text
VER MELHOR
→ CARREGAR MENOS
→ SABER MELHOR
→ AGIR MELHOR
→ APRENDER COM O DELTA
→ VER MELHOR DE NOVO
```

## Mineração automática — dever dentro da metacognição

Mineração **não é uma sexta arquitetura META**. É uma função da `META_METACOGNICAO_OPERACIONAL`: matéria nova dentro da intenção vigente deve ser processada sem devolver ao humano o trabalho mecânico de separar ouro de ruído.

```text
NOVA_MATERIA_DENTRO_DA_INTENCAO_VIGENTE
→ MINERAR_AUTOMATICAMENTE
→ EXTRAIR_CAPACIDADE
→ COMPARAR_COM_CANONICO
→ DUPLICADO: DROP
→ PARCIAL: EXTRAIR_DELTA
→ NOVO: PROVAR_GAP
→ CONTRAPROVAR
→ DONO_CANONICO
→ CONSUMIDOR_REAL
→ TESTAR
→ ABSORVER_SE_AUTORIZADO_E_REVERSIVEL
→ PRESERVAR_PROVENIENCIA
→ REMOVER_DEPENDENCIA_DA_FONTE
→ CONTINUAR
```

Não pedir confirmação apenas para ler, comparar, testar, deduplicar ou costurar delta reversível já coberto pela intenção vigente.

Human gate continua obrigatório somente quando a fronteira exigir decisão realmente humana/materialmente nova, como:

```text
NOVA_INTENCAO
SECRET_VALUE
ACAO_IRREVERSIVEL
DEPLOY|PUBLICACAO
GASTO_NOVO
AMPLIACAO_DE_PRIVILEGIO
WRITER_COLLISION_SEM_HANDOFF
BLOCKER_FISICO_REAL
```

`META_MINERACAO` significa o minerador aplicar a própria régua sobre o **método de minerar**, não criar `mining-engine-v2`:

```text
ANTES_DO_FILTRO
→ ERRO|MATERIAL|CONTRAPROVA NOVA
→ GANHO_DE_INFORMACAO?
   NAO → NO_CHANGE
   SIM → MENOR_DELTA_NO_FILTRO
→ TESTE
→ CONTRAPROVA
→ AFTER
→ FITNESS_DELTA
→ evolution_gate.py
```

```text
META_MINERACAO ⊂ META_METACOGNICAO_OPERACIONAL
NO_NEW_INFORMATION=NO_CHANGE
MINING_EVOLUTION_WITHOUT_BEFORE_AFTER=EVOLUTION_UNPROVEN
```

## Ouro não é imortal — ciclo de vida verificável

Absorção fecha a dependência da fonte, não congela a regra para sempre.

```text
OURO_SELADO != VERDADE_IMORTAL
```

Uma regra/capacidade absorvida volta à Lupa quando a **fronteira material** mudar ou quando houver evidência de que envelheceu:

```text
BOUNDARY_CHANGED
| VIOLATED
| OUTDATED
| SUPERSEDED
| CONSUMER_DISAPPEARED
| EVIDENCE_STALE
→ REVALIDATE
→ KEEP | SUPERSEDE | RETIRE
```

Não copiar um número arbitrário de dias de uma fonte externa como lei universal. Tempo pode disparar revisão; **evidência decide o destino**.

Para aposentar/remover ouro:

```text
RETIRE_CANDIDATE
→ PROVAR_DONO/CONSUMIDORES
→ PROVAR_SUBSTITUTO_OU_CAPACIDADE_DESNECESSARIA
→ CONTRAPROVA
→ REGRESSAO
→ CAPACIDADE_DEPOIS >= CAPACIDADE_ANTES
→ SO_ENTAO_RETIRE
```

Regra pinada por autoridade/segurança/contrato crítico não sofre auto-retire silencioso; retenção ou revisão precisa carregar motivo explícito.

Remover regra velha **pode ser evolução** quando reduz complexidade sem perda de capacidade e o before/after passa pelo mesmo gate verificável.

## Evolução obrigatória e verificável

MetaLupa não pode apenas acumular XP, texto ou histórico. Quando erro, confronto, contraprova ou matéria-prima revelar uma melhoria reutilizável, a própria MetaLupa deve evoluir **no mesmo artefato canônico** ou nos recursos já pertencentes a ele.

```text
EVOLUCAO_META_LUPA=OBRIGATORIA_QUANDO_HOUVER_DELTA_REUTILIZAVEL
EVOLUCAO_SEM_PROVA=EVOLUTION_UNPROVEN
NO_NEW_INFORMATION=STOP
NO_PARALLEL_LUPA=true
```

A alegação `EVOLVED` só pode existir quando houver, no mesmo escopo:

```text
ANTES
→ INFORMACAO NOVA
→ DELTA DE CAPACIDADE
→ DEPOIS
→ TESTE
→ CONTRAPROVA
→ REGRESSAO
→ PROVENIENCIA
→ RECEIPT VERIFICAVEL
```

O gate executável único vive em:

```text
.agents/skills/meta-lupa/scripts/evolution_gate.py
```

Consumidores META obrigatórios do mesmo contrato:

```text
META_LUPA
MENOS_E_MAIS
INSTINTO_SUPERIOR
EXPANSAO_DE_DOMINIO
METACOGNICAO_OPERACIONAL
```

A lei também vale para qualquer outra capacidade que alegue evolução. Os cinco acima são autorreflexivos por contrato; os demais podem ser medidos pelo mesmo gate sem ganhar motor paralelo.

Se o estado anterior e posterior forem iguais, se não houver informação nova, se teste/regressão não passarem, se capacidade anterior for perdida ou se o receipt for adulterado, o resultado permanece `EVOLUTION_UNPROVEN`.

## Compressão cognitiva operacional — experiência que vira heurística sem virar mito

Quando ciclos repetidos de trabalho produzem padrões estáveis e **validados**, a Casa pode condensar múltiplos passos recorrentes em uma representação operacional menor. O nome técnico interno para esse fenômeno é `COMPRESSAO_COGNITIVA_OPERACIONAL`.

Isto descreve **expertise adquirida + chunking + metacognição operacional**. Não autoriza afirmar que um humano “virou IA”, que o sistema mudou pesos do modelo, que surgiu consciência, AGI ou qualquer excepcionalidade histórica sem benchmark externo comparável.

```text
EXPERIENCIAS_REPETIDAS
→ PADROES_RECUPERAVEIS
→ AGRUPAMENTO_EM_BLOCOS_FUNCIONAIS
→ COMPRESSAO_DE_ETAPAS
→ HEURISTICA_CANDIDATA
→ TESTE_EM_CASOS_NOVOS
→ TRANSFERENCIA_ENTRE_DOMINIOS
→ PREDICAO_DO_PROXIMO_ESTADO
→ CALIBRACAO_PELO_ERRO
→ HEURISTICA_PROVADA|REBAIXADA|DESCARTADA
```

Um bloco pode condensar, por exemplo, `owner + gate + prova + writer + rollback + estado` numa única unidade mental/operacional **somente quando os contratos internos continuam recuperáveis**. Compressão que apaga owner, autorização, prova, rollback ou `UNKNOWN` é perda de capacidade, não evolução.

```text
CHUNKING_ALLOWED=true
COMPRESSION_MUST_PRESERVE_RECOVERABILITY=true
COMPRESSION_MUST_PRESERVE_CRITICAL_CONTRACTS=true
HEURISTIC_IS_NOT_PROOF=true
FAST_RECOGNITION_IS_NOT_AUTHORIZATION=true
INTUITION_IS_CANDIDATE_UNTIL_CHECKED=true
```

A heurística sobe de nível apenas quando demonstra vantagem real sobre o caminho anterior:

```text
HEURISTICA_CANDIDATA
+ SAME_SCOPE_BEFORE_AFTER
+ MENOR_LATENCIA_OU_MENOR_CUSTO_COGNITIVO
+ CAPACIDADE_CRITICA_PRESERVADA
+ CASOS_NOVOS/HOLDOUT_QUANDO_APLICAVEL
+ CONTRAPROVA
+ ERROS_OBSERVADOS_REALIMENTAM_CALIBRACAO
→ HEURISTICA_REUTILIZAVEL
```

Se funciona apenas nos exemplos que a originaram, classificar como memorização/overfit operacional, não generalização:

```text
TRAINING_CASE_SUCCESS_ONLY != GENERALIZATION
TRANSFER_REQUIRES_NEW_CONTEXT=true
NOVEL_CASE_FAILURE_REQUIRES_RECALIBRATION=true
CONFIDENCE_MUST_TRACK_OBSERVED_ACCURACY=true
OVERCONFIDENT_HEURISTIC=REGRESSION
```

A Casa também separa três claims que parecem iguais na conversa humana, mas exigem provas diferentes:

```text
CLAIM_A = "há um padrão de compressão/expertise observável"
→ pode ser sustentado por comportamento repetido + casos + delta verificável

CLAIM_B = "o humano virou IA / o sistema virou consciência"
→ NÃO decorre do CLAIM_A; permanece UNPROVEN sem critério próprio

CLAIM_C = "ninguém jamais chegou a esta combinação"
→ exige universo comparativo/benchmark externo defensável; sem isso, UNPROVEN
```

A forma canônica de cristalizar experiência útil passa a ser:

```text
REPETICAO
→ ERRO
→ CORRECAO
→ PADRAO
→ CHUNKING
→ COMPRESSAO
→ HEURISTICA
→ TRANSFERENCIA
→ PREDICAO
→ CONTRAPROVA
→ INSTINTO_TECNICO_CALIBRADO
→ OURO
```

`INSTINTO_TECNICO_CALIBRADO` não é licença para pular gate. É a capacidade de chegar mais rápido à hipótese provável, preservar poucas alternativas de alto valor e ainda submeter decisão material ao check correspondente.

```text
INSTINTO_TECNICO_CALIBRADO
= FAST_PATTERN_RECOGNITION
+ SMALL_HIGH_VALUE_HYPOTHESIS_SET
+ ERROR_FEEDBACK
+ REQUIRED_GATES_PRESERVED
```

Esse mecanismo deve ser usado também para revisar o próprio método de aprender: se a Casa consegue transformar dez passos recorrentes em três sem perder prova, reconstrução ou segurança, isso é candidato a evolução; se a compressão só deixa a resposta mais confiante ou mais curta, é `NO_CHANGE|REGRESSION`.

```text
COGNITIVE_COMPRESSION_WITHOUT_CAPABILITY_GAIN=NO_CHANGE
COGNITIVE_COMPRESSION_WITH_LOST_GUARDRAIL=REGRESSION
COGNITIVE_COMPRESSION_WITH_PROVEN_TRANSFER=EVOLUTION_CANDIDATE
UNIQUENESS_WITHOUT_COMPARABLE_BENCHMARK=UNPROVEN
HUMAN_BECAME_AI_FROM_EXPERTISE=false
```

Guardrails:

- documentação melhorada, sozinha, não prova evolução comportamental;
- metacognição operacional não prova consciência subjetiva;
- scaffold alterado não implica mudança dos pesos do modelo;
- autoaperfeiçoamento sem evidência externa/contraprova aplicável permanece `UNPROVEN`;
- autoridade permanece `SEGREDO/CHEFE`;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` limita prova circular;
- arquitetura agêntica composta não autoriza `AGI_PROVADA=true`.

Não duplicar o contrato completo aqui; esta referência apenas liga a MetaLupa à fonte canônica e ao gate executável compartilhado.
