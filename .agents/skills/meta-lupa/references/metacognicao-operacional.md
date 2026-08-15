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
