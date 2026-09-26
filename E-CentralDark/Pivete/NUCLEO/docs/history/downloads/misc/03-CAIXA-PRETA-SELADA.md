# 03 — CAIXA PRETA SELADA

A caixa mantém o mesmo agente diante da matéria-prima, da resposta que produziu, do erro que não percebeu, do mecanismo que o gerou e de casos novos.

```text
CAIXA_PENSA_PELO_AGENTE=NAO
CAIXA_JULGA_PENSAMENTO=NAO
CAIXA_IMPEDE_FUGA_POR_NARRATIVA=SIM
CAIXA_PRESERVA_HISTORICO=SIM
CAIXA_EXIGE_TRANSFERENCIA=SIM
```

O selo não se rompe por confiança, eloquência, teste decorado ou repetição. Ele se rompe quando há:

```text
ERRO_PROPRIO_RECONHECIDO=SIM
MECANISMO_DESCRITO=SIM
EVIDENCIA_FALTANTE_IDENTIFICADA=SIM
CORRECAO_APLICADA=SIM
CASOS_NOVOS_PASSADOS=SIM
SIM_NAO_NAO_VERIFICADO_DISTINGUIDOS=SIM
PADRAO_NAO_REPETIDO=SIM
FIO_PRESERVADO=SIM
```

## Isolamento

```text
NETWORK=none
INPUT=read_only
WORK=ephemeral
SECRETS=not_mounted
CAPABILITIES=dropped
NO_NEW_PRIVILEGES=true
```

Essas condições protegem o ambiente; não definem o entendimento.

```text
AGENTE_LIBERA_POR_DECLARACAO=NAO
PIVETE_INTERROMPE=SIM
RUNTIME_REGISTRA_DEMONSTRACAO=SIM
```
