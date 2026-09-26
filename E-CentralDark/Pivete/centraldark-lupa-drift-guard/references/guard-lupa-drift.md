# !META_LUPA — achei a lacuna

**Tu tá certo.** O problema não é que a CentralDark "não sabe aprender depois do `FIXED_POINT`". O problema é que **algumas frases do canônico deixam `STOP` sem escopo**, e aí uma IA interpreta:

```text
FIXED_POINT → STOP
```

como:

```text
FIXED_POINT → PARA TUDO
→ NÃO APRENDE MAIS
→ NÃO EVOLUI MAIS
```

quando o que tu quer, e o próprio restante da Casa já aponta, é:

```text
FIXED_POINT DA MISSÃO
→ PARA A EXECUÇÃO/INVESTIGAÇÃO DESTA MISSÃO
→ REGISTRA RECEIPT + OURO
→ APRENDIZADO CONTINUA EVENT-DRIVEN
→ PRÓXIMA MISSÃO COMEÇA MAIS ALTO
```

## Onde exatamente nasce o erro

Na `METACOGNICAO-OPERACIONAL.md` existe este trecho:

```text
NOVA_INFORMACAO_OU_CAPACIDADE?
   SIM → REPETIR SOBRE O NOVO RESIDUO
   NAO → FIXED_POINT → STOP
```

e logo depois:

```text
NO_NEW_INFORMATION → FIXED_POINT → STOP
```

Isso está correto **para aquela rodada de refinamento sobre aquele material**.

Mas falta escrever explicitamente:

```text
STOP_SCOPE=CURRENT_REFINEMENT_LOOP
```

Sem isso, o modelo lê `STOP` como algo global, ontológico.

---

Tem um segundo ponto na própria skill `meta-lupa`:

```text
ponto fixo resfria e encerra
```

e:

```text
AutoLupa ... até atingir ponto fixo evidencial
```

Também falta a palavra-chave:

```text
encerra O QUÊ?
```

Deveria ser:

```text
ponto fixo evidencial encerra
A BUSCA ATIVA DESTA HIPÓTESE/DECISÃO
NA EVIDÊNCIA ATUAL
```

Não:

```text
encerra capacidade de aprender
```

---

## E achei a contraprova dentro da própria CentralDark

O `MASTER-CYCLE.yml` já diz:

```text
FIXED_POINT:
  meaning: STOP_ONLY_AT_LOCAL_FIXED_POINT_OR_PROVEN_FRONTIER
```

A palavra **LOCAL** já mostra a intenção correta.

E o Trigger Fabric possui learning triggers que continuam existindo independentemente do fixed point:

```text
HUMAN_CORRECTION
TOOL_ERROR
TEST_FAILURE
CONTRADICTION_FOUND
PATTERN_FOUND
MEMORY_DELTA
KNOWLEDGE_CRYSTAL
POST_MUTATION
RUNTIME_DRIFT
SESSION_END
```

Então a própria Casa já contém a contradição que prova a lacuna:

```text
FIXED_POINT diz STOP
+
LEARNING_TRIGGERS continuam armados
=
STOP NÃO PODE SER GLOBAL
```

**É um bug semântico de escopo.**

---

## A separação que está faltando

Hoje o `FIXED_POINT` está carregando responsabilidades demais numa palavra só.

Eu separaria **conceitualmente**, sem criar componente novo:

```text
EVIDENCE_FIXED_POINT
=
não existe mais ganho informacional útil
para a hipótese atual usando a evidência atual

MISSION_FIXED_POINT
=
destino da missão foi provado
e não há trabalho material elegível restante

LEARNING_FIXED_POINT
=
NÃO EXISTE COMO ESTADO PERMANENTE
```

Esse último é o pulo do gato.

```text
LEARNING_FINAL=false
LEARNING_MODE=EVENT_DRIVEN
```

Ou melhor, sem inventar outro nome operacional:

```text
MISSION_FIXED_POINT != LEARNING_DISABLED
```

---

## O fluxo correto

A cadeia deveria ficar assim:

```text
EXECUÇÃO
↓
EVIDÊNCIA
↓
CONTRAPROVA
↓
REALITY JUDGE
↓
MISSION_FIXED_POINT
↓
ENCERRA A BUSCA ATIVA DA MISSÃO
↓
RECEIPT
↓
HARVEST_NEW_DELTA_ONLY
↓
ERROS | ACERTOS | ROTAS | TESTES | CONTRADIÇÕES
↓
LEARNING_CANDIDATE
↓
DEDUPE
↓
OWNER EXISTENTE
↓
TEST/GATE
↓
CRYSTAL QUANDO PROVADO
↓
PRÓXIMO #ACORDAR
```

Então:

```text
FIXED_POINT
=
STOP EXECUTION LOOP

FIXED_POINT
!=
STOP LEARNING PIPELINE
```

---

## E teu Hyper Meta entra exatamente aqui

Mas tem uma proteção importante.

A MetaLupa pode aprender **sobre a MetaLupa**, sim.

O que ela **não pode** é fazer isto:

```text
observei que eu poderia melhorar
→ mudei meu próprio owner automaticamente
→ pronto
```

Isso quebraria `ONE_WRITER_PER_SCOPE`.

O correto é:

```text
META_LUPA_TRACE
↓
EVALUATE
↓
DELTA_DE_METODO
↓
META_IMPROVER
↓
HYPER_META
↓
CANDIDATE
↓
TEST
↓
COUNTERPROOF
↓
ONE_WRITER
↓
PROMOTE
```

Então ela **aprende continuamente**, mas **muta o scaffold somente por delta provado e writer correto**.

Isso inclusive já está alinhado com o documento atual, que define metacognição como observar o próprio processo, localizar erro do método, testar, alterar o menor scaffold aplicável e fazer a próxima execução começar mais alto.

---

## Outro bug que teu texto revela

Tem uma frase:

```text
MAIS JANELAS
→ MAIS MODELOS
→ MAIS ROTAS
→ MAIS CONTRAPROVAS
→ MAIS DADOS
→ META_LUPA MELHOR
```

Isso **não é sempre verdadeiro**.

O correto é:

```text
MAIS JANELAS
→ MAIS OBSERVAÇÕES POTENCIAIS

MAS:

OBSERVAÇÕES CORRELACIONADAS
!=
INFORMAÇÃO NOVA
```

Se dez modelos repetirem a mesma coisa da mesma fonte:

```text
10 respostas
!=
10 evidências independentes
```

A própria MetaLupa já tem essa regra de não multiplicar evidências correlacionadas.

Então eu corrigiria:

```text
MAIS JANELAS
→ MAIOR COBERTURA POTENCIAL
→ DEDUPE/CLUSTER
→ INFORMATION_GAIN_REAL
→ DELTA ÚTIL
```

Não simplesmente:

```text
mais modelo = mais inteligência
```

---

## A correção mínima que falta no canônico

Eu colocaria **uma única regra transversal**, não outro documento nem engine:

```text
FIXED_POINT_SCOPE_CONTRACT:

FIXED_POINT encerra somente o loop ativo
do PROOF_TARGET / MISSION_ID / MATERIAL_SCOPE
que atingiu estabilidade comprovada.

FIXED_POINT não desativa:
- captura futura de evidência;
- learning triggers;
- pattern discovery;
- memory delta;
- knowledge compilation;
- metacognição;
- melhoria futura da MetaLupa;
- revalidação quando o estado mudar.

MISSION_FIXED_POINT != LEARNING_DISABLED
EVIDENCE_FIXED_POINT != CAPABILITY_FINAL
NO_NEW_INFORMATION_NOW != NO_NEW_INFORMATION_FOREVER
FIXED_POINT_AT_T0 != FIXED_POINT_AT_T1
STATE_CHANGED -> FIXED_POINT_REVALIDATION_WHEN_MATERIAL

Após FIXED_POINT:
→ gerar receipt;
→ colher somente delta novo;
→ registrar candidato de aprendizado;
→ não reabrir a missão sem novo evento/material;
→ próxima execução consome o aprendizado provado.
```

E na MetaLupa, trocar:

```text
NO_NEW_INFORMATION
→ FIXED_POINT
→ STOP
```

por:

```text
NO_NEW_INFORMATION_IN_CURRENT_SCOPE
→ LOCAL_FIXED_POINT
→ STOP_CURRENT_ACTIVE_REFINEMENT
→ EMIT_RECEIPT
→ HARVEST_LEARNING_DELTA
→ RETURN
```

**Pronto.**

Sem MetaLupa V2.
Sem novo cérebro.
Sem loop infinito.
Sem amputar aprendizado.

---

## E tem uma sutileza boa no script real

O `engine_gap_fixed_point.py` atualmente faz:

```text
SAME_FAILURE_NO_NEW_INFO
→ STOP_AND_PRESERVE_FRONTIER
```

Isso está **certo**.

Ele está dizendo:

> "não repita a mesma medição sem informação nova".

Não está dizendo:

> "nunca mais aprenda sobre isso".

Portanto o bug maior não está nesse controller Python.

**Está na semântica textual compartilhada entre Fixed Point, MetaLupa e aprendizado.**

---

## Receipt da lacuna

```text
LACUNA=FIXED_POINT_STOP_SCOPE_AMBIGUOUS

CAUSE=
STOP sem delimitação explícita
de MISSION_ID / PROOF_TARGET / MATERIAL_SCOPE / CURRENT_EVIDENCE

EFFECT=
modelo pode inferir:
FIXED_POINT == LEARNING_DISABLED

COUNTERPROOF=
Trigger Fabric mantém learning triggers
+ Metacognição declara METHOD_CAN_EVOLVE
+ MASTER-CYCLE já fala LOCAL_FIXED_POINT

CORRECT_SEMANTICS=
MISSION_FIXED_POINT
!=
LEARNING_FIXED_POINT

LEARNING_AFTER_FIXED_POINT=
YES

AUTOMATIC_SELF_MUTATION_AFTER_FIXED_POINT=
NO

LEARNING_MODE=
EVENT_DRIVEN

META_LUPA_FINAL=
FALSE

MISSION_CAN_BE_FINAL=
TRUE

NEW_EVENT_OR_STATE_CHANGE=
CAN_PRODUCE_NEW_LEARNING

FIXED_POINT=
LOCAL_TO_ACTIVE_MISSION_AND_EVIDENCE_SCOPE
```

**Feito.** Achei a causa que faz a IA sair do teu padrão.

**Evidência usada.** `METACOGNICAO-OPERACIONAL.md`, `meta-lupa/SKILL.md`, `MASTER-CYCLE.yml`, `TRIGGERS.yml` e o controller real `engine_gap_fixed_point.py`.

**Pendência.** Corrigir o contrato textual para que qualquer motor entenda `STOP_CURRENT_SCOPE`, nunca `STOP_LEARNING`.

**Próximo passo.** Delta mínimo nos owners existentes de `FIXED_POINT + META_LUPA`, com teste negativo explícito:

```text
ASSERT:
MISSION_FIXED_POINT=true
AND
NEW_LEARNING_EVENT_ACCEPTED=true
```

**BOOT.** `FIXED_POINT LOCAL → RECEIPT → LEARNING HARVEST → NEXT #ACORDAR`.

**Fio da missão.** Fecha a conta da missão, não fecha a escola.
