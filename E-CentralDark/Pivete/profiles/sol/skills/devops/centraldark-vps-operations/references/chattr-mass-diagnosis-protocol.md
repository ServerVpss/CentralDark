# Protocolo de Diagnóstico: chattr +i em Massa (2026-08-28)

## Sinal de alerta

Quando `lsattr -R | grep -c 'i'` retorna número alto (>20), **não é necessariamente bug** — pode ser:
- Proteção deliberada (pontual, concentrada em 1 módulo)
- Bug de script (espalhado por múltulos)
- Efeito de rebase-merge travado
- Proteção de segurança intencional

## Diagnóstico em 4 passos

### 1. Medir o número REAL

```bash
# Filtro correto (só campo 1, formato de atributo)
git ls-files -z | xargs -0 lsattr 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/,""); print }'
```

### 2. Mapear distribuição

```bash
git ls-files -z | xargs -0 lsattr 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/,""); print }' \
  | awk -F/ '{print $1"/"$2}' | sort | uniq -c
```

### 3. Classificar a origem

| Distribuição | Origem provável | Ação |
|---|---|---|
| 1 módulo, <10 arquivos | Proteção deliberada pontual (rebase) | Autorização pontual do CHEFE nos paths exatos |
| 3+ módulos, >20 arquivos | Bug de script (hardening/watchdog) | Investigar origem antes de mutar |
| `.git/rebase-merge` existe | Rebase travado de processo anterior | `git rebase --abort` antes de qualquer ação |
| `SEGURANCA/`, `api-*keys*` | Proteção de segurança intencional | Identificar quem colocou e por quê antes de remover |

### 4. Decidir a remoção

- **Pontual (<10 arquivos, 1 módulo):** `chattr -i <paths>` com autorização pontual do CHEFE.
- **Em massa (>20 arquivos, múltiplos módulos):** NUNCA `git ls-files | xargs chattr -i` sem diagnóstico. Investigar origem primeiro.
- **Rebase travado:** `git rebase --abort` ANTES de qualquer outra ação.

## Caso real (2026-08-28)

- VPS: 85 arquivos com `+i` em HERMES-CORE, Bolt/source, arsenal-openai-adapter, artifacts-builder/public, .github/workflows, SEGURANCA
- Diagnóstico: espalhado por 6+ módulos → bug de script de hardening, não proteção pontual
- Ação correta: diagnosticar e apresentar alternativa cirúrgica, não `chattr -i` em massa
- HUMAN_FRONTIER: "permito" genérico NÃO cobre remoção de proteção deliberada sem diagnóstico

## Caso real 2 (2026-08-28, mesma sessão)

- VPS: 9 arquivos com `+i` TODOS em `apps/modulos/HERMES-CORE/`
- Diagnóstico: concentrado em 1 módulo → proteção deliberada de rebase
- Origem: `.git/rebase-merge/` de 14/07 (6 semanas atrás), processo anterior
- Ação correta: `git rebase --abort` + `rm -rf .git/rebase-merge` + `chattr -R -i apps/modulos/HERMES-CORE/`
- Resultado: deploy destravado, `SHA_VPS == SHA_MAIN` ✓

## Relação com outros protocolos

- `centraldark-deploy.sh` tem guarda `chattr +i` que trava o deploy se houver imutável
- `git rebase --abort` é o primeiro passo quando `.git/rebase-merge` existe
- `permito-segredo` precisa de escopo preciso pra mutação em massa
