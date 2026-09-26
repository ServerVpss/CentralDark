---
name: brainstorming
description: "Use ANTES de qualquer trabalho criativo — criar features, componentes, funcionalidades novas ou mudar comportamento. Explora intenção, requisitos e design ANTES de implementar. Aplica-se a TODO projeto, por mais simples que pareça."
---

# Brainstorming — Transformar ideias em designs aprovados

Ajuda a transformar ideias em designs e specs bem definidos através de diálogo colaborativo natural, ANTES de escrever qualquer código.

Comece entendendo o contexto atual do projeto. Depois faça perguntas uma por vez para refinar a ideia. Quando entender o que vai construir, apresente o design e obtenha aprovação do usuário.

<PORTAO-RIGIDO>
NÃO escreva código, NÃO crie scaffolding, NÃO invoque nenhuma skill de implementação e NÃO tome nenhuma ação de implementação até ter apresentado um design E o usuário ter aprovado. Isso vale para TODO projeto, independentemente da simplicidade aparente.
</PORTAO-RIGIDO>

## Anti-padrão: "Isso é simples demais pra precisar de design"

Todo projeto passa por esse processo. Uma lista de tarefas, uma função utilitária, uma mudança de config — todos. Projetos "simples" são justamente onde suposições não examinadas causam mais retrabalho. O design pode ser curto (algumas frases pra projetos genuinamente simples), mas você PRECISA apresentar e obter aprovação.

## Checklist obrigatório

Você DEVE criar uma task (via `task_tracking--create_task`) pra cada item abaixo e executá-los em ordem:

1. **Explorar contexto do projeto** — ler arquivos relevantes, docs (`docs/`, `START_HERE.md`, `docs/STATE.md`), commits recentes, estado do PM2/VPS se for trabalho ops.
2. **Fazer perguntas de esclarecimento** — UMA por vez, via `questions--ask_questions`. Foco em propósito, restrições e critério de sucesso.
3. **Propor 2-3 abordagens** — com trade-offs e a sua recomendação no topo, explicando o porquê.
4. **Apresentar o design** — em seções dimensionadas pela complexidade. Pedir confirmação após cada seção.
5. **Escrever o documento de design** — salvar em `docs/specs/YYYY-MM-DD-<topico>-design.md` e commitar.
6. **Auto-revisão do spec** — varredura rápida por placeholders, contradições, ambiguidade e escopo. Corrigir inline.
7. **Revisão do usuário no spec escrito** — pedir explicitamente pro usuário revisar o arquivo antes de prosseguir.
8. **Transição para implementação** — só então começar a codar (ou invocar uma skill de planos/implementação, se existir).

## Fluxo do processo

```
Explorar contexto
        ↓
Perguntas de esclarecimento (uma por vez)
        ↓
Propor 2-3 abordagens com recomendação
        ↓
Apresentar design em seções
        ↓
Usuário aprovou? ── não → revisar e reapresentar
        ↓ sim
Escrever doc em docs/specs/
        ↓
Auto-revisão (corrigir inline)
        ↓
Usuário revisa o spec escrito
        ↓ aprovado
Iniciar implementação
```

## Como conduzir

**Entendendo a ideia:**

- Sempre cheque o estado atual do projeto primeiro (arquivos, docs, commits recentes, PM2 quando for ops).
- Antes de cair em perguntas de detalhe, avalie escopo: se o pedido descreve vários subsistemas independentes ("monta uma plataforma com chat, storage, billing e analytics"), sinalize na hora. Não gaste perguntas refinando algo que precisa ser decomposto antes.
- Se o projeto é grande demais pra um único spec, ajude o usuário a quebrar em sub-projetos: quais são as peças independentes, como se relacionam, em que ordem construir. Cada sub-projeto vira seu próprio ciclo spec → plano → implementação.
- Pra projetos com escopo certo, faça uma pergunta por vez pra refinar.
- Prefira múltipla escolha quando der; aberta tudo bem também.
- UMA pergunta por mensagem. Se o tópico precisa de mais exploração, quebra em várias mensagens.
- Foco: propósito, restrições, critério de sucesso.

**Explorando abordagens:**

- Proponha 2-3 abordagens com trade-offs.
- Apresente conversacionalmente, lidere com sua recomendação e explique o porquê.

**Apresentando o design:**

- Quando entender o que vai construir, apresente o design.
- Cada seção dimensionada pela complexidade: algumas frases se for direto, até 200-300 palavras se for nuançado.
- Após cada seção, pergunte se faz sentido até ali.
- Cobrir: arquitetura, componentes, fluxo de dados, tratamento de erro, testes.
- Esteja pronto pra voltar e esclarecer.

**Design pra isolamento e clareza:**

- Quebrar o sistema em unidades menores, cada uma com um propósito claro, comunicando por interfaces bem definidas, testáveis isoladamente.
- Pra cada unidade você deve conseguir responder: o que faz, como usar, do que depende.
- Dá pra entender o que a unidade faz sem ler o miolo? Dá pra mudar o miolo sem quebrar quem usa? Se não, as fronteiras precisam de trabalho.
- Unidades menores e bem delimitadas também são mais fáceis pra você (agente) trabalhar: arquivo grande é sinal de que tá fazendo demais.

**Trabalhando em base de código existente:**

- Explore a estrutura atual antes de propor mudanças. Siga padrões existentes.
- Onde o código atual tem problemas que afetam o trabalho (arquivo grande demais, fronteiras confusas, responsabilidades misturadas), inclua melhorias direcionadas como parte do design — do jeito que um bom dev melhora o código por onde passa.
- Não proponha refactor não relacionado. Foque no objetivo atual.

## Depois do design

**Documentação:**

- Salvar o design validado em `docs/specs/YYYY-MM-DD-<topico>-design.md`.
- Commitar o documento.

**Auto-revisão do spec:**

Após escrever, olhe com olhos novos:

1. **Placeholders:** algum "TBD", "TODO", seção incompleta, requisito vago? Corrige.
2. **Consistência interna:** alguma seção contradiz outra? Arquitetura bate com as features?
3. **Escopo:** dá pra um único plano de implementação ou precisa decompor?
4. **Ambiguidade:** algum requisito tem duas interpretações? Escolha uma e explicite.

Corrige inline. Não precisa re-revisar — corrige e segue.

**Portão de revisão do usuário:**

Depois do self-review, peça ao usuário pra revisar o spec escrito antes de prosseguir:

> "Spec escrito e commitado em `<caminho>`. Dá uma olhada e me fala se quer ajustar algo antes da gente começar a implementação."

Espere a resposta. Se pedir mudança, ajusta e refaz o self-review. Só prossegue quando o usuário aprovar.

**Implementação:**

- Aí sim, parte pro código.

## Princípios chave

- **Uma pergunta por vez** — não soterra o usuário.
- **Múltipla escolha preferida** — mais fácil de responder do que aberta.
- **YAGNI sem dó** — corte features desnecessárias do design.
- **Sempre explore alternativas** — 2-3 abordagens antes de fechar.
- **Validação incremental** — apresenta, aprova, segue.
- **Seja flexível** — volta e esclarece quando algo não fizer sentido.

## Adaptação a este projeto (MultiZap / clone-deck)

- Use `questions--ask_questions` pra fazer perguntas (de preferência múltipla escolha).
- Use `task_tracking--create_task` pros itens do checklist.
- Salve specs em `docs/specs/` (criar a pasta se não existir). Se for trabalho operacional de VPS, também referencie em `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/<topico>/`.
- Respeite as regras do `docs/AGENTS.md` (não tocar CRM, não restart all, não expor secrets).
- Tudo em PT-BR, tom conversacional, direto e curto.

## Quando NÃO usar essa skill

- Correção de bug pontual já diagnosticado (1 arquivo, mudança óbvia).
- Pergunta puramente de Q&A sem mudança de código.
- Ação operacional repetitiva já coberta por um script existente.
- Pedido explícito do usuário tipo "só faz X agora" com escopo claro.
