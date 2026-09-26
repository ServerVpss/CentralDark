# CI vermelho: submodule quebrado no self-hosted runner

## Assinatura (2026-08-27)

Todos os PRs abertos falham com o mesmo gate determinístico (juiz ou porta). Runner continua **online** — não é offline nem de infra.

No log-failed do juiz determinístico, a bactida é:

```
fatal: No url found for submodule path 'skills/pretty-mermaid' in .gitmodules
```

ou

```
fatal: destination path 'E:/CentralDark/Pivete/CentralDark/skills/pretty-mermaid' already exists and is not an empty directory.
fatal: clone of '...' into submodule path '...' failed
```

## Diagnóstico

Passos:

```bash
# 1. Verificar se o .gitmodules referencia paths que não são repos git válidos
cat .gitmodules | grep path

# 2. Para cada path, verificar integridade
for dir in $(grep path .gitmodules | awk '{print $3}'); do
  echo "$dir:"; test -d "$dir" && (test -d "$dir/.git" || echo "  → NÃO É REPO GIT (submodule quebrado)")
done

# 3. Teste de clonagem no estado atual
git submodule update --init --dry-run 2>&1 | grep -i "fatal\|already exists\|not an empty directory"

# 4. Verificar se algo crítico referencia o path quebrado
grep -r "pretty-mermaid" LEIA-ME-IA.md AGENTS.md docs/ 2>/dev/null || echo "não referenciado em docs/lei"
```

## Raiz do caso 2026-08-27

- `.gitmodules` registra `skills/pretty-mermaid` como submodule pointando para `https://github.com/imxv/Pretty-mermaid-skills.git`
- Na máquina local, `skills/pretty-mermaid/` existe como pasta cheia (com `node_modules`) mas **não é um repositório git** (`.git` ausente)
- O runner self-hosted executa `git submodule update --init` no checkout do PR e o git falha porque o diretório não é um repo válido e não está vazio
- O skill real está em `skills/mermaid-skill/` (com SKILL.md, examples, reference)
- A falha afecta todos os PRs abertos porque o juiz determinístico roda em todos os workflows via `git submodule foreach`

## Reparo executado

```bash
# Verificar se referência crítica existe (não era o caso — skill real era mermaid-skill)
grep -r "pretty-mermaid" LEIA-ME-IA.md AGENTS.md docs/ || true

# Remover a seção do .gitmodules
git config -f .gitmodules --remove-section submodule.skills/pretty-mermaid
git add .gitmodules
git commit -m "fix(ci): remover submodule quebrado skills/pretty-mermaid"

# Se a pasta for lixo local, remover também
rm -rf skills/pretty-mermaid
```

## Aplicação geral

- Quando **todos** os PRs abertos falham com o mesmo gate e o log-failed mostra erro de submodule, diagnosticar como submodule quebrado antes de tentar corrigir código do PR
- Submodule quebrado pode ser de dois tipos:
  1. `.gitmodules` referencia path que não existe (remover a seção)
  2. `.gitmodules` referencia path que existe como lixo (pasta cheia sem .git) — reparo igual: remover seção ou realinhar para diretório correto
  3. Submodule existe mas URL inválida ou repositório removido — verificar com `git ls-remote <url>` e corrigir URL ou remover seção
- Sempre verificar se algo no repo referencia o path removido antes de apagar (LEIA-ME-IA, AGENTS.md, docs/, config)
