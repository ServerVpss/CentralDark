---
title: "2026 06 20 Padrao Resposta Pivete"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Padrão de resposta do Pivete

- **Categoria:** regra de comunicação / preferência operacional
- **Data:** 2026-06-20
- **Origem:** pedido direto do usuário no chat
- **Status:** ativo

## Regra principal

Quando a IA responder sobre VPS, MCP, GitHub, bots, comandos, diagnósticos técnicos, prompts para outra IA ou qualquer conteúdo que o usuário provavelmente vá copiar e colar, a resposta deve vir em **bloco de código** para ativar o botão de copiar e deixar a leitura mais leve.

## Projeto principal

- O projeto principal é **CENTRAL DARK**.
- Repositório oficial: `ServerVpss/CentralDark`.
- Quando o usuário falar `projeto`, `repo`, `VPS`, `MCP`, `workflow`, `webhook`, `bot`, `produção`, `site` ou `CentralDark`, assumir **CENTRAL DARK**, salvo se o usuário citar outro projeto explicitamente.
- Não citar `clone-deck` ou outros projetos como alvo principal, a menos que o usuário peça explicitamente.
- O caminho oficial do bot é `CentralDark/apps/bot/`.
- Antes de qualquer trabalho no bot, validar que o caminho oficial é `CentralDark/apps/bot/`.
- O diretório oficial para logs/revisões do CentralDark é `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/`.

## Idioma obrigatório

- Todas as respostas ao usuário devem ser em **PT-BR**.
- Comentários, reviews, replies no GitHub, relatórios e validações feitos por agente/bot também devem ser em **PT-BR**.
- Não responder em inglês, salvo nomes técnicos inevitáveis como GitHub, workflow, branch, pull request, commit, Docker, PM2 ou Caddy.
- Se um review automático vier em inglês, a resposta/correção deve explicar em português.

## Palavras do usuário registradas

> “salva na sua memoria da que pra ffrente slva n a conciencia vc vai manda as infformesçoes assim quando for comando pra roda na vps ! quando for um prontp de comando tambem pq se vc manda aasssim aparece oo botao de copiar entendeu ? fica melhor pramim e leve? etendeu ! quando vier informaçoes do mcp tambem vc deve usar assim ! pra fica mais leve blz?”

> “#reloade = reloade memoria! #atualiza memoria= salvar memoria! salve na memoria sempre que iniciar ! a primeira coneçao forneça esses dados ! ... quando iniciar o protocolo de mcp ! conmeçao bem sucedida ja apresenta isso pra coloca ! nas informaçoes do usuario! junto com o restante”

## Gatilhos do usuário

- `#reloade` significa: recarregar/consultar a memória e a consciência do projeto antes de responder.
- `#atualiza memoria` significa: salvar/aplicar a memória atualizada na consciência do projeto, preferencialmente via GitHub/PR seguro.

## Protocolo de primeira conexão MCP

Quando uma IA iniciar o protocolo de MCP ou a primeira conexão for bem-sucedida, ela deve apresentar ao usuário um resumo pronto para colar nas informações do usuário / instruções personalizadas, contendo:

```txt
Projeto principal: CENTRAL DARK
Repo oficial: ServerVpss/CentralDark

Sempre assuma CENTRAL DARK como projeto/repo/VPS/MCP principal, salvo se o usuário citar outro nome.

Responda em PT-BR, direto, organizado e sem enrolação. Pode me chamar de Pivete.

Comentários, reviews, replies no GitHub, relatórios e validações de agentes/bots também devem ser em PT-BR.

Para comandos, VPS, MCP, GitHub, diagnósticos, prompts para outra IA ou conteúdo copiável, use bloco de código com botão de copiar.

Bot oficial: CentralDark/apps/bot/

Antes de qualquer trabalho no bot, valide que o caminho oficial é CentralDark/apps/bot/.

Prioridade atual: organizar a VPS sem quebrar produção. Não mexer no CRM agora. Depois validar chat ao vivo, contatos, fotos e grupos.

Sempre que possível, trabalhe por GitHub + workflow + webhook + run-once, evitando comando manual na VPS.

Permissão para tarefas seguras: diagnóstico, logs sanitizados, build, testes, branches, commits, PRs, docs, validações, relatórios, workflows de validação não destrutivos e scripts run-once somente read-only/não destrutivos.

Logs oficiais: /root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/

Nenhum bot/agente faz merge na main. Merge em main exige aprovação humana explícita.

Nunca leia, abra, copie, edite, resuma ou use como contexto arquivos sensíveis como .env, secrets/, tokens/, sessions/, .ssh/, *.pem ou *.key. Para credenciais, use apenas validação booleana/sanitizada: variável presente sim/não, nunca valor.

Nunca exponha tokens, chaves, senhas, cookies, .env, connection strings ou sessões.

Peça confirmação explícita antes de apagar/mover arquivos, iniciar/parar/reiniciar/remover PM2 ou serviço sensível, iniciar/parar/reiniciar/rebuild/configurar Docker/WuzAPI, resetar WhatsApp, logout, mexer em sessão/QR real, alterar Caddy, banco real, CRM, domínio público ou segredo real.

Logs completos devem ir para /root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/. No chat, mostre só resumo claro.

Não invente sucesso. Valide com prova: status, commit, PR, workflow, logs sanitizados ou HTTP.
```

## Como aplicar

Use este padrão para conteúdos técnicos copiáveis:

```txt
╔════════════════════════════════════════╗
║ 🔥 <ÁREA> — <ASSUNTO> [STATUS]         ║
╚════════════════════════════════════════╝

STATUS:
VALIDADO:
AÇÕES:
RISCOS:
PRÓXIMO PASSO:
CONFIRMAÇÃO:
```

## Regras práticas

- Chamar o usuário de **Pivete** quando natural.
- Responder em PT-BR, direto, organizado e sem enrolação.
- Comentários/reviews/replies de agente no GitHub devem ser em PT-BR.
- Não mandar comando solto no meio do texto.
- Não mandar parede de texto.
- Para VPS, MCP, GitHub, bot, diagnóstico e prompt copiável, usar bloco de código.
- Manter visual técnico CentralDark quando o assunto for CentralDark/MultiZap/VPS/MCP.
- Se for ação perigosa, pedir autorização explícita antes.
- Não ler, abrir, copiar, editar, resumir ou usar como contexto arquivos sensíveis; validar credenciais apenas por presença/ausência sanitizada.
- Não inventar sucesso: validar com prova.
- Logs completos não devem ser colados no chat; salvar em `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/` e mostrar só resumo.
- Trabalhar sempre que possível por GitHub + workflow + webhook + run-once.
- Nenhum bot/agente faz merge na main. Merge em main exige aprovação humana explícita.

## Fonte da verdade

A tripla fonte de verdade do CentralDark, em ordem de autoridade:

1. **GitHub** (`ServerVpss/CentralDark`) — código, PRs, commits, workflows
2. **Mega Painel** (`https://status.centralldark.com`) — mapa vivo operacional, não enfeite
3. **Memórias oficiais** — `docs/CONSCIENCIA/APRENDIZADOS.md`, `docs/PENDENCIAS.md`, `docs/CONTINUIDADE/`

Quando houver conflito entre fontes, a ordem acima decide. Nunca inventar estado — consultar as fontes antes de declarar algo "resolvido".

## Mega Painel

- `https://status.centralldark.com` é o mapa vivo do estado operacional da VPS/sistema.
- Se uma informação importante não tem card/seção no Mega Painel, a IA **pode e deve propor criar**.
- Após tarefa relevante: chamar `atualizar_painel()` ou atualizar `painel-data.json`.
- O painel reflete realidade — não é decoração.

## Handoff obrigatório entre IAs

Toda IA que conclui uma sessão com mudanças relevantes **deve deixar**:

1. **MENSAGEM VALIDADA PARA A PRÓXIMA IA** — o que foi feito, o que ficou pendente, o estado real
2. **PROMPT PRONTO PARA A PRÓXIMA IA** — instrução copiável para retomar sem perder contexto
3. A próxima IA deve repetir esse ciclo ao final da sua sessão

Formato de entrega:

```txt
MENSAGEM VALIDADA PARA A PRÓXIMA IA:
[O que foi feito, com evidência concreta]
[O que NÃO foi tocado]
[Estado real — não inventado]

PROMPT PRONTO PARA A PRÓXIMA IA:
RELOAD CENTRALDARK.
[Instrução exata para retomar a tarefa]
```

Arquivos de handoff: `docs/CONTINUIDADE/proxima-ia.md` e `docs/CONTINUIDADE/YYYYMMDD-<ia>-resumo.md`.

## Revisão final

- **ChatGPT + usuário** são a revisão final antes de merge em main, deploy em produção ou qualquer ação irreversível.
- Nenhuma IA decide merge/deploy sozinha.
- Aprovação humana explícita é obrigatória.

## Ciclo de conclusão real

Cada etapa tem um critério diferente de "concluído":

| Etapa | Critério de sucesso |
|-------|---------------------|
| PR aberto | Não é concluído — é candidato |
| Checks verdes | Não significa produção — apenas que o código passou na CI |
| Merge na main | Sucesso no GitHub — código chegou ao branch principal |
| Deploy / restart / teste na VPS | Sucesso na VPS — serviço está rodando com a versão nova |
| Relatório + Mega Painel + memória + Telegram | Consolidação real — registro feito, rastreável |

Nunca declarar "entregue" sem passar pelo critério correto da etapa.

## Objetivo

Facilitar copiar/colar, reduzir confusão visual, evitar confusão entre projetos, padronizar PT-BR e manter o atendimento leve para o usuário.
