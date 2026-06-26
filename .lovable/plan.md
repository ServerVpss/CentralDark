## O que vamos fazer (em linguagem simples)

Hoje o seu menu lateral só mostra **algumas** páginas do site. Existem várias páginas que foram criadas mas ficaram "soltas" — o site sabe que o arquivo existe, mas ninguém aponta uma porta de entrada (rota) pra elas. Resultado: você não consegue clicar e abrir.

A ideia é:

1. **Mapear tudo automaticamente** — um pequeno script vai varrer a pasta de páginas e listar todas que existem.
2. **Comparar com o que está registrado** no `App.tsx` (o "índice" do site).
3. **Cadastrar as que faltam**, pra cada página ter uma URL e aparecer no menu.
4. **Criar uma tela `/mapa`** dentro do seu painel que mostra esse relatório — páginas registradas, páginas órfãs (sem rota), e total. Assim você vê tudo de uma vez.

## Como vou organizar o trabalho

Uso 3 sub-agentes trabalhando em paralelo pra ser rápido:

- **Auditor** — varre `src/apps/**/pages` e gera a lista bruta.
- **Executor** — adiciona as rotas que faltam no `App.tsx` e cria a página `/mapa`.
- **Validador** — roda checagem de tipos no final pra garantir que nada quebrou.

## Garantias de segurança

- Só **adiciono** rotas, nunca removo nem altero as existentes.
- Nenhuma página atual muda de comportamento.
- 3 componentes que estão mal-colocados (estão na pasta `pages/` mas não são páginas) vão pra pasta correta — ajusto o único import afetado.
- Build é validado antes de entregar.
- **Não toca na VPS** — fica só no site, como você pediu.

## O que você vai ver depois

- Menu lateral com **todas** as páginas do site listadas.
- Nova rota `/mapa` com um painel mostrando: "X páginas no total, Y registradas, Z órfãs" + lista clicável.
- Um arquivo `public/data/paginas.json` com o relatório bruto (caso queira inspecionar).

## Detalhes técnicos (pra referência)

- Script novo: `scripts/audit-pages.mjs` (Node, roda local, gera JSON).
- Página nova: `src/apps/painel/pages/MapaSite.tsx`.
- Edição: `src/App.tsx` recebe os `<Route>` faltantes.
- Movimentação: 3 componentes não-página saem de `pages/` pra `components/` (com ajuste do import).
- Validação final: `tsgo` no projeto inteiro.