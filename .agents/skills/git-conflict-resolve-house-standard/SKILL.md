---
name: git-conflict-resolve-house-standard
description: Padrão único da Casa para resolver conflito de PR (dependabot ou humano). Use quando um PR abrir CONFLICTING, quando a main avançar sob um PR aberto, ou quando perguntarem como resolver conflito. Não criar segundo resolvedor, não fazer merge manual fora deste padrão.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# Conflito de PR — padrão único da Casa

Owner do motor: `scripts/dependabot/resolve-conflicts.sh`
Gatilho: `.github/workflows/dependabot-auto-merge.yml`
Registry estruturado de padrões recorrentes: `scripts/dependabot/known-conflict-patterns.json`

Se aparecer um segundo resolvedor, ele é o errado. Este se **atualiza**; não se
duplica.

## A regra que quase ninguém acerta

O motor está **na branch do PR** e faz `git merge origin/main`. Logo:

```text
--ours    = lado do PR    (HEAD)
--theirs  = lado da main  (MERGE_HEAD)
```

Isso é contraintuitivo e já custou caro: a versão anterior do motor tinha os
comentários invertidos em relação ao código — dizia "mantém main" e usava
`--ours`, que aceita o PR.

```text
FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
```

Efeito real do bug: o default "fail-closed" falhava **aberto**. Um PR que
tocasse `.github/**`, `docs/**` ou `scripts/trigger-fabric/**` tinha a versão
dele aceita automaticamente, sem revisão humana.

## Política de resolução

| Caminho | Lado que vence | Por quê |
|---|---|---|
| `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` — em qualquer diretório | **PR** (`--ours`) | o PR **é** o bump; manter a main aqui apaga o motivo do PR |
| conflito conhecido não-manifesto | política registrada (normalmente **main**) | preserva owner canônico já provado |
| conflito desconhecido textual (`.md/.txt/.mmd/.jsonl/.csv/.rst/.adoc`) | **ambos** | auto-review preserva os dois deltas; CI/contraprova julga a composição |
| conflito desconhecido de código/config | **PR como candidato** | preserva o delta do PR, mas NÃO promove sem same-head CI/contraprova |

Sem lista de exceções para core. O default já protege tudo que não é manifesto.

## Conflitos recorrentes conhecidos

Os caminhos que já apareceram como feridas operacionais recorrentes ficam
registrados em `scripts/dependabot/known-conflict-patterns.json`. Esse registry
machine-readable é **telemetria/roteamento**, não autorização para um resolvedor
paralelo e não muda a tabela `--ours`/`--theirs`.

Quando um conflito tocar um caminho registrado, o motor emite receipt:

```text
KNOWN_CONFLICT_PATH=true
CONFLICT_ID=<id>
OWNER=<owner>
RESOLUTION_POLICY=<policy>
SOURCE_REF=<evidência>
```

Depois aplica a mesma política única: manifestos/lockfiles preservam o PR;
conflitos conhecidos seguem o registry; conflito desconhecido entra em
`AUTO_REVIEW`. Texto usa composição dos dois lados. Código/config preserva o
lado do PR como **candidato**, nunca como PASS: `git diff --check`, validação
sintática aplicável e SAME_HEAD CI/contraprova decidem a promoção.

```text
UNKNOWN_CONFLICT
→ AUTO_REVIEW
→ APPLY_CANDIDATE
→ COUNTERPROOF
→ SAME_HEAD_CI
→ PASS | REMEDIATE
```

O CHEFE não escolhe manualmente `Accept current / incoming / both` quando a
Casa consegue produzir e testar uma resolução reversível.

## Fluxo canônico

```text
PR abre/atualiza  ->  workflow dispara
                  ->  Update branch contra main
                  ->  conflito? motor único auto-revisa e resolve
                  ->  commit + push na branch do PR
                  ->  synchronize / same-head checks
                  ->  rerun falho transitório uma vez quando aplicável
                  ->  squash apenas pela política de promoção do PR
                  ->  main avança
```

Na mão, quando o runner estiver fora:

```bash
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

## Regras de ferro

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != CI_PASS
```

- Não criar segundo script de conflito.
- Não `force push` em `main`.
- `NO_CONFLICT` significa que **naquele instante** não havia divergência. Se a
  main avançar depois, medir de novo — não reusar o veredito velho.
- Squash é o botão padrão da Casa. Mas verde do CI é medição, não formalidade:
  se um check aplicável falhou, isso é informação, não obstáculo a ignorar.

## Armadilhas registradas (todas medidas, nenhuma suposta)

1. **`--ours`/`--theirs` invertidos.** Provado com repositório de teste:
   merge de main na branch do PR, `--ours` devolveu o lado do PR e `--theirs`
   o lado da main. Sempre que mexer nesta política, reprovar com um repo
   descartável antes de confiar no comentário do código.

2. **Reinjetar bump por nome de branch.** O motor antigo resolvia o manifesto
   para a main (perdendo o bump) e tentava reaplicá-lo lendo o nome do branch.
   Além de frágil, gravava sempre em `package.json` da **raiz** — corrompendo
   o arquivo errado em PR de subdiretório (`apps/modulos/Bolt/source`).
   Resolvido na origem: o manifesto agora resolve para o lado do PR, que já
   contém o bump.

3. **Lockfile único = conflito em cadeia.** Vários PRs de bump no mesmo
   `pnpm-lock.yaml` conflitam entre si; `@dependabot rebase` não resolve,
   porque rebasear um recria o conflito nos outros enquanto a main avança.
   A cura é **agrupar** (`.github/dependabot.yml`), não resolver um a um.
   E `groups` sem `applies-to` cobre apenas `version-updates`: alerta de
   segurança gera `security-updates` e passa por fora do grupo.

## Adaptação

Realidade nova (outro gerenciador de pacotes, outro lockfile, outro
ecossistema) atualiza **este arquivo e o motor no lugar**. Nunca um segundo.
