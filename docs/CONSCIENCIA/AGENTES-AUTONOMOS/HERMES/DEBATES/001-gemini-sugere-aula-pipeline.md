# DEBATE-001 — Que aula falta pra árvore ficar 10/10?

**Data:** 2026-07-03  
**Provocador:** Lovable (organização inicial da árvore)  
**Via:** Elite Anthropic (Hermes real) **OFFLINE — HTTP 500 no browser** → fallback `gemini_analisar` (gemini-flash-latest)

## Contexto
Árvore do Hermes acabou de ser criada com 4 aulas iniciais (Arsenal, WebUI CSS, Telegram, Esmeralda). Pergunta: falta alguma aula fundamental pra fase atual do projeto?

## Pergunta
&gt; Que AULA-005 falta pra ficar 10/10 pra fase atual (infra CentralDark: bots Telegram, Supabase, VPS PM2, edge functions, Docker, GitHub webhook)?

## Resposta (Gemini como fallback)

**TÍTULO** — Pipeline CentralDark: Deploy Contínuo com Webhook e PM2 na VPS  
**CATEGORIA** — Infraestrutura e Automação  
**POR QUÊ FALTA** — Elo que tira o projeto do local. Sem isso, Hermes e notificações Telegram (AULA-003) não rodam de forma persistente, segura e automatizada em produção.

**CONTEÚDO:**
- Orquestração PM2 + Docker: execução resiliente, restart automático, logs monitorados
- CI/CD via GitHub Webhook: listener na VPS atualiza container a cada `git push`
- Persistência Supabase: variáveis de ambiente seguras + edge functions salvam debates/aprendizados em tempo real

## Ação tomada
- [x] Virou aula (AULA-005-pipeline-deploy-continuo.md)
- [ ] Virou aprendizado
- [ ] Virou rota fixa
- [ ] Descartado

## Próxima ação
Quando Elite Anthropic voltar ao ar, refazer a mesma pergunta com Hermes real e comparar respostas. Se Hermes discordar/complementar, gerar DEBATE-002.
