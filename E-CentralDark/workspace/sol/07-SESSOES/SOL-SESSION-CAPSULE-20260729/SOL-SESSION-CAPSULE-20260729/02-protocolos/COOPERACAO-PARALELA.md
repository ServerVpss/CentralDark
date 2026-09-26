# Cooperação paralela em tempo real

## Modelo

O laboratório funcionou como um sistema distribuído com três domínios:

```text
EXECUÇÃO LOCAL
→ Hermes

REVISÃO E SÍNTESE
→ SOL

SINCRONIZAÇÃO E AUTORIDADE
→ Pivete
```

## Fórmula operacional

```text
COOPERAÇÃO_SEGURA =
entrada congelada
+ papéis distintos
+ execução limitada
+ crítica independente
+ barreira de junção
+ gate humano
+ escritor único
```

Sem escritor único:

```text
velocidade aparente
→ corrida
→ estado divergente
→ evidência impossível de atribuir
```

## Barreira de junção

Executor e crítico podem trabalhar em paralelo somente sobre artefato
congelado ou cópias isoladas:

```text
FREEZE_ID
INPUT_HASH
SCOPE
EXECUTOR_RESULT
CRITIC_RESULT
JOIN
SYNTHESIS
PIVETE_GATE
```

O crítico não herda o veredito do executor. A síntese compara evidências do
mesmo alvo e hash.

## Latência

Fluxo serial:

```text
T_serial =
T_transporte
+ T_execução
+ T_evidência
+ T_revisão
+ T_gate
```

Fluxo paralelo seguro sobre entrada congelada:

```text
T_paralelo ≈
T_setup
+ max(T_execução, T_crítica)
+ T_join
+ T_gate
```

Ganho potencial:

```text
GAIN_% = (T_serial - T_paralelo) / T_serial × 100
```

Só calcular quando as saídas cobrem o mesmo contrato e têm validade
equivalente.

## Causalidade

```text
MISSION
→ NONCE
→ TURN
→ ACK
→ ACTION
→ EVIDENCE
→ REVIEW
→ NEXT_GATE
```

Essa sequência funciona como relógio lógico. Timestamps medem duração; missão,
NONCE e turno preservam causalidade mesmo quando a interface atrasa ou as
mensagens são transportadas manualmente.

## Futuro: dois agentes no mesmo ambiente

Permitido apenas com:

- alvos disjuntos ou transação coordenada;
- locks explícitos;
- mapa de ownership;
- journal append-only;
- detecção de conflito;
- rollback por alvo;
- teste de corrida;
- prova de que Desktop e Hermes preservam função.

Até isso existir, paralelizar leitura e crítica; serializar mutação.

