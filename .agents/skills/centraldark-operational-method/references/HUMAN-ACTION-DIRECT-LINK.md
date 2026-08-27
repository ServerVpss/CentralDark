---
title: "Ação humana direta — link clicável"
status: "CANONICO"
authority: "SEGREDO/CHEFE"
owner: ".agents/skills/centraldark-operational-method/SKILL.md"
scope: "UX operacional quando a próxima ação humana é abrir, editar, revisar ou agir em um alvo específico"
---

# Ação humana direta — link clicável

Regra da Casa CentralDark:

```text
ACAO_HUMANA_ESPECIFICA
→ FORNECER_LINK_DIRETO_DA_ACAO
→ NAO_OBRIGAR_O_HUMANO_A_NAVEGAR_MANUALMENTE
```

## Menos é mais

Se a próxima ação humana já tem destino conhecido, o retorno deve apontar para esse destino de forma clicável.

```text
PATH_SOZINHO < LINK_DIRETO
INSTRUCAO_DE_NAVEGACAO < ACAO_CLICAVEL
```

Exemplos:

- editar arquivo GitHub → preferir `https://github.com/<owner>/<repo>/edit/<branch>/<path>`;
- abrir PR → link direto do PR;
- revisar arquivo específico → link direto do arquivo/ref;
- abrir workflow/run/issue conhecido → link direto do alvo.

## Formato recomendado

```markdown
👉 [EDITAR AGORA — nome-do-arquivo](URL_DIRETA_DE_EDICAO)
```

ou equivalente visual simples.

## Fronteira

O link facilita a ação; não amplia autoridade nem permissão.

```text
LINK != AUTHORIZATION
LINK != APPROVAL
LINK != MERGE_PERMISSION
LINK != DEPLOY_PERMISSION
```

Se a ação exigir autorização separada, o link pode ser fornecido, mas a mutação continua bloqueada até a autorização aplicável.

## Regra de falha

Se não for possível construir com segurança o link direto para o destino correto, fornecer o melhor link estável disponível e declarar a limitação. Não inventar URL.

```text
KNOWN_TARGET + SAFE_DIRECT_URL → DIRECT_LINK
UNKNOWN_TARGET → CLARIFY_OR_REPORT_UNKNOWN
```
