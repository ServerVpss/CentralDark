---
title: "00 PORTA DE ENTRADA IA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-08-03
status: "CANÔNICO"
---

# CHECKPOINT-IA — Estado vivo para qualquer IA

Este arquivo é a primeira camada de sincronização entre agentes, modelos, plugins e hubs no projeto CentralDark.

## Agentes usados pelo usuário

O usuário pode operar o projeto com qualquer IA atual ou futura: ChatGPT, Claude, Sonnet, Opus, Codex, Gemini, Grok, Copilot, Cursor, Windsurf, Lovable, Hermes ou outra tecnologia conectada.

Todos trabalham sobre a mesma fonte da verdade. Nenhum agente continua tarefa sem carregar a porta, identificar o papel atual, medir o estado necessário e reconciliar o pedido com as capacidades já existentes.

Nomes de modelo são exemplos, não criam autoridade própria.

## Comandos de recarregamento de memória

Quando o usuário escrever qualquer uma destas frases, ou quando houver reset de contexto, troca de agente, retomada de missão ou dúvida sobre o estado atual, a IA deve parar antes de agir e recarregar o contexto:

```txt
RELOAD MEMORIA
RECARREGAR MEMORIA
LEMBRAR MEMORIA
SYNC IA
SINCRONIZAR IA
ATIVA MODO SEGREDO
ATIVA DELTA
RETOMAR MISSAO
#ACORDA
#ACORDAR
!CALIBRAR
```

## O que a IA deve fazer

1. Ler `LEIA-ME-IA.md`.
2. Ler `AGENTS.md`.
3. Ler `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.
4. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
5. Ler `docs/CONSCIENCIA/APRENDIZADOS.md` e `docs/PENDENCIAS.md` quando forem relevantes ao pedido.
6. Consultar histórico de GitHub Actions quando a tarefa envolver CI, PR, merge ou deploy.
7. Confirmar branch, HEAD, escopo, escritor atual e evidência aplicável.
8. Emitir uma única vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.
9. Executar o preflight de reconciliação antes de propor qualquer solução nova.
10. Só depois responder ou agir.

## Preflight universal — reutilizar antes de criar

`REUSE_BEFORE_CREATE_REQUIRED`

```text
PEDIDO ATUAL
→ BUSCAR O QUE JÁ EXISTE
→ ABRIR A IMPLEMENTAÇÃO, NÃO APENAS O NOME DO ARQUIVO
→ CRUZAR CAPACIDADE POR CAPACIDADE COM O PEDIDO
→ CLASSIFICAR AUTORIDADE E ESTADO REAL
→ REUTILIZAR OU ESTENDER
→ CRIAR SOMENTE SE O GAP ESTIVER PROVADO
```

Classificações obrigatórias:

```text
CANONICAL     = contrato vigente
OPERATIONAL   = funcionamento observado
CANDIDATE     = proposta ainda não promovida
PROGRAM_ONLY  = plano, PR-mãe ou direção; não é runtime
HISTORICAL    = memória preservada; não governa o presente
UNKNOWN       = não provado; nunca vira PASS
```

Um PR aberto/Draft, plano, relatório ou prova formal não recebe autoridade operacional por existir. Um caminho canônico pode existir sem runtime; isso não autoriza criar um concorrente. Encontrar um componente e não ligá-lo ao pedido é `FALHA_DE_RECONCILIACAO_DE_CONTEXTO`.

## Fluxo proporcional ao risco

### Tarefa simples, local, clara e reversível

```text
carregar porta
→ reconciliar com o existente
→ executar correção mínima
→ validar
→ responder curto
```

Não criar swarm, missão Delta, tratado matemático, matriz de fases, documento ou arquitetura nova sem necessidade ou pedido explícito.

### Tarefa ampla, incerta, longa ou crítica

```text
carregar governança
→ reconciliar com o existente
→ congelar estado relevante
→ leitores investigam quando houver ganho real
→ um escritor executa
→ revisor/judge independente valida
→ gates promovem
→ registrar e resumir
```

A governança opera internamente. SEGREDO/CHEFE não deve administrar manualmente worktrees, receipts, revisões e repetições de teste salvo quando existir decisão humana real.

## Padrão operacional

```txt
resultado recebido
→ comparação com estado atual
→ somente informação nova útil
→ próxima ação mínima
→ validação
→ relatório curto
```

Regras:

- resposta simples e prática;
- sem enrolação e sem repetir diagnóstico fechado;
- mensagem atrasada não reinicia missão;
- evidência nova vence contexto antigo;
- somente um escritor por escopo;
- nenhum agente aprova a si mesmo;
- formalização é ferramenta sob demanda, não substituto da execução;
- segurança automática não vira burocracia do usuário.

## Onde registrar cada coisa

| Tipo | Onde registrar |
|---|---|
| Regra, erro aprendido ou padrão reutilizável | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Contrato de reconciliação antes de criar | `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` |
| Contrato universal de coordenação | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| Conclusão oficial de tarefa | `docs/RELATORIOS/YYYY-MM-DD-nome.md` |
| O que falta resolver | `docs/PENDENCIAS.md` |
| Estado curto para qualquer IA | `LEIA-ME-IA.md` e este arquivo |

## Estado e autoridade

Estado antigo escrito neste documento é contexto histórico até ser medido novamente. Fonte da verdade estrutural é o GitHub atual; runtime é provado pelo ambiente correspondente. Programa, PR-mãe e documentação de fase orientam direção, mas não bloqueiam automaticamente uma tarefa atual fora de seu escopo.

## Ações sensíveis

Sempre exigir autorização aplicável antes de:

- alterar Caddy, DNS, SSL ou domínio;
- mexer em Docker/WuzAPI ou banco real;
- resetar/logout WhatsApp;
- reiniciar serviço sensível;
- tocar em secrets;
- apagar ou mover pastas;
- transferir posse de escrita durante alteração em andamento.

## Regra final

Antes de começar uma nova conversa, continuar com outro agente ou retomar após interrupção, recarregue a fonte atual e reconcilie o pedido com o que já existe.

O objetivo é simples: qualquer IA deve reconhecer o sistema antes de inventar outro, executar proporcionalmente ao risco e deixar o usuário apenas com decisões reais.

---

## Conexões rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
