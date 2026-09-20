# AGENTES POR DIAS DA SEMANA — PENDÊNCIA FUTURA

> Status: PENDÊNCIA FUTURA
> Estado: RASCUNHO CONCEITUAL
> Execução: NÃO INICIADA
> Eventos/automações: NÃO DEFINIDOS
> Arquitetura detalhada: ADIADA

## Intenção

Criar futuramente um conjunto de agentes nomeados por dias da semana.

Cada dia representa um agente diferente, destinado a uma ocasião/contexto específico.

```text
SEGUNDA-FEIRA = AGENTE
TERÇA-FEIRA   = AGENTE
QUARTA-FEIRA  = AGENTE
QUINTA-FEIRA  = AGENTE
SEXTA-FEIRA   = AGENTE
SÁBADO        = AGENTE
DOMINGO       = AGENTE
```

## Regra conceitual

```text
UM DIA = UM AGENTE
UM AGENTE = UMA OCASIÃO / CONTEXTO PRÓPRIO
```

Os papéis de cada agente ainda NÃO estão definidos.

Esta pendência existe somente para preservar a ideia enquanto o CHEFE desenha a arquitetura do "Olho de Deus".

## Não definir agora

- qual ocasião pertence a cada dia;
- responsabilidades individuais;
- sensores, câmeras ou dispositivos;
- eventos, triggers ou automações;
- protocolos de resposta;
- integração com telefone, carro ou Casa;
- permissões operacionais;
- arquitetura do "Olho de Deus";
- implementação.

## Próximo passo futuro

Depois que a arquitetura conceitual do "Olho de Deus" estiver pronta, reconciliar cada ocasião com o respectivo agente/dia e somente então detalhar implementação.

```text
PENDING_ONLY=true
ONE_DAY_ONE_AGENT=true
OCCASION_ROUTED=true
NO_RUNTIME_CHANGE=true
NO_AUTOMATION=true
NO_EVENT=true
NO_DEPLOY=true
NO_IMPLEMENTATION=true
```
