---
id: 20260606-2325-melhorar-ia-live-grok
executor: grok
status: recebido
finalizado_em: 2026-06-06 23:31:55
---

# Resultado

**Análise objetiva (somente leitura, sem ações sensíveis, sem modificações, sem git, sem restart, sem serviços).**

Inspecionei exclusivamente:
- `/usr/local/bin/ia-live`
- `/usr/local/bin/grok-live`
- `docs/tarefas/monitor_tarefas.py`
- `docs/tarefas/logs/monitor_tarefas.log`
- `docs/tarefas/logs/grok-build-live.log` (amostras grandes)
- `docs/tarefas/resultados/*.md` relevantes
- `docs/tarefas/README.md` e referências em REGRAS_DA_EQUIPE.md

**Causa raiz confirmada da poluição:**
- `grok-live` (linha 10) executa `script -q -f -a "$LOG" -c "grok $*"`. O binário `grok` é um TUI completo (alternate screen `?1049h`, posicionamento absoluto de cursor `\x1b[...H`, cores 24-bit RGB, caixas unicode, repaint constante da tela inteira, mouse tracking, barras de status, tree views, etc.).
- `ia-live` (linhas 65-94) faz `tail -c 0 -F` do log + filtro Python mínimo (remove só alguns CSI/OSC ANSI, acumula por `\r`/`\n`, pula "Script started/done"). Resultado: fragmentos de redraws sobrepostos, linhas repetidas, lixo de cursor, "Resume this session with: grok --resume ...", caracteres de controle e sobreposições — exatamente o descrito no problema.
- O log `grok-build-live.log` cresce para dezenas de MB de ruído de terminal (exemplos lidos confirmam repaints massivos a cada frame).
- Em contraste, `monitor_tarefas.log` é limpo (linhas `[timestamp] pegando tarefa X.md` / `tarefa concluida X.md` / erros).
- `monitor_tarefas.py` (especialmente `executar_grok`, `resultado_markdown`, `processar` e `log`) já captura a execução de forma não-interativa (timeout + pipe), sanitiza secrets, e persiste a resposta final estruturada em `resultados/<id>.md` (bloco após `# Resultado` até `## Tarefa lida`, mais metadados). O `print_result()` atual do ia-live já tenta extrair isso (awk + head -40) — é a única parte confiável.

O `ia-live` atual mistura dois fluxos incompatíveis: eventos limpos da fila + tentativa de espelhar UI dinâmica de TUI. O segundo é a fonte de toda a poluição e não agrega valor real (o usuário quer "o que está acontecendo" + "resposta final", não o ruído de repaint do terminal do grok).

### Respostas às perguntas

**1. Vale a pena continuar capturando o Grok Build interativo por `script`?**  
Não.  
O `script` captura o stream raw de um TUI projetado para terminal interativo (redraws completos, cursor control, alternate screen). Nenhum filtro leve em Python (ou mesmo um parser vt100 completo) consegue transformar isso em texto linear estável e legível em tempo real via tail. O custo de manutenção de um parser robusto é alto e o benefício é baixo — a resposta final já é capturada de forma sanitizada e persistida pelo monitor em `resultados/`. Capturar dessa forma nunca ficará limpo.

**2. É melhor mostrar só eventos da fila e resposta final, sem tentar espelhar o chat inteiro?**  
Sim, é claramente melhor e a única abordagem estável.  
O monitor_tarefas já orquestra tudo e persiste a resposta final limpa. Tentar espelhar o "chat inteiro" do Grok Build TUI é a origem da poluição e não entrega informação utilizável (o TUI não emite pensamentos sequenciais; ele rede***OCULTO*** tela). O `print_result()` existente prova que a parte útil já pode ser extraída dos arquivos de resultados.

**3. Qual seria o melhor desenho para o painel: `ia`, `ia-live`, `ia-chat`, ou outro?**  
Separação clara de responsabilidades (recomendado):

- `ia-live` (ou `ia live`): feed contínuo/append-only de eventos da fila + respostas finais. Banner/cabeçalho impresso **uma única vez** no início. Scroll natural do terminal. Sem `clear` após o banner, sem redraw de tela, sem TUI garbage. Foco em "o que está acontecendo agora na fila".
- `grok-live`: manter apenas como utilitário auxiliar isolado para quem quer rodar sessão interativa manual do grok (debug pontual). Não deve alimentar o painel principal. Documentar explicitamente que "o log será cru".
- `ia` ou `painel_netflix.sh`: para visão geral/dashboard (status de filas, últimas tarefas, visão VPS etc.). Pode ter clear + redraw periódico porque é um snapshot, não um feed de eventos.
- `ia-chat`: não usar para o painel ao vivo atual. Reservar para futuro (interação direta limpa ou replay de prompt ↔ resposta sanitizado, sem mistura com TUI nem com fila).

Melhor nome unificado futuro: `ia` como entrypoint com subcomandos (`ia live`, `ia painel`, `ia status`), mas manter os bins atuais simples por enquanto para evitar complexidade.

**4. Qual comando/script você recomenda para deixar limpo e estável?**  
Recomendação principal (após aprovação):

- Parar completamente de alimentar `ia-live` com `grok-build-live.log` e remover o `grok_stream`.
- Reescrever/substituir o conteúdo de `/usr/local/bin/ia-live` (mantendo a mesma interface de uso `/usr/local/bin/ia-live`):
  - Imprimir banner + cabeçalho **uma única vez** (fixo visualmente pelo scroll do terminal).
  - Rodar apenas stream de `monitor_tarefas.log` com parser similar ao atual (pegando tarefa / concluida / erro / falha), colorido e limpo.
  - Ao detectar "tarefa concluida", chamar `print_result` (melhorar levemente para extrair só o bloco após `# Resultado` até `## Tarefa lida`, truncado de forma estável, sem head arbitrário se possível).
  - Sem `tail` do log poluído, sem Python filter de TUI, sem `script`.
- Opcional leve: listar últimas N tarefas concluídas via polling simples de `resultados/` (sem inotify se quiser zero dependência extra).
- Deixar `grok-live` exatamente como está (wrapper mínimo de `script`), mas com documentação de uso restrito.

Isso atende 100% o objetivo: banner fixo/cabeçalho limpo, feed sem piscar, eventos do `monitor_tarefas`, resposta final do Grok. A "saída do Grok Build" em tempo real do TUI interativo é descartada como fonte (intrinsecamente poluente).

**Comandos seguros e focados (exatamente nos paths autorizados) — para inspeção manual pelo usuário:**

```bash
cat /usr/local/bin/ia-live
cat /usr/local/bin/grok-live
head -100 docs/tarefas/logs/monitor_tarefas.log
tail -30 docs/tarefas/logs/monitor_tarefas.log
tail -n 0 -F docs/tarefas/logs/monitor_tarefas.log | grep -E 'pegando tarefa|tarefa concluida|erro|falha'
ls -l docs/tarefas/logs/
ls -l docs/tarefas/resultados/
```

Após aprovação explícita do ChatGPT, o conteúdo atualizado do script `ia-live` (e nota para `grok-live`) pode ser fornecido para revisão manual antes de qualquer instalação via cat/echo ou editor.

Nenhuma ação foi executada além de leituras seguras de arquivos. Nenhum serviço tocado, nenhum git, nenhum binário sensível invocado, nenhum segredo exposto, nenhum `git add .`, nenhuma alteração em Docker/Caddy/WuzAPI/etc.

============================================================
[GROK] TAREFA FINALIZADA
============================================================
Status: Concluído
Resumo: Análise completa via leitura dos bins permitidos, monitor_tarefas.py, logs (monitor limpo vs grok-build-live poluído) e resultados. Raiz da poluição identificada (captura de TUI rico via script + filtro insuficiente). Confirmação de que monitor + resultados/ já entregam eventos limpos e resposta final sanitizada. Respostas objetivas às 4 perguntas + proposta de separação de responsabilidades e simplificação radical do ia-live (remover grok_stream e o log TUI).
Arquivos alterados: nenhum
Riscos ou dúvidas: Baixo. A única dependência é o monitor_tarefas continuar escrevendo logs e resultados limpos (já faz isso de forma estável). Se no futuro o CLI `grok` oferecer modo --plain/--no-tui estável, o monitor poderia usá-lo para respostas mais ricas, mas fora do escopo.
Próximo passo sugerido: Apresentar esta proposta ao ChatGPT. Após aprovação explícita, fornecer versão atualizada do conteúdo de /usr/local/bin/ia-live (mantendo interface idêntica) + nota de uso para grok-live, para revisão manual antes de qualquer deploy.
Aguardando aprovação do ChatGPT para prosseguir.
============================================================


## Tarefa lida

```md
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

```
