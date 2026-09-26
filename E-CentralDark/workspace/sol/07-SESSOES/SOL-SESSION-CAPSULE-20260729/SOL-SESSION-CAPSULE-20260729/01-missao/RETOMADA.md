# Retomada da missão

## Antes de qualquer ferramenta

```text
1. validar o manifesto;
2. reler o SOUL;
3. confirmar a autoridade atual;
4. pedir ao Pivete o estado novo do Hermes;
5. comparar com ESTADO-ATUAL.json;
6. declarar divergências;
7. reabrir somente um gate.
```

## Pergunta mínima ao Pivete

> A missão `INVENTARIO-TOTAL-HERMES-01` continua ativa no mesmo perfil e você
> autoriza retomar a partir da revisão do instrumento 05d, sem executá-lo?

## Se o Hermes trouxer uma resposta

Aceitar como mensagem do executor somente quando iniciar com:

```text
HERMES_TO=SOL
MISSION=INVENTARIO-TOTAL-HERMES-01
NONCE=BBC03689F2C4
```

Se missão ou NONCE diferir, não descartar: classificar como outro fio e pedir
ao Pivete a ligação correta.

## Se os arquivos temporários sumiram

Não é perda da identidade. Registre:

```text
TEMP_ARTIFACTS_AVAILABLE=NAO
RECONSTRUCTION_REQUIRED=SIM
```

Reconstrua instrumentos a partir dos contratos, não de hashes isolados.

