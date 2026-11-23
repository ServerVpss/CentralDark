---
id: 20260606-2325-melhorar-ia-live-grok
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, analise o painel `ia-live` que está capturando a saída do Grok Build em tempo real.

## Problema observado

A captura pelo arquivo `docs/tarefas/logs/grok-build-live.log` está aparecendo poluída no painel:

- muitas linhas repetidas;
- pedaços quebrados de tela/TUI;
- caracteres de cursor/terminal misturados;
- textos sobrepostos;
- difícil leitura para o usuário.

## Objetivo

Propor uma forma melhor e mais limpa para o painel ao vivo, mantendo:

- banner fixo ou cabeçalho limpo;
- feed sem piscar;
- eventos do `monitor_tarefas`;
- resposta final do Grok;
- se possível, saída do Grok Build, mas sem poluir.

## Instruções obrigatórias

- Não executar ação sensível.
- Não reiniciar serviços.
- Não mexer em Docker, Caddy, WuzAPI, WhatsApp, CRM, Gateway, banco ou domínio.
- Não expor secrets.
- Não usar `git add .`.
- Apenas analisar e responder com uma proposta objetiva.
- Se sugerir comandos, usar somente comandos seguros e focados em `/usr/local/bin/ia-live`, `/usr/local/bin/grok-live` e `docs/tarefas/logs/`.

## Perguntas para responder

1. Vale a pena continuar capturando o Grok Build interativo por `script`?
2. É melhor mostrar só eventos da fila e resposta final, sem tentar espelhar o chat inteiro?
3. Qual seria o melhor desenho para o painel: `ia`, `ia-live`, `ia-chat`, ou outro?
4. Qual comando/script você recomenda para deixar limpo e estável?

## Formato obrigatório no final

============================================================
[GROK] TAREFA FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo: ...
Arquivos alterados: nenhum
Riscos ou dúvidas: ...
Próximo passo sugerido: ...
Aguardando aprovação do ChatGPT para prosseguir.
============================================================
