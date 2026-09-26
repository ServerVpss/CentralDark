# Gates de implementação

## Gate 1 — descoberta
- checkout, HEAD, PM2, portas e runtimes medidos;
- nenhuma mutação;
- nenhum secret lido;
- hashes emitidos.

## Gate 2 — topologia
- todos os processos encontrados possuem cadeia ou `UNKNOWN`;
- nenhuma ligação inferida é marcada `CONFIRMED`.

## Gate 3 — modelo local
- hardware medido;
- runtime instalado comprovado;
- modelo já instalado inventariado;
- benchmark local antes de seleção final;
- sem instalação automática nesta fase.

## Gate 4 — escrita
- writer único;
- branch/worktree isolada;
- diff restrito à Sentinela e testes;
- sem colisão com PRs ativos;
- rollback definido.

## Gate 5 — Judge
- ator separado;
- read-only;
- HEAD congelado;
- resultados reproduzíveis.

## Gate 6 — promoção
- checks no HEAD exato;
- receipt SHA-256;
- nenhuma pendência P1/P2;
- autorização canônica aplicável.
