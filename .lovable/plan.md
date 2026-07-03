## Diagnóstico honesto do que aconteceu hoje

Auditei tudo desde 11h UTC (8h BRT). O quadro real, **ignorando o barulho do Vigia** (aqueles 519 cancelados eram o próprio spam que consertamos — não é trabalho perdido):

```
Workflow                          Estado real hoje
─────────────────────────────────────────────────────────
painel auto-update                3 FAILURES + ~40 cancelados   ← raiz
Farm — trailer Co-authored-by     ~40 cancelados encadeados
CodeQL — análise de segurança     ~40 skipped encadeados
Notion Sync                       1 cancelado
linear-pendencias-sync            3 cancelados
sentinela-divergencias            1 cancelado
VPS HealthCheck                   1 cancelado
Vigia Actions Vermelhos           519 cancelados (esperado, spam)
```

## Causa raiz (achei nos logs)

O `painel auto-update` tá quebrado por **duas coisas independentes**:

1. **Caminho fantasma no YAML**: o workflow ainda aponta pra `apps/projeto-dashboard/atualizar-painel-vivo.mjs` e `apps/projeto-dashboard/painel-data.json` — mas isso foi consolidado dia 02/07 pra `apps/modulos/status/` (área protegida da seção 9 do CLAUDE.md). O script simplesmente não existe mais no caminho antigo → `Cannot find module`.
2. **Submodule fantasma**: git enxerga `apps/modulos/Bolt/source` como submodule, mas `.gitmodules` tá vazio → `fatal: no submodule mapping found`. Quebra o `actions/checkout@v4`.

Cada push na main dispara esse workflow, ele falha, e o `concurrency` da cadeia (Farm, CodeQL, painel) cancela em cascata. **Foi isso que gerou a impressão de "tudo em vão"** — mas o código dos nossos commits (`4e71bf41`, `5c3d0935`, `8009898e` do Vigia) está intacto no `main`.

## Plano de correção

### 1. Corrigir a raiz (2 arquivos)

**`.github/workflows/painel-auto-update.yml`**
- Trocar `apps/projeto-dashboard/atualizar-painel-vivo.mjs` → `apps/modulos/status/atualizar-painel-vivo.mjs`
- Trocar `apps/projeto-dashboard/painel-data.json` → `apps/modulos/status/painel-data.json` (no `paths-ignore` e no `git add`)
- Manter `runs-on: [self-hosted, Linux]` (runner tá online)
- Adicionar `submodules: false` no `actions/checkout` pra não tropeçar no fantasma

**Submodule fantasma `apps/modulos/Bolt/source`**
- Investigar com `git ls-files --stage apps/modulos/Bolt/source` (se aparecer como modo `160000` é gitlink órfão)
- Remover o gitlink órfão: `git rm --cached apps/modulos/Bolt/source` e commit
- Isso libera o `checkout` de qualquer workflow que use submodules por padrão

### 2. Auditoria + fila de reprocessamento

Depois do fix, reenfileirar os que falharam/cancelaram hoje sem terem tido uma execução `success` posterior:

- 3 runs de `painel auto-update` em `failure` (#345, #346, #347) → re-run
- Últimos cancelados de cada workflow importante que não teve sucesso hoje:
  - `Notion Sync` #82
  - `linear-pendencias-sync` #110
  - `sentinela-divergencias` #33
  - `VPS HealthCheck` #36
- `Farm` e `CodeQL` **não precisam re-run manual** — vão disparar sozinhos no próximo push (que é o próprio commit do fix).

Não vou re-rodar os 519 Vigia cancelados — eles eram lixo por design; a v2 já roda enxuta.

### 3. Garantir deploy na VPS

Depois que os workflows verdes voltarem, disparar `vps-ssh-exec.yml` (workflow_dispatch) com o comando:

```bash
cd /root/CentralDark && git fetch --all && git reset --hard origin/main && pm2 reload all --update-env && pm2 save
```

Isso garante que **todos os commits de hoje** (Vigia v2, fix do painel, submodule) cheguem na VPS de uma vez, com PM2 recarregado e dump salvo (regra do CLAUDE.md).

### 4. Monitor até estabilizar

Loop de leitura a cada 30s por até 10 min:
- Contar runs `in_progress` + `queued` + `pending` (deve chegar a 0)
- Confirmar que os 4 workflows re-executados fecharam em `success`
- Se algum falhar de novo, ler o log e reportar antes de fechar

### 5. Notificação final

Card no `@srver1bot` privado do admin + linha no canal Status, conforme regra do memory (`notificacao-pos-acao-telegram`).

## Detalhes técnicos

- **Nenhuma área protegida é modificada** (seção 9 do CLAUDE.md). O YAML do workflow não está na lista de protegidas; `apps/modulos/status/` **não é tocado** — só passamos a apontar corretamente pra ele.
- **Sem risco de perder trabalho**: os 3 commits de hoje já estão no `main` (verificado via API). O plano só corrige o pipeline e reprocessa o que tinha ficado grey.
- **Sem `git rm` de arquivos reais**: o `git rm --cached apps/modulos/Bolt/source` remove só a referência de gitlink órfã, não o conteúdo do módulo Bolt (área protegida — o conteúdo do diretório fica intacto).

Se aprovar, executo tudo em sequência (fix → reenfileirar → dispatch VPS → monitor → notifica no Telegram) e volto com o placar final.