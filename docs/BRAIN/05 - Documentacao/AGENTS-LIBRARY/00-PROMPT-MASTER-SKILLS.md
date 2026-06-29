---
title: "Prompt Master — Criador de Skills"
date: 2026-06-29
tags: ["prompt", "master", "skills", "criacao", "template"]
updated: 2026-06-29
---

# 🧠 Prompt Master — Criador de Skills CentralDark

> Cole esse prompt no Claude/Opus quando quiser criar uma skill nova de qualidade.
> Substitua `[INSIRA O FOCO AQUI]` pelo que você quer criar.

---

## O Prompt

```
Você é um especialista em criar Skills de alta performance para sistemas multi-agente (como o CentralDark).

Crie uma Skill completa, bem escrita, prática e reutilizável com as seguintes características:

- Nome da Skill: [Nome claro e objetivo]
- Objetivo principal: [O que essa skill resolve de forma eficaz]
- Quando usar: [Em quais situações o agente deve ativar essa skill]
- Como funciona: [Explicação clara do raciocínio + passos]
- Regras importantes: [O que nunca fazer + o que sempre fazer]
- Exemplo de uso real: [Exemplo prático dentro do contexto do CentralDark]
- Saída esperada: [O que o agente deve entregar no final]

A skill deve ser:
- Direta e sem enrolação
- Focada em resolver problemas reais do dia a dia
- Fácil de entender e executar por qualquer agente
- Bem conectada com memória (CONSCIENCIA + BRAIN)
- Respeitando o Guia do Pivete (tom informal, direto, sem frescura)

Contexto do sistema:
- Bot Telegram @srver1bot com skills ativas
- MCP CentralDark com 95 ferramentas
- Vault Obsidian sincronizado via GitHub
- VPS com PM2 gerenciando processos
- Áreas protegidas exigem "PERMITO PIVETE"

Crie agora a skill com o seguinte foco: [INSIRA O FOCO AQUI]

Depois de criar, informe também:
- Onde essa skill deve ficar salva (dentro de AGENTS-LIBRARY)
- Se ela deve ser integrada em algum agente existente
- Se ela precisa de alguma ferramenta do MCP para funcionar melhor
```

---

## Como usar

1. Copie o bloco acima
2. Cole no chat do Claude/Opus
3. Substitua `[INSIRA O FOCO AQUI]` pelo tema da skill
4. Salve o resultado em `docs/BRAIN/05 - Documentacao/AGENTS-LIBRARY/[NOME].md`
5. Adicione no [[00-AGENTS-INDEX]]

---

## Exemplos de foco já testados

| Foco | Skill gerada |
|------|-------------|
| `auditar nós cinzas no grafo do Obsidian` | [[GRAPH-INVESTIGATOR]] |
| `criar links semânticos entre notas` | [[SEMANTIC-LINKER]] |
| `gravar ideias e decisões no vault` | [[MEMORY-REGISTRAR]] |

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — índice do arsenal
- [[00-TEMPLATE-SKILL]] — template padrão
