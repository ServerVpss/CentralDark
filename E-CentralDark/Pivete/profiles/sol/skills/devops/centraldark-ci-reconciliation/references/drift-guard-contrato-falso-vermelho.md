# Drift-Guard falso-vermelho por bug de contrato na MAIN

Data: 2026-08-27 (sessão #ACORDAR → !RECONCILIAR, PR #1221).

## Sintoma
Todos os PRs abertos (1228, 1227, 1221, 1211) com `drift-guard=FAILURE` e/ou
`Porta=FAILURE`. Runner self-hosted `vmi3256920-centraldark` ONLINE busy=true
(infra viva, não zumbi).

## Diagnóstico
`lupa-drift-guard.yml` tem lista HARD-CODED de nomes proibidos:
```bash
for proibido in tecnica-da-lupa metalupa-bayesiana-canonica lupa-premium; do
  for base in .agents/skills .claude/skills .workspace/skills; do
    if [ -d "$base/$proibido" ]; then exit 1; fi
  done
done
```
Mas `.agents/skills/tecnica-da-lupa/SKILL.md` é ALIAS DE COMPATIBILIDADE:
```yaml
metadata:
  type: redirect
  status: COMPATIBILITY_ALIAS
  owner: .agents/skills/meta-lupa/SKILL.md
```
O próprio arquivo diz `TECNICA_DA_LUPA_IS_SECOND_SKILL=false`. A main viola o
próprio guard → todos os PRs vermelhos no gate, independente do diff.

## Prova (git, sem runner)
```bash
git ls-tree -r origin/main --name-only | grep tecnica-da-lupa
# → .agents/skills/tecnica-da-lupa/SKILL.md   (EXISTE NA MAIN)

git diff --name-only origin/main...HEAD | grep tecnica-da-lupa
# → (vazio) → PR #1221 NÃO toca a pasta
```
Conclusão: falha é da main/guard, não do PR.

## Caso irmão (PR #1221 específico)
PR #1221 achatou `skills/pretty-mermaid` de submódulo (gitlink 160000) para
diretório comum (040000), mas `.gitmodules` ainda declarava submódulo →
`git submodule status` quebrava no checkout (log do juiz: `fatal: no submodule
mapping found in .gitmodules for path 'skills/pretty-mermaid'`).
Correção no worktree `pr-1221-rebase`: esvaziar `.gitmodules` + remover gitlink
do index. Commit `501d6432d`, force-with-lease no branch `fix/integrate-mermaid-skills`.
`git submodule status` local → exit 0. `mergeable: MERGEABLE` confirmado.

## Regra de ouro
UNKNOWN/SKIPPED/queued de run ANTIGO (head diferente do push) NUNCA promovido
como FAILURE do head novo. Filtrar `statusCheckRollup[].detailsUrl` pelo
`databaseId` do run cujo `headSha == teu push`
(`gh run list --repo ServerVpss/CentralDark --branch <branch> --limit N`).

## Fronteira
Corrigir a main (remover `tecnica-da-lupa` ou ajustar o guard) é HUMAN_FRONTIER.
Diagnosticar e devolver — não force-push na main nem edita guard sozinho.

## PITFALL DESCOBERTO EM PR #1231 (mesmo dia, turno posterior)
A lista banida por nome NÃO existe só no YAML. O `lupa-drift-guard.yml` chama
`python scripts/lupa/detectar_drift.py`, e ESSE script tem sua PRÓPRIA lista:

`scripts/lupa/detectar_drift.py` (branch fix/lupa-drift-guard-allow-compat-alias):
```python
PROIBIDOS_EXATOS = {"tecnica-da-lupa", "metalupa-bayesiana-canonica", "lupa-premium"}   # linha ~17
...
padrao_ativo = re.compile(
    r"(skill|habilidade|t[eé]cnica)\s*[:`\"']?\s*[`\"']?(tecnica-da-lupa|metalupa-bayesiana-canonica|lupa-premium)",  # linha ~51
    re.IGNORECASE,
)
```

Sintoma que revelou: depois de corrigir SÓ o YAML, o `drift-guard` continuou
`FAILURE` no PR #1231 com:
```
❌ DRIFT DETECTADO — META LUPA canônica NÃO é única fonte ativa:
  - SKILL_REMOVIDA_REAPARECEU: .agents/skills/tecnica-da-lupa
```
ou seja, o SCRIPT (não o YAML) ainda barrava.

### Fix correto (ambos os lugares)
1. YAML (`lupa-drift-guard.yml`): tirar `tecnica-da-lupa` de `for proibido in ...`
   e adicionar guard semântico (permitir `type/status: redirect` ou
   `COMPATIBILITY_ALIAS`; barar só `IS_SECOND_(SKILL|OWNER|AUTHORITY)=true`).
2. Script (`detectar_drift.py`):
   - remover `"tecnica-da-lupa"` de `PROIBIDOS_EXATOS`;
   - no bloco #2 (skills em disco), antes de `erros.append("SKILL_REMOVIDA_REAPARECEU...")`,
     ler o frontmatter do `SKILL.md` e `continue` se for `type/status: redirect` /
     `COMPATIBILITY_ALIAS` (ou `IS_SECOND_*=false`);
   - no `padrao_ativo` (bloco #3), isentar menções que estejam dentro de contexto
     de alias/compatibilidade (ou simplesmente remover `tecnica-da-lupa` do regex
     se não houver doc apontando pra ele como skill ativa).

### Verificação pós-fix (sem runner)
```bash
uv run --no-project python scripts/lupa/detectar_drift.py   # exit 0 com alias presente
# teste de regressão: skill fake com IS_SECOND_SKILL=true deve dar exit 1
```
Host Windows sem python nativo → `uv run --no-project python ...` funciona (uv instalado).

Regra: ao mexer num gate CI que tem lista de nomes proibidos, PROCURE todas as
ocorrências do nome na árvore do workflow (YAML + scripts chamados) antes de
empurrar — senão o PR volta vermelho e você perde um round-trip de CI.
