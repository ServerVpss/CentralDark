---
name: casa-github-sync
description: "Sync Casa↔GitHub. Use when Pivete manda sync ou commit."
version: 1.0.0
author: Pivete
platforms: [windows]
metadata:
  hermes:
    tags: [casa, github, sync, backup, manifest, deterministic-casa-ops]
    related_skills: [hermes-sync-status, deterministic-casa-ops, centraldark-pr, memoria-canonica-pivete, pivete-card-mestre, meta-lupa]
---

# Casa ↔ GitHub Sync (umbrella)

Sincronizar a Casa local (NUCLEO + 3 temperaturas + artefatos) com o repo GitHub canônico
**sem perder Casa-primeiro/VPS-por-último, sem degradar o que já foi comprovado, e sem
push sem ordem literal do Pivete.**

## Quando usar (gatilhos)

- Pivete manda: "sync Casa", "sincronizar NUCLEO", "subir devagar", "commit Casa",
  "fecha o sync", "arquiva isso" — qualquer verbo que conecte Casa↔GitHub.
- Fio `SINCRONIZAR_METALUPA_CASA_GITHUB` está ativo no `CARTAO-MESTRE.md`.
- HOJE contém pendência "Casa ≠ GitHub" e Pivete pede fechamento.
- Após compactação que resulte em drift suspeito entre memória local e repo.

## Quando NÃO usar

- VPS, deploy, restart, merge, swarm, Telegram blast → skills dedicadas.
- Backup/restore isolado (sem sync) → `integridade-fips180-4`.
- Sync read-only sem decisão → `hermes-sync-status` (mais barato).

## Pre-flight (verificar ANTES de propor plano)

Lição 07/08 que o Pivete cobrou: **plano sem âncora = teatro.**

1. **O path esperado é repo?** `git -C <path> rev-parse --is-inside-work-tree`.
   Se `false` (aconteceu com `E:\CentralDark\`), `find <parent> -maxdepth 5 -name ".git" -type d 2>/dev/null`.
   Pare e confirme o alvo antes de qualquer `git add`.
2. **Cópias divergentes do mesmo arquivo?** `find <raiz> -name HOJE.md`,
   `find <raiz> -iname CARTAO*.md`. Exemplo real: dois `HOJE.md` (motor/03-memoria/memoria/
   ativo 1.490B, hermes-mente/memoria/ órfão 0B). Declare o drift no card antes de unificar.
3. **Worktree ou branch ativo?** `git worktree list`.
4. **Gateway offline não trava este fluxo.** `curl http://127.0.0.1:9119/sessions` pode
   estar down; sync por linha de comando continua válido.

## Plano canônico (6 fases)

Fase 0–3 é R0/R1. Fase 4+ é R2 — exige ordem explícita pra CADA commit/push.

```text
FASE 0 — DESCONFIAR (R0)
   ├─ listar dirs de memória, diff byte-a-byte entre cópias
   ├─ backup frio: BACKUPS/sync-{timestamp}.tar.gz + SHA-256
   ├─ listar untracked (git ls-files --others --exclude-standard)
   └─ declarar proveniência (RECUPERADO_DO_DISCO, INFERIDO, AINDA_AUSENTE)

FASE 1 — PROVAR (R0)
   ├─ git status, git log -1, git remote -v, git rev-parse --abbrev-ref HEAD
   ├─ git diff --name-only HEAD (dirty tree)
   └─ conferir convenção de mensagem (vX.Y.Z.W type(scope): …)

FASE 2 — DRIFT (R1)
   ├─ mapear divergências (HOJE/SEMANA/REGRAS, skill/edit)
   └─ classificar: versionado / só-casa / duplicado / proibido

FASE 3 — DECIDIR (R2)
   ├─ óbvios (commit sem perguntar): doc canônico, README, skill, regra
   ├─ duvidosos (pergunta consolidada 1×): state.db, logs, worktrees, BACKUPS/
   ├─ proibidos (nunca): .env, profiles runtime, MEMORY.md local, secrets, OAuth
   └─ apresentar manifest; só avançar com OK explícito

FASE 4 — EXECUTAR (R2)
   ├─ git add só dos caminhos aprovados na Fase 3
   ├─ git commit com mensagem versionada
   ├─ git push SOMENTE COM ORDEM LITERAL (REGRA #20 do SOUL)
   └─ nunca reset --hard, clean, push --force, push --delete

FASE 5 — PROVAR (R1)
   ├─ git log -1 confere com planejado
   ├─ git status limpo
   ├─ origin/main == local (quando push feito)
   └─ SHA-256 dos arquivos chave bate antes/depois

FASE 6 — REGRESSÃO (R0)
   ├─ nova sessão / shell
   ├─ 3 temperaturas batem
   ├─ Card-Mestre marca item ✅
   └─ atualizar SEMANA.md / REGRAS.md se consolidou padrão
```

## Travas honestas (nunca negociar)

- **Push ≠ decisão da IA.** REGRA #20 do SOUL: sem ordem literal, sem `git push`.
- **Drift grande entre cópias** → parar e perguntar. Não unificar sozinho.
- **Manifesto de decisão antes do commit.** Sem plano explícito, sem commit.
- **`.env`, secrets, MEMORY.md local** → nunca sobem. Remover do manifesto com aviso.
- **Branch name = workspace name** (se usar Conductor — `centraldark-pr` cobre).
- **PR title** começa com versão (`vX.Y.Z.W type(scope): …`).
- **VPS/deploy/restart** → proibidos nesta skill. Se implicar deploy, encerrar e abrir
  `centraldark-pr`.

## Manifest (template)

```yaml
# sync-manifest-{timestamp}.yaml
repo: <path confirmado via git rev-parse --is-inside-work-tree>
branch: <git rev-parse --abbrev-ref HEAD>
backup: BACKUPS/sync-{timestamp}.tar.gz
backup_sha256: <sha256sum>
untracked_count: <N>
drift_pontos: [<arquivo>: <divergência>]

entram_no_commit:
  - <path relativo>    # óbvios aprovados

ficam_de_fora:
  - <path>             # proibidos, .env, MEMORY.md local

duvidosos_para_decisao:
  - <path>: <opção A: commitar / B: ignorar / C: perguntar>
```

## Pitfalls (acumulado 07/08)

- **Path esperado ≠ repo.** `E:\CentralDark` não é repo (foi onde eu travei). Sempre
  `git rev-parse --is-inside-work-tree` antes de `git add`.
- **Duplicata silenciosa.** Dois `HOJE.md` (motor/ vs hermes-mente/) → declarar drift no
  card antes de commitar. Versão errada = lixo versionado.
- **Gateway offline ≠ sync falhou.** Não bloquear por `127.0.0.1:9119`.
- **Push sem ordem.** REGRA #20 inegociável. Se Pivete não falou "manda", só commit local.
- **Commit message fora do padrão.** `vX.Y.Z.W type(scope): …` é convenção CentralDark.
- **Manifest não é opcional.** Sem `sync-manifest-{timestamp}.yaml` arquivado, sync não
  auditável. Tratar como recibo.
- **`#ACORDA` ≠ proposta de sync.** Quando o Pivete dispara `#ACORDA`, o boot apenas
  recarrega o estado (HOJE/SEMANA/REGRAS/Card) e mostra onde o fio pausado parou. Não
  puxar o fio `SINCRONIZAR_METALUPA_CASA_GITHUB` automaticamente nem listar "fases 0..6"
  sem o Pivete mandar "vamos". O gatilho é **passivo-recuperador**, não **propositor**.
  Se fio pausado for o nomeado no Card, exibe o estado dele e espera ordem. Lição
  registrada 07/08: Pivete apontou "essa ancora ai tem duas ne" porque o resumo do
  `#ACORDA` misturou confirmação de protocolo com plano de sync.

## Sinais de fim ("feito")

- `git log -1` confere com o commit planejado.
- `git status` limpo.
- `git push` confirmado (se executado) — `git ls-remote origin HEAD` mostra o SHA local.
- `CARTAO-MESTRE.md` marca item ✅, fio `SINCRONIZAR_METALUPA_CASA_GITHUB` sai do quadro.
- `HOJE.md`, `SEMANA.md`, `REGRAS.md` atualizados (se houve mudança).
- Backup SHA-256 validado.

Se algum item não foi confirmado, o sync **não terminou** — voltar pra Fase 0/3 conforme gap.

## Integração com outras skills

- `hermes-sync-status` — fase 0/1 (read-only, base sem escrita).
- `deterministic-casa-ops` — Modo Casa, anti-zona-burra-gate, PARE.
- `centraldark-pr` — quando o sync virar PR (gate, label, CI).
- `memoria-canonica-pivete` — perfil vs NUCLEO durante verificação.
- `pivete-card-mestre` — atualizar quadro `SINCRONIZAR_METALUPA_CASA_GITHUB`.
- `meta-lupa` — aplicar quando drift grande ou decisão de unificação.
- `integridade-fips180-4` — SHA-256 dos backups e dos manifests.

## References

- `references/sync-manifest-template.yaml` — modelo de manifesto.
- `references/sync-exemplos-reais.md` — execuções reais (populada a cada uso).
- `references/gate-ordenacao-fases.md` — quando R0 vira R2 e por quê.
- `references/push-sem-ordem-casos.md` — histórico das quase-falhas evitadas.
