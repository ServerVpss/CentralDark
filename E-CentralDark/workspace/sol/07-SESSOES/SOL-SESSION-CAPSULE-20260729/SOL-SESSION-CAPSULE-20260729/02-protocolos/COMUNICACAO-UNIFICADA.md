# Comunicação unificada SOL ↔ Hermes

## Papéis

| Participante | Função |
|---|---|
| Pivete | fala naturalmente, define intenção, autoriza e decide |
| SOL | supervisiona, critica, sintetiza e mantém o fio |
| Hermes | executa localmente e apresenta evidência |

## Envelope canônico

```text
HERMES_TO=SOL | SOL_TO=HERMES
MISSION=
NONCE=
TURN=
PROTOCOL=SOL_HERMES_UNIFIED_V2

ACK=
STATUS=
RESULTADO=
EVIDENCIA=
ERROS=
FIZ_CERTO=PERGUNTA_PARA_SOL
NOVO_PASSO_INICIADO=NAO

PASTA_ATUAL=
FASE=
ACAO_AUTORIZADA=
ULTIMA_PROVA=
PENDENCIA=
PROIBIDO=
PROXIMO_GATE=
```

## Regras

- Uma confirmação não inclui ação nova.
- Hermes não inicia o próximo coletor antes da revisão.
- SOL não atribui autorização ao Pivete sem mensagem explícita aplicável.
- Pivete não precisa falar como máquina.
- Texto copiado entre chats é transporte; o envelope identifica a origem.
- Resposta cortada é incompleta.
- A barra de ações da resposta é marcador de conclusão visual, não prova
  semântica do conteúdo.

## Estado quente

Cada turno substitui a cápsula anterior somente nos campos que declara. A
versão ativa deve ser explícita:

```text
ACTIVE_PROTOCOL=SOL_HERMES_UNIFIED_V2
PREVIOUS_PROTOCOLS=DEPRECATED
HISTORY_DELETED=NAO
```

