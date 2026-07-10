# Hierarquia oficial das instruções para IAs — CentralDark

Este documento elimina ambiguidades entre arquivos antigos e novos. Ele define qual instrução prevalece quando duas regras parecerem conflitantes.

## Ordem obrigatória de entrada

```text
1. 00-COMECE-AQUI-IA.md
2. AGENTS.md
3. docs/COFRE/README.md
4. docs/COFRE/COMO-FALAR-COM-O-PIVETE.md
5. docs/GOVERNANCA/BOOT-IA.md
6. docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
7. docs/PROTOCOLO-BOOT.md
8. CLAUDE.md, GROK.md, GEMINI.md, .claude/ e demais documentos de contexto
```

## Função de cada camada

- `00-COMECE-AQUI-IA.md`: porta universal. Manda abrir `pivete/dev`, localizar `AGENTS.md` e parar antes de qualquer alteração.
- `AGENTS.md`: regras universais de trabalho, segurança, branches, evidências e comunicação.
- `docs/GOVERNANCA/BOOT-IA.md`: BOOT operacional obrigatório para edição, commit, push, deploy, auditoria ou mudança de estado.
- `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md`: fluxo permanente `pivete/dev → pivete/auditoria → main`.
- `docs/PROTOCOLO-BOOT.md`: ritual complementar de memória, pendências, estado vivo e continuidade entre sessões.
- `CLAUDE.md`, `GROK.md`, `GEMINI.md` e equivalentes: contexto específico de ferramenta. Eles complementam, mas não substituem a porta universal.

## Regra de precedência

Em caso de conflito:

```text
00-COMECE-AQUI-IA.md
vence qualquer instrução de entrada antiga.

AGENTS.md
vence instruções específicas de uma ferramenta.

BOOT-IA.md
vence qualquer ritual antigo sobre branch, edição, commit, push, deploy, auditoria e rollback.

FLUXO-PIVETE-DEV-AUDITORIA.md
vence instruções antigas que autorizem trabalho direto na main ou no ambiente de produção.

PROTOCOLO-BOOT.md
complementa memória e continuidade, mas nunca substitui o BOOT operacional.
```

## Como executar os dois BOOTs sem conflito

### BOOT operacional — sempre obrigatório antes de agir

Usar `docs/GOVERNANCA/BOOT-IA.md` para confirmar:

- branch e SHA;
- diretório e workspace;
- missão e escopo;
- ambiente de deploy;
- riscos, testes, prova e rollback.

### BOOT de memória — complementar quando as ferramentas estiverem disponíveis

Depois do BOOT operacional, usar `docs/PROTOCOLO-BOOT.md` para recuperar:

- pendências;
- aprendizados;
- estado atual da VPS;
- herança da sessão anterior;
- ritual de encerramento e registro do ouro.

A indisponibilidade de um MCP de memória deve ser relatada, mas não autoriza improvisar nem ignorar o BOOT operacional.

## Regra para tarefas somente leitura

Em investigação read-only:

- nenhuma edição é autorizada;
- a IA pode ler refs remotas sem fazer checkout;
- deve diferenciar claramente `branch do workspace` de `ref inspecionada`;
- deve informar o SHA exato da ref consultada;
- não deve declarar que está em `pivete/dev` se o checkout local continuar em outra branch.

## Resumo definitivo

```text
Porta universal: 00-COMECE-AQUI-IA.md
Regra universal: AGENTS.md
BOOT operacional: docs/GOVERNANCA/BOOT-IA.md
Fluxo de branches: docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
Memória e continuidade: docs/PROTOCOLO-BOOT.md
Contexto específico: CLAUDE.md / GROK.md / GEMINI.md
```
