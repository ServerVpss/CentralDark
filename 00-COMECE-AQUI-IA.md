# 🚪 00 — COMECE AQUI, IA

Este é o primeiro arquivo de descoberta de qualquer IA, agente, bot, CLI ou assistente no repositório `ServerVpss/CentralDark`.

## Antes de qualquer ação

1. Abra ou inspecione a branch `pivete/dev`.
2. Leia **integralmente** `CLAUDE.md` — Constituição universal de todas as IAs do CentralDark.
3. Leia `AGENTS.md` — adaptador operacional universal.
4. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
5. Leia os demais documentos obrigatórios apontados pela Constituição e por `AGENTS.md`.
6. Execute o BOOT operacional de `docs/GOVERNANCA/BOOT-IA.md`.
7. Informe branch, commit SHA, missão, escopo, riscos, testes, prova e rollback.
8. Não edite, não faça commit, push, deploy ou merge antes de concluir esse BOOT.

## Hierarquia resumida

```text
00-COMECE-AQUI-IA.md                 → porta de descoberta
→ CLAUDE.md                          → Constituição universal
→ AGENTS.md                          → adaptador operacional universal
→ docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md
→ docs/GOVERNANCA/BOOT-IA.md         → BOOT operacional
→ docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md
→ docs/PROTOCOLO-BOOT.md             → memória e continuidade complementar
→ GROK.md / GEMINI.md / .claude/ / Copilot e outras pontes específicas
```

`GROK.md`, `GEMINI.md`, `.claude/`, Copilot e arquivos futuros não possuem Constituição própria. Todos devem encaminhar e obedecer a `CLAUDE.md`.

Em caso de conflito, siga `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md` e trate `CLAUDE.md` como autoridade normativa interna do projeto.

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
Li CLAUDE.md integralmente: SIM/NÃO
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

> Abra ou inspecione a branch `pivete/dev` e leia integralmente `CLAUDE.md` antes de fazer qualquer coisa.

Se `pivete/dev`, `CLAUDE.md`, `AGENTS.md` ou a hierarquia oficial não estiverem disponíveis, pare e informe ao Pivete. Não improvise regras e não use a `main` como área de desenvolvimento.
