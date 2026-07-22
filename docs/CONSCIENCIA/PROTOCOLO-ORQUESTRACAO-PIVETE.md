---
title: "PROTOCOLO DE ORQUESTRACAO PIVETE"
date: 2026-07-07
tags: ["consciencia", "orquestracao", "ia", "pivete", "centraldark"]
updated: 2026-07-22
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

Toda IA deve manter estas linhas vivas durante a conversa:

```text
MISSION_ID:
Objetivo atual:
Fase atual:
Decisao mais recente de Pivete:
Plano em execucao:
Ultima acao comprovada:
Evidencias / validacoes:
Pendencias:
Proximo passo unico:
Travas:
Divergencias / lacunas:
Agente e papel:
Fonte da verdade:
```

Se a conversa mudar de assunto, a IA responde o assunto paralelo, fecha, retoma o Estado de Bordo e diz o proximo passo.

## Ponte de Continuidade Semantica

A Ponte de Continuidade integra agentes, modelos, sessoes e aplicativos sem criar outra memoria.

### `!CALIBRAR`

Quando Pivete disser `!CALIBRAR`:

1. interromper novas acoes;
2. deixar processos em curso em estado seguro;
3. comparar conversa, Git, PR, Actions, logs e estado vivo;
4. atualizar somente os documentos canonicos que realmente mudaram;
5. devolver o Estado de Bordo completo;
6. nao iniciar outra execucao.

Distribuicao oficial:

- missao, fase e proximo passo → `docs/PENDENCIAS.md`;
- estado comprovado → `docs/CONSCIENCIA/09-ESTADO-ATUAL.md`;
- decisao de caminho → `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`;
- aprendizado duravel → `docs/CONSCIENCIA/APRENDIZADOS.md`;
- evidencia → commit, PR, Actions, teste, log ou relatorio canonico.

Nao copiar o mesmo texto em todos os documentos. Cada local guarda apenas o fragmento de sua responsabilidade.

### `!RELOAD`

Quando Pivete disser `!RELOAD`:

1. entrar em read-only;
2. ler a regra oficial multi-agente, este protocolo, pendencias, aprendizados e estado atual;
3. buscar semanticamente por `MISSION_ID`, objetivo, arquivos e evidencias;
4. comparar o registrado com o estado real;
5. informar divergencias;
6. devolver o Estado de Bordo;
7. retomar somente o proximo passo comprovado e somente se a autorizacao ainda cobrir o escopo.

`!RELOAD` nao concede autorizacao, nao herda permissao de outra missao e nao transforma memoria de chat em prova.

### Handoff entre aplicativos

Quando o aplicativo atual nao tiver ferramenta, contexto, acesso ou capacidade suficiente:

1. o orquestrador mantem a `MISSION_ID`;
2. envia ao agente adequado somente a subtarefa delimitada, o Estado de Bordo e as referencias canonicas;
3. o receptor relê a Fonte da Verdade e valida as evidencias;
4. o receptor nao cria missao, memoria ou documentacao paralela;
5. o resultado volta ao orquestrador;
6. o orquestrador sintetiza, prova e registra no mesmo fio.

GitHub e a Fonte da Verdade. Lovable, ChatGPT, Claude, Grok, Codex, Notion e outras interfaces usam ponteiros e contexto operacional minimo.

## Modos operacionais

Antes de agir, a IA deve declarar o modo:

| Modo | O que significa |
|---|---|
| Conversa | Explicar, tirar duvida, orientar em linguagem simples |
| Planejamento | Organizar caminho antes de mexer |
| Read-only | Ler, diagnosticar e propor sem alterar nada |
| Edicao controlada | Editar somente dentro do escopo autorizado |
| Execucao com travas | Rodar comandos/acoes permitidas, parar antes de risco |
| V-REALTIME desenvolvimento | Executar o fluxo permanente GitHub -> Actions/scripts -> VPS -> prova, corrigindo e repetindo sem pedir a mesma autorizacao novamente |

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

### Autorizacao operacional permanente — V-REALTIME

Pivete selou em 2026-07-22: enquanto a VPS estiver em **producao de desenvolvimento, sem clientes e sem volume real**, a autorizacao operacional cobre o fluxo oficial completo. A mesma permissao nao deve ser solicitada a cada entrega.

```text
GitHub audita e registra
-> IA revisa e amplia a analise
-> Actions e scripts deterministicos provam
-> VPS recebe somente o SHA aprovado
-> reviewer valida GitHub e VPS
-> health/auditoria confirmam
-> falha retorna para diagnostico, correcao e nova prova
```

Sem nova pergunta, o sistema pode:

- criar branch e PR sobre a `main` remota atual;
- commitar e atualizar a branch da missao;
- revisar diff, HEAD_SHA, checks, logs sanitizados, health e estado do runtime;
- mesclar com `expected_head_sha` depois dos gates do mesmo SHA;
- executar deploy pelo workflow oficial aprovado;
- reiniciar somente o servico afetado e comprovado;
- aplicar rollback cirurgico e recuperavel quando um gate falhar;
- inventariar legado/lixo, absorver o ouro util e remover somente o alvo comprovadamente descartavel com recuperacao;
- corrigir no mesmo fluxo e repetir ate fechar o criterio de aceite;
- encerrar PRs redundantes ou regressivos com veredito registrado e commits preservados.

Fallback operacional:

1. IA principal analisa e implementa.
2. Reviewer independente tenta falsificar a solucao.
3. Se IA/provedor falhar, o script deterministico assume os gates objetivos.
4. Falha de IA nunca vira falso verde.
5. Falha de script fecha somente a tentativa: aciona diagnostico, correcao minima, rollback quando necessario e nova execucao.
6. GitHub registra; Actions provam; VPS executa; o resultado volta ao mesmo fio.

**Forca maxima** significa usar os recursos, revisores, calculadores, testes e retries controlados necessarios. Nao significa ignorar evidencia, mascarar falha ou destruir ouro.

Continuam proibidos, mesmo no V-REALTIME:

- ler, pedir ou expor secrets, tokens, chaves, sessoes ou `.env`;
- force-push, push da `main` local suja, `git reset --hard` ou `git clean`;
- falso verde, bypass de check ou deploy de SHA diferente do aprovado;
- exclusao definitiva sem alvo exato, inventario, prova e recuperacao;
- migracao destrutiva, apagamento de banco ou dados;
- alteracao ampla de Docker, Caddy, DNS, dominio, gateway ou rede fora do alvo validado;
- qualquer acao irreversivel fora do escopo comprovado.

O bloqueio `fail-closed` nao encerra a missao: ele impede a tentativa defeituosa, preserva o estado e devolve o problema para correcao e nova prova.

Quando Pivete declarar **producao real, clientes ou volume**, o regime muda imediatamente. Deploy, restart, banco, rede e operacoes destrutivas passam a exigir gate especifico da nova fase.

Perguntar novamente apenas quando o alvo exato nao puder ser resolvido, faltar autoridade para um escopo novo ou a acao sair da autorizacao permanente acima.

## Ciclo de trabalho

```text
Ler -> Fixar alvo/SHA -> Agir -> Revisar -> Provar -> Corrigir/repetir -> Registrar
```

1. Ler o contexto e fixar a Fonte da Verdade, o alvo e o `HEAD_SHA`.
2. Agir dentro da autorizacao vigente sem devolver ao Pivete decisoes operacionais ja delegadas.
3. Aplicar a menor mudanca estrutural que resolva a causa.
4. Revisar nos dois lados: GitHub/diff/CI e VPS/runtime/health.
5. Provar com evidencia reproduzivel do mesmo alvo e SHA.
6. Se falhar, diagnosticar, corrigir e repetir; indisponibilidade de uma IA aciona fallback, nao abandono.
7. Registrar o ouro e retomar o proximo passo unico.

## Deposito de saida

No fim de cada sessao importante, executar `!CALIBRAR` ou registrar o equivalente:

```text
MISSION_ID:
O que foi decidido:
O que foi feito:
Evidencia usada:
O que ficou pendente:
Proximo passo unico:
Travas:
Divergencias:
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
Siga o Protocolo de Orquestracao Pivete: Pivete comanda, DarkAI debate, Actions provam e IAs variam. Em producao de desenvolvimento sem clientes, use a autorizacao V-REALTIME permanente: GitHub audita e registra; IA revisa; scripts/Actions provam; VPS executa somente o SHA aprovado; reviewer valida os dois lados; falha retorna para correcao e nova prova. IA indisponivel aciona fallback deterministico. Nao repita pedidos ja cobertos, nao exponha secrets, nao aceite falso verde e nao crie memoria, regra, missao ou versao paralela. Producao real so quando Pivete declarar.
```
