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

Lovable, ChatGPT, Claude, Codex, Gemini, Mistral, Grok ou outro agente podem mudar por preço, crédito, limite, qualidade ou disponibilidade.

O que deve ser fixo é o fluxo:

```txt
contexto no GitHub
estado vivo no Supabase
execução na VPS
entrada pelo Gateway
prova no painel
```

Regra:

```txt
Não limitar o CentralDark a Claude Cloud, Lovable, ChatGPT ou qualquer fornecedor único.
O CentralDark deve usar o que estiver disponível, melhor e autorizado pelo Pivete.
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
Pool antigo não deve ser reutilizado sem validação.
Pools vivos de outros orgs devem ser ignorados quando a missão for diferente.
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

## 12. Contrato de missão gamificado

Antes de iniciar missão multiagente, o sistema deve perguntar o mínimo necessário.

Formato observado e adaptado:

```txt
Qual a missão?
- Objetivo em 1 frase:
- Definition of Done:
- Restrições: não tocar em X, respeitar Y
- Prazo:
```

Definition of Done = critério objetivo para saber que a missão terminou.

Esse contrato permite transformar comando do Pivete em jogo operacional:

```txt
Missão = objetivo.
Squad = time escolhido.
Panes = jogadores/agentes em campo.
Placar = DONE / PARTIAL / BLOCKED.
Handoff = relatório de cada jogador.
Watchdog = juiz que percebe travamento.
Consolidador = técnico que junta o resultado final.
Pivete = comandante que aprova ou manda ajustar.
```

Gamificação = deixar a execução visual, acompanhável e fácil de auditar como se fosse um jogo de missão.

## 13. Catálogo inicial de squads e skills

Este catálogo vem das referências trazidas pelo Pivete para o modelo de operação multiagente.

Skill = capacidade ou comando especializado de um agente.
Squad = grupo de agentes com papéis complementares.

### Design e planejamento

```txt
/brainstorming        -> alinhar direção
/architect-first      -> mapa técnico
/senior-architect     -> segunda opinião arquitetural
@architect +design    -> decisão formal arquitetural
```

### Implementação

```txt
/senior-backend       -> backend, banco, integrações
/senior-frontend      -> frontend, React, Tailwind
/senior-fullstack     -> fluxo completo ponta a ponta
/react-best-practices -> performance e renderização
@dev +develop-story   -> transformar tarefa em entrega técnica
```

### UI/UX

```txt
/apex-lead            -> squad frontend completo
/impeccable           -> polimento visual forte
/ui-design-system     -> tokens e consistência visual
/dashboard-design     -> telas de dados e painéis
/dataviz              -> gráficos e cores
/frontend-design      -> design criativo em código
```

UI = parte visual da tela.
UX = experiência de uso.
Dataviz = visualização de dados em gráficos, cards e painéis.

### Qualidade

```txt
/simplify             -> limpar duplicação
/code-review          -> revisão geral
/security-review      -> segurança e secrets
@qa +qa-gate          -> gate oficial de qualidade
/paranoid-audit       -> auditoria máxima
/blind-spot-audit     -> procurar o que foi esquecido
/verify-6-levels      -> múltiplos níveis de checagem
```

Gate = barreira de validação antes de avançar.

### Orquestração

```txt
/dispatch-chief       -> decompor decisão arquitetural em tarefas menores
/overclock-skill      -> mecânica multiagente inspirada em panes
/class-calc           -> plano global antes de executar
/swarm-architect      -> padrão de swarm controlado
/wave-execute         -> execução em ondas estruturadas
```

Swarm = enxame de agentes trabalhando em paralelo.
Wave = onda de execução com fase, limite e revisão.

### Pesquisa

```txt
/dc-orchestrator      -> pesquisa profunda com várias mentes
/context7             -> documentação oficial de bibliotecas
/tech-research        -> escolher stack e ferramenta
/spy                  -> benchmark de concorrente
```

Benchmark = comparar com referências externas para melhorar o produto.

### Go-to-market

```txt
/offer                -> oferta
/pricing              -> precificação
/copy                 -> texto persuasivo
/hooks                -> ganchos de atenção
/copy-chief           -> escrita geral
/ads-audit            -> auditoria de criativos
/brand-chief          -> narrativa da marca
```

Go-to-market = plano para colocar produto no mercado.

### Conteúdo

```txt
/curator-chief        -> cortes, curadoria e organização de conteúdo
```

## 14. Contrato de missão para workers

Todo worker deve receber um contrato curto antes de executar.

Worker = agente trabalhador que executa uma parte da missão.

Formato base:

```txt
Contrato novo.
Papel: <role>
Tarefa: <tarefa>
Arquivos exclusivos seus: <lista>
Skill sugerida: <skill>
Definition of Done: <critério>
Devolva HANDOFF ao terminar.
```

Definition of Done = critério objetivo para saber que a tarefa terminou.

## 15. Painéis, panes e preview

O modelo observado usa panes paralelos para acompanhar muitos agentes ao mesmo tempo.

Pane = janela/painel de execução de um agente.
Preview = visualização ao vivo do que está sendo construído.

Para o CentralDark, isso vira:

```txt
pane_spawn_many       -> criar vários panes/agentes
pane_wait_many        -> esperar vários panes concluírem
pane_read_many        -> ler handoffs quando ficarem ociosos
preview_live          -> mostrar resultado em tempo real
placar_missao         -> mostrar DONE / PARTIAL / BLOCKED por agente
pool_status           -> mostrar SPANNED / IGNORED / DEAD / ACTIVE
```

Regra:

```txt
Pivete precisa ver o trabalho acontecendo.
Agente precisa mostrar estado.
Preview não substitui GitHub.
Preview ajuda auditoria antes do commit.
```

## 16. Referência Overclock

Overclock entra como referência de arquitetura para sala de comando multiagente.

Referência não significa copiar marca, código proprietário ou depender da ferramenta.

Significa observar padrões úteis:

```txt
cockpit multiagente
panes paralelos
preview em tempo real
workers com papel claro
squads por especialidade
handoff obrigatório
placar de missão
watchdog de agentes
isolamento por missão
controle de custo por modelo
uso de múltiplos provedores
```

Regra:

```txt
Overclock inspira.
CentralDark governa.
Ferramenta muda.
Fluxo fica.
```

## 17. Primeira entrega sugerida

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
- Squads e Skills
- Preview
- Pools e org_id
- Divergências
- Ações pendentes

Cada card deve ter status, resumo e link para detalhe.

## 18. Segurança

Não salvar secrets.
Não expor tokens.
Não executar ação destrutiva.
Não mexer em produção sem autorização.
Não tratar VPS como fonte oficial.
Não deixar agente operar sem escopo.
Não consolidar mudança sem revisão.
Não misturar missões sem org_id.
Não ignorar agente travado sem registrar.
Não usar bypass de permissão em área protegida ou produção.
Não permitir que preview substitua commit oficial.
Não copiar código proprietário de ferramenta externa.

## 19. Selo

Mapa Vivo CentralDark = visão de ponta a ponta para o Pivete auditar, comandar, orquestrar agentes, usar squads, aplicar gamificação operacional e evoluir o sistema sem depender de uma IA específica.
