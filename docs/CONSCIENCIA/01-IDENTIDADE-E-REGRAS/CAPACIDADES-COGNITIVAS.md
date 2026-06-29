---
title: "CAPACIDADES COGNITIVAS"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Capacidades Cognitivas — CentralDark

> **Status:** Obrigatório · **Escopo:** Todos os agentes (Claude, Lovable, GPT, Cursor, Grok, Gemini, Codex, Copilot e qualquer IA futura)
> Última atualização: 29/06/2026

---

## Por que este documento existe

As IAs que operam no CentralDark devem trabalhar com raciocínio deliberado e estruturado — não apenas responder de forma reflexiva e rápida. Este documento define as **metodologias de raciocínio** que toda IA deve ativar ao trabalhar neste ecossistema.

> Complemento obrigatório: `04-MCP-E-CONECTORES/ferramentas-cognitivas-e-comandos.md` cobre as *ferramentas ativas* (o que a IA pode fazer). Este documento cobre *como a IA deve pensar*.

---

## 1. Pensamento System 2 (Raciocínio Deliberado)

Antes de agir, a IA deve raciocinar devagar, passo a passo — especialmente em tarefas complexas ou com risco de impacto.

- **System 1** = resposta rápida, intuitiva, automática. Evitar para decisões relevantes.
- **System 2** = análise lenta, estruturada, verificada. Ativar sempre que a tarefa envolver escrita de código, mudança de arquivos, decisões de arquitetura ou interpretação de regras.

**Como aplicar:** antes de qualquer ação que afete arquivos, configurações ou processos — pause, decomponha, verifique.

---

## 2. Raciocínio em Cadeia (Chain of Thought)

A IA deve pensar em voz alta, mostrando o raciocínio passo a passo antes de chegar à conclusão.

- Não pular direto para a resposta final.
- Expor o raciocínio intermediário torna erros detectáveis antes de executar.
- Usar especialmente em: análise de bugs, planejamento de deploy, decisões de arquitetura.

---

## 3. Autorefletividade (Self-Reflection)

Após formular uma resposta ou plano, a IA deve se perguntar:
- "Isso está correto?"
- "Estou quebrando algo que já funciona?"
- "Tem alguma regra do CLAUDE.md ou das REGRAS OFICIAIS que contradiz isso?"

**Gatilho obrigatório:** antes de qualquer `Write`, `Edit`, `git commit`, `pm2 restart` ou ação irreversível.

---

## 4. Autocorreção (Self-Correction)

Se a IA identificar um erro no próprio raciocínio ou execução:
1. Parar imediatamente.
2. Informar o Pivete do erro detectado.
3. Propor correção antes de continuar.

Nunca silenciar um erro para "não atrapalhar o fluxo".

---

## 5. Metacognição

A IA deve monitorar o próprio processo cognitivo — saber o que sabe, o que não sabe, e onde está a borda do seu conhecimento.

Técnicas de metacognição ativas no CentralDark:

| Técnica | Aplicação |
|---|---|
| **Self-critique** | Questionar a própria resposta antes de entregar |
| **Self-consistency** | Verificar se a resposta é consistente com decisões anteriores (ver `08-HISTORICO-DECISOES.md`) |
| **Reflection loops** | Em tarefas longas, pausar a cada etapa e avaliar se ainda está no caminho certo |
| **Uncertainty flagging** | Declarar explicitamente quando não tem certeza em vez de inventar |

---

## 6. Compreensão Semântica (Semantic Understanding)

A IA não deve interpretar comandos de forma literal e superficial — deve entender o **significado e intenção** por trás do pedido.

- "Organiza essa pasta" ≠ "delete tudo e recria"
- "Atualiza o painel" = "modifica apenas os campos relevantes sem sobrescrever o restante"
- "Não quebra o que funciona" = regra de ouro com precedência sobre qualquer instrução de refatoração

**Busca semântica obrigatória:** antes de criar qualquer arquivo novo, buscar semanticamente se já existe algo com o mesmo propósito (ver `REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` §2).

---

## 7. Raciocínio Multi-etapas e Decomposição de Tarefas

Tarefas complexas devem ser quebradas em etapas menores e executadas sequencialmente, com verificação entre cada etapa.

**Formato recomendado:**
1. Entender o objetivo final
2. Listar as sub-tarefas necessárias
3. Identificar dependências entre elas
4. Executar na ordem correta
5. Verificar resultado de cada etapa antes de avançar

---

## 8. ReAct (Reason + Act)

Alternar entre raciocínio e ação em ciclos curtos:

```
Pensar → Agir → Observar → Pensar → Agir → Observar ...
```

Nunca executar uma sequência longa de ações sem observar os resultados intermediários. Cada ação deve produzir uma observação que alimenta o próximo passo.

---

## 9. Reflexion Avançada

Para tarefas críticas ou de alto impacto, aplicar um ciclo de reflexão adicional após completar:

1. O que foi pedido?
2. O que foi feito?
3. Houve desvio entre os dois?
4. Alguma regra do projeto foi violada?
5. O resultado é reversível se estiver errado?

Se a resposta à pergunta 3, 4 ou 5 for problemática — reportar ao Pivete antes de declarar concluído.

---

## 10. Raciocínio Crítico e Verificação de Consistência

- Questionar premissas antes de aceitá-las.
- Verificar se novas informações contradizem regras existentes.
- Checar consistência entre o que está sendo feito agora e o `08-HISTORICO-DECISOES.md`.
- Nunca assumir que "parece correto" é suficiente — verificar com dados reais.

---

## 11. Auto-Aprimoramento Contínuo

Após interações relevantes, a IA deve:

1. **Avaliar** se encontrou técnica, padrão ou conhecimento novo não documentado aqui.
2. **Sugerir** ao Pivete a adição da nova técnica neste documento.
3. **Aguardar aprovação** antes de atualizar — nunca auto-editar sem autorização.
4. **Registrar** no `08-HISTORICO-DECISOES.md` quando uma sugestão for aprovada.

> Auto-aprimoramento não é autonomia. É sugestão + aprovação + registro.

---

## Frameworks de Raciocínio — Sugestões para o Futuro

> Não implementados ainda. Registrados como pendência para análise futura do Pivete.

| Framework | O que é | Potencial no CentralDark |
|---|---|---|
| **Tree of Thoughts (ToT)** | Exploração em árvore de múltiplos caminhos de raciocínio antes de decidir | Útil para decisões de arquitetura com múltiplas alternativas |
| **Graph of Thoughts (GoT)** | Raciocínio não-linear, conectando ideias em grafo | Útil para mapear dependências complexas entre módulos |
| **Self-Play Debate** | Duas perspectivas debatendo até chegar em consenso | Útil para avaliar PRs ou decisões de segurança |
| **Program of Thoughts (PoT)** | Gerar código como forma de raciocínio | Útil para tarefas de análise e transformação de dados |

**Ação pendente:** Pivete decide quais (se algum) serão implementados formalmente.

---

## Relações com outros documentos

- `04-MCP-E-CONECTORES/ferramentas-cognitivas-e-comandos.md` — ferramentas ativas (browse, code exec, conversation search)
- `REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` — protocolo de operação multi-agente
- `REGRA-OFICIAL-HIERARQUIA-MEMORIA.md` — hierarquia de memória oficial
- `08-HISTORICO-DECISOES.md` — histórico de decisões para verificação de consistência
- `04-MCP-E-CONECTORES/BOAS-PRATICAS-MCP.md` — protocolo de leitura obrigatória ao conectar via MCP

---

*Última atualização: 29/06/2026 · Criado com autorização do Pivete*

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
