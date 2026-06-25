# 🧠 LEIA-ME-IA — Porta de entrada pra qualquer IA

## Verdade atual

- Repo principal oficial: `ServerVpss/CentralDark`.
- Repo espelho/backup: `segredounlock/clone-deck`.
- Pasta principal de apps na VPS: `/root/CentralDark/apps`.
- Git root real na VPS: `/root`.
- Projeto operacional na VPS: `/root/CentralDark`.
- Espelho automático está pausado até existir `MIRROR_PAT`.
- Deploy real por SSH está temporariamente pausado; `deploy.yml` está como guard verde.

## Regra central multi-IA

O projeto é operado por três agentes de IA que precisam trabalhar sincronizados:

- ChatGPT;
- Grok;
- Lovable.

Nenhum agente deve trabalhar como se estivesse sozinho.

Antes de diagnosticar, editar, fazer deploy, registrar pendência, registrar aprendizado ou continuar uma tarefa, a IA deve consultar a memória viva do projeto para entender o estado atual.

## Fontes obrigatórias antes de continuar tarefa

1. `LEIA-ME-IA.md` — porta de entrada e verdade curta.
2. `docs/CONSCIENCIA/APRENDIZADOS.md` — regras, erros aprendidos, estado atual e padrões oficiais.
3. `docs/PENDENCIAS.md` — o que falta, o que está pausado e o que não pode ser esquecido.
4. `docs/RELATORIOS/` — tarefas já concluídas e validações oficiais.
5. `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/` — logs completos sanitizados quando houver execução na VPS.
6. GitHub Actions `#FASE deploy` — histórico real de deploys e commits aplicados.

## Padrão único de trabalho

Todas as IAs devem seguir o mesmo fluxo:

```txt
ler memória → entender estado atual → agir com segurança → validar → registrar → resumir
```

Se o ChatGPT registrar um aprendizado, relatório ou pendência, Grok e Lovable devem ler isso antes de continuar.

Se Grok ou Lovable registrar algo, o ChatGPT deve ler antes de continuar.

O objetivo é evitar informações divergentes, diagnósticos repetidos e padrões diferentes de deploy, debug ou documentação.

## Padrão de deploy

O padrão visual/oficial dos runs é:

```txt
#FASE deploy
```

O padrão operacional é:

```txt
GitHub → workflow #FASE deploy → VPS → validação → relatório → memória/consciência
```

Quando um agente concluir deploy ou validação, deve registrar da mesma forma:

- relatório em `docs/RELATORIOS/` quando for conclusão oficial;
- aprendizado em `docs/CONSCIENCIA/APRENDIZADOS.md` quando virar regra, erro aprendido ou estado importante;
- pendência em `docs/PENDENCIAS.md` quando algo ficar para depois;
- logs completos em `/root/CentralDark/revisoes/...` quando rodar script/checklist na VPS.

## Modo Segredo

Modo Segredo é o padrão operacional quando solicitado pelo usuário.

Resumo do modo:

```txt
resultado recebido → interpretação objetiva → próxima ação pronta → validação → relatório
```

Respostas devem ser simples, práticas e sem enrolação.

## Regras rápidas

- Não usar `git add .`.
- Sempre limitar pathspec no Git.
- Não mexer em Caddy, Docker/WuzAPI, WhatsApp, CRM, banco real ou domínio sem confirmação.
- Logs completos ficam em `/root/CentralDark/revisoes/...`.
- Workflows antigos ficam manual-only até revisão.
- Não expor tokens, senhas, chaves, cookies, sessions, connection strings ou valores privados.
- Ações sensíveis exigem confirmação explícita, mesmo no Modo Segredo.

---
