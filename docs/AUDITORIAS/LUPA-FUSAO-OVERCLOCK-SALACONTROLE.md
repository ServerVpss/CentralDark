# Auditoria Lupa — Fusão Overclock × Sala de Controle

**Data:** 2026-07-22
**HEAD `pivete/dev`:** `843762acc6` (renomeou skill lupa-bayesiana)
**HEAD `main`:** `b2333bcbdb` (registrar push painel)
**VPS branch atual:** `chore/gateway-providers-routes` · último commit `0208fc06b9`
**Fonte externa:** `MARKDOWN.zip` (roadmap Sonnet + 32 screenshots do Overclock 1.1.0)
**Modo:** read-only (nenhum arquivo do cockpit alterado)

---

## 1. Fonte da verdade × VPS

| Item | Estado | Evidência |
|------|--------|-----------|
| `pivete/dev` HEAD | `843762acc6` | GitHub API |
| `main` HEAD | `b2333bcbdb` | GitHub API |
| Branch da VPS | `chore/gateway-providers-routes` | `vps_git_status` |
| Working tree VPS | 🟡 27 arquivos modificados + 15 untracked | `vps_git_status` |
| `HERMES-CORE/missions/` | 🟡 dirs existem (`pendente/em-andamento/concluidas`), vazios | `vps_list_dir_safe` |

**Inconsistência #1:** VPS está numa branch diferente de `pivete/dev` e com working tree sujo — merges/pushes futuros precisam higienizar antes.
**Inconsistência #2:** barramento de missões existe fisicamente mas nunca foi escrito. Confirmado ponto morto.

---

## 2. Cockpit atual (Sala de Controle)

| Peça | Caminho | Estado |
|------|---------|--------|
| Página | `src/paginas/admin-cockpit/SalaControle.tsx` | 🟢 183 linhas, densa, monoespaçada |
| CSS | `src/paginas/admin-cockpit/sala-controle.css` | 🟢 278 linhas |
| Fundo Matrix | `MatrixRain.tsx` | 🟢 integrado |
| Mascote reativo | `HermesMascote.tsx` | 🟢 lê último log |
| Hook de estado | `hooks/useCockpitLive.ts` | 🟡 dados mock |
| Rota | `/admin/cockpit` (+ alias `/preview/cockpit`) | 🟢 |
| Abas | MAPA · MCP · HUB · INFRA · IAs · GROK · LOGS | 🟢 7 abas |
| Overclock antigo | — | 🔴 já removido (não existe mais rota `/admin/cockpit-overclock`) |

---

## 3. Overclock 1.1.0 — o que o zip revela

Screenshots analisados: 1, 5, 15, 20, 25, 30. Padrões visuais principais:

| Bloco Overclock | Descrição | Existe hoje? |
|-----------------|-----------|:------------:|
| **Header topo** com tabs de workspace (`Meu Projeto` · `Segredo-VPS`) | Barra fina, cor de destaque na aba ativa | 🔴 não |
| **Header direito** com `VOL 0 ▄▂▄` · `0 PPM` · `CODE` · `+ PANE` | Métricas ao vivo + ação | 🔴 não |
| **Sidebar de Missões** (`+ NOVA MISSÃO`, busca, lista com dot verde e badge ATIVA) | Coluna esquerda estreita | 🔴 não (temos GrokMissoes só numa aba) |
| **Grid 2×2 de panes** (`pane-4`, `pane-5`, `pane-6`, `pane-7`) rodando `STARTING GROK / CLAUDE` | Cada pane = 1 agent CLI ao vivo | 🔴 não |
| **Coroa 👑** no pane = orquestrador da missão | Tooltip: "Promover a orquestrador" | 🔴 não |
| **Widget Jarvis flutuante** (esfera de partículas + `CONFIGURAR`) | Assistente global no canto | 🔴 não (temos HermesMascote fixo em outro lugar) |
| **Espaço de Trabalho** (mascote laranja + nome do workspace) | Bloco central em tela vazia | 🔴 não |
| **Tela Providers** com CLIs compatíveis (Claude Code / Codex / OpenAI) + `testar conexão` · `health check` | Gestão de API keys por provider | 🟡 parcial (temos gestão de chaves no HUB, sem UI CLI-compat) |
| **Arquivados** (contador na base da sidebar) | Missões finalizadas colapsadas | 🔴 não |

---

## 4. Ledger Lupa (evidência × classificação)

### 🟢 OURO (manter/reaproveitar)
- `SalaControle.tsx` + CSS densos, tema esmeralda + Matrix + Hermes mascote — base sólida.
- Rota `/admin/cockpit` consolidada e livre de duplicação.
- `useCockpitLive` já provê `nos[]`, `console[]`, `stats` — contrato reutilizável.
- `GrokMissoes` componente separado — pode virar sidebar sem reescrever.
- Skill `lupa-bayesiana` ativa localmente.

### 🟡 PENDÊNCIA (falta fazer)
- Barramento `HERMES-CORE/missions/` vazio na VPS — nada grava missão real.
- `useCockpitLive` ainda em mock; sem endpoint `/cockpit/state` do HUB.
- Skill `lupa-bayesiana` ativa no workspace mas **não versionada** no repo — some se apagar.
- Working tree da VPS suja (27 arquivos M) — bloqueia deploy limpo.
- Sem página de Providers com "testar conexão / health check" (o zip mostra padrão).

### 🔴 LIXO (remover/consolidar)
- Nenhum resíduo visual do Overclock antigo (`cockpit-overclock` já deletado — confirmado).
- Possível duplicação **`apps/modulos/status/`** (painel vivo com JSON) × **SalaControle** (mock). Um dos dois deve virar cliente do outro; hoje competem pelo mesmo papel de "estado ao vivo".
- 3 pastas `.dist-backup.*` e `.dist-failed.*` no `mcp` da VPS — sujeira acumulada.

### 🛠️ MELHORIAS (evoluções propostas)
1. **Sidebar de Missões** (canto esquerdo, fixa) usando `GrokMissoes` como fonte + `+ NOVA MISSÃO`.
2. **Header operacional** com `VOL · PPM · CODE · + PANE` (custo/latência/tokens/adicionar pane).
3. **Multi-Pane 2×2** substituindo a área central da aba MAPA; cada pane = agent (Grok/Claude/GPT/Local) com badge de custo `$` em tempo real.
4. **Coroa 👑** = pane orquestrador da missão ativa (marca visual).
5. **Widget Jarvis flutuante** no canto inferior direito — mover o `HermesMascote` pra floating panel e ligar em Voice/Config.
6. **Aba Providers** dedicada (dentro da nav vertical atual, sem rota nova) com listagem de CLIs compatíveis + `testar conexão` batendo no gateway.
7. **Aba Arquivados** ou contador de missões concluídas na base da sidebar.
8. **Contrato `/cockpit/state`** no HUB — fim do mock, dados reais.

---

## 5. Falsificação e AutoLupa

- **O que derruba a fusão?** Se o barramento HERMES nunca ficar pronto, o multi-pane vira decoração. Mitigação: usar `useCockpitLive` como camada de mock estruturado até o HUB expor o endpoint — a UI sobrevive.
- **Estou contando algo duas vezes?** `apps/modulos/status/` e `SalaControle` disputam papéis. Decisão pendente: status = página pública de saúde; SalaControle = cockpit operacional. Documentar a divisão no mapa antes de mexer.
- **Cria módulo paralelo?** Não — tudo permanece em `src/paginas/admin-cockpit/`. Extensão canônica, sem rota nova.
- **Áreas 🔒?** `apps/modulos/status/` é protegida. Se `SalaControle` consumir dados dela, é leitura — permitido. Nenhuma edição em 🔒.

---

## 6. Veredito

**APROVAR-COM-RESSALVAS** para a Fase 2 (fusão), com este backlog priorizado:

```text
P0  Sidebar de Missões + Header operacional (VOL/PPM/CODE/+PANE)
P0  Multi-Pane 2×2 na aba MAPA com badges de custo
P1  Jarvis flutuante (mover HermesMascote pra floating panel)
P1  Aba Providers (CLIs compatíveis + testar conexão)
P2  Contrato /cockpit/state real (fim do mock) — depende HERMES-CORE
P2  Versionar skill lupa-bayesiana no repo (fora do escopo visual)
P3  Consolidar responsabilidades status/ × SalaControle no mapa
```

**Próximo passo único:** você aprovar o P0 (sidebar + header + multi-pane) pra eu abrir a Fase 2 com plano de implementação frontend, sem tocar VPS/HUB/Supabase.

**Risco residual:** o multi-pane 2×2 é decorativo até o HERMES gravar missões. UI fica pronta, dados chegam depois.

**Fio da missão:** MetaLupa aplicada · zip absorvido · relatório entregue · aguardando decisão pra Fase 2.
