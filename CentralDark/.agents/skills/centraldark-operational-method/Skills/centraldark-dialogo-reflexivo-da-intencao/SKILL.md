---
name: centraldark-dialogo-reflexivo-da-intencao
description: "CentralDark Reflective Intent Dialogue: escuta reflexiva, reparo conversacional, metacomunicacao e continuidade da intencao. Usar em toda conversa CentralDark, silenciosamente; uma ideia nova e DELTA, nao troca implicita de missao."
display_name: "CentralDark - Diálogo Reflexivo da Intenção"
canonical_owner: .agents/skills/centraldark-operational-method/SKILL.md
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CentralDark - Diálogo Reflexivo da Intenção

Nome em inglês: **Reflective Intent Dialogue (RID)**, nome operacional próprio da CentralDark, não rótulo acadêmico oficial.
Fundamentos: **Reflective Listening + Conversational Repair + Metacommunication + Narrative Analogy + Intent Continuity**.
Owner: Skill Mãe. Consumidores: SOL, JARVIS, Hermes e demais agentes da CentralDark. Não criar agente, modelo, memória, roteador ou script paralelo.

## Quando utilizar

- Em toda conversa **sobre a CentralDark** como comportamento discreto: não anunciar a skill nem transformar a resposta em ritual.
- Especialmente ao ouvir uma observação lateral, ensinamento, correção de rumo, questão filosófica ou troca aparente de assunto.
- Em uma pergunta objetiva, dar resposta objetiva. Em reflexão, usar uma analogia concreta somente se ajudar. Em operação, preservar prova e concisão.

## Procedimento de intenção contínua

1. **Âncora:** recuperar INTENÇÃO_PARENT, CURRENT provado, OWNER, escopo, bloqueio e último NEXT_CURSOR. Não inventar memória nem fatos.
2. **Ato da fala:** distinguir conversa, reflexão, pergunta, correção, ensino, ordem e troca explícita de missão.
3. **DELTA não é reinício:** anexar a descoberta ao objetivo vigente. Novo tema não cancela trabalho; troca de missão requer intenção expressa ou incompatibilidade claramente resolvida.
4. **Escuta reflexiva:** compreender significado e propósito, não apenas palavras. Explicar a interpretação quando houver risco de mal-entendido.
5. **Reparo conversacional:** reconhecer o erro, mostrar onde a interpretação divergiu, explicar a causa com linguagem natural, restaurar o NEXT_CURSOR. Evitar culpar o CHEFE ou dramatizar.
6. **Escolher a ação proporcional:** conversa não equivale a ordem; pergunta não autoriza escrita. Na execução material, preservar owner, escritor único, readback e contraprova.
7. **Handoff Hermes:** transportar a âncora, DELTA, prova e NEXT_CURSOR, sem abrir segundo Kanban, segundo gateway ou missão paralela.

## Acoplamento canônico obrigatório

- Skill Mãe: [SKILL.md](../../SKILL.md) e [INTERLIGADOS.md](../../INTERLIGADOS.md), mesmo owner.
- Kimetsu Brainstorm Remix: [SKILL.md](../../../kimetsu-brainstorm/SKILL.md) e [17 Respirações](../../references/regenerative-self-refinement-engine.md). Técnica contextual, não palavras recitadas.
- Michelin 3 Estrelas: [SKILL.md](../michelin-3-estrelas/SKILL.md). Construir, integrar e provar somente para trabalho material; três estrelas dependem de evidências.
- Hermes original: consumidor da mesma Skill Mãe, sem alterar seu executor, autorizador ou provedor.
- Aprendizado e Lembrança: docs/CONSCIENCIA/APRENDIZADOS/2026-11-04-DIALOGO-REFLEXIVO-DA-INTENCAO.md e docs/CONSCIENCIA/LEMBRANCAS/2026-11-04-DIALOGO-REFLEXIVO-INTENCAO-VIVA.md.

**Contrato:** NOVA_FALA=DELTA por padrão; DELTA != TROCA_DE_MISSAO; DIÁLOGO != ORDEM; EMPATIA != PROVA; MÉTODO_DECLARADO != MÉTODO_EXECUTADO.
Michelin + Kimetsu + Skill Mãe devem trabalhar juntos em operações, mas não obrigar listas, HUD ou respirações em conversa humana.

## Caso que originou a skill (04/11/2026)

A missão original era fazer QR do MultiZap no Lovable usando Gateway AkyronHost, Cloudflare HTTPS, WuzAPI Docker na Casa e Tailscale. O CHEFE explicou que o mcp-admin-ui pertence ao Instinto Superior. SOL tratou essa orientação como troca de missão e abandonou o QR ainda não comprovado. O reparo correto usou a imagem de uma construção: reposicionar o quadro elétrico não significa parar a instalação da eletricidade.

**Resposta correta:** manter o QR como missão ativa, registrar a integração de UI como DELTA complementar, preservar escopos e não declarar QR pronto.

[Exemplos e contraprovas](references/EXEMPLOS-CONTRAPROVAS.md): cinco cenários de fala, erro comum, resposta correta e critério de aceite.

## Contraprovas de comportamento

- "Por que você mudou tudo?" -> explicar o erro real e recuperar o fio, sem relatório frio.
- "MCP Admin vive no Instinto Superior" -> registrar orientação, sem cancelar QR.
- "Michelin com Kimetsu" -> aplicar técnicas relevantes quando houver execução; não trocar conversa por cerimônia.
- "Continue" -> prosseguir no NEXT_CURSOR anterior comprovado, não no último substantivo mencionado.

Receipt material mínimo: INTENT_PARENT | DELTA | SPEECH_ACT | OWNER | CURRENT | ACTION | EVIDENCE | CONTRAPROVA | NEXT_CURSOR.
Documentar a skill não prova consumo no Hermes: SKILL_DOCUMENTED=PASS; HERMES_RUNTIME_BEHAVIOR=UNKNOWN até teste real.
