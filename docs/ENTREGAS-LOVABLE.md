# 📒 Diário de Entregas — Lovable

> **Para quê serve isso (leigo):** é o caderno de obra da Lovable. Toda vez que a Lovable mexe em algum arquivo do projeto, ela escreve aqui — em português simples — o que foi feito, onde, como testar e o que ainda falta. Assim o Pivete, a equipe do GitHub e as automações não precisam adivinhar nada: abrem este arquivo e leem o que aconteceu, na ordem, do mais novo pro mais velho.

## Como ler

- Entrada mais recente sempre no **topo**.
- Cada entrega segue o mesmo modelo padronizado (abaixo).
- Se um campo não se aplica, escrever `—` (não apagar o campo).
- O SHA do commit da própria entrega **não pode** ficar dentro do arquivo (o arquivo faz parte do próprio commit — colocar o SHA aqui geraria outro commit em cima). Nesse caso, usar `este commit (SHA informado no chat/PR)`. Nas próximas entregas, o SHA anterior pode ser preenchido normalmente.

## Modelo padrão de entrega

```md
## [AAAA-MM-DD HH:MM BRT] — Título curto e claro

- **Fio da missão:** de onde viemos e o que o Pivete pediu.
- **Escopo:** frontend | admin | portal | telepainel | docs | backend | infra.
- **Área tocada:** caminhos exatos dos arquivos.
- **O que mudou:**
  - `caminho/arquivo` → o que foi alterado, em 1 linha.
- **Supabase / backend:** migration, edge function ou "—".
- **Depende da VPS / equipe GitHub?:** sim/não + o quê.
- **Como testar (leigo):** passos simples em PT-BR.
- **Evidência:** rota, print, query ou observação de validação.
- **Pendências deixadas:** o que ficou pra depois.
- **Próximo passo:** uma única ação.
- **Commit:** `[LOVABLE][área] título` — SHA e branch.
- **Branch:** `pivete/dev`.
```

---

## 2026-07-14 14:30 BRT — Revisão do commit anterior (endurecimento controller + migração)

- **Fio da missão:** "PERMITO PIVETE" — revisar o commit `7b6a4321f045b3036919a0ef1ebc3e3789ec95e1`, sem deploy, sem executar migração real, sem fechar issue/PR e sem tocar em secrets.
- **Escopo:** infra (workflows) + docs.
- **Área tocada:**
  - `.github/workflows/github-bot-controller.yml`
  - `.github/workflows/bots-labels-seed.yml`
  - `scripts/github-bot-controller.mjs`
  - `docs/BOTS/README.md`, `docs/BOTS/TIME-DE-BOTS.md`
  - `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md`
  - `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
- **O que mudou:**
  - Verdade documental: todas as frases que davam a migração como "executada/removida" viraram "preparada, execução pendente do `workflow_dispatch`".
  - Controller workflow: checkout fixa `ref: default_branch`, `persist-credentials: false`, `clean: true` (self-hosted não executa código de PR); relatório persiste via `actions/upload-artifact@v4` (`if: always()`, nome único por `run_id`/`run_attempt`, retention 7 dias, `if-no-files-found: warn`); script escreve resumo em `GITHUB_STEP_SUMMARY` quando disponível.
  - Fechamento manual mais forte: agora exige linha explícita `Supersedes: #N #N …` no corpo do PR mergeado (case-insensitive); `BOT_SUPERSEDES` precisa ser subconjunto dela; preflight valida existência/estado/base de todos os alvos e a existência da label `superseded`. Qualquer falha aborta o lote inteiro sem escrita. Auditoria pagina PRs abertos (sem corte em 100). Removida a alegação de "rate-limit ciente".
  - Migração de labels: dispatch-only mantido; `failedMig` agora tem efeito — o job falha o workflow no final se algum item ou deleção falhar, sem apagar alias que ainda tenha uso.
- **Supabase / backend:** —
- **Depende da VPS / equipe GitHub?:** sim — Pivete ainda precisa disparar o workflow manualmente (dry-run → aplicar).
- **Como testar (leigo):** Actions → "Bots — seed de labels oficiais" → Run workflow com `dry_run=true, run_migration=true` → ler log/summary. Depois `dry_run=false`. Actions → "GitHub Bot Controller" (dispatch sem inputs) gera relatório baixável (artifact) e resumo no summary.
- **Evidência:** `node --check scripts/github-bot-controller.mjs` OK; YAMLs validados com `yq`; busca no repo confirma que nenhum canônico contém alias legado e que nenhuma doc afirma migração já executada.
- **Pendências deixadas:** dispatch manual da migração ainda não rodado.
- **Próximo passo:** Pivete disparar o workflow em dry-run, revisar summary/artefato, depois aplicar.
- **Commit:** `[LOVABLE][infra] Revisar controller e migração — verdade documental + preflight forte` — este commit (SHA informado no chat/PR).
- **Branch:** `pivete/dev`.

---

## 2026-07-14 12:00 BRT — Consolidação de labels + fix github-bot-controller

- **Fio da missão:** "PERMITO PIVETE" — corrigir duplicidade alias/canônico no seed de labels e o workflow quebrado do controller, sem fechar issue/PR e sem tocar em produção.
- **Escopo:** infra (workflows) + docs.
- **Área tocada:**
  - `.github/workflows/bots-labels-seed.yml` (reescrito: 2 jobs — seed canônicos + migrate opcional)
  - `.github/workflows/github-bot-controller.yml` (path corrigido; DRY_RUN default true)
  - `scripts/github-bot-controller.mjs` (novo, seguro e reversível)
  - `docs/BOTS/README.md`, `docs/BOTS/TIME-DE-BOTS.md` (nota de migração de aliases **preparada**, execução pendente)
  - `docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md` (seção "Duas camadas")
  - `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` (registro da decisão)
- **O que mudou:**
  - Seed passa a criar/atualizar somente canônicos (roteamento `assign:*` + camada humana emoji/PT-BR). Aliases legados (`assign:faxineiro`, `:auditor`, `:seguranca`, `:vps-health`) saem do seed.
  - Novo job `migrate` (dispatch-only, `dry_run`+`run_migration`) troca alias→canônico em issues/PRs abertos e fechados e só deleta a label alias quando a contagem restante é 0. Nunca fecha issue/PR. **Migração preparada, ainda não executada.**
  - `github-bot-controller` corrigido pra `scripts/github-bot-controller.mjs`. Modo agenda/PR-closed = auditoria (relatório em `docs/RELATORIOS/github-bot-controller/`). Modo dispatch só fecha PR substituído quando merged_pr está mergeado, cada superseded está aberto e é referenciado explicitamente (`#<n>`) no merged.
- **Supabase / backend:** —
- **Depende da VPS / equipe GitHub?:** sim — Pivete precisa rodar manualmente o workflow "Bots — seed de labels oficiais" primeiro com `dry_run=true, run_migration=true`, revisar o log, depois com `dry_run=false, run_migration=true`.
- **Como testar (leigo):** Actions → "Bots — seed de labels oficiais" → Run workflow → escolher dry_run/run_migration → ler o log e o summary. Depois `gh label list` não deve mais mostrar as 4 labels alias.
- **Evidência:** `node --check` OK; YAML validado com `yq eval`.
- **Pendências deixadas:** dispatch manual da migração ainda não foi rodado (aguarda Pivete).
- **Próximo passo:** Pivete dispara o workflow em dry-run, valida, depois aplica.
- **Commit:** `[LOVABLE][infra] Consolidar labels e corrigir github-bot-controller` — SHA `7b6a4321f045b3036919a0ef1ebc3e3789ec95e1`.
- **Branch:** `pivete/dev`.



## 2026-07-14 09:20 BRT — Cockpit vira Sala de Controle (etapa 1)

- **Fio da missão:** transformar `/admin/cockpit` numa sala de controle densa (Overclock-like), sem cara de site, esperando o dossiê do Grok pra ganhar dados reais.
- **Escopo:** frontend.
- **Área tocada:**
  - `src/paginas/admin-cockpit/SalaControle.tsx` (novo)
  - `src/paginas/admin-cockpit/sala-controle.css` (novo)
  - `src/paginas/admin-cockpit/hooks/useCockpitLive.ts` (novo, mock estruturado)
  - `src/app/rotas/rotas-admin.tsx` (rota `/admin/cockpit` → SalaControle)
  - `src/paginas/centraldark-admin/pages/DashboardAdmin.tsx` (botão "🎮 Entrar na Sala de Controle")
- **O que mudou:** rota `/admin/cockpit` agora renderiza uma cabine (header · nav · mapa vivo SVG · feed IA · console) em paleta esmeralda oficial, com nós/linhas animados e dados mock no formato que o dossiê do Grok vai preencher. Painel admin ganhou card destacado levando pro cockpit.
- **Supabase / backend:** — (mock local; consumo de HUB `/cockpit/state` é entrega separada).
- **Depende da VPS / equipe GitHub?:** não pra rodar. Sim depois: HUB precisa expor endpoint/WebSocket de estado vivo.
- **Como testar (leigo):** logar como admin → em `/centraldark/admin` clicar em "🎮 Entrar na Sala de Controle" → ver mapa com nós pulsando, feed do Hermes rolando e console embutido.
- **Evidência:** rota carrega sem erro, layout bate com o wireframe enviado pelo Pivete.
- **Pendências deixadas:**
  - Antigos arquivos `src/admin/cockpit/*` seguem no repo (não referenciados). Remover em etapa seguinte.
  - Abas MCP/HUB/Infra/IAs/Logs mostram placeholder até o dossiê chegar.
  - Conectar dados reais depende do HUB expor `/cockpit/state`.
- **Próximo passo:** aguardar dossiê do Grok e trocar a fonte de `useCockpitLive` do mock pro endpoint real.
- **Commit:** `[LOVABLE][admin] Reconstruir cockpit como Sala de Controle` — este commit (SHA informado no chat/PR).
- **Branch:** `pivete/dev`.

---

## 2026-07-13 16:28 BRT — Padronizar entregas e labels (Lovable ↔ GitHub)

- **Fio da missão:** Pivete pediu um fluxo contínuo entre Lovable e a equipe/automação do GitHub, pra ninguém adivinhar o que a Lovable mudou nem gastar tokens repetindo contexto.
- **Escopo:** docs.
- **Área tocada:**
  - `docs/ENTREGAS-LOVABLE.md`
  - `docs/LEIA-EQUIPE-GITHUB.md`
  - `.lovable/GUIA-DO-PIVETE.md`
- **O que mudou:**
  - `docs/ENTREGAS-LOVABLE.md` → criado como diário vivo com modelo padronizado e esta primeira entrada.
  - `docs/LEIA-EQUIPE-GITHUB.md` → criado como página curta pra equipe/automação do GitHub entender o que vem da Lovable e como tratar.
  - `.lovable/GUIA-DO-PIVETE.md` → acrescentada seção permanente de convenção de entrega (sem apagar nada do que já existia).
- **Supabase / backend:** —
- **Depende da VPS / equipe GitHub?:** não pra rodar. Sim pra o próximo passo (a equipe do GitHub passa a olhar `docs/ENTREGAS-LOVABLE.md` como fonte humana das entregas Lovable).
- **Como testar (leigo):** abrir os 3 arquivos acima e conferir se o modelo, as regras de label e a seção nova do guia estão como descrito.
- **Evidência:** os 3 arquivos existem e batem com este modelo.
- **Pendências deixadas:**
  - Os workflows `.github/workflows/pr-agent.yml` e `.github/workflows/pr-auto-review.yml` escutam PRs para `main`. PR de `pivete/dev` → `pivete/auditoria` **ainda não** dispara essas revisões automáticas. Ajustar isso exige mexer em workflow, o que precisa de ordem explícita do Pivete.
- **Próximo passo:** abrir/atualizar o PR de `pivete/dev` para `pivete/auditoria` e aplicar as labels corretas (`frontend`, `assign:lovable`, `revisao-humana`).
- **Commit:** `[LOVABLE][docs] Padronizar entregas e labels` — este commit (SHA informado no chat/PR).
- **Branch:** `pivete/dev`.
