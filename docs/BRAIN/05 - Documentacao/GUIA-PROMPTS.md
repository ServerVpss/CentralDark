---
title: "Guia de Prompts — Como falar com a IA"
date: 2026-06-29
tags: ["prompts", "tutorial", "leigo", "aprender", "ia"]
---

# Guia de Prompts — Como falar com a IA

> Para o Pivete aprender a transformar o jeito que fala em prompts poderosos.
> A IA entende você do jeito que você fala. Mas prompts bem feitos dão resultados melhores.

---

## O que é um prompt?

É a mensagem que você manda para a IA. Um prompt ruim dá uma resposta genérica. Um prompt bom dá exatamente o que você precisa.

**Prompt fraco:** "me ajuda com o sistema"
**Prompt forte:** "lista as 3 pendências mais urgentes do CentralDark e me diz o que preciso fazer amanhã"

---

## Fórmula simples de prompt que funciona

```
[O QUE VOCÊ QUER] + [CONTEXTO] + [FORMATO DA RESPOSTA]
```

**Exemplos:**

| Você fala (informal) | Prompt refinado que a IA entende |
|---------------------|----------------------------------|
| "me diz o que tá faltando" | "Liste todas as pendências ativas do CentralDark, agrupadas por prioridade" |
| "como tá o servidor?" | "Mostre o status de todos os processos PM2 e destaque qualquer problema" |
| "quero aprender sobre MCP" | "Explique o que é o Model Context Protocol em linguagem simples, com exemplos do CentralDark" |
| "grava isso" | "Crie uma nota Zettelkatten em docs/BRAIN/ com título e [[links]] automáticos sobre: [ideia]" |

---

## Tipos de prompt mais usados

### 1. Prompt de ação
Para quando você quer que a IA FAÇA algo.
```
"[verbo de ação] + [o que] + [onde/como]"
Exemplo: "cria uma nota sobre X na pasta 07"
```

### 2. Prompt de consulta
Para quando você quer SABER algo.
```
"[explica / lista / mostra / resume] + [o que] + [em linguagem simples]"
Exemplo: "explica o que é sparse-checkout em linguagem simples"
```

### 3. Prompt de decisão
Para quando você quer OPINIÃO da IA.
```
"[qual a melhor forma / o que você sugere] + [situação] + [meu objetivo]"
Exemplo: "qual a melhor forma de organizar as pastas do Obsidian dado que sou leigo?"
```

### 4. Prompt de registro
Para gravar ideias no cérebro.
```
"grava aí que [sua ideia]"
"registra: [o que aprendeu]"
"anota isso: [pensamento importante]"
```

---

## Como a IA refina o que você fala

Quando você fala de forma informal, a IA faz isso internamente:

```
Você fala: "to achando que o guardião ta usando muita cpu"
    ↓
IA interpreta: "Verificar o uso de CPU do processo CentralDark-GuardiaoConsciencia
               e sugerir otimizações se estiver acima de 10%"
    ↓
IA age e te mostra o resultado em linguagem simples
```

Você pode pedir para ver o prompt gerado: "me mostra o prompt que você usou para isso"

---

## Palavras mágicas para resultados melhores

| Palavra | O que faz |
|---------|-----------|
| "em linguagem simples" | IA explica sem jargão técnico |
| "passo a passo" | IA divide em passos numerados |
| "seja direto" | IA vai direto ao ponto, sem enrolação |
| "lista resumida" | IA dá bullet points curtos |
| "explica o porquê" | IA justifica cada decisão |
| "verifique antes de fazer" | IA confirma com você antes de executar |
| "sem código por enquanto" | IA só explica, não implementa |

---

## Aprendendo junto — como funciona

1. Você fala do jeito que pensa
2. A IA executa E mostra o que entendeu
3. Você corrige se necessário
4. A IA aprende seu jeito e vai ficando mais precisa

Com o tempo, a IA vai precisar de menos contexto porque já conhece você.

---

*Guia criado para o Pivete — atualizar sempre que aprender algo novo sobre prompts*
*Relacionado: [[TUTORIAL-OBSIDIAN]] | [[00-POSTURA-PIVETE]] | [[BRAIN]]*
