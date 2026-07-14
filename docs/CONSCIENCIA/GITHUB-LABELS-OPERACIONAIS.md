# Labels Operacionais CentralDark

Este arquivo define o padrao oficial de labels do GitHub para operar o CentralDark de forma simples, leiga e segura.

## Regra central

```text
Label boa precisa dizer o que fazer.
Label tecnica demais confunde.
Label em portugues ajuda o Pivete a operar o sistema sem depender de tradutor mental.
```

## Regra 2026-07-14 (Pivete)

```text
SÓ labels com emoji.
Proibido: assign:grok, bug, p1, documentation, stale…
Dono IA = 🧠 AGENTE-GROK / 🧠 AGENTE-CODEX / etc.
Seed: .github/workflows/bots-labels-seed.yml (só emoji).
```

## Labels oficiais (núcleo)

| Label | Quando usar | Permissao operacional |
|---|---|---|
| 🟢 PRONTO-PARA-IA | Tarefa clara, contexto suficiente | IA analisa / propõe |
| 🟡 IA-PRECISA-REVISAR | Precisa revisão IA | IA revisa, não mergea sozinha |
| 🔴 RISCO-SERVIDOR | VPS, deploy, PM2, Caddy, produção | BOOT Completo + confirmação |
| 🟡 PRECISA-DE-OK | Aguarda PERMITO Pivete | IA para |
| 🔐 SEGURANÇA | RLS, secrets, tokens, auth | Read-only primeiro |
| 🟢 CORREÇÃO-SEGURA | Baixo risco, sem segredo/destrutivo | Branch/PR ok |
| 🔴 FALTA-EVIDÊNCIA | Sem log/print/prova | Bloqueia até prova |
| 🧠 AGENTE-GROK | Grok dono (VPS/PM2/infra) | Roteamento |
| 🧠 AGENTE-CODEX | Codex dono (código/PR) | Roteamento |
| 🛠️ INFRA | Servidor / deploy / PM2 | Com RISCO se produção |
| 🔧 SELF-HEAL | Script puro restart | Preferir sem IA |
| 🤖 AGENTIC-DEVOPS | Orquestração self-heal | Sem inventar V3 |

## Como aplicar

### Issue comum

Use `🟢 PRONTO-PARA-IA` quando a tarefa estiver bem explicada.

### Pull request

Use `🟡 IA-PRECISA-REVISAR` quando o PR precisa de leitura da IA/Codex.

### VPS, deploy ou banco

Use sempre:

```text
🔴 RISCO-SERVIDOR
🟡 PRECISA-DE-OK
```

Se envolver banco, auth, RLS ou segredo, adicionar tambem:

```text
🔴 SEGURANÇA
```

### Falta de prova

Use `🔴 FALTA-EVIDÊNCIA` quando alguem pediu correcao, mas ainda nao trouxe print, log, output ou erro real.

## Regras para automacao

1. Bots podem pegar automaticamente apenas tarefas com `🟢 PRONTO-PARA-IA` ou `🟢 CORREÇÃO-SEGURA`.
2. Qualquer label vermelha bloqueia acao automatica destrutiva.
3. `🟡 PRECISA-DE-OK` pausa a missao ate o Pivete autorizar.
4. `🔴 RISCO-SERVIDOR` muda o modo para BOOT Completo.
5. `🔴 SEGURANÇA` exige registro de evidencia antes e depois.
6. `🔴 FALTA-EVIDÊNCIA` impede patch ate prova real.

## Mapeamento do padrao CentralDark

```text
Memoria fixa = texto curto CentralDark
Chat simples = so manda a missao
Chat GitHub/docs/PR = BOOT Medio
Chat VPS/Actions/deploy/producao = BOOT Completo
```

## Fio da missao

Labels padronizadas -> Codex/Hermes trabalham com menos confusao -> PRs ficam mais faceis de revisar -> VPS so executa o que foi aprovado.
