# Aprendizado comprovado — Missão-mãe permanente, Hermes e Cockpit da Casa

**Data:** 2026-10-24, Bahia. **ID único:** `t_911e17ff`.
**Direção humana:** uma só missão permanente — expandir a CentralDark — e filhos/deltas por execução. Usuários, amigos e clientes informam problemas; tratar feedback recebido como entrada de melhoria, não como PASS até haver correção/reteste.

## Necessidade e causa
O fluxo anterior exigia pelo menos 7 atos manuais por intenção: identificar owner, escolher executor, criar tarefa, atribuir, transportar contexto, observar, registrar aprendizado. O objetivo é aproximar de 1 entrada textual + acompanhamento no Cockpit, reaproveitando owners e logs já existentes.

## Reuso realizado
- **Hermes Kanban Casa** existente, `default`, modelo `nvidia/nemotron-3-ultra-550b-a55b`. Mãe `t_911e17ff`, sem assignee, BLOCKED **intencional** como índice e não worker.
- **Filha auditora paralela** `t_13f64ec8`: DONE e run completed; gerou `scripts/remote-bridge/canonical/HANDOFF-DELTA-HERMES-COCKPIT-SENSOR-20261024.md` sem modificar UI.
- **ChatGPT** alterou apenas os owners existentes `apps/instinto-superior/src/components/central/ForjaExecutor.tsx` e `src/lib/cockpit.functions.ts`, para sensor admin local de leitura do Kanban e card de missões/execuções/chefões/setores/fases. Não criamos serviço paralelo.
- **Handoff comum**: `scripts/remote-bridge/canonical/HANDOFF-DELTA-CHATGPT-MAE-COCKPIT-20261024.md`.

## Armadilha matemática e solução
`hermes kanban --parent` **é dependência para conclusão do pai**, não só organização. Pai mãe intencionalmente BLOCKED faz filhos novos aguardarem. Para trabalhar em paralelo sem travar: toda filha declara `ID_MAE=t_911e17ff` no corpo e `created_by=mae:t_911e17ff:<autor>`; executa em workspace absoluto e owner exclusivo; quando o resultado for DONE e readback confirmá-lo, usa `kanban link` para conectar ao ID mãe. Esse vínculo posterior preserva o DONE das tarefas já concluídas.
O teste real `kanban link t_911e17ff t_13f64ec8` retornou exit 0; readback: filha DONE, parents=t_911e17ff, mãe children=t_13f64ec8. Outras ligações com tarefas DONE retornaram sucesso (traces `t_928a8cbd`, criar `t_2805243c`, excluir `t_26e02a16`). Não vincular missão em execução à mãe bloqueada se o scheduler for respeitar a dependência.

## Provas e limitações
- Sensor administrativo foi implementado em arquivos locais da Casa, lendo `hermes kanban list/show --json` sem shell de comandos arbitrários, autenticado como admin Supabase; em Linux/VPS sem canal nativo retorna UNKNOWN.
- TypeScript inicialmente mostrou erro local `Object is possibly undefined` (setor); correção pontual `partes.at(-1)?.slice(...)`. Verificação filtrada posterior dos dois arquivos não mostrou novos diagnósticos nesses owners; existem erros anteriores em outros arquivos do projeto, portanto build global não é PASS.
- A auditoria Hermes tinha uma confusão de parentesco: mãe com `children=[]` antes de vincular; as filhas `t_25ea192c` e `t_5f53bd8c` pertencem a `t_5b386368` (integração). Corrigido por readback direto.
- Fases restantes: mostrar NÃO DEFINIDO sem contrato de etapas reais. HTTP 200/STATUS RUNNING não equivale a efeito comprovado.
- O botão GOAL existente da Forja ainda é **DRAFT_NOT_DISPATCHED**; não declarar despacho pelo Cockpit até integração real ao MCP.
- Sem push/merge/GitHub Actions runner/SSH/deploy neste ciclo; GitHub funciona como arquivo histórico de provas depois de aprovação. Testar VPS no destino antes de certificar que se comporta como Casa.

## Regra de continuidade
`CHEFE_INTENCAO → ID_MAE → FILHA(owner exclusivo) → HERMES/TOOLS EXISTENTES → EVENTOS/PROVA/CONTRAPROVA → LINK DONE NA MÃE → APRENDIZADOS/LEMBRANÇAS/SKILL → GITHUB(HISTÓRICO AUTORIZADO)`.

**Próximo cursor:** validar renderização da Forja autenticada na Casa; conectar GOAL ao dispatcher existente do MCP, sem serviço novo; reconciliar integração Remote em paralelo; microprova Casa e, quando autorizado, VPS por SSH.
