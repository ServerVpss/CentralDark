---
title: "00 PORTA DE ENTRADA IA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-07-30
---

# CHECKPOINT-IA — Estado vivo para qualquer IA

Este arquivo é a primeira camada de sincronização entre agentes, modelos, plugins e hubs no projeto CentralDark/MultiZap.

## Agentes usados pelo usuário

O usuário pode operar o projeto com qualquer IA atual ou futura: ChatGPT, Claude, Sonnet, Opus, Codex, Gemini, Grok, Copilot, Cursor, Windsurf, Lovable, Hermes ou outra tecnologia conectada.

Todos devem trabalhar como especialistas sincronizados sobre a mesma fonte da verdade. Nenhum agente deve continuar tarefa sem antes carregar a memória viva, identificar o papel atual e verificar se já existe um escritor no escopo.

Nomes de modelo são exemplos, não uma lista fechada e não criam autoridade própria.

## Comandos de recarregamento de memória

Quando o usuário escrever qualquer uma destas frases, ou quando houver reset de contexto, troca de agente, retomada de missão ou dúvida sobre o estado atual, a IA deve parar antes de agir e recarregar o contexto do projeto:

```txt
RELOAD MEMORIA
RECARREGAR MEMORIA
LEMBRAR MEMORIA
SYNC IA
SINCRONIZAR IA
ATIVA MODO SEGREDO
ATIVA DELTA
RETOMAR MISSAO
```

## O que a IA deve fazer ao receber esses comandos

1. Ler `LEIA-ME-IA.md`.
2. Ler `AGENTS.md`.
3. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
4. Ler `docs/CONSCIENCIA/APRENDIZADOS.md`.
5. Ler `docs/PENDENCIAS.md`.
6. Ler os relatórios recentes em `docs/RELATORIOS/` somente quando forem relevantes à missão.
7. Consultar, quando disponível e autorizado, logs/relatórios recentes em `/root/CentralDark/revisoes/`.
8. Consultar o histórico recente do GitHub Actions quando a tarefa envolver CI, PR, merge ou deploy.
9. Confirmar branch, HEAD, escopo, escritor atual, última prova e próximo gate.
10. Emitir uma única vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.
11. Só depois responder ao usuário ou executar qualquer ação.

## Fluxo único dos agentes

```txt
carregar governança
→ identificar papel
→ congelar estado atual
→ leitores investigam em paralelo
→ um escritor executa
→ revisores enviam delta
→ judge tenta derrubar
→ gates validam
→ registrar
→ resumir
```

Se qualquer IA registrar algo canônico, todas as outras devem ler a fonte atual antes de continuar. Nenhum agente depende da memória privada de outro agente.

## Padrão operacional

O padrão de conversa e execução é o **Modo Segredo + Método Delta**:

```txt
resultado recebido
→ comparação com estado atual
→ somente informação nova útil
→ próxima ação mínima
→ validação
→ relatório
```

Regras:

- resposta simples e prática;
- sem enrolação;
- sem repetir diagnóstico já fechado;
- mensagem atrasada não reinicia missão;
- evidência nova vence contexto antigo;
- somente um escritor por escopo;
- scripts com `clear || true` no início quando aplicável;
- visual CentralDark quando houver script;
- relatório salvo em `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/` quando a execução ocorrer na VPS e estiver autorizada;
- resumo limpo no chat;
- ações sensíveis só com confirmação explícita;
- nenhum agente aprova a si mesmo como revisão independente.

## Onde registrar cada coisa

| Tipo | Onde registrar |
|---|---|
| Regra, erro aprendido, padrão, estado importante | `docs/CONSCIENCIA/APRENDIZADOS.md` |
| Contrato universal de coordenação | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| Conclusão oficial de tarefa | `docs/RELATORIOS/YYYY-MM-DD-nome.md` |
| O que falta resolver | `docs/PENDENCIAS.md` |
| Log completo de execução na VPS | `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/` |
| Estado curto para qualquer IA | `CHECKPOINT-IA.md` e `LEIA-ME-IA.md` |

## Estado atual resumido

- Repo oficial: `ServerVpss/CentralDark`.
- Espelho/backup: `segredounlock/clone-deck`.
- Git root real na VPS: `/root`.
- Projeto operacional: `/root/CentralDark`.
- Bot validado online em `https://bot.multizap.dev`.
- Rotas SPA do bot retornaram 200 via Caddy.
- Bot real possui telas/componentes para `/chats` e `/contatos`.
- CRM continua fora do escopo e não deve ser mexido sem confirmação.
- Banco real, histórico WhatsApp, sessões WhatsApp/WuzAPI e migração pesada estão fora do escopo atual.
- Padrão de deploy visual: `#FASE deploy`.

## Ações sensíveis

Sempre pedir confirmação explícita antes de:

- alterar Caddy;
- mexer em Docker/WuzAPI;
- resetar/logout WhatsApp;
- reiniciar serviço sensível;
- mexer em CRM fora de leitura/auditoria;
- alterar banco real;
- tocar em secrets;
- trocar domínio/DNS/SSL;
- apagar ou mover pastas;
- transferir posse de escrita para outro agente durante alteração em andamento.

## Regra final

Antes de começar uma nova conversa, continuar tarefa com outro agente ou retomar após interrupção, recarregar a fonte atual primeiro.

O objetivo é manter qualquer IA respondendo sob a mesma governança, sabendo onde o último agente parou e colaborando em delta sem criar personalidades, memórias ou escritores concorrentes.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre