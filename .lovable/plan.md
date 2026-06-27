# Investigar a conexão com `run.gptengineer.app`

## Contexto rápido (em PT-BR, sem enrolar)

Esse domínio `run.gptengineer.app` é o **runtime oficial do Lovable** (a Lovable nasceu como "GPT Engineer" e manteve o domínio). Toda preview Lovable carrega um script desse host pra ligar o editor ao app em execução. O `?token=...` é uma sessão temporária de quem abriu o link — não dá pra eu abrir nem reaproveitar.

Ou seja: **sim, tem conexão direta**. Esse é o cordão umbilical entre o seu projeto e a Lovable.

## O que eu quero confirmar no código

1. Procurar no `index.html` a tag `<script src="https://cdn.gptengineer.app/gptengineer.js">` (ou similar) — é ela que conversa com `run.gptengineer.app`.
2. Procurar qualquer outra referência a `gptengineer` / `gpteng` no repositório (workflows, scripts, docs).
3. Confirmar no GitHub quem é o bot que commita (`gpt-engineer-app[bot]`) — mesmo nome, mesma origem do domínio.

## O que vou entregar

Um resumo curto, em uma mensagem só:
- Onde o script aparece no projeto.
- Quais arquivos/commits vêm dessa origem.
- Confirmação de que `run.gptengineer.app` = infraestrutura Lovable, não terceiro estranho.

## O que **não** vou fazer

- Não abrir/usar o token da URL (é sessão privada de quem gerou).
- Não mexer em nenhum arquivo. Investigação puramente de leitura.
