## O que você pediu (em uma linha)

Um **único menu dentro do cockpit** que mostra o avanço real do próprio cockpit: o que já foi feito, o que falta, o que travou e por quê, com % de progresso e o Card Pivete de cada entrega. Sem v1/v2/v3. Fonte única, viva, dentro de `/admin/cockpit`.

## O que vai existir (só isso)

**1 aba nova no menu do cockpit:** `📋 AVANÇO` (entra na barra que hoje tem HUB · INFRA · IAs · GROK · N7).

Ao clicar, abre **um painel só**, dividido em 4 blocos empilhados (mobile-first, já que você usa no celular):

```text
┌─ AVANÇO DO COCKPIT ──────────────────────────┐
│  Progresso geral: ██████████░░░░  62%         │
│  12 feitas · 4 em andamento · 5 pendentes · 2 bloqueadas
├───────────────────────────────────────────────┤
│  [Filtro: Todas | ✅ Feitas | 🟡 Andando | 🔴 Pendentes | ⛔ Bloqueadas]
├───────────────────────────────────────────────┤
│  ✅ Reconciliação Esmeralda do cockpit         │
│     └ clique → abre Card Pivete completo       │
│  🟡 Menu AVANÇO (esta tela)      45%           │
│  🔴 Plugar logs reais no painel                │
│     └ Por que não foi: falta endpoint no HUB   │
│  ⛔ Alinhar VPS chore/*                        │
│     └ Bloqueado por: aguarda seu OK            │
└───────────────────────────────────────────────┘
```

**Cada item, ao clicar, abre o Card Pivete** com todos os campos que você mandou:
`ANTES_SHA256`, `DEPOIS_SHA256`, `ARQUIVOS_MODIFICADOS`, `OUTROS_ARQUIVOS_TOCADOS`, `RESTART_EXECUTED`, `INSTALADO_NO_HERMES`, `ONDE / POR QUE / PRA QUE`, `COMO / QUANDO / POR QUÊ USAR`, `PROVA (link)`, `TUTORIAL`. Campo vazio = `N/A`. Sem inventar.

## Fonte de dados (única, canônica — Lupa aplicada)

Um único arquivo JSON versionado no repo:

```text
docs/CONSCIENCIA/COCKPIT-AVANCO.json
```

- **Uma fonte só.** Sem v1/v2. Sem cópia em outro lugar.
- Formato simples (array de itens com `id`, `titulo`, `status`, `porcentagem`, `motivo_bloqueio`, e o `card_pivete` inteiro).
- O painel lê esse JSON via `fetch('/docs/CONSCIENCIA/COCKPIT-AVANCO.json')` no build/dev — sem backend novo, sem edge, sem migration.
- Atualizar = editar o JSON e commitar. Simples, rastreável no Git.

**Por que JSON no repo e não Supabase:** você pediu Lupa canônica e "não misturar assuntos alheios". Backend/tabela nova é escopo de outro pedido. JSON no repo mostra o avanço **do próprio código do cockpit** direto do Git — que é onde o avanço real acontece.

## Aplicação da Técnica da Lupa (canônica)

Antes de escrever qualquer item novo no JSON, o Lupa Check obriga:
- **Zoom out:** o item pertence ao cockpit? Se não, não entra.
- **Zoom in:** existe evidência (commit, arquivo, print, log)? Se não, marca `🔴 pendente` sem inventar prova.
- **Feynman:** dá pra explicar em 3 linhas leigas? Se não, o item volta pro rascunho.
- **AutoLupa:** se um item ficar > 7 dias sem mudança, aparece um selo `⚠️ parado — reavaliar` no painel.

Documento: `docs/CONSCIENCIA/COCKPIT-AVANCO.README.md` — 1 página só, explicando o formato e as 4 checagens acima.

## Arquivos que vou criar/editar (fechado — só isso)

1. `docs/CONSCIENCIA/COCKPIT-AVANCO.json` — fonte de verdade (já semeada com as ~20 tarefas reais conhecidas desta conversa).
2. `docs/CONSCIENCIA/COCKPIT-AVANCO.README.md` — 1 página: formato + Lupa Check.
3. `src/paginas/admin-cockpit/painéis/PainelAvanco.tsx` — o painel novo (leitor do JSON, filtros, barra de progresso, card expandido).
4. `src/paginas/admin-cockpit/painéis/CardPivete.tsx` — componente que renderiza o Card Pivete completo de um item.
5. `src/paginas/admin-cockpit/SalaControle.tsx` — adiciona a aba `AVANÇO` na `sc-nav` e faz o roteamento interno.
6. `src/paginas/admin-cockpit/sala-controle.css` — 20-30 linhas: estilos da barra de progresso, do card expandido e dos selos de status. Usa tokens Esmeralda que já reconciliamos.

## O que NÃO vou fazer neste plano

- Não crio tabela nova no HUB.
- Não crio edge function.
- Não mexo em áreas 🔒.
- Não mexo em VPS/PM2.
- Não mudo nenhuma outra aba do cockpit.
- Não crio "cockpit v2" nem duplicata em outra rota.

## Como você vai usar

1. Abre `/admin/cockpit` no celular ou desktop.
2. Toca em **AVANÇO** na barra do topo.
3. Vê a barra de % + contagem por status.
4. Filtra por status ou rola a lista.
5. Toca em qualquer item → abre o Card Pivete completo com prova, tutorial e motivo do bloqueio (se estiver 🔴 ou ⛔).
6. Quer atualizar? Me pede: "marca X como feito com Card Pivete Y" — eu edito o JSON e commito. Você vê a mudança no próximo reload.

## Progresso deste próprio menu

Vou registrar o item `#1: Menu AVANÇO` no JSON já semeado, começando em `🟡 45% — implementação inicial`. Quando terminar de plugar, viro pra `✅ 100%` com o Card Pivete preenchido — meta-prova de que o padrão funciona.

## Próximo passo depois de você aprovar

Executo os 6 arquivos acima em uma leva só, semeio o JSON com o inventário real desta conversa (ações concluídas + pendências + bloqueios que apareceram nos últimos turnos) e te devolvo o Card Pivete do próprio menu como primeira entrega no formato novo.