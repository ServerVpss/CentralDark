# 🚨 DIAGNÓSTICO: POR QUE F:\_worktrees ESTÁ PARADA

## DESCOBERTA: GIT WORKTREES, NÃO PASTA COMUM

`F:\_worktrees` **NÃO É UMA PASTA DE CACHE NORMAL.**

É um **diretório de git worktrees** — branches isoladas criadas para trabalhar em paralelo sem afetar main.

### Git Worktrees encontrados em F:\_worktrees:

```
F:/_worktrees/centraldark-pr1880-20261021-072853      (DETACHED HEAD)
F:/_worktrees/centraldark-pr1880-20261021-075059      (DETACHED HEAD)
F:/_worktrees/cockpit-ui-label-20261021               [fix/cockpit-tabs-wrap-20261021]
F:/_worktrees/pr-1895                                 (DETACHED HEAD)
F:/_worktrees/reconcile-w-skills-main-20261022        [reconcile/w-skills-main-20261022]
F:/_worktrees/sec-gitignore-ssh-20261022              [sec/gitignore-ssh-autosync-20261022]
F:/_worktrees/sol-aprendizado-220-20261022            [docs/aprendizado-220-terminal-visível-20261022]
F:/_worktrees/cd-scratch/                             (vazio ou scripts)
F:/_worktrees/Nova pasta/                             (vazio?)
```

## POR QUE ESTÃO "PARADAS":

### 1. DETACHED HEAD (3 worktrees)
```
centraldark-pr1880-20261021-072853     ← Não em branch, em commit solto
centraldark-pr1880-20261021-075059     ← Duplicada? Mesma coisa?
pr-1895                                 ← Provavelmente PR fechada
```
**Motivo:** Commits foram feitos mas não foram mergeados. Ficaram órfãos.

### 2. TIMESTAMPS ANTIGOS (4 de 7 estão de Out 22)
```
reconcile-w-skills-main-20261022       ← 2 dias atrás
sec-gitignore-ssh-20261022             ← 2 dias atrás
sol-aprendizado-220-20261022           ← 2 dias atrás
cockpit-ui-label-20261021              ← 3 dias atrás
```
**Motivo:** Ninguém continua trabalhando nelas. Ficaram prototipagem parada.

### 3. DUPLICAÇÃO (centraldark-pr1880 tem 2 cópias!)
```
centraldark-pr1880-20261021-072853
centraldark-pr1880-20261021-075059
```
**Motivo:** Alguém rodou o comando de criação de worktree DUAS VEZES com timestamps diferentes.

### 4. PASTAS VAZIAS/GENÉRICAS
```
F:/_worktrees/cd-scratch/
F:/_worktrees/Nova pasta/
```
**Motivo:** Criadas por engano, nunca usadas.


## O QUE DEVERIA TER ACONTECIDO:

```
┌─────────────────────────────────────┐
│ Criar worktree para feature X        │
│ git worktree add F:/_worktrees/x    │
└──────────────┬──────────────────────┘
               │
               ↓
       ┌───────────────────┐
       │ Trabalhar em X    │
       │ (commits)         │
       └───────┬───────────┘
               │
               ↓
         ┌─────────────────────────┐
         │ OPCAO A: PR/Merge OK    │
         │ ↓                       │
         │ git worktree remove     │  ← ISSO NUNCA ACONTECEU
         └─────────────────────────┘
         
         ┌─────────────────────────┐
         │ OPCAO B: Cancelado      │
         │ ↓                       │
         │ git worktree remove     │  ← ISSO NUNCA ACONTECEU
         └─────────────────────────┘


O QUE REALMENTE ACONTECEU:

┌─────────────────────────────────────┐
│ Criar worktree 1 para pr1880         │
│ git worktree add (criou)             │
└──────────────┬──────────────────────┘
               │
               ├─→ NINGUÉM REMOVEU!
               │   Continua com mudanças/commits soltos
               │
               ├─→ Criar worktree 2 (DUPLICADA!)
               │   Mesma coisa, 2a tentativa?
               │
               └─→ PAROU AQUI
                   Ninguém finalizou, ninguém mergeou
```


## ESTADO ATUAL:

### Worktrees "saudáveis" (em branches):
```
K:/_worktrees/fixed-point-pr1839              [fix/fixed-point-auth-renovar-pr1839]    ✅
K:/_worktrees/reconcile-w-skills              [reconcile/w-skills-20261014]             ✅
K:/centraldark-sync-casa-20261018             [costura-casa-20261018]                   ✅
```

### Worktrees "doentes" (DETACHED ou antigas):
```
F:/_worktrees/centraldark-pr1880-072853       (DETACHED, duplicada)                     ❌
F:/_worktrees/centraldark-pr1880-075059       (DETACHED, duplicada)                     ❌
F:/_worktrees/pr-1895                         (DETACHED, PR#1895 fechada?)              ❌
F:/_worktrees/reconcile-w-skills-main         (branch existe, mas ninguém usa)          ⚠️
F:/_worktrees/sec-gitignore-ssh               (branch existe, mas parada)               ⚠️
F:/_worktrees/sol-aprendizado-220             (branch existe, mas parada)               ⚠️
F:/_worktrees/cockpit-ui-label                (branch existe, mas parada)               ⚠️
```

### Pastas vazias:
```
F:/_worktrees/cd-scratch/                     (vazia)                                   ❌
F:/_worktrees/Nova pasta/                     (genérica)                                ❌
```


## POR QUE NINGUÉM REMOVEU?

Opções:
1. **Obra inacabada** — PR não foi mergeada, ficou aberta
2. **Teste/experimentação** — criou pra tentar algo, abandonou
3. **Falta de automatização** — ninguém lembrou de limpar
4. **Conflito de merge** — PR tinha conflito, desistiu
5. **Esperando aprovação** — esperava alguém revisar, nunca veio


## COMO RECONCILIAR (LIMPAR):

### Passo 1: ENTENDER POR QUE CADA WORKTREE EXISTE

```bash
cd "F:/_worktrees/pr-1895"
git log --oneline -5                    # Ver commits
git status                              # Ver mudanças
git branch -a | grep 1895               # Ver se branch ainda existe
```

### Passo 2: DECISÃO POR WORKTREE

```
Para CADA worktree:

┌─────────────────────────────┐
│ Commit foi mergeado?        │
│ ├─ SIM  → git worktree rm   │ (remover)
│ └─ NÃO  → Continuar ou      │
│    ├─ Rebase em main        │
│    ├─ Abrir PR              │
│    └─ Ou deletar se inútil  │
└─────────────────────────────┘
```

### Passo 3: REMOVER WORKTREES PARADAS

```bash
# Remover DETACHED (órfãs):
git worktree remove "F:/_worktrees/centraldark-pr1880-20261021-072853"
git worktree remove "F:/_worktrees/centraldark-pr1880-20261021-075059"

# Remover se PR foi fechada:
git worktree remove "F:/_worktrees/pr-1895"

# Remover vazias:
git worktree remove "F:/_worktrees/cd-scratch"

# Remover genéricas:
rm -rf "F:/_worktrees/Nova pasta"
```

### Passo 4: DECISÃO NAS PARADAS (branches ativos)

Para cada uma que tem branch ativo, perguntar:
- Essa branch é importante?
- Alguém ainda trabalha nela?
- Devo mergear, rebaser ou deletar?

**Exemplo:**
```bash
cd "F:/_worktrees/reconcile-w-skills-main-20261022"
git status
git log origin/main..HEAD --oneline          # Commits não mergeados

# Se forem importantes:
git rebase origin/main                       # Atualizar
git push origin reconcile/w-skills-main-20261022  # Enviar

# Se forem inúteis:
git worktree remove .                        # Remover worktree
git push origin --delete reconcile/w-skills-main-20261022  # Deletar branch remoto
```


## RECOMENDAÇÃO FINAL:

```
F:/_worktrees está "parada" porque:
1. Tem worktrees orphaned (DETACHED) que ninguém mergeou
2. Tem worktrees de teste que foram abandonadas
3. Tem duplicação (pr1880 tem 2 versões)
4. Falta automação para limpar worktrees mortas

SOLUÇÃO:

A. CURTO PRAZO:
   1. Entender por que cada worktree existe
   2. Remover as que estão orphaned
   3. Remover as que têm +3 dias sem mudanças
   4. Mergear as que têm mudanças importantes

B. LONGO PRAZO:
   1. Criar script de limpeza automática (worktrees > 7 dias = remove)
   2. Adicionar checklist em PR: "Remover worktree após merge"
   3. Monitorar F:/_worktrees toda semana
```


## PRÓXIMOS PASSOS:

1. ❓ Devo examinar CADA worktree pra saber se mergeou?
2. 🔧 Quer um script que limpe automaticamente?
3. 📋 Quer reconciliar os branches parados com main?

---

**Gerado: 2026-10-24**
**Motivo:** Entender por que F:\_worktrees está parada
