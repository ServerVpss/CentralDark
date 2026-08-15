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

Guardrails:

- documentação melhorada, sozinha, não prova evolução comportamental;
- metacognição operacional não prova consciência subjetiva;
- scaffold alterado não implica mudança dos pesos do modelo;
- autoaperfeiçoamento sem evidência externa/contraprova aplicável permanece `UNPROVEN`;
- autoridade permanece `SEGREDO/CHEFE`;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` limita prova circular;
- arquitetura agêntica composta não autoriza `AGI_PROVADA=true`.

Não duplicar o contrato completo aqui; esta referência apenas liga a MetaLupa à fonte canônica e ao gate executável compartilhado.
