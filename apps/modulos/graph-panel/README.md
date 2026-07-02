# Graph Panel CentralDark

Painel seguro para visualizar o mapeamento do projeto em forma de grafo.

## Onde fica

`apps/modulos/graph-panel/`

Tudo do painel fica dentro desta pasta: servidor, tela, dados, scripts, logs e documentação.

## Como roda

- Porta local: `3030`
- Processo PM2: `graph-panel`
- Subdomínio: `grafo.centralldark.com`

## Rotas principais

- `/` abre o painel.
- `/api/health` mostra saúde do serviço.
- `/api/graph` entrega `data/graph.json`.
- `/api/report` entrega o resumo em Markdown.
- `/api/audit` entrega a auditoria em Markdown.
- `/api/stats` entrega contadores.
- `/api/history` lista runs salvos.
- `/api/run?mode=lovable` inicia novo run pela rota principal.
- `/api/run?mode=graphifyy` inicia run reserva.

## Estratégia

A rota principal usa a API Lovable quando a chave estiver disponível no ambiente. Se não estiver, o parser local mantém o painel funcionando com um grafo seguro básico.

O graphifyy não foi abandonado: ele fica como plano reserva.
