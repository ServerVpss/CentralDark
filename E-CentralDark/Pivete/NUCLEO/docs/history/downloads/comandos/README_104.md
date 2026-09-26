# Agentes CentralDark

Esta pasta concentra os agentes criados para organizar, auditar e sincronizar a memória viva do projeto CentralDark.

A linguagem aqui deve ser simples. Nomes de pastas e agentes devem ser claros para humano leigo e para qualquer IA nova.

## Objetivo

Criar um ecossistema de agentes que, com um único comando, consiga:

1. ler o `README.md` da raiz;
2. seguir para a pasta `CentralDark/`;
3. mapear documentos de memória, consciência, pendências, relatórios e planos;
4. organizar a árvore de memórias;
5. verificar se repo e VPS contam a mesma história;
6. gerar relatório do que está correto, duplicado, ausente ou fora do padrão;
7. preparar correção segura sem tocar em ação sensível sem confirmação humana.

## Fonte de verdade

A porta de entrada é sempre:

```txt
/root/README.md
```

Depois disso, a IA deve seguir para:

```txt
/root/CentralDark/
```

Documentos principais:

```txt
CentralDark/README.md
docs/CONSCIENCIA/APRENDIZADOS.md
docs/PENDENCIAS.md
docs/RELATORIOS/
CentralDark/revisoes/
```

## Agentes planejados

| Agente | Função |
|---|---|
| Agente Mestre de Memória | Orquestra os demais agentes com um único comando |
| Agente Leitor de Contexto | Lê README, consciência, pendências e relatórios |
| Agente Organizador de Memória | Categoriza memórias por regra, erro, atalho, estado, pendência e relatório |
| Agente Validador Repo VPS | Compara o que está documentado com o estado do repo/VPS quando permitido |
| Agente Guardião de Regras | Garante Tema Bash V4, pathspec, confirmação literal e proteção contra ações sensíveis |
| Agente Relator | Gera relatório simples, numerado, com data/hora BRT e próximo passo |

## Pacote inicial da fase #132.1

| Arquivo | Função |
|---|---|
| `AGENTE-MESTRE-MEMORIA.md` | Define função, leitura obrigatória, coordenação dos agentes auxiliares, permissões e bloqueios |
| `PROMPT-CODEX.md` | Prompt pronto para colar em uma IA/Codex nova e iniciar `RELOAD MEMORIA` |
| `CHECKLIST-READONLY.md` | Checklist de auditoria somente leitura com classificação dos achados |
| `RELATORIO-MODELO.md` | Modelo simples de relatório com status, alertas, bloqueios e handoff |

## Regras obrigatórias

- Não usar `git add .`.
- Não usar `reset`, `clean`, `prune` ou `gc` sem plano e confirmação.
- Não tocar Caddy, Docker, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou sessões sem confirmação literal.
- Usar Tema Bash V4 em comandos operacionais de VPS.
- Toda memória nova deve conter categoria, data, hora BRT, contexto, aprendizado e próximo passo quando existir.
- Se houver rebase/conflito local, usar uma fonte de verdade por vez e não criar agente paralelo.

## Estado atual

A criação dos agentes virou prioridade temporária antes de retomar a fase Builder Bolt.

Ponto pausado do Builder Bolt:

```txt
#131.4 — Validação ponta a ponta do Builder Bolt no navegador
Status: UI pública OK, geração falhando com erro de provider/modelo/key/config.
```

Depois que os agentes de memória forem validados, retomar exatamente a fase #131.4.
