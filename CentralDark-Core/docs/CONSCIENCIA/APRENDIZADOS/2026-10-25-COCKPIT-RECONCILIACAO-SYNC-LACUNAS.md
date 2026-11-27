# Reconciliação do cockpit após sync local main ↔ origin/main (2026-10-25)

## Contexto
A sincronização de `main` local com `origin/main` (237 commits de distância) exigiu descartar um
commit local (`59c23a02a7`, preservado intacto na tag `backup/pre-sync-20261025`) porque:
- tinha um bug real (`jarvisMic` usado sem ser declarado em `StatusPanel.tsx`);
- conflitava com ~240 linhas que o upstream já tinha mudado em `cockpit.functions.ts` no mesmo período.

## O que foi reconciliado nesta sessão (commit `eb7c7705e8`)
- Header visual "CentralDark / Instinto Superior" em `CockpitShell.tsx`.
- `StatusPanel.tsx` passou a expor 4 sensores que o backend **já media** mas a UI não mostrava:
  `grafoVivo`, `omniRouter`, `heartbeat`, `receipts` (campos já existentes em `cockpit.functions.ts`).

## Lacunas identificadas, NÃO reimplementadas (fora do escopo desta reconciliação)
Essas partes do commit descartado dependiam de infraestrutura de backend que não existe hoje em
`cockpit.functions.ts` e precisariam ser desenhadas do zero, coordenando com quem estiver mexendo
nesse arquivo no momento (alta frequência de mudança — ver `#OBSERVACOES#` no topo de `CockpitShell.tsx`):

1. **Tailscale Casa↔VPS** — sensor novo, sem probe hoje.
2. **Screenpipe Vídeo/OCR separado de Áudio** — hoje só existe o campo agregado `screenpipe`
   (alias legado); split em dois sensores independentes não existe.
3. **Microfone do Jarvis** — sensor client-side via `CustomEvent("centraldark:jarvis:audio")`,
   nunca chegou a existir no DOM (o listener que o alimentava nunca foi declarado). Precisa de quem
   estiver trabalhando no componente Jarvis confirmar se esse evento ainda é emitido em algum lugar.
4. **Card "🪬 Missão-mãe"** em `ForjaExecutor.tsx` — lê o Kanban Hermes Casa via uma função de
   servidor nova (`lerMissoesMaeCentralDark`, ID `t_911e17ff`) que nunca foi criada em
   `cockpit.functions.ts`. É a peça mais substancial (card inteiro + 20+ linhas de ordenação de
   missões por estado).

## Bugs pré-existentes achados e corrigidos de passagem (não causados por este trabalho)
- `MapaOwners.tsx`: `<servidor-publico>` como texto solto dentro de JSX quebrava o parser.
- `CockpitShell.tsx`: `HARNESS_DESTINOS` declarado duas vezes (array antigo + `= COCKPIT_ABAS`),
  sobra de uma migração para `@/data/painel-unico` que não foi finalizada.
- `CockpitShell.tsx`: atributo `onClick` duplicado no botão "CentralDark Estúdio".

## Próximo passo sugerido
Antes de retomar os itens 1–4, migrar de fato `HARNESS_DESTINOS` para `COCKPIT_ABAS` (hoje
`COCKPIT_ABAS` não tem o campo `icone` usado pela busca do harness) — essa dívida técnica vai
colidir de novo com qualquer novo trabalho na mesma área.
