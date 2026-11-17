---
title: "Lembrança — Landing responsiva no mobile por PASS comprovado"
status: CANONICAL_MEMORY
updated: 2026-11-17
authority: SEGREDO/CHEFE
owner: docs/CONSCIENCIA/05-APRENDIZADOS/
repo_afetado: segredounlock/app
truth_rule: REALIDADE_IS_JUDGE
---

# Lembrança — Landing responsiva no mobile por PASS comprovado

O CHEFE declarou conformidade 100% na responsividade mobile da landing do apex
`centralldark.com`. Esta lembrança cristaliza o que foi comprovado, como foi medido e as
regras que impedem o defeito de voltar.

```text
MEDIR_NO_NAVEGADOR_REAL
→ CORRIGIR_A_CAUSA (não o sintoma)
→ CONTRAprova_EM_CADA_LARGURA
→ REGISTRAR
→ SINCRONIZAR_REPO
```

## Estado comprovado

| Item | Valor |
| --- | --- |
| Repositório | `segredounlock/app` |
| Base | `main` @ `e849c45c20c86e4473e430b6b0b207f00b92718e` |
| Commit landing | `32133a2` (branch `feat/landing-responsivo-mobile`) |
| Integração | PR #1 mesclado em `main` @ `d445bcf` |
| Publicado | `/data/www/centralldark` (build CRA), apex HTTP 200 |
| Arquivos | `frontend/src/App.css`, `components/landing/Hero.jsx`, `components/landing/Navbar.jsx`, `pages/Landing.jsx`, `public/index.html` |

## Defeitos reais encontrados (todos com sintoma do usuário)

1. **Menu sumia sem substituto.** Abaixo de 1100px o `.nav-links` recebia `display: none` e não
   existia botão. Sintoma: "no mobile não tem menu".
2. **Cards mais largos que a tela.** O item de grid tinha `min-width: auto` e não encolhia abaixo do
   conteúdo: `.hero-figure` media 401px dentro de um `hero-grid` de 334px. Sintoma: "o OPEN está
   cortado". O `scrollWidth - clientWidth` marcava **0** — o `overflow: hidden` do ancestral
   escondia a prova.
3. **Margem lateral desperdiçada.** A div-container da página tinha `padding` inline de 48px, isto
   é, 96px do celular perdidos. Sintoma: "aproveita mais o espaço".
4. **Oclusão e recorte no empilhamento.** No mobile o SVG do capuz (`z-index` inline 2) pintava por
   cima dos cards `position: relative`; e o container com `aspect-ratio: 1/1` + `overflow: hidden`
   recortava os cards ao saírem do `position: absolute`. Sintoma: "o card sumiu", "o campo não está
   visível".

## Contraprova medida (navegador real, cache-buster)

Borda direita do card contra a largura da tela:

| Largura | Container | Card | Borda direita | Corta? |
| --- | --- | --- | --- | --- |
| 320px | 320 | 296 | 308 | não |
| 360px | 360 | 336 | 348 | não |
| 375px | 375 | 343 | 359 | não |
| 390px | 390 | 358 | 374 | não |
| 430px | 430 | 398 | 414 | não |
| 768px | 768 | 736 | 752 | não |

Antes: em 430px o card ia até **449** — 19px fora da tela.
`scrollWidth - clientWidth = 0` em todas as larguras. Desktop 1280px inalterado
(`aspect-ratio: 1/1`, cards `position: absolute`, fonte 12px, padding 48px).

## Regras que ficam (não repetir o erro)

- **Item de grid/flex não encolhe sozinho.** `min-width: 0` no item e no filho largo. Medir
  `card.getBoundingClientRect().right` contra `window.innerWidth`; o probe de `scrollWidth` **não**
  pega esse defeito.
- **Geometria não é visibilidade.** `getBoundingClientRect()` continua contando "linhas visíveis"
  enquanto um irmão absoluto com `z-index` inline cobre o conteúdo. Comparar `z-index`/`position`
  do overlay com os cards e confirmar com print do trecho.
- **`aspect-ratio` fixo + `overflow: hidden` recorta** o que entra no fluxo em coluna. Ao empilhar:
  `aspect-ratio: auto !important` e `overflow: visible !important` no container.
- **Estilo inline vence `@media`.** Para empilhar/afrouxar algo com `display:flex` ou `padding`
  inline, dar classe semântica no JSX (`cd-container`, `hero-copy`) e alvo no CSS com `!important`.
- **Reduzir o padding do container antes de reduzir o componente.** "Diminui o card" + "aproveita a
  largura" costuma significar "cabe na tela com margem menor", não fonte menor.
- **Testar na largura do aparelho do usuário.** O iPhone Pro Max tem 430px de CSS: testar 375px
  pode passar enquanto o defeito real está em 430–500px.
- **Corrigir a causa, nunca esconder com `overflow-x: hidden`.** Esconder o eixo esconde também a
  prova e quebra `position: sticky` de descendentes.

## Pendências honestas

- `frontend/public/index.html` removeu os scripts de terceiros do template (`posthog`,
  `emergent-main.js`) e atualizou metadados (`lang="pt-BR"`, title `CENTRAL DARK`, canonical, Open
  Graph/Twitter).
- `backend/.env` e `frontend/package-lock.json` seguem **não rastreados** no clone local; o `.env`
  não está no `.gitignore` — cuidado para não commitar segredo.
- `MERGED != DEPLOYED`: o PASS aqui vale para o apex medido no navegador após publicação.

## Como usar

Ao mexer no mobile desta landing, medir antes e depois nas larguras 320/360/375/390/430/768/1280,
comparar a borda direita do card com a largura da tela e conferir o desktop. Só declarar PASS com
número. `UNKNOWN != PASS`.
