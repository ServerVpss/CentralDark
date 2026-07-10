# 🚪 00 — COMECE AQUI, IA

Este é o primeiro arquivo de entrada de qualquer IA, agente, bot, CLI ou assistente no repositório `ServerVpss/CentralDark`.

## Antes de qualquer ação

1. Abra ou inspecione a branch `pivete/dev`.
2. Leia `AGENTS.md` na raiz.
3. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
4. Leia os demais documentos obrigatórios apontados por `AGENTS.md`.
5. Execute o BOOT operacional de `docs/GOVERNANCA/BOOT-IA.md`.
6. Informe branch, commit SHA, missão, escopo, riscos, testes, prova e rollback.
7. Não edite, não faça commit, push, deploy ou merge antes de concluir esse BOOT.

## Hierarquia resumida

```text
00-COMECE-AQUI-IA.md
→ AGENTS.md
→ docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md
→ docs/GOVERNANCA/BOOT-IA.md
→ docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
→ docs/PROTOCOLO-BOOT.md (memória e continuidade complementar)
→ documentos específicos como CLAUDE.md, GROK.md e GEMINI.md
```

Em caso de conflito, siga `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.

## Diferença entre workspace e ref inspecionada

Em tarefa somente leitura, a IA pode consultar `origin/pivete/dev` sem trocar o checkout local. Nesse caso deve responder com precisão:

```text
Branch do workspace: main (exemplo)
Ref inspecionada: origin/pivete/dev
SHA da ref inspecionada: ...
```

É proibido declarar `Branch atual: pivete/dev` quando o checkout local continua em outra branch.

## Resposta mínima esperada da IA

```text
BOOT CENTRALDARK
Branch do workspace: ...
Ref inspecionada: ...
Commit SHA verificado: ...
Li 00-COMECE-AQUI-IA.md: SIM/NÃO
Li AGENTS.md: SIM/NÃO
Li a hierarquia oficial: SIM/NÃO
Li o Cofre do Pivete: SIM/NÃO
Missão entendida: ...
Escopo permitido: ...
Riscos: ...
Testes previstos: ...
Prova esperada: ...
Rollback: ...
Aguardando autorização para editar: SIM
```

## Regra curta

> Abra ou inspecione a branch `pivete/dev` e leia `AGENTS.md` antes de fazer qualquer coisa.

Se `pivete/dev`, `AGENTS.md` ou a hierarquia oficial não estiverem disponíveis, pare e informe ao Pivete. Não improvise regras e não use a `main` como área de desenvolvimento.
