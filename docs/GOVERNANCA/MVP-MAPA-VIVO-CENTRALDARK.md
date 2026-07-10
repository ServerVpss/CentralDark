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

## 9. Regra curta

Ferramenta muda.
Fluxo fica.
Execução importa.
Registro prova.

## 10. Primeira entrega sugerida

Criar uma tela MVP chamada Mapa Vivo no HUB.

Essa tela deve mostrar cards simples:

- GitHub
- VPS
- Supabase
- Gateway
- Bots
- Domínios
- Agentes
- Divergências
- Ações pendentes

Cada card deve ter status, resumo e link para detalhe.

## 11. Segurança

Não salvar secrets.
Não expor tokens.
Não executar ação destrutiva.
Não mexer em produção sem autorização.
Não tratar VPS como fonte oficial.
Não deixar agente operar sem escopo.
Não consolidar mudança sem revisão.

## 12. Selo

Mapa Vivo CentralDark = visão de ponta a ponta para o Pivete auditar, comandar, orquestrar agentes e evoluir o sistema sem depender de uma IA específica.
