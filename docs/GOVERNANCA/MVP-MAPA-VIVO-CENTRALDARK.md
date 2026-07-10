# MVP MAPA VIVO CENTRALDARK

Este documento registra a direção do Pivete para organizar o CentralDark como núcleo principal do ecossistema.

## 1. Princípio

CentralDark é o sistema principal.

Os demais domínios, módulos, bots, painéis e serviços existem como partes complementares dentro do ecossistema CentralDark.

## 2. Objetivo do MVP

Criar um mapa vivo simples e útil para o Pivete enxergar em tempo real o que existe, o que está conectado, o que está divergente e o que precisa de ação.

MVP = primeira versão pequena, funcional e auditável.

## 3. O que mapear primeiro

- Repositório GitHub oficial.
- Estrutura atual da VPS.
- Módulos dentro de apps/modulos.
- Domínios e subdomínios conhecidos.
- Serviços vivos.
- Bots e agentes.
- Supabase e estado vivo.
- Gateway e rotas principais.
- Pontos de divergência entre repo e VPS.

## 4. Comparação repo + VPS

O mapa vivo deve comparar:

- existe no GitHub e existe na VPS;
- existe no GitHub, mas não aparece na VPS;
- existe na VPS, mas não está oficializado no GitHub;
- área protegida;
- risco conhecido;
- próximo passo sugerido.

## 5. Modo de operação

O Pivete não deve editar no escuro.

O painel deve permitir ver mudança, comentar, aprovar, pedir ajuste e acompanhar prova.

Regra:

```txt
Pivete fala.
IA organiza.
GitHub registra.
VPS executa.
Supabase guarda estado vivo.
Painel mostra prova.
```

## 6. Independência de IA

Nenhuma IA é fixa.

Lovable, ChatGPT, Claude, Codex, Gemini, Mistral ou outro agente podem mudar por preço, crédito, limite, qualidade ou disponibilidade.

O que deve ser fixo é o fluxo:

```txt
contexto no GitHub
estado vivo no Supabase
execução na VPS
entrada pelo Gateway
prova no painel
```

## 7. Orquestração multiagente

O CentralDark pode usar dezenas de agentes em paralelo, desde que exista coordenação.

Orquestração = vários agentes trabalhando juntos com missão, limite e prova.

Padrão seguro:

```txt
Pivete = comando e prioridade.
Orquestrador = divide missão e distribui tarefas.
Agentes = executam partes pequenas.
Revisor = confere resultado.
Auditor = procura risco, duplicação e quebra de fluxo.
Consolidador = junta apenas o que foi aprovado.
GitHub = registra.
Painel = mostra prova.
```

Regra:

```txt
Muitos agentes sem controle viram bagunça.
Muitos agentes com escopo, fila, revisão e prova viram força operacional.
```

## 8. Camadas mínimas do MVP multiagente

Para o MVP, não começar com ação destrutiva ou escrita livre.

Começar com:

- leitura;
- mapeamento;
- comparação;
- relatório;
- sugestão;
- aprovação do Pivete;
- registro.

Depois evoluir para execução controlada.

## 9. Handoff e reconciliação

Cada agente deve devolver um handoff padronizado.

Handoff = relatório curto que permite outro agente continuar sem perder contexto.

Formato mínimo:

```txt
from: agente ou painel
role: papel do agente
status: DONE | BLOCKED | PARTIAL
files_changed: arquivos alterados ou analisados
decisions: decisões tomadas
blockers: impedimentos encontrados
next: próxima ação sugerida
```

Reconciliação = juntar os handoffs, resolver conflito e apresentar um placar final.

Regra:

```txt
Agente não termina em silêncio.
Agente termina com handoff.
Consolidador junta handoffs.
Pivete vê placar e prova.
```

## 10. Isolamento de missões por org_id

Quando vários grupos de agentes estiverem rodando ao mesmo tempo, cada missão deve ter identificador próprio.

org_id = identificação da missão/grupo para não misturar contexto.

Regra:

```txt
Cada missão tem org_id.
Cada pane/agente pertence a um org_id.
Agentes de uma missão não reutilizam contexto de outra missão sem autorização.
Missões paralelas podem coexistir sem pisar uma na outra.
```

## 11. Watchdog de agentes

Watchdog = vigia automático que detecta agente travado, morto, sem resposta ou sem heartbeat.

Heartbeat = sinal periódico de que o agente ainda está vivo.

O watchdog deve:

- verificar snapshots de estado;
- marcar agente parado;
- marcar missão sem avanço;
- liberar pane/agente morto;
- evitar duplicação de execução;
- avisar o painel do Pivete.

Regra:

```txt
Agente sem heartbeat não pode ficar segurando missão.
Missão parada precisa aparecer no HUB.
Pivete precisa ver quem está vivo, quem travou e qual é o próximo passo.
```

## 12. Regra curta

Ferramenta muda.
Fluxo fica.
Execução importa.
Registro prova.

## 13. Primeira entrega sugerida

Criar uma tela MVP chamada Mapa Vivo no HUB.

Essa tela deve mostrar cards simples:

- GitHub
- VPS
- Supabase
- Gateway
- Bots
- Domínios
- Agentes
- Missões
- Handoffs
- Watchdog
- Divergências
- Ações pendentes

Cada card deve ter status, resumo e link para detalhe.

## 14. Segurança

Não salvar secrets.
Não expor tokens.
Não executar ação destrutiva.
Não mexer em produção sem autorização.
Não tratar VPS como fonte oficial.
Não deixar agente operar sem escopo.
Não consolidar mudança sem revisão.
Não misturar missões sem org_id.
Não ignorar agente travado sem registrar.

## 15. Selo

Mapa Vivo CentralDark = visão de ponta a ponta para o Pivete auditar, comandar, orquestrar agentes e evoluir o sistema sem depender de uma IA específica.
