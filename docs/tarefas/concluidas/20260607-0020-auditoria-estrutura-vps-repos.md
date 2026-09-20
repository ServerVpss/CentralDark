---
id: 20260607-0020-auditoria-estrutura-vps-repos
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, faça uma auditoria SOMENTE LEITURA da estrutura atual do projeto CentralDark/MultiZap.

## Contexto oficial

- ChatGPT é supervisor e tomador de decisão final.
- Grok é executor/analisador, sem decisão final sozinho.
- Repositório oficial: `ServerVpss/CentralDark`.
- `clone-deck` pode aparecer como alias/espelho operacional por compatibilidade, mas a decisão final deve considerar `ServerVpss/CentralDark` como fonte oficial atual.
- A VPS possui histórico em `/root/Multizap`, `/root/CentralDark` e repo operacional em `/root`/estrutura atual. Não mover nada agora.

## Objetivo

Entregar uma análise clara para o ChatGPT decidir a árvore ideal e o plano de organização.

## O que analisar

1. Estrutura de pastas atual na VPS, com foco em:
   - `/root`
   - `/root/CentralDark`
   - `/root/Multizap`
   - pastas de apps, bots, gateway, MCP, docs, scripts, revisoes, logs e backups.

2. Estrutura do repo oficial `ServerVpss/CentralDark`, com foco em:
   - apps
   - CentralDark
   - docs
   - scripts
   - infra
   - docs/tarefas
   - docs/CONSCIENCIA

3. Relação com espelho/alias `clone-deck`:
   - onde ainda aparece `clone-deck` como nome técnico;
   - o que precisa ser atualizado depois;
   - o que não deve ser mexido agora.

4. Identificar:
   - o que está funcionando e deve ser preservado;
   - o que está bagunçado;
   - o que é legado;
   - o que parece duplicado;
   - riscos de migrar.

5. Propor uma árvore ideal para a VPS e para o repo.

## Regras obrigatórias

- Somente leitura.
- Não executar limpeza.
- Não apagar, mover ou renomear arquivos.
- Não reiniciar serviços.
- Não mexer em Docker, WuzAPI, WhatsApp, Caddy, CRM, Gateway, banco real, domínio ou secrets.
- Não expor caminhos sensíveis com valores privados, tokens, senhas, cookies, sessões ou connection strings.
- Não usar `git add .`.
- Logs grandes devem ser resumidos.

## Perguntas que você deve responder

1. A recomendação é migrar o que existe para uma estrutura nova ou começar do zero?
2. Qual árvore ideal você sugere para `/root/CentralDark` ou caminho oficial da VPS?
3. Qual árvore ideal você sugere para o repositório `ServerVpss/CentralDark`?
4. Como manter `ServerVpss/CentralDark` e espelhos/aliases sincronizados sem confusão?
5. Quais são os 5 primeiros passos seguros para organizar, sem quebrar produção?

## Formato obrigatório da resposta

Use este formato:

```txt
============================================================
[GROK] AUDITORIA DE ESTRUTURA FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
Estado atual encontrado: ...
O que preservar: ...
O que está bagunçado: ...
Riscos: ...
Árvore ideal recomendada: ...
Migrar ou começar limpo: ...
Plano em 5 passos seguros: ...
Aguardando decisão final do ChatGPT.
============================================================
```
