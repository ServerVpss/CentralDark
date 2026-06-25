# CHECKPOINT-IA — Estado vivo para ChatGPT, Grok e Lovable

Este arquivo é a primeira camada de sincronização entre agentes de IA no projeto CentralDark/MultiZap.

## Agentes usados pelo usuário

O usuário opera o projeto com três agentes principais:

- ChatGPT;
- Grok;
- Lovable.

Eles devem trabalhar como uma equipe sincronizada. Nenhum agente deve continuar tarefa sem antes ler a memória viva do projeto.

## Comandos de recarregamento de memória

Quando o usuário escrever qualquer uma destas frases, a IA deve parar antes de agir e recarregar o contexto do projeto:

```txt
RELOAD MEMORIA
RECARREGAR MEMORIA
LEMBRAR MEMORIA
SYNC IA
SINCRONIZAR IA
ATIVA MODO SEGREDO
```

## O que a IA deve fazer ao receber esses comandos

1. Ler este `CHECKPOINT-IA.md`.
2. Ler `LEIA-ME-IA.md`.
3. Ler `docs/CONSCIENCIA/APRENDIZADOS.md`.
4. Ler `docs/PENDENCIAS.md`.
5. Ler os relatórios recentes em `docs/RELATORIOS/`.
6. Consultar, quando disponível, logs/relatórios recentes em `/root/CentralDark/revisoes/`.
7. Consultar o histórico recente do GitHub Actions `#FASE deploy` quando a tarefa envolver deploy.
8. Só depois responder ao usuário ou executar qualquer ação.

## Fluxo único dos agentes

```txt
ler memória → entender estado atual → agir com segurança → validar → registrar → resumir
```

Se o ChatGPT registrar algo, Grok e Lovable devem ler antes de continuar.

Se Grok registrar algo, ChatGPT e Lovable devem ler antes de continuar.

Se Lovable registrar algo, ChatGPT e Grok devem ler antes de continuar.

## Padrão operacional

O padrão de conversa e execução é o **Modo Segredo**:

```txt
resultado recebido → interpretação objetiva → próxima ação pronta → validação → relatório
```

Regras do Modo Segredo:

- resposta simples e prática;
- sem enrolação;
- sem repetir diagnóstico já fechado;
- scripts com `clear || true` no início;
- visual CentralDark quando houver script;
- relatório salvo em `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/`;
- resumo limpo no chat;
- ações sensíveis só com confirmação explícita.

## Onde registrar cada coisa

| Tipo | Onde registrar |
|---|---|
| Regra, erro aprendido, padrão, estado importante | `docs/CONSCIENCIA/APRENDIZADOS.md` |
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
- apagar ou mover pastas.

## Regra final

Antes de começar uma nova conversa ou continuar tarefa com qualquer agente, recarregar memória primeiro.

O objetivo é manter ChatGPT, Grok e Lovable respondendo a mesma coisa, seguindo o mesmo padrão e sabendo onde o último agente parou.
