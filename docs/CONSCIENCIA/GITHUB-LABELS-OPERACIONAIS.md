# Labels Operacionais CentralDark

Este arquivo define o padrao oficial de labels do GitHub para operar o CentralDark de forma simples, leiga e segura.

## Regra central

```text
Label boa precisa dizer o que fazer.
Label tecnica demais confunde.
Label em portugues ajuda o Pivete a operar o sistema sem depender de tradutor mental.
```

## Duas camadas de labels (nao fundir)

O CentralDark opera com duas camadas de labels que **coexistem** e **nao devem ser fundidas**:

1. **Camada humana operacional** — emoji + PT-BR maiusculo (ex.: `🟢 PRONTO-PARA-IA`, `🔴 RISCO-SERVIDOR`). Sinaliza intencao/estado para o Pivete e para revisao humana. Documentada nesta pagina.
2. **Camada de roteamento de maquina** — minusculas, namespaced `assign:*` (ex.: `assign:codex`, `assign:grok`, `assign:lovable`). Diz **qual bot e dono** da tarefa. Consumida por `dispatcher-bots.yml` e afins.

Regra semantica:

- `assign:chatgpt` e `assign:grok` = **dono/roteamento** (quem executa).
- Se um dia surgirem `area:chatgpt` ou `area:grok-cli`, terao semantica de **area/integrador** (do que a tarefa trata) e nao substituem `assign:*`.
- Aliases legados (`assign:faxineiro`, `assign:auditor`, `assign:seguranca`, `assign:vps-health`) têm migração **preparada** para os canonicos (`assign:faxineiro-repo`, `assign:auditor-divergencia`, `assign:guarda-seguranca`, `assign:vps-healthcheck`) via `bots-labels-seed.yml` (job `migrate`, `workflow_dispatch`). A execução real ainda **não foi rodada** — está pendente do Pivete. Nao recriar.

## Labels oficiais



| Label | Equivalente tecnico | Quando usar | Permissao operacional |
|---|---|---|---|
| 🟢 PRONTO-PARA-IA | codex-ready | Tarefa clara, com contexto suficiente para IA trabalhar. | IA pode analisar e propor correcao. |
| 🟡 IA-PRECISA-REVISAR | needs-codex-review | Codigo/PR precisa de revisao da IA antes de seguir. | IA revisa, comenta e aponta risco. |
| 🔴 RISCO-SERVIDOR | vps-sensitive | Mexe em VPS, deploy, PM2, Caddy, runner, banco ou producao. | Exige BOOT Completo e confirmacao humana para acao sensivel. |
| 🟡 PRECISA-DE-OK | manual-confirm | A acao esta pausada aguardando autorizacao humana. | IA nao continua sozinha. |
| 🔴 SEGURANÇA | security | Envolve RLS, secrets, tokens, credenciais, auth, banco ou vazamento. | Read-only primeiro; qualquer alteracao exige confirmacao. |
| 🟢 CORREÇÃO-SEGURA | auto-fix-safe | Correcao de baixo risco, sem producao, sem segredo e sem impacto destrutivo. | IA pode aplicar em branch/PR. |
| 🔴 FALTA-EVIDÊNCIA | blocked-evidence | Falta log, print, erro, teste ou prova antes de agir. | Bloqueia execucao ate existir evidencia. |

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
