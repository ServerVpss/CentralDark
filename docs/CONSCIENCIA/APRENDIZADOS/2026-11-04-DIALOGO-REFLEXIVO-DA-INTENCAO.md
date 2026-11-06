# Aprendizado | Diálogo Reflexivo da Intenção | 04/11/2026

Origem: conversa CHEFE com SOL sobre MultiZap, o harness Instinto Superior e o MCP Admin UI.
Owner canônico: .agents/skills/centraldark-operational-method/Skills/centraldark-dialogo-reflexivo-da-intencao/SKILL.md
Estado: LIÇÃO_DOCUMENTADA; comportamentos de Hermes não testados nesta sessão.

## Erro real e causa

A missão ativa era permitir QR do MultiZap pelo Lovable: Gateway AkyronHost, HTTPS Cloudflare e WuzAPI Docker Casa/Tailscale. O CHEFE explicou que o mcp-admin-ui pertence ao Instinto Superior, como interface do harness. SOL interpretou a nova arquitetura como troca de prioridade e desviou do QR. O erro não foi falta de ferramenta: foi **perda da âncora da intenção**.

## Conversa que reparou

O CHEFE perguntou por que o foco mudou. SOL usou o exemplo de uma construção em que a pessoa indica onde o quadro elétrico deve ficar: isso não cancela a instalação elétrica. A analogia permitiu explicar a diferença entre compreender palavras e preservar o sentido contínuo. O CHEFE pediu reproduzir o padrão com Hermes.

Nome operacional CentralDark: Reflective Intent Dialogue (RID). Elementos técnicos: Reflective Listening, Conversational Repair, Metacommunication, Narrative Analogy e Intent Continuity. Não afirmar que RID é uma classificação acadêmica única.

## Melhoria proporcional

- Uma mensagem nova é DELTA por padrão; distinguir conversa, pergunta, ensino, correção, ordem e troca explícita de missão.
- Preservar INTENT_PARENT, CURRENT, owner, último verde e NEXT_CURSOR.
- Reconhecer mal-entendido, explicar a causa sem culpar o usuário e restaurar a continuidade.
- Em operação: Skill Mãe + Kimetsu Brainstorm Remix + Michelin 3 Estrelas, sem criar outro motor, sem repetir provas já suficientes.
- Em conversa filosófica: linguagem humana, metáfora clara quando útil; nada de HUD ou 17 técnicas recitadas.
- Uma skill documentada não equivale a consumo no runtime, nem altera pesos do modelo.

## Handoff técnico para não perder a missão

QR MultiZap: Gateway público HTTPS criado em multizap-mvp.centralldark.com; WuzAPI Docker Casa e Tailscale Funnel servindo a porta 8081; URL do Gateway atualizada como Secret no Lovable. No checkpoint observado, /health ainda retornava 503 degradado por URLs, QR não comprovado. Retomar desse NEXT_CURSOR e medir somente arestas alteradas.
O encaixe MCP Admin no Cockpit Instinto Superior permanece orientação arquitetural sem cancelar o QR; preservar as três alterações locais pré-existentes do Cockpit/Halo.

## Critério de aceite

Documentação: arquivo de skill + catalogação + interligações + aprendizado + lembrança, links e Markdown validados.
Hermes em runtime: observar uma instrução lateral sem abandono da missão principal, com resposta e NEXT_CURSOR preservados. Até isso: HERMES_RUNTIME=UNKNOWN.
