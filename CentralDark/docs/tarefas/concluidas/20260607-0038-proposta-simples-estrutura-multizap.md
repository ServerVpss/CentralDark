---
id: 20260607-0038-proposta-simples-estrutura-multizap
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, revise a auditoria anterior de estrutura e proponha uma nova árvore MAIS SIMPLES para a VPS e para o projeto.

## Contexto

O usuário não aprovou a árvore anterior porque ficou excessivamente aninhada, com exemplos como `apps/site`, `apps/portal`, `apps/modulos/multizap`, etc.

Agora a regra é simplicidade.

## Requisitos obrigatórios

- A raiz da VPS deve continuar sendo `/root/Multizap` por enquanto.
- O repositório oficial continua sendo `https://github.com/ServerVpss/CentralDark`.
- `clone-deck` deve ser tratado como alias, espelho ou histórico operacional quando alguma ferramenta ainda usar esse nome.
- Separação clara entre:
  - `apps` = o que o cliente usa;
  - `bots` = automação e canais;
  - `ia` = inteligência artificial, tarefas, consciência e comunicação entre IAs;
  - `docs` = documentação;
  - `scripts` = comandos e manutenção;
  - `logs`, `backups`, `revisoes`, `secrets` = operação.
- Não criar estrutura profunda demais.
- Na maioria das áreas, usar no máximo 3 níveis de profundidade.
- A estrutura precisa ser fácil de entender para alguém não técnico.

## O que analisar

1. Estrutura atual em `/root/Multizap`.
2. O que existe em `/root/CentralDark` que precisa continuar funcionando.
3. Onde encaixar:
   - clone-deck;
   - CentralDark/MCP;
   - gateway;
   - CRM;
   - bots WhatsApp/Telegram;
   - tarefas das IAs;
   - consciência/aprendizados;
   - scripts;
   - logs/revisões/backups;
   - secrets.

## Regras de segurança

- Somente leitura/análise.
- Não mover arquivos.
- Não apagar arquivos.
- Não reiniciar serviços.
- Não mexer em Docker, WuzAPI, WhatsApp, Caddy, CRM, Gateway, banco real, domínio ou secrets.
- Não expor valores privados.
- Não usar `git add .`.

## Resposta esperada

Responda com uma proposta prática, curta e objetiva.

Use este formato:

```txt
============================================================
[GROK] PROPOSTA SIMPLES DE ESTRUTURA FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
Árvore simples sugerida: ...
Onde fica cada coisa: ...
O que preservar sem mexer agora: ...
O que migrar primeiro: ...
Plano simples de migração gradual: ...
Riscos e cuidados: ...
Aguardando decisão final do ChatGPT.
============================================================
```
