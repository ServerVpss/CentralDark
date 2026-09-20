---
name: git-state-safety
description: Lente global e model-neutral para observar estado Git antes de mutar, distinguir fetch/pull/push, tratar non-fast-forward como sinal de divergência, recuperar histórico sem rewrite cego e preservar trabalho local. O owner cognitivo continua CAPACIDADES-COGNITIVAS.md; esta skill é projeção reutilizável, não novo cérebro.
---

# Git State Safety

Esta skill cristaliza capacidade Git reutilizável para toda a Casa sem criar segunda governança.

```text
HOUSE_WIDE=true
MODEL_NEUTRAL=true
SECOND_BRAIN=false
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
REALITY=JUDGE
```

Owners:

```text
COGNITIVE_OWNER=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md
PERMISSION_OWNER=docs/CONSCIENCIA/02-PERMISSOES.md
OPERATIONAL_CONSUMER=scripts/webhook/lib/safe-git-deploy.mjs
```

## Cristal curto

```text
REMOTE
→ FETCH / OBSERVAR
→ COMPARAR LOCAL × REMOTO
→ CLASSIFICAR
   IGUAL        → NO_CHANGE
   ATRAS_LOCAL  → FF_ONLY quando o consumidor permitir
   LOCAL_AHEAD  → PRESERVAR + RECONCILIAR
   DIVERGED     → PRESERVAR + ESCOLHER merge|rebase no escopo correto
   DIRTY        → PRESERVAR; NAO esmagar
   UNKNOWN      → BLOQUEAR mutação destrutiva
→ APLICAR MENOR TRANSICAO
→ VERIFICAR HEAD/REF/WORKTREE
```

```text
FETCH = OBSERVAR ESTADO REMOTO SEM INTEGRAR NA BRANCH ATUAL
PULL  = FETCH + INTEGRACAO CONFORME OPCAO/CONFIG
PUSH_REJECTED_NON_FAST_FORWARD = SINAL DE DIVERGENCIA, NAO PERMISSAO PARA FORCE
REFLOG = RASTRO LOCAL DE MOVIMENTO DE REFS; PODE AJUDAR A LOCALIZAR COMMIT PARA RAMO DE RECUPERACAO
```

No registro do CHEFE:

```text
FETCH  = olhar a rua pela janela
PULL   = trazer a mudança pra dentro da casa
FORCE  = tentar mudar a história na marra
REFLOG = câmera do corredor das refs locais
RECOVERY_BRANCH = tirar o achado para um quarto seguro antes de mexer de novo
```

## Política CentralDark

```text
FORCE_PUSH=FORBIDDEN
RESET_HARD_AS_OPERATIONAL_MECHANISM=FORBIDDEN
FORCE_WITH_LEASE_IS_KNOWN_BUT_NOT_AUTHORIZED=true
DIRTY|LOCAL_AHEAD|DIVERGED|DETACHED_HEAD|REMOTE_REWRITE
→ BLOCK_AND_PRESERVE
CLEAN_FAST_FORWARD
→ APPLY_FF_ONLY_WHEN_CONSUMER_REQUIRES_SYNC
```

`--force-with-lease` é conhecimento útil para entender Git; não vira exceção automática à política da Casa.

## Recuperação após rewrite/force acidental

```text
PARAR NOVAS MUTACOES
→ MEDIR REMOTE + CLONES DISPONIVEIS
→ PROCURAR COMMIT EM REFLOG/OUTRO CLONE/REF PRESERVADA
→ CRIAR RECOVERY_BRANCH NO COMMIT ENCONTRADO
→ COMPARAR E PROVAR CONTEUDO
→ INTEGRAR POR PR/FLUXO NORMAL
→ NUNCA REESCREVER NOVAMENTE NO ESCURO
```

## Clone / acesso — diagnóstico em camadas

```text
URL/REMOTE CORRETO?
→ REPOSITORIO EXISTE?
→ AUTENTICACAO HTTPS/PAT/SSO APLICAVEL?
→ PERMISSAO DE ACESSO?
→ SSH CONFIGURADO QUANDO USADO?
→ DEFAULT BRANCH / REMOTE HEAD EXISTE?
→ SO DEPOIS TRATAR COMO FALHA DE GIT LOCAL
```

## Gatilhos

Use esta lente quando houver `fetch`, `pull`, `push rejected`, `non-fast-forward`, `force`, `force-with-lease`, `reflog`, clone quebrado, branch divergente, deploy que sincroniza Git ou recuperação de commit/ref.

Contrato machine-readable: `contract.json`.
Validação: `scripts/validate.mjs`.
Regressão do consumidor: `scripts/webhook/lib/safe-git-deploy.test.mjs`.
