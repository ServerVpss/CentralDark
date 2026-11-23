---
title: "Cristal da sessão 2026-09-30 → 2026-10-01 — CentralDark fluxo, prova, limpeza e pré-formatação"
date: 2026-09-30
status: SESSION_CRYSTAL
owner: ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/SESSOES"
pr_mother: 1562
child_pr: 1723
classification: "SESSION_CRYSTAL_NOT_PR_MOTHER"
tags: [centraldark, session-crystal, dependabot, update-branch, cleanup, ephemeral-workspace, centraldark-os, preformat, supabase, hub, cockpit, general, junho, reality-judge]
---

# Cristal da sessão 2026-09-30 → 2026-10-01

## Intenção

Registrar a sessão inteira sem transformar narrativa em runtime verde, sem criar arquitetura paralela e sem perder deltas úteis que surgiram de GitHub, Casa, VPS, Supabase, arquivos históricos e contraprovas.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
CURRENT > HISTORY
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
REALITY = JUDGE
PR_MOTHER_AS_SESSION_OWNER=FORBIDDEN
```

A sessão começou como continuação da esteira de promoção/reconciliação e terminou consolidando quatro eixos do mesmo sistema:

```text
RECONCILIAR
→ LIMPAR/FECHAR BANCADA
→ MOSTRAR O FLUXO REAL
→ PREPARAR REINSTALAÇÃO/RENASCIMENTO DA VPS
```

---

## 1. Reconciliação Dependabot — causa atual medida e corrigida

Foi medido que o workflow real de auto-review era:

`⚙️ PR auto-review CentralDark — checklist determinístico`

enquanto consumidores ativos ainda exigiam o nome histórico:

`⚙️ PR auto-review (Codex + checklist)`

Efeito material: o green guard/promotor podia produzir `MISSING` apesar do workflow atual existir.

Também foi encontrada uma quebra sintática real no contrato:

`docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`

na fronteira entre `non_equivalence_guards` e `universal_operational_contract`.

Deltas aplicados diretamente em `main` durante a sessão:

- `5b773c0a51ba85ca4b13d795cfef8299cce4c757` — green guard alinhado ao workflow atual.
- `3ddd8f48ae568f1087abeb8d8eed28de08b7c12a` — promotor alinhado.
- `ac7fdf7070d423025639149bcc5334898d21c9d7` — teste atualizado.
- `890e750961c0cd20dcacd8d1b4dbfe1b7c1eed3b` — contrato alinhado ao nome atual.
- `aaba4948eb0c73d58ab4798137ea6af6de1671c2` — JSON restaurado para sintaxe válida.

Contraprova local:
- `node --check` → PASS.
- `node --test scripts/github-autonomia-green-guard.test.mjs` → 9/9 PASS.
- JSON CURRENT → parse PASS.
- nome antigo nos owners ativos → 0 após readback.

Regra preservada:

```text
SAME_PR_HEAD_REQUIRED
UNKNOWN != PASS
RUN_FROM_OTHER_PR_OR_MANUAL != PROOF_FOR_TARGET_PR
```

---

## 2. Replay Dependabot real — #1279

Para não declarar a reconciliação provada somente por teste estático, foi usado um PR histórico real do próprio `dependabot[bot]`:

- PR #1279.
- branch original: `dependabot/npm_and_yarn/apps/modulos/Bolt/source/vitest-3.2.7`.
- HEAD original do bot: `a70e37521d25b46a6f6c01bcc5f417822d08dadc`.
- delta original: Vitest 3.2.6 → 3.2.7.

A branch original foi restaurada no SHA original e o PR reaberto para replay controlado.

Run observado:
- `36790021200`.

Provas:
- aprovação de workflows Dependabot → SUCCESS.
- fast-path → executou e **bloqueou corretamente** o squash.
- diagnóstico: `NOT_MERGEABLE | MERGE_STATE_DIRTY | DELTA_STATUS_DIVERGED | DELTA_NOT_PROVEN | CHECKS_PENDING | CHECKS_FAILED`.
- nenhum merge/regressão foi forçado.

O reconciliador especializado permaneceu `QUEUED` enquanto os dois runners self-hosted estavam ocupados. Isso foi mantido como:

```text
FAST_PATH_FAIL_CLOSED=PASS
WORKFLOW_APPROVAL=PASS
SPECIALIZED_RECONCILER_RUNTIME=QUEUED_NOT_PASS
NO_REGRESSION_MERGE=PASS
```

---

## 3. Arqueologia da Casa — por que havia worktrees/clones esquecidos

Foram investigados:

- `E:\_centraldark-validation`
- `E:\_wt1710`
- `E:\_wt_pr1709`
- `E:\tmp`

Conclusão por evidência:

### `E:\_centraldark-validation`
- ~332 MB.
- resto de `autonomy-restore-20260929`.
- `.git` apontava para `C:\CentralDark\.git\worktrees\...`, owner que já não existe.
- conteúdo associado à missão do PR #1710, já absorvida.
- forte órfão de missão.

### `E:\_wt_pr1709`
- ~397 MB.
- gitdir antigo em `C:\CentralDark` inexistente.
- PR #1709 já MERGED.
- sem processo/task/service usando a pasta.

### `E:\_wt1710`
- ~331 MB.
- ainda registrado como worktree no owner atual:
  `E:\VMs\CENTRALDARK-OS\SHARED\CentralDark`.
- clean/detached.
- missão já absorvida pelo PR #1710.
- classificação: worktree residual válida, não dependência de runtime.

### `E:\tmp`
Mistura itens diferentes; não pode ser apagada inteira cegamente.

Confirmado:
- `centraldark-reality-authority-fix` → clone clean, delta absorvido.
- `centraldark-selo-fabric-0930` → clone clean do PR #1722, já MERGED.
- `centraldark-pr-1416` → owner antigo ausente; PR #1416 já MERGED.
- `centraldark-main` → owner antigo ausente.
- `claude-code-proxy` → repo externo, não dependência CentralDark; possui arquivo local próprio e foi preservado.

Não foi encontrado processo, serviço Windows ou Scheduled Task dependente das bancadas CentralDark investigadas.

---

## 4. Causa raiz do lixo de bancada

A regra já existia no contrato:

```text
CLEANUP_AT_END_OR_TTL_REQUIRED
delete_after_use=true
cleanup_on_success=true
cleanup_on_failure_when_safe=true
cleanup_on_cancel_or_timeout=true
ZERO_UNLESS_PROVEN_ACTIVE_OR_FORENSIC_KEEP
```

E a ferramenta já existia:

`scripts/centraldark/ephemeral-workspace.mjs`

Porém:

- busca encontrou **zero call sites reais de `ephemeral-workspace.mjs cleanup`**;
- as bancadas investigadas não possuíam `.centraldark-ephemeral.json`;
- portanto foram criadas fora do owner canônico;
- a própria ferramenta se recusa corretamente a apagar alvo sem marcador:
  `MARKER_MISSING_REFUSE_BLIND_DELETE`.

Causa:

```text
REGRA_EXISTE
+ FERRAMENTA_EXISTE
- FINALIZER_OBRIGATORIO
- CRIADOR_CANONICO_OBRIGATORIO
= BANCADA ESQUECIDA
```

---

## 5. Endurecimento: Fixed Point exige vassoura quando houve workspace efêmero

No PR #1723, o mesmo owner foi evoluído, sem ferramenta V2 paralela.

Contrato adicionado:

```text
FIXED_POINT_REQUIRES_EPHEMERAL_CLEANUP=true
TEMPORARY_WORKSPACE_MUST_USE_CANONICAL_CREATOR=true
UNMARKED_TEMP_WORKSPACE=CONTRACT_VIOLATION
MISSION_END_REQUIRES_TEMP_INVENTORY=true
CLEANUP_READBACK_REQUIRED=true
TEMP_RESIDUE_TARGET=ZERO
```

`MASTER-CYCLE.yml` passou a incluir:

```text
INVENTORY
→ CLASSIFY
→ CLEANUP
→ READBACK
→ RESIDUE_ZERO_OR_PROVEN_KEEP
→ FIXED_POINT
```

`centraldark_master_cycle.py` passou a bloquear `FIXED_POINT_PASS` quando:
- workspace efêmero foi usado e não há cleanup readback;
- existe resíduo temporário não classificado.

Foram adicionados quatro testes discriminantes:
1. sem workspace efêmero → Fixed Point pode passar;
2. workspace usado sem cleanup readback → não passa;
3. resíduo não classificado > 0 → não passa;
4. cleanup readback PASS + resíduo 0 → passa.

O próprio `ephemeral-workspace.mjs` ganhou `inventory`, reutilizando o mesmo owner.

Prova alvo:
- 4/4 testes novos → PASS.
- `ephemeral-workspace.mjs --self-test` → create → inventory → cleanup → readback PASS.
- sandbox de prova → `CLEANUP_READBACK=True`.

---

## 6. Debug global do GitHub Actions

Como delta de observabilidade, foram habilitadas no repositório:

```text
ACTIONS_RUNNER_DEBUG=true
ACTIONS_STEP_DEBUG=true
```

como variáveis de Actions.

Readback confirmou os dois valores configurados.

Nenhum segredo foi transportado para Git ou impresso por esse delta.

Regra:
```text
DEBUG_MORE != PASS
LOG_MORE != PROOF
```

Debug melhora diagnóstico; não muda o Reality Judge.

---

## 7. PR Update Branch — de um quadrado para um fluxo visível

A imagem do GitHub mostrava apenas um quadrado porque o workflow:

`.github/workflows/pr-update-branch-deterministic.yml`

possuía um único job `update-branch`.

O owner:
`scripts/github/update-branch-deterministic.mjs`

já executava internamente:
- medir;
- chamar `PUT /pulls/{PR}/update-branch`;
- poll;
- compare;
- estabilização/checks;
- classificar resultado.

O problema era projeção/observabilidade do workflow, não ausência total de lógica.

No PR #1723, o workflow foi desdobrado em jobs reais:

```text
🧭 Preflight
→ 🔄🪡 Update branch + estabilização
→ ⚖️ Reality Judge
→ 🧾 Receipt
```

O owner JS permaneceu único.

Lock de runner e fiscal foram atualizados para proteger o grafo inteiro em `ubuntu-latest`.

### Prova runtime real

Run:
`36800555838`

O GitHub mostrou quatro jobs reais:

- Preflight → SUCCESS.
- Update/Stitch → SUCCESS.
- Reality Judge → FAILURE.
- Receipt → SUCCESS.

Portanto, a correção visual foi materialmente provada: deixou de ser um único quadrado.

O mesmo run também provou que `main` entrou na branch do PR sem mergear o PR em `main`:
- PR #1723 ficou `mergeable=true`;
- HEAD mudou após update branch.

Isso confirmou a intenção histórica recuperada do Radeon ReLive:
`Update branch` atualiza a branch do PR com `main`; não promove o PR para `main`.

### Ferida aberta

O Reality Judge recebeu outputs vazios/nulos do job anterior apesar do owner produzir resumo. Ao mesmo tempo, naquele instante o owner havia observado `unknown_or_pending=1`.

Logo:
- transporte de outputs entre jobs = **BUG REAL**;
- estado material daquele instante = **não era PASS de qualquer forma**.

Regra preservada:
```text
CORRIGIR_TRANSPORTE_DO_RECEIPT != TRANSFORMAR_UNKNOWN_EM_PASS
```

---

## 8. Identidade visual Hub / Contas / Cockpit

Garimpo mostrou que `ACCOUNTS_HUB` já era capability única; o problema era identidade visual duplicada/hardcoded por superfície.

O registry já continha:
`one_visual_identity_owner: true`.

Foi cristalizado modo híbrido:

```text
SAME_CAPABILITY → SAME_BASE_ICON
SURFACE → may change badge/status/accent/action
EXTERNAL_FAVICON != CANONICAL_IDENTITY
```

Owner evoluído:
`apps/modulos/Bolt/source/app/components/centraldark/centraldark-hub-inventory.ts`

Adicionados:
- `canonicalVisualIdentity`;
- `canonicalIcon(id)`;
- contrato `HYBRID`.

Consumers atualizados:
- `CentralDarkUnifiedHud.client.tsx`;
- `CentralDarkCockpitShell.client.tsx`.

CSS do HUD passou a reservar slot:
`icon | conteúdo | status`.

Registry visual e fiscal passaram a exigir owner único.

---

## 9. Garimpo Radeon ReLive — história reaproveitada sem virar autoridade

Origem:
`C:\Users\danda\Videos\Radeon ReLive`

Foram indexados metadata, ZIP, imagens e snapshot HTML histórico.

Ouro recuperado:
- intenção antiga do botão Update branch;
- registros de VS Code/Codex/Gemini/Cline/Claude como superfícies/braços;
- captura 2026-09-03 com fluxo já semelhante a:
  `PEGATUDO → proveniência → dedupe → delta útil → owner existente → costura → teste → contraprova → CI same-head`.

Ruído/duplicata:
- thumbnails/cache/avatar sem efeito operacional;
- história já absorvida em owners atuais.

Regra:
```text
HISTORY_CAN_EXPLAIN_INTENT
HISTORY_CANNOT_OVERRIDE_CURRENT
```

---

## 10. Supabase — braço existente, não arquitetura nova

O projeto informado pelo CHEFE foi reconciliado como superfície já existente.

O painel mostrou dezenas de Edge Functions, incluindo:
- `centraldark-bridge`
- `hermes-think`
- `hub-command`
- `hub-read`
- `learn-from-outcome`
- `memory-search`
- `receive-graph-run`
- `vault`
- `vps-exec`
- outras funções históricas.

O delta foi tratado como:
```text
EXISTING_CAPABILITIES_TO_PROVE
!=
NEW_ARCHITECTURE_TO_CREATE
```

A VPS já possuía fontes de secrets/runtime; leitura foi sanitizada para nomes/configuração, sem ecoar valores.

O arquivo:
`/root/CentralDark/secrets/DELTA_UTIL.txt`
foi lido com redaction.

Regra preservada:
```text
SECRET_CAN_BE_USED_IN_RUNTIME
SECRET_VALUE_MUST_NOT_ENTER_GIT
SECRET_VALUE_MUST_NOT_ENTER_RECEIPT
```

---

## 11. GENERAL — postura operacional transportável

Dos diagramas e da intenção do CHEFE foi extraído apenas o delta irreduzível:

```text
CHEFE
→ ENSINA / CORRIGE / DEFINE INTENCAO
→ CENTRALDARK OS APRENDE NO SCAFFOLD
→ GENERAL HERDA O MESMO CONTRATO
→ MOTOR EXECUTA
→ REALIDADE JULGA
→ APRENDIZADO PROVADO VOLTA AO NUCLEO
```

`GENERAL` não foi criado como nova persona/arquitetura/cérebro.

SOUL recebeu:

```text
GENERAL=POSTURA_OPERACIONAL_TRANSPORTAVEL
GENERAL_IS_NOT_NEW_BRAIN=true
GENERAL_IS_NOT_NEW_AUTHORITY=true
GENERAL_INHERITS_SOUL=true
GENERAL_MAY_BE_CARRIED_BY_ANY_REPLACEABLE_ENGINE=true
GENERAL_OPERATES_ONLY_INSIDE_CHEFE_INTENT_AND_SCOPE=true
GENERAL_RETURNS_PROVEN_LEARNING_TO_CANONICAL_CORE=true
CHEFE_TEACHES_CENTRALDARK_OS_LEARNS=true
```

Motores possíveis:
GPT, Claude, Codex, Hermes, Grok, Gemini ou outro motor substituível.

Prova alvo:
- gramática YAML → PASS;
- fiscal Python → syntax PASS;
- markers SOUL/metacognição → PASS;
- sandbox → cleanup readback TRUE.

Commits:
- `1f3040f73f9fa55862f4b17092db3e50340b9116`
- `4a87e1edbc58b1b55c233fc2bc6f6ae90a833a4a`
- `ef96218e704968c0053c5795525cee067fe2fd2b`
- `51e59b3a1a87bee102e0d570aa6cc308c39fb375`

---

## 12. História junho → agora

O Git de junho mostra transição real:

### Início de junho
Predominavam:
- UI;
- efeitos;
- pagamentos;
- telas e comportamento de produto.

### Meio de junho
Passaram a aparecer:
- RLS/RBAC;
- proxies;
- Edge Functions;
- auditoria;
- segurança;
- infraestrutura.

### 20–23 de junho
Entraram:
- MCP;
- SQLite;
- bots isolados;
- workflows;
- login/browser;
- SSH/SSL/Cloudflare.

Em 23/06 aparece commit com linguagem explícita de atualização para CentralDark.

### 29–30 de junho
Explosão de integração:
- MCP OpenAPI;
- WebUI;
- Telegram executando tools;
- Claude Code via Telegram;
- dezenas de ferramentas;
- memória/consciência;
- providers;
- backup/notificações.

### Agosto/setembro
Mudança de unidade de trabalho:

Antes:
```text
ERRO → APAGAR VERMELHO
```

Depois:
```text
INTENCAO
→ OBJETIVO
→ CLAUSULAS
→ UNKNOWN LOCAL
→ MENOR DELTA
→ ACAO
→ MUNDO
→ CONTRAPROVA
→ REALITY JUDGE
→ RECEITA/FINGERPRINT
→ REPLAY
```

A inteligência persistente deixou de ser confundida com o modelo:
```text
CENTRALDARK = SISTEMA
MODELO = MOTOR SUBSTITUIVEL
CHEFE = AUTORIDADE DE INTENCAO
REALIDADE = JUIZ
```

---

## 13. CentralDark-OS / reinstalação — por que ainda não formatou

Foi reencontrado o PDF/relatório:

`CentralDark-OS autônomo para reinstalação, restore e auto-provisionamento da VPS`.

O relatório antigo concluía `GO_REINSTALL=NO` porque, naquele momento, ainda tratava como faltantes/não provados:
- snapshot READY atual;
- rollback route;
- `RESTORE_APPLY=1`;
- firstboot autônomo;
- target image;
- same-SHA no GO.

Parte dessa dívida foi paga depois do relatório:
- preflight A/B/C existe em `main`;
- restore APPLY existe;
- teste de hash pós-write existe;
- firstboot idempotente existe;
- workflow de reinstall existe;
- snapshot `snap1790430960` foi localizado historicamente;
- rota de rollback foi registrada.

### Dois receipts diferentes

**PRE-FORMAT RECEIPT**
acontece antes de destruir a VPS e deve produzir:

```text
GATE_A=PASS
GATE_B=PASS
GATE_C=PASS
REINSTALL_ARMED=1
GO_REINSTALL=YES
```

**FINAL RECEIPT**
só pode nascer depois da reinstalação:

```text
REINSTALL
→ FIRSTBOOT
→ RESTORE
→ RUNTIME
→ REBOOT
→ HEALTH
→ FINAL RECEIPT
→ DEPLOYED/HEALTHY
```

Portanto, esperar o final receipt para formatar seria circular: ele depende da formatação já ter acontecido.

### Estado CURRENT medido da VPS nesta sessão

- sistema ainda Ubuntu 22.04.x;
- checkout da VPS observado em `ab8fe2d80eb66873d0854485555f279c71aa3f70`;
- GitHub `main` medido depois em `e53c8c46c84ab4f8c869be0889f8d19f860384b4`;
- VPS com aproximadamente 131 entradas dirty;
- não fazer reset/pull cego;
- `centraldark-preformat-go-no-go.sh` não estava presente no checkout antigo da VPS;
- dois Vaults grandes (~753 MB) e sidecars SHA presentes;
- Omni Router 8099 LISTEN;
- Screenpipe 3030 LISTEN;
- WebUI 8788 sem listener na medição.

### Motivo irreduzível de ainda não formatar

```text
NAO_E_FALTA_DE_SNAPSHOT_APENAS
NAO_E_ESPERA_DO_FINAL_RECEIPT

E:
CURRENT_AINDA_NAO_PRODUZIU_UM_NOVO_PRE_FORMAT_RECEIPT_VERDE
PARA_O_MESMO_SHA + MESMA_VPS + MESMO_VAULT + RECOVERY_CURRENT
```

Além disso, o ouro dos ~131 dirty precisa ser reconciliado antes de descartar a máquina velha.

---

## 14. Estado do PR #1723 ao cristalizar

PR:
`#1723 — FECHAR CICLO EFÊMERO + GRAFO VISUAL UPDATE BRANCH + IDENTIDADE VISUAL HÍBRIDA`

Estado observado:
- OPEN;
- mergeable=true;
- não merged;
- base `main`;
- HEAD do último readback desta sessão: `51e59b3a1a87bee102e0d570aa6cc308c39fb375`;
- branch: `fix/ephemeral-cleanup-and-update-branch-graph-20261001`.

O PR contém:
- finalizer efêmero/FIXED_POINT;
- inventário de resíduos;
- grafo visual Update Branch;
- identidade visual híbrida;
- GENERAL transportável;
- fiscais correspondentes.

`MERGEABLE=true` não equivale a CI verde nem a merge.

---

## 15. PROVADO / QUEBRADO / EVIDÊNCIA FALTANTE

### PROVADO
- causa de workflow-name stale no Dependabot corrigida.
- JSON de reconciliação reparado.
- testes green guard 9/9.
- replay Dependabot fail-closed.
- lixos/worktrees investigados e classificados.
- regra de cleanup existia mas não tinha finalizer obrigatório.
- novo contrato de cleanup alvo passa 4/4 testes.
- self-test ephemeral create/inventory/cleanup/readback passa.
- GitHub Actions debug vars habilitadas.
- workflow Update Branch passou a mostrar quatro jobs reais.
- update-branch trouxe `main` para PR sem mergear o PR.
- Hub/Cockpit passaram a compartilhar owner visual na branch.
- GENERAL cristalizado como postura, não cérebro.
- distinção PRE-FORMAT receipt vs FINAL receipt recuperada do plano.

### QUEBRADO
- Reality Judge do run `36800555838` recebeu outputs nulos/vazios do job anterior.
- transporte estruturado do receipt entre jobs do novo grafo precisa ser corrigido.

### UNKNOWN / EVIDÊNCIA FALTANTE
- CI final SAME-HEAD do #1723.
- specialized Dependabot reconciler em run real após slot de runner e estado estável.
- reconciliação dos ~131 dirty da VPS com o target final.
- escolha/validação profunda do Vault primário ~753 MB.
- off-host readback do Vault escolhido.
- Gate C CURRENT completo do provider imediatamente antes da destruição.
- VNC/rescue CURRENT para o mesmo alvo.
- target image/rota de instalação CURRENT e imutável.
- PRE-FORMAT receipt A+B+C PASS no mesmo SHA/VPS/Vault.
- rebuild completo + reboot + health pós-formatação.
- FINAL receipt DEPLOYED/HEALTHY.

---

## 16. NEXT_CURSOR

```text
1. CORRIGIR_TRANSPORTE_DE_OUTPUTS_DO_UPDATE_BRANCH
2. RETESTAR_#1723_NO_HEAD_EXATO
3. REMEDIR_CI_SAME_HEAD
4. PROMOVER_#1723_SOMENTE_SE_GATES_PASSAREM
5. CONGELAR_TARGET_SHA_DA_REINSTALACAO
6. RECONCILIAR_131_DIRTY_SEM_RESET_CEGO
7. ESCOLHER_UM_VAULT_PRIMARIO_~753MB
8. PROVAR_HASH + MANIFEST + ALLOWLIST + OFFHOST
9. REMEDIR_PROVIDER: INSTANCE + SNAPSHOT_READY + ROLLBACK + VNC/RESCUE + INSTALL_ROUTE
10. EXECUTAR_PREFORMAT_ATUAL_CONTRA_MESMO_SHA/VPS/VAULT
11. EXIGIR REINSTALL_ARMED=1 + GO_REINSTALL=YES
12. FREEZE → LAST VAULT → OFFHOST READBACK
13. SOMENTE_ENTAO_REINSTALL
14. FIRSTBOOT → RESTORE → RUNTIME → REBOOT → HEALTH
15. FINAL_RECEIPT → DEPLOYED/HEALTHY
```

---

## 17. Cristal irreduzível da sessão

```text
CHEFE ENSINA
→ CENTRALDARK OS APRENDE
→ GENERAL/MOTOR EXECUTA
→ WORKSPACE TEMPORARIO TEM OWNER E VASSOURA
→ ACAO PRODUZ EFEITO
→ REALITY JUDGE MEDE
→ RECEIPT TRANSPORTA PROVA
→ ROTA PROVADA VOLTA AO MESMO GRAFO
→ CENTRALDARK CONTINUA
```

E para a reinstalação:

```text
CODIGO_DE_RESTORE_EXISTIR
!=
VPS_PRONTA_PARA_SER_APAGADA

SNAPSHOT_EXISTIR
!=
PREFORMAT_CURRENT_PASS

FINAL_RECEIPT
!=
PRE_FORMAT_RECEIPT

FORMATAR_SOMENTE_QUANDO:
SAME_SHA + SAME_VPS + SAME_VAULT + A_PASS + B_PASS + C_PASS + RECOVERY_CURRENT
```

Este cristal é memória/proveniência. Não é prova automática de runtime futuro.
