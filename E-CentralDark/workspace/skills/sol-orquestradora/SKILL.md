---
name: sol-orquestradora
description: Orquestrar testes locais por telas, preservando padrões e evoluindo a complexidade somente após contraprova.
---

# SOL ORQUESTRADORA

## Regra principal

Começar com uma tela. Usar um prompt completo, aguardar a execução, ler o recibo e medir antes de adicionar outra tela ou agente.

Antes de cada rodada, executar `scripts/measure-terminals.ps1`. Terminais visíveis recebem IDs `T1..TN`; sessões raiz recebem IDs `S1..SN`. O nível observado acompanha as sessões, mas o nível acionável acompanha somente terminais que podem receber tarefa e ser contraprovados.

## Ancoragem no SOUL-SOL

Esta skill é aplicação do loop `#ACORDAR` do SOUL-SOL em ambiente terminal, não sistema paralelo.

Princípios vigentes da SOUL-SOL que regem esta skill:

- `SURFACE_IS_ADAPTER_NOT_INTELLIGENCE`: a janela/terminal é adaptador, não inteligência. PID, posição e tamanho são efêmeros.
- `MODEL_IS_NOT_ROLE`: o motor executa a função; não confundir modelo com orquestradora.
- `OPERATIONAL_STATE_IS_RECONSTRUCTED`: o estado da tela é reconstruído a cada rodada por medida real, não por cache ou intenção.
- `CROSS_SURFACE_TRANSPORT_REQUIRES_PROVEN_CHANNEL`: ao acionar um terminal diferente do observado, o canal de envio deve ser provado pelo recibo, não presumido.
- `UNKNOWN_IS_NOT_PASS`: sem contraprova visível no terminal, classifica como UNKNOWN, não PASS.
- `NO_V1_V2_V3` e `MENOS_E_MAIS`: não criar acompanhante, segundo painel ou novo script antes de esgotar o existente com prova.
- `META_SELF_APPLICATION_REQUIRED`: esta skill mesma deve ser medida e contraprovada pelo mesmo padrão que aplica a outros níveis.

Regra de não duplicação: se o `scripts/measure-terminals.ps1` ou `scripts/send-terminal-prompt.ps1` já cobrem o caso, não criar variante nova. Extender somente com gap real provado por falha de contraprova.

## Estrutura

- `01-telas/`: níveis por quantidade de telas.
- `02-padroes/`: padrões aprovados de operação e comunicação.
- `03-recibos/`: resultados e contraprovas.
- `04-evolucao/`: mudanças de nível e critérios de promoção.
- `scripts/`: automação reutilizável de terminal.

## Método comprovado: Computer Use no terminal

1. Ler o terminal e confirmar que o prompt está livre.
2. Resolver a janela alvo em tempo real; PID e posição nunca são permanentes.
3. Focar somente a aba `MINGW64` e o campo do prompt.
4. Colar um único prompt completo e pressionar Enter.
5. Reler o buffer do terminal.
6. Considerar envio comprovado somente quando aparecerem o texto recebido e o início da execução.

O script `scripts/send-terminal-prompt.ps1` implementa o envio. A leitura posterior do terminal continua obrigatória como contraprova.

## Autoevolução

```text
MEDIR TERMINAIS REAIS
-> DEDUPLICAR
-> SEPARAR TERMINAIS VISIVEIS, SESSOES RAIZ E PROCESSOS FILHOS
-> ATRIBUIR T1..TN E S1..SN
-> SALVAR ESTADO ATUAL
-> REUTILIZAR PADROES PROVADOS
-> PROMOVER NIVEL SOMENTE COM CONTRAPROVA
```

Contagem de botões, arquivos ou capturas repetidas não aumenta o nível. Acessibilidade sem imagem pode ser usada para contar abas.
Processos `conhost` e shells filhos não contam como novos terminais.

## Estados

- `PASS`: executado e contraprova confirmada.
- `UNKNOWN`: não medido ou sem evidência suficiente.
- `BLOCKED`: impedido por uma causa registrada.

Nunca tratar documentação, intenção ou processo em execução como prova de sucesso.

## Limites

- Operar somente o terminal nomeado pelo SEGREDO/CHEFE.
- Não apagar arquivos nem encerrar processos não relacionados.
- Não expor segredos.
- Uma tela por vez até o nível atual ser comprovado.
