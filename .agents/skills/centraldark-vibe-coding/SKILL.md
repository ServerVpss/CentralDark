---
name: centraldark-vibe-coding
description: "SuperSkill CentralDark de Vibe Coding em português claro: diga em um comando o que quer criar, explore opções com Brainstorming quando necessário, faça mutações pequenas quando não gostar de uma parte e recomece somente o rascunho aprovado. Encadeia skills sob demanda, grafo INTERLIGADOS e contraprova sem gerar outro agente, owner ou serviço."
version: "1.0.0"
status: SOURCE_IN_PR_RUNTIME_NOT_PROVEN
owner: .agents/skills/centraldark-vibe-coding
trigger: "#VIBECODING"
aliases: ["!VIBECODING", "!CENTRALDARK #VIBECODING"]
---

# 🎨🧵 CentralDark · SuperSkill Vibe Coding + Brainstorming

**Um comando objetivo:** \`!CENTRALDARK #VIBECODING Quero [objetivo concreto]\`.

O usuário descreve a intenção e a composição criativa propõe o menor caminho viável. Esta SuperSkill **não é outro cérebro, agente, executor, skill workshop ou catálogo**. Ela seleciona capacidades existentes por demanda, mantendo CHEFE = decisão, SOL = coordenação, Hermes = execução autorizada e realidade = juiz.

## 🎯 Como usar

- **Criar** — \`!CENTRALDARK #VIBECODING crie um painel de saúde dos conectores\`: descobrir contexto/owners, gerar 2–3 opções quando houver incerteza, escolher a menor implementação viável e testar.
- **Brainstorm** — \`!CENTRALDARK #VIBECODING brainstorm de uma navegação modular\`: carregar \`../brainstorming/SKILL.md\` conforme a necessidade; design/consentimento precedem alterações de escopo ainda não aprovado.
- **Só onde não gostei** — \`!CENTRALDARK #VIBECODING ajustar: botão do painel; desejo: reduzir largura\`: alterar apenas o componente ou aspecto identificado, mantendo os demais IDs, props, serviços, fluxos e testes.
- **Não gostei de tudo** — \`!CENTRALDARK #VIBECODING recomeçar este rascunho\`: exigir delimitação de versão e confirmação; recriar somente a **casca rascunho isolada**, sem apagar arquivos originais, histórico Git, recibos ou trabalho de outro escritor.
- **Conflito** — \`!CENTRALDARK #VIBECODING reconciliar PR #1880\`: usar \`../git-conflict-resolve-house-standard/SKILL.md\`, preservar lados não relacionados, validar a resolução no mesmo SHA e aguardar CI antes de promover.

**Regra de interpretação:** fala nova do CHEFE = delta da intenção atual. Não abandonar o objetivo anterior ou recriar projeto por conta própria. Criatividade altera a solução **dentro do escopo autorizado**; não altera permissões nem inventa ferramentas. Nenhuma frase vaga executa exclusão.

## 🧠🪡 Fluxo de mutação e ouro

\`\`\`text
!CENTRALDARK / #ACORDAR
  → recuperar último FIXED_POINT e owner real
  → #VIBECODING (intenção curta, conceito criativo)
  → INTERLIGADOS (resolver tags e menor conjunto suficiente)
  → BRAINSTORMING? [somente para lacuna de design]
  → CASCA RASCUNHO / PROTÓTIPO COM IDENTIDADE ESTÁVEL
  → MUTAR APENAS O DELTA PEDIDO
  → TESTE DA HIPÓTESE + CONTRAPROVA
  → NÃO GOSTOU? PATCH_LOCAL | RECOMEÇAR_RASCUNHO_CONFIRMADO
  → CRISTAL (menor solução demonstrável reutilizável)
  → OURO (aprendizado útil no mesmo owner, receipt, NEXT_CURSOR)
\`\`\`

Cada alternativa criativa deve explicitar \`OBJETIVO | ALVO | HIPÓTESE | TESTE | ORÁCULO | PROVA | CONTRAPROVA | DECISÃO\` sem expor cadeia privada de pensamento. Hipótese é candidato; só resultado medido e contraprova satisfatória viram prova. \`GREEN\` somente para teste executado sobre alvo/SHA compatível.

**Casca mutável:** rascunho versionado com identidade do componente e opções; patch mínimo sobre escopo nomeado; preservar tudo que não foi pedido. **Recomeçar** significa voltar à baseline aprovada num workspace temporário isolado e montar nova proposta. No repositório real, não usar \`git reset --hard\`, \`rm -rf\`, \`force push\`, cancelar deploy ou substituir owner para encenar reinício. Destruição do original requer autorização e gate separados.

## 🔗 Skills existentes acionadas sob demanda

| Quando | Skill já existente | Volta |
|---|---|---|
| Ideia ou requisitos ainda indeterminados | \`../brainstorming/SKILL.md\` | design aprovado |
| Seleção de ferramentas/agentes | \`../capability-contract-router/SKILL.md\` | conjunto mínimo justificado |
| Conflito Git | \`../git-conflict-resolve-house-standard/SKILL.md\` | merge sem perdas e CI pendente/verde explícito |
| Prova crítica ou informação divergente | \`../meta-lupa/SKILL.md\` | contraprova e próximo teste |
| Skill ausente de fato | \`../skill-workshop/SKILL.md\` | reutilizar ou criar somente lacuna comprovada |
| Execução/continuidade da missão | \`../centraldark-operational-method/SKILL.md\` | receipt, NEXT_CURSOR |

\`SKILL_LISTED != SKILL_LOADED\`; os adapters/motores disponíveis devem ser verificados antes do uso. Desktop Commander está fora do circuito desta missão; não o reativar como dependência.

## 🏷️ Grafo

O **mesmo registry** em \`../meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS/SKILLS/REGISTRY.json\` contém \`creative_on_demand\`, com trigger, aliases, tags, arestas \`from/to/condition/kind\`. O mapa existente \`MAPA-MENTAL-OPERACIONAL.md\` exibe os vínculos, e \`INTERLIGADOS.md\` é apenas a ponte visual desta skill. O grafo é uma declaração versionada, não um serviço/autoload paralelo.

As tags \`🎨 VIBE_CODING\`, \`🧠 BRAINSTORMING\`, \`🪡 MUTACAO_SELETIVA\`, \`🧬 CASCA_MUTAVEL\`, \`💠 CRISTAL\`, \`🍒 OURO_UTIL\`, \`🧪 CONTRAPROVA\` classificam decisões. Arestas são bidirecionais quando há retorno material; nenhuma aponta para um caminho inexistente.

## 🧪 Contrato do gatilho

\`node .agents/skills/centraldark-vibe-coding/scripts/vibe-router.mjs '!CENTRALDARK #VIBECODING crie um painel'\`

O adaptador é **read-only**: devolve proposta de rota estruturada para o orquestrador existente; não executa shell, não grava arquivos, não acessa tokens, não cria segundo agent nem aciona mutações. \`scripts/vibe-router.test.mjs\` cobre CREATE, IDEATE, PATCH com/sem alvo, RESET com/sem aprovação, ausência de gatilho e relações do grafo.

## 🧾 Critérios para FIXED_POINT

1. Fontes, paths e relação com \`brainstorming\` verificados no Git.
2. Testes do adaptador executados no mesmo HEAD; erro observado vira contraprova específica.
3. Integração à árvore de skills e tags está publicada no registry; não inferir que Hermes carregou só por haver registro.
4. Quando existir implementação de produto, exigir CI, revisão, readback da Casa/VPS e mesmo SHA.
5. Receipt no owner existente com \`GOAL | SOURCE_SHA | TESTS | DELTA | GRAPH_LINKS | RUNTIME | PROOF | NEXT_CURSOR\`.

\`SOURCE_COMMITTED != CI_PASS != HERMES_SKILL_LOADED != MISSION_COMPLETE\`.

NEXT_CURSOR: \`GIT_GRAPH_READBACK → TEST_SAME_SHA → USER_GOAL → MINIMUM_SKILLS → DRAFT → LOCAL_MUTATION → COUNTERPROOF → RECEIPT\`.
