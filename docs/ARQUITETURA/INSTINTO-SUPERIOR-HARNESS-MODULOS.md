# Instinto Superior · Harness de módulos e loop direcional

## Decisão canônica

O Instinto Superior é a superfície visual. O CentralDark Harness é o orquestrador. Cada motor permanece no próprio owner, processo e transporte; o cockpit apenas resolve intenção, mostra capacidade e abre a rota original quando ela estiver comprovada.

Não existe segundo cockpit, clone de runtime, migração forçada ou arquitetura paralela.

## Loop obrigatório

`intenção → owner → transporte → execução → readback → receipt → CI`

Cada entrada deve carregar `owner`, `transport`, `scope`, `session` e `evidence`. Falha ou ausência de prova retorna `UNKNOWN`; nunca é promovida a `PASS`.

## Módulos

- DeepSeek: owner existente do harness.
- Hermes: owner `apps/modulos/HERMES-CORE`, transporte MCP/RDC.
- Claude Code: cliente externo/VS Code; sessão viva ainda requer prova.
- ChatGPT/Cowork: cliente externo/Work; rota viva ainda requer prova.
- VS Code: extensão/host existente; não recebe uma segunda extensão concorrente.
- Figma: connector MCP existente.
- Obsidian: Grafo Vivo existente; leitura e escrita dependem de readback do owner.

## Ciclo de branches, PR e CI

A branch do owner recebe o delta. O PR equivalente é a fila de revisão. O CI é disparado pelo commit do PR; somente o readback dos checks fecha o ciclo. Branches separadas não são absorvidas por cópia manual: entram por PR/merge da mesma linhagem.

## Memória persistente

Este arquivo é o registro técnico versionado. A publicação no Obsidian/Grafo Vivo deve ser confirmada pelo sensor do owner; enquanto `obsidian_live_graph_status` falhar, o estado permanece `UNKNOWN` e não é declarado sincronizado.

## Gate de implementação

A integração página por página/arquivo por arquivo só pode ser marcada 100% após inventário com origem, owner, hash/versão, consumidor e prova de runtime para cada item. O catálogo não substitui o inventário.
