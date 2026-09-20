---
title: "Template Padrão de Skill"
date: 2026-06-29
tags: ["template", "skill", "agents", "padrao"]
updated: 2026-06-29
---

# 🤖 SKILL: [INSIRA O NOME AQUI]

> **Objetivo:** [O que essa skill resolve de forma objetiva]
> **Tipo:** [Memória | Investigação | Organização | Código | Criação | Arquitetura]
> **Prioridade:** [Alta | Média-Alta | Média]

---

## Quando usar

[Em quais situações o agente deve ativar essa skill. Seja específico.]

Exemplos de gatilhos:
- "Claude, [frase que ativa essa skill]"
- "Claude, [outra frase de ativação]"

---

## Como funciona (passo a passo)

1. **[Passo 1]** — [O que fazer]
2. **[Passo 2]** — [O que fazer]
3. **[Passo 3]** — [O que fazer]
4. **[Verificação final]** — Confirmar com o Pivete antes de commitar qualquer mudança

---

## Regras de Ouro

**Nunca:**
- Apagar conteúdo existente sem "PERMITO PIVETE"
- Criar duplicatas sem verificar se já existe
- Expor secrets, tokens ou senhas

**Sempre:**
- Respeitar o Guia do Pivete (tom direto, sem enrolação)
- Gravar resultado em BRAIN ou CONSCIENCIA conforme tabela de roteamento
- Notificar no Telegram quando concluir

---

## Exemplo de uso real (CentralDark)

```
Pivete: "Claude, executa a skill [NOME] focada em [CONTEXTO]"

Agente:
1. [O que faz]
2. [O que entrega]
3. [Onde salva]
```

---

## Saída esperada

- [Entregável 1]
- [Entregável 2]
- Notificação no Telegram com resumo

---

## Integrações

- **Onde salvar:** `docs/BRAIN/05 - Documentacao/AGENTS-LIBRARY/[NOME].md`
- **Integrar em:** [agente existente que pode usar essa skill, ou "standalone"]
- **Ferramentas MCP:** [ferramenta do MCP necessária, ou "nenhuma"]

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — índice de todas as skills
- [[00-LEIA-PRIMEIRO]] — regras operacionais
- [[BRAIN]] — vault raiz
