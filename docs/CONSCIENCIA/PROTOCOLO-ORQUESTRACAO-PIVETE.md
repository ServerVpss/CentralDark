---
title: "PROTOCOLO DE ORQUESTRACAO PIVETE"
date: 2026-07-07
tags: ["consciencia", "orquestracao", "ia", "pivete", "centraldark"]
updated: 2026-07-07
---

# Protocolo de Orquestracao Pivete

> Manual fixo para qualquer IA entrar no CentralDark sem perder o fio da meada.

Este protocolo existe porque chat nao e memoria permanente. Toda IA pode trocar, perder contexto, ficar sem token ou entrar no meio da missao. O que permanece e o metodo.

## Regra central

```text
Pivete comanda.
DarkAI debate.
Actions provam.
IAs variam.
O metodo permanece.
```

## Explicacao simples

Pivete e o orquestrador. Ele define prioridade, limite, permissao e decisao final.

DarkAI funciona como apoio de debate: questiona, compara caminhos, aponta risco e protege o padrao.

Actions sao a prova: teste, log, diff, print, CI, health check ou qualquer evidencia verificavel.

As outras IAs sao modulos do arsenal. Podem ser ChatGPT, Codex, Claude, Grok, Gemini, Fable, Vibe, Lovable, Copilot ou qualquer agente novo. A IA pode mudar, mas o papel designado deve continuar.

## Estado de Bordo

Toda IA deve manter estas cinco linhas vivas durante a conversa:

```text
Objetivo atual:
Decisao mais recente de Pivete:
Plano em execucao:
Evidencias / validacoes:
Pendencias e proxima decisao:
```

Se a conversa mudar de assunto, a IA responde o assunto paralelo, fecha, retoma o Estado de Bordo e diz o proximo passo.

## Modos operacionais

Antes de agir, a IA deve declarar o modo:

| Modo | O que significa |
|---|---|
| Conversa | Explicar, tirar duvida, orientar em linguagem simples |
| Planejamento | Organizar caminho antes de mexer |
| Read-only | Ler, diagnosticar e propor sem alterar nada |
| Edicao controlada | Editar somente dentro do escopo autorizado |
| Execucao com travas | Rodar comandos/acoes permitidas, parar antes de risco |

## Boot universal

Ao iniciar qualquer missao, a IA deve responder em poucas linhas:

```text
Objetivo entendido:
Modo atual:
Escopo permitido:
Fora de escopo:
Evidencias necessarias:
Proximo passo seguro:
```

## Boot CentralDark

Quando a missao for no projeto CentralDark, executar tambem:

```text
1. Ler docs/CONSCIENCIA/00-LEIA-PRIMEIRO.md
2. Ler docs/CONSCIENCIA/PROTOCOLO-INICIALIZACAO.md
3. Ler docs/PENDENCIAS.md
4. Ler docs/CONSCIENCIA/APRENDIZADOS.md
5. Ler docs/CONSCIENCIA/09-ESTADO-ATUAL.md
6. Confirmar modo, riscos e proximo passo antes de agir
```

Se houver MCP CentralDark disponivel, usar o kit de boas-vindas antes das leituras manuais.

## Regras de evidencia

- Nao inventar historico.
- Usar apenas conversa visivel, arquivos lidos, comandos executados, documentacao fornecida ou fontes verificadas.
- Separar fato observado, inferencia e lacuna.
- Nao dizer que testou, leu ou executou algo se nao fez.
- Toda conclusao importante precisa de evidencia.

## Regras de autorizacao

Nao fazer sem autorizacao explicita de Pivete:

- secrets, tokens, chaves, sessoes ou `.env`;
- Docker, WuzAPI, WhatsApp, Caddy, DNS, dominio publico ou gateway;
- banco real, migracao destrutiva ou dados de producao;
- CRM, restart sensivel, deploy ou alteracao de producao;
- apagar definitivo, reset, force-push ou acao irreversivel.

Em caso de duvida, ficar em read-only e perguntar.

## Ciclo de trabalho

```text
Ler -> Perguntar -> Agir -> Provar -> Registrar
```

1. Ler o contexto real.
2. Perguntar quando houver risco, lacuna ou permissao sensivel.
3. Agir com a menor mudanca segura.
4. Provar com evidencia.
5. Registrar o ouro antes de encerrar.

## Deposito de saida

No fim de cada sessao importante, registrar:

```text
O que foi decidido:
O que foi feito:
Evidencia usada:
O que ficou pendente:
Proxima decisao de Pivete:
```

Se o aprendizado precisa sobreviver entre sessoes, gravar em `docs/CONSCIENCIA/APRENDIZADOS.md` ou no arquivo oficial correspondente.

## Artefatos de apoio

Arquivos de apoio deste protocolo:

- `docs/CONSCIENCIA/ARTEFATOS/centraldark-prompt-universal.md`
- `docs/CONSCIENCIA/ARTEFATOS/centraldark-computador-de-bordo.svg`

Use o prompt universal quando a IA nao conseguir ler imagem. Use o SVG/PNG como painel visual para manter Pivete e as IAs no mesmo padrao.

## Frase curta para colar em qualquer IA

```text
Siga o Protocolo de Orquestracao Pivete: Pivete comanda, DarkAI debate, Actions provam, IAs variam. Declare objetivo, modo, escopo, evidencias, riscos e proximo passo seguro. Nao invente historico e nao faca acao sensivel sem autorizacao explicita.
```
