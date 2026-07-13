# 👋 Leia primeiro — Equipe do GitHub (o que vem da Lovable)

Este documento explica, em 1 página, como reconhecer e tratar as entregas que a **Lovable** faz no repositório `ServerVpss/CentralDark`.

## 1. Onde a Lovable escreve

- A Lovable trabalha **somente** na branch `pivete/dev`.
- Ela mexe basicamente em **frontend/design** (`src/**`, `public/**`, `docs/**`, `.lovable/**`).
- Ela **não** mexe (sem ordem explícita) em: VPS, PM2, secrets, produção, `apps/**`, `infra/**`, `supabase/**`, `.github/workflows/**` ou qualquer área 🔒.

## 2. Promoção oficial

```txt
pivete/dev  →  PR  →  pivete/auditoria  →  PR  →  main
```

- `pivete/dev` é oficina.
- `pivete/auditoria` é revisão/homologação.
- `main` é produção — só recebe SHA aprovado.

## 3. Como identificar um commit da Lovable

Título do commit começa com o prefixo:

```
[LOVABLE][<área>] Verbo no infinitivo + objeto
```

Áreas permitidas: `frontend`, `admin`, `portal`, `telepainel`, `docs`, `backend`, `infra`.

## 4. Onde ler o detalhe humano de cada entrega

- Arquivo mestre: **[`docs/ENTREGAS-LOVABLE.md`](./ENTREGAS-LOVABLE.md)**.
- Ordem: entrega mais recente no topo.
- Cada entrada traz: fio da missão, escopo, arquivos, como testar, evidência, pendências, próximo passo, commit e branch.

## 5. Labels — regra oficial

Labels vivem em **PRs/issues**, nunca em commits. Reutilizar o catálogo já existente, semeado por `.github/workflows/bots-labels-seed.yml`. **Não criar labels novas ou duplicadas sem ordem explícita do Pivete.**

Regras práticas para PRs de entrega Lovable:

| Situação | Labels mínimas |
|---|---|
| PR `pivete/dev` → `pivete/auditoria` (frontend/visual) | `frontend`, `assign:lovable`, `revisao-humana` |
| PR de docs Lovable | `assign:lovable` (+ `frontend` se o docs descrever mudança visual) |
| Severidade (só quando fizer sentido) | `p0`, `p1`, `p2`, `p3` |

- `needs-codex-review` **é aplicada automaticamente** apenas em PRs abertos **para `main`** pelo workflow atual. Não aplicar à mão em PR para `pivete/auditoria`.
- Nunca inventar rótulos como `lovable-delivery`, `entrega-lovable`, etc. — usar o catálogo já existente.

## 6. Limite atual conhecido (pendência registrada, não resolver aqui)

Os workflows `.github/workflows/pr-agent.yml` e `.github/workflows/pr-auto-review.yml` escutam PRs cujo alvo é `main`. Isso significa que o PR `pivete/dev` → `pivete/auditoria` **ainda não** dispara essas automações. Ajustar isso exige mexer em workflow, o que só acontece com autorização explícita do Pivete. Enquanto isso, a revisão em `pivete/auditoria` continua sendo humana (label `revisao-humana`).

## 7. O que nunca vem da Lovable

- Deploy/restart/logs na VPS ou PM2.
- Criação, leitura ou uso de secrets/tokens.
- Push direto em `main`.
- Mexer em áreas 🔒 listadas em `CLAUDE.md` §9.
- Mudanças fora de frontend/design sem ordem explícita.

Se aparecer commit `[LOVABLE][...]` violando algo acima, é bug — sinalizar ao Pivete antes de mergear.
