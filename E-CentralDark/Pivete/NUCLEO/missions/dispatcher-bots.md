# MISSAO - dispatcher-bots.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\dispatcher-bots.yml
**SHA:** 5816bff71fe66af0
**Timestamp:** 2026-08-26T19:33:13.350441
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: dispatcher-bots

# Ao adicionar uma label `assign:<bot>` em uma Issue, posta o briefing
# operacional pro bot correspondente e registra evento no painel.
# Anti-loop: cada bot só age se a label dele estiver presente.

on:
  issues:
    types: [labeled, opened]

permissions:
  issues: write
  contents: read

jobs:
  rotear:
    if: contains(github.event.issue.labels.*.name, 'assign:codex') || contains(github.event.issue.labels.*.name, 'assign:supabase-bot') || contains(github.event.issue.labels.*.name, 'assign:lovable') || contains(github.event.issue.labels.*.name, 'assign:grok') || contains(github.event.issue.labels.*.name, 'assign:chatgpt')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Postar briefing
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ISSUE_NUM: ${{ github.event.issue.number }}
          LABELS: ${{ toJSON(github.event.issue.labels) }}
        shell: bash
        run: |
          set -euo pipefail
          briefing() {
            cat <<EOF
          🤖 **Dispatcher CentralDark** — esta Issue foi delegada via label.

          **TTL:** 7 dias pra abrir PR linkado ou comentar progresso, senão escala via \`sentinela-stale\`.
          **Regra anti-loop:** só o bot com a label \`assign:<self>\` deve agir. Outros bots ignoram.

          ---
          $1
          EOF
          }
          if echo "$LABELS" | grep -q '"assign:codex"'; then
            gh issue comment "$ISSUE_NUM" -b "$(briefing 'Codex: ler AGENTS.md + CODEX.md, fazer patch mínimo, rodar build/test, abrir PR explicando diff. Bloqueado: arquivos sensíveis.')"
          fi
          if echo "$LABELS" | grep -q '"assign:supabase-bot"'; then
            gh issue comment "$ISSUE_NUM" -b "$(briefing 'Supabase Bot: rodar checks read-only (schema/RLS/migrations) e anexar relatório. Escrita só com label adicional `confirm:write`.')"
          fi
          if echo "$LABELS" | grep -q '"assign:lovable"'; then
            gh issue comment "$ISSUE_NUM" -b "$(briefing 'Lovable: tarefa de frontend/UI/painel. Sem mexer em backend, secrets, Docker ou VPS.')"
          fi
          if echo "$LABELS" | grep -q '"assign:grok"'; then
            gh issue comment "$ISSUE_NUM" -b "$(briefing 'Grok: auditoria VPS/PM2 read-only. Sem rm -rf, sem reset --hard sem OK explícito do usuário.')"
          fi
          if echo "$LABELS" | grep -q '"assign:chatgpt"'; then
            gh issue comment "$ISSUE_NUM" -b "$(briefing 'ChatGPT: orquestrar, validar cadeia 7 passos e fechar issue quando o critério for cumprido.')"
          fi

```

---

# MISSAO - dispatcher-bots.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\dispatcher-bots.yml
**SHA:** ab872d14e0ed04e2
**Timestamp:** 2026-08-28T02:56:03.220655
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- '**Regra:** label escolhe capacidade; não concede autoridade nem Writer permanente.',

### Ouro Bruto (primeiros 5000 chars)
```
name: dispatcher-bots

# Issues e PRs usam somente labels canônicas em MAIÚSCULAS.
# Label roteia capacidade; não concede autoridade nem posse permanente de Writer.

on:
  issues:
    types: [labeled, opened]
  pull_request_target:
    types: [labeled, opened, reopened]

permissions:
  issues: write
  pull-requests: write
  contents: read

concurrency:
  group: dispatcher-bots-${{ github.event_name }}-${{ github.event.issue.number || github.event.pull_request.number }}
  cancel-in-progress: false

jobs:
  rotear:
    if: >-
      (github.event_name == 'issues' && (
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-CODEX') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-SUPABASE') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-GROK') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-CHATGPT') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-CLAUDE') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-HERMES') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-JARVIS') ||
        contains(github.event.issue.labels.*.name, '🧠 AGENTE-SENTINELA')
      )) ||
      (github.event_name == 'pull_request_target' && (
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-CODEX') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-SUPABASE') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-GROK') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-CHATGPT') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-CLAUDE') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-HERMES') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-JARVIS') ||
        contains(github.event.pull_request.labels.*.name, '🧠 AGENTE-SENTINELA')
      ))
    runs-on: [self-hosted, Linux]
    steps:
      - name: Postar briefing idempotente
        uses: actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const subject = context.payload.issue || context.payload.pull_request;
            const labels = subject.labels.map((label) => label.name);
            const issue_number = subject.number;
            const kind = context.payload.pull_request ? 'PR' : 'Issue';
            const briefings = [
              ['🧠 AGENTE-CODEX', 'Codex: código/YAML estruturado; patch mínimo quando for o Writer autorizado; build/test; sem arquivos sensíveis.'],
              ['🧠 AGENTE-SUPABASE', 'Supabase: checks de schema/RLS/migrations; escrita somente dentro do escopo já autorizado e sem expor secrets.'],
              ['🧠 AGENTE-GROK', 'Grok: capacidade de infra/VPS; medir primeiro e não executar restart/deploy/reset sem autorização aplicável.'],
              ['🧠 AGENTE-CHATGPT', 'ChatGPT/SOL: coordenação, prova, código/artefatos quando Writer; suporte não transfere ownership.'],
              ['🧠 AGENTE-CLAUDE', 'Claude: análise/revisão/execução conforme Writer-Scope vigente; sem model lock.'],
              ['🧠 AGENTE-HERMES', 'PIVETE/Hermes: executor e continuidade operacional; nunca autoridade humana.'],
              ['🧠 AGENTE-JARVIS', 'Jarvis: orquestração e síntese; realidade e SEGREDO/CHEFE permanecem acima do modelo.'],
              ['🧠 AGENTE-SENTINELA', 'Sentinela: detector determinístico; atualizar ferida existente antes de criar nova.'],
            ];

            let comments;
            try {
              comments = await github.paginate(github.rest.issues.listComments, {owner:context.repo.owner,repo:context.repo.repo,issue_number,per_page:100});
            } catch (error) {
              if (kind !== 'PR' || error.status !== 403) throw error;
              comments = await github.paginate(github.rest.pulls.listReviews, {owner:context.repo.owner,repo:context.repo.repo,pull_number:issue_number,per_page:100});
            }

            for (const [label, text] of briefings) {
              if (!labels.includes(label)) continue;
              const marker = `<!-- dispatcher-bots:${label} -->`;
              const alreadyPosted = comments.some((comment) => {
                const owned = comment.user?.login === 'github-actions[bot]' || comment.performed_via_github_app?.slug === 'github-actions';
                return owned && comment.body?.includes(marker);
              });
              if (alreadyPosted) continue;
              const body = [
                marker,
                `🤖 **Dispatcher CentralDark** — ${kind} roteado por \`${label}\`.`,
                '',
                '**Regra:** label escolhe capacidade; não concede autoridade nem Writer permanente.',
                '**Anti-loop:** atualizar a ferida material existente; não criar eco/issue paralela.',
                '',
                text,
              ].join('\n');
              try {
                await github.rest.issues.cr
```