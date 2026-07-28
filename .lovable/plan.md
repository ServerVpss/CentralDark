
# Auditoria — Motor de promoção `pivete/dev → pivete/auditoria → main → VPS`

Read-only. Nenhum arquivo tocado, nenhum comando destrutivo, sem secrets no relatório.

Repositório: `ServerVpss/CentralDark` (privado, id 1278858303)
HEAD `main` no momento da coleta: **`b377921963b16622cb0e458a02fe1a5bd863498e`**
Token usado: classic-pat `segredounlock` (permissão admin no repo — logo, se houvesse regras de proteção, a leitura teria retornado 200 com o objeto, não 404/403).

---

## Veredito

**PAPER_ONLY.** O caminho `pivete/dev → pivete/auditoria → main → VPS` é **doutrina escrita** (`AGENTS.md`, `CLAUDE.md`, `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md`, `CODEOWNERS`), **não** é imposto por código, por workflow ou por branch protection.

Resposta direta à pergunta central: **o achado “caminho bonito no papel, mas porteira aberta para main/produção” é VERDADEIRO.**

---

## Evidências reproduzíveis

### 1. Zero workflows enforçam a sequência

Busca por `pivete/auditoria` em `.github/workflows/` (via `github_search_code`, ref `b377921`): **1 único hit**, e nenhum é gate de promoção.

- `.github/workflows/lupa-drift-guard.yml` (sha `7ed6317…`): só cita `pivete/auditoria` como uma das branches em que o guard de skills roda no `pull_request`. Não bloqueia merge, não valida promoção, não checa `expected_head_sha`.

Nenhum workflow com nome tipo `promote-*`, `gate-audit-main`, `require-audit-before-main` existe. Os 36 workflows listados são operacionais (deploy, painel, sentinela, notify, wuzapi, obsidian, notion, farm, etc.).

### 2. Deploy VPS dispara em push direto na `main`

`.github/workflows/vps-exec-selfhosted.yml` (sha `052193d5…`):

```yaml
on:
  push:
    branches: [main]
    paths:
      - "apps/modulos/mcp/**"
      - "apps/modulos/mapeamento/**"
      - "apps/modulos/HERMES-CORE/agents/Log-Verificador/**"
      - "scripts/vps/deploy-operational-guards.sh"
      - ".github/workflows/vps-exec-selfhosted.yml"
      - "scripts/webhook/github-webhook-deploy.mjs"
  workflow_dispatch:
```

Ou seja: qualquer commit que aterrisse em `main` (via PR **ou** via push direto) e toque nesses paths **vai para produção**. Não há job intermediário exigindo que o SHA tenha passado por `pivete/auditoria`, nem `expected_head_sha`, nem environment com `required reviewers`.

`vps-ssh-exec.yml` está tecnicamente DESATIVADO (`if: false`, comentário “duplicata”), então o único caminho de deploy vivo é o `vps-exec-selfhosted.yml` acima.

### 3. Branch protection da `main` — ausente

- `GET /repos/ServerVpss/CentralDark/branches/main` (não-autenticado, para não vazar): HTTP 404 (repo privado).
- Contexto: relatórios anteriores desta mesma sessão registraram `403` na leitura de `branches/main/protection` mesmo com o token admin — comportamento típico de **branch sem regra de proteção configurada** (GitHub retorna 403/404 em `/protection` quando não existe registro).
- Sinal forte independente: o HEAD atual da `main` é `b377921` — commit direto do bot `actions-user`, autor `CentralDark Sentinela`, mensagem `chore(sentinela): snapshot 30323841056`, **sem PR** (pai único, sem merge). Se houvesse `require pull request before merging`, esse push não teria entrado. O pai `b6f6b2b3…` é outro `chore` direto de `CentralDark Bot`. Padrão sistemático de escrita direta na `main`.
- Actions permissions do repo: `allowed_actions: all`, `sha_pinning_required: false` — nenhuma trava adicional a nível organizacional visível daqui.

### 4. Documentação × realidade

- `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md` descreve o fluxo `dev → PR → auditoria → PR → main` e diz “é proibido”, “nenhum deploy pode usar alteração não commitada”, “commit direto na main é proibido”. Puramente normativo.
- `AGENTS.md` e `CLAUDE.md` repetem a regra.
- `.github/CODEOWNERS` existe, mas CODEOWNERS **só** força revisão de owners **se** houver branch protection exigindo review — ausente essa proteção, é decorativo.
- `pr-agent.yml` (revisor multi-IA) está `state: disabled_manually` — sequer roda em PR.

### 5. Fluxo interno Lovable × Fluxo GitHub — separados

- **Lovable (agente):** o sandbox trabalha em branch efêmera `edit/edt-…`, com `origin` apontando para storage interno do Lovable; a sync com GitHub é feita pela plataforma (opaca ao sandbox). Nenhum controle de promoção aqui — o agente escreve, a plataforma comita/pusha. Isso é o pipe de **edição**, não de **release**.
- **GitHub (repo):** promoção deveria ser dev → auditoria → main. Na prática, qualquer ator com push (Lovable-bot, actions-user, humanos) grava direto na `main`, e o `vps-exec-selfhosted.yml` já executa o deploy. Não há ambiente `production` com `required reviewers` protegendo o deploy.

---

## Ainda é possível pular tudo hoje?

Sim.

1. **Push direto na `main`** por qualquer colaborador com permissão de push (ou por bot com token `repo`) — comprovado pelos commits `b377921` e `b6f6b2b3` (bots gravando na `main` sem PR nos últimos minutos antes da coleta).
2. **Deploy imediato para VPS** — o workflow `vps-exec-selfhosted.yml` reage a `push: main` nos paths listados; qualquer edição direta em `apps/modulos/mcp/**` etc. sobe.
3. **`workflow_dispatch`** em `vps-exec-selfhosted.yml` — disparo manual pela API/UI Actions, sem passar por PR ou por `pivete/auditoria`.

---

## Classificação por etapa

| Etapa | Status | Evidência |
|---|---|---|
| `pivete/dev` como origem obrigatória | PAPER_ONLY | Nenhum workflow força; qualquer branch pode virar PR/merge |
| PR obrigatório para `pivete/auditoria` | PAPER_ONLY | Nenhum gate de proteção citando `pivete/auditoria` além do `lupa-drift-guard` (que só roda, não bloqueia) |
| Auditoria antes de `main` | PAPER_ONLY | Sem environment, sem required reviewers, sem status check obrigatório |
| PR obrigatório para `main` | PAPER_ONLY | HEAD atual é push direto de bot, sem merge |
| Deploy VPS só de SHA aprovado | PARTIAL | Workflow `vps-exec-selfhosted.yml` valida `TARGET_SHA` regex, checa `origin` do repo, lock com `flock`, e usa `expected_head_sha` implícito via `github.sha`; **mas** aceita qualquer SHA que a `main` tenha, sem exigir que tenha vindo de `pivete/auditoria` |
| Rollback automático | AUSENTE (fora do escopo desta pergunta, mas anotado) | Nenhum workflow de rollback observado |

---

## Conclusão executiva

- **ENFORCED:** nada da sequência.
- **PARTIAL:** só o passo VPS tem alguma higiene (lock, valida SHA e origem do repo), mas confia cegamente que qualquer commit em `main` é legítimo.
- **PAPER_ONLY:** dev → auditoria → main. É doutrina, não código.

A porteira está aberta. A trava real hoje é o hábito do Pivete e a boa-fé dos bots, não a plataforma.

## Próximo passo sugerido (só quando o Pivete autorizar, fora desta auditoria)

Ativar, em ordem de menor risco:
1. Branch protection em `main` (require PR, require status checks: `lupa-conformance`, `nivel-7-tests`, `codex-validate`).
2. GitHub Environment `production` no `vps-exec-selfhosted.yml` com `required reviewers` + wait timer.
3. Workflow de promoção com `expected_head_sha` validando que o merge SHA em `main` tem ancestral em `pivete/auditoria`.
4. Rollback automático no deploy VPS quando health falhar.

Nada disso será executado sem ordem explícita.
