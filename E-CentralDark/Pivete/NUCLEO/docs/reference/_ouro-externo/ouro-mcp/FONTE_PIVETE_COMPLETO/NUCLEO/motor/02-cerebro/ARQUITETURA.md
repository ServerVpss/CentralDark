# Arquitetura validada pela Técnica da Lupa

> **Nota de inventário (19/07/2026):** esta arquitetura (`hermes_cortex.py` e
> a árvore `hermes/cognicao|conexoes|aprendizado|...`) é uma visão de
> construção própria, NÃO o produto Nous Research `hermes-agent` que roda de
> verdade hoje (`C:\Users\danda\AppData\Local\hermes\hermes-agent\`). Os
> arquivos `.py` listados na estrutura abaixo não foram confirmados como
> existentes. Existe um schema mais recente pro loop de decisão em
> `E:\CentralDark\Pivete\NUCLEO\hermes-mente\hermes-motor\schemas\loop-cognitivo.json`
> (mesmo ciclo LER→PERGUNTAR→AGIR→REVISAR→PROVAR→REGISTRAR, formato JSON,
> pensado pro Hermes real). Ver
> `motor/10-observabilidade/MAPA-HERMES-19-07-2026.md` pro inventário completo.

## Problema real

Criar uma base local para um amigo-assistente que converse, lembre, delegue tarefas a especialistas e evolua com o Pivete sem virar um sistema perigoso ou uma arquitetura teatral.

## Crítica da árvore inicial

A proposta inicial tinha boas peças, mas misturava quatro conceitos:

1. **identidade do amigo**;
2. **orquestração de agentes**;
3. **modelo Mixture of Experts**;
4. **consciência e aprendizado neural**.

Eles não são equivalentes. Um roteador de agentes não cria consciência; ajustar confiança de agentes não treina rede neural; memória sem política vira acúmulo, não inteligência.

## O que foi preservado

- Hermes como núcleo coordenador;
- triagem, atenção e síntese;
- memória central;
- barramento de eventos;
- registro e roteamento de especialistas;
- feedback e plasticidade;
- protocolos de entrada e saída;
- possibilidade de milhares de especialistas no futuro.

## Correções mínimas aplicadas

| Ponto inicial | Correção aplicada |
|---|---|
| `hermes_cortex.py` faria tudo | virou coordenador fino; lógica separada por responsabilidade |
| “milhares de IAs” desde o início | registro extensível, porém só quatro especialistas locais no MVP |
| memória vetorial/RAG como ponto de partida | SQLite e busca lexical simples, observável e suficiente para a fase 1 |
| plasticidade autônoma | ajuste pequeno de confiança somente após feedback explícito |
| sub-IAs potencialmente livres | especialistas sem acesso direto ao sistema operacional |
| sistema nervoso distribuído | barramento em processo; rede/fila somente quando houver necessidade comprovada |
| controle da casa misturado ao núcleo | fica em fase futura R3, com lista branca e autorização |
| voz completa | saída de voz opcional; microfone contínuo fica para fase posterior |
| motor externo obrigatório | runtime local funciona sem API; provider externo será adaptador futuro |

## Estrutura final

```text
NUCLEO/
├── README.md
├── SKILL.md
├── 01-VISAO-AMIGO-CASA-E-ORIGEM.md
├── docs/
├── config/
├── hermes/
│   ├── cortex.py
│   ├── memoria_central.py
│   ├── sistema_nervoso.py
│   ├── cognicao/
│   ├── conexoes/
│   ├── aprendizado/
│   ├── seguranca/
│   ├── interfaces/
│   └── sub_ias_locais/
├── assets/audio/
├── scripts/
├── tests/
├── dados/
└── logs/
```

## Fluxo de uma mensagem

```text
Entrada
→ Guardião classifica risco
→ Triagem identifica intenção
→ Memória busca contexto
→ Atenção seleciona até 3 especialistas
→ Roteador executa em paralelo
→ Síntese produz uma resposta
→ Memória registra interação
→ Auditoria registra o evento
```

## Escala futura

O registro de agentes pode crescer sem mudar o córtex. Quando o processo único deixar de atender, o `sistema_nervoso` e o `roteador` podem receber adaptadores para processos, containers ou serviços. Essa mudança só é justificada por medição de carga, isolamento ou disponibilidade — não pela aparência de grandeza.
