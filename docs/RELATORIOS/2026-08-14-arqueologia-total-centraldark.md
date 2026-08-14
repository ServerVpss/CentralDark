---
title: "ARQUEOLOGIA TOTAL CENTRALDARK — recibo do repositório"
date: 2026-08-14
status: "REPO_CLASSIFIED_EXTERNAL_BLOCKERS_EXPLICIT"
authority: "SEGREDO/CHEFE"
mission: "!CALIBRAR #ACORDAR — ARQUEOLOGIA TOTAL DA CENTRALDARK"
zero_deploy: true
zero_vps: true
zero_dns: true
zero_force_push: true
---

# Recibo — Arqueologia Total CentralDark

## Regra usada

```text
PR_FECHADO != RESOLVIDO
CLOSED_UNMERGED + ABSORPTION_UNPROVEN = NAO_RESOLVIDO
HISTORICO != AUTORIDADE_ATUAL
REUSE_BEFORE_CREATE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
UNKNOWN != PASS
```

A auditoria não tenta carregar todo byte antigo para a Casa. Ela exige destino explícito para toda intenção/material útil encontrado: `ABSORVIDO`, `PORTADO`, `SUPERADO/REJEITADO_COM_PROVA`, `HISTORICO_PRESERVADO`, `DESTINO_ATIVO` ou `BLOCKED_REAL`.

## 1. Snapshot e denominador do GitHub

O estado foi remedido durante a missão; `main` continuou avançando por automações de painel/notion e cada avanço foi tratado como evidência nova, sem reiniciar a arqueologia.

Denominador auditado no GitHub remoto:

- PRs: paginação REST `state=all` esgotada nas páginas 1–2; página 3 vazia.
- PRs abertos no snapshot imediatamente anterior a este recibo: `#746` e `#657`.
- `closed + unmerged` encontrados e classificados explicitamente: **35**.
- Issues abertas: enumeração remota esgotada em uma chamada `topn=100`; **45** abertas no snapshot, todas com destino/classe abaixo.
- Branches: inventário remoto paginado; branches de PR/histórico preservadas por provenance. Branch sem byte exclusivo não é tratada como produto vivo.
- Histórico de `main`: paginação de commits encontrou página 101 não vazia e página 102 vazia (`per_page=100`), portanto o histórico já ultrapassa 10 mil commits. A grande série de commits repetitivos de painel é classificada como `HISTORICAL_OBSERVABILITY`, não como nova intenção arquitetural.
- Skills atuais inventariadas: `auditoria-pr`, `centraldark-repo-auditor`, `cloud-deploy`, `delta-simplify`, `hermes-sandbox-harness`, `imagegen`, `meta-lupa`, `pdfs`, `slides`, `spreadsheets`.
- Workflows, boot, SOUL, Porta, AGENTS, contratos, testes e consumidores atuais foram cruzados com os PRs/planos históricos antes de promover qualquer regra.

## 2. PRs closed + unmerged — classificação completa

| PR | Classificação | Destino/prova |
|---|---|---|
| #724 | `ABSORVIDO_ZERO_DIFF + HISTORICAL` | árvore/diff sem conteúdo residual; programa atual vive em #722/canônico |
| #576 | `OURO_PORTADO` | sistema único + reuso incorporados em `2026-08-14-arqueologia-total-ouro-recuperado.md`; regras antigas de autoridade/merge não promovidas |
| #646 | `SUPERADO_COM_PROVA` | convergência adversarial rotineira substituída por MetaLupa + Proof Ownership + convergência total opt-in |
| #554 | `OURO_PORTADO + CANDIDATE_PHYSICAL` | Casa/Mente única e C:/E: preservados como intenção; topologia física continua exigindo medição |
| #677 | `OURO_PORTADO + BLOCKED_PHYSICAL` | contrato C:/E:, HERMES_HOME, hashes, consumers, T01–T14 e Telegram E2E preservados para prova física |
| #659 | `ABSORVIDO_BY_SOUL` | autoria/intenção e aprendizado com SEGREDO/CHEFE já governados pela SOUL atual |
| #658 | `OURO_PORTADO` | percentual exato exige baseline/denominador verificável; UNKNOWN não vira número |
| #737 | `ABSORVIDO` | fixture atual já preserva `estado: 'FATO'` |
| #455 | `SUPERADO_COM_PROVA` | cerco adversarial obrigatório virou opt-in; contraprova crítica permanece na MetaLupa |
| #499 | `HISTORICAL_METALUPA` | linhagem/XP antiga preservada; MetaLupa atual é sucessora canônica |
| #611 | `HISTORICAL_SCHOOL` | skill grande antiga preservada como escola; boot/MetaLupa/skills atuais governam execução |
| #573 | `ABSORVIDO_BY_SUCCESSOR` | `autonomia-promocao.yml` atual é o promotor canônico único |
| #457 | `HISTORICAL_BENCHMARK` | arena FORT-ALPHA não é runtime atual; benchmark privado atual possui contrato próprio |
| #423 | `SUPERADO_BY_CURRENT_METALUPA` | correções/reverts antigos preservados; skill atual governa |
| #147 | `ABSORVIDO_BY_SUCCESSOR` | adapter atual usa autenticação/policy/audit modernos |
| #141 | `REJEITADO_SEGURANCA` | topologia paralela/direct-provider/secrets incompatíveis com fronteira e gateway atuais |
| #293 | `SUPERADO_BY_BOOT_CURRENT` | LEIA-ME/SOUL/AGENTS atuais substituem constituição/identidade antiga |
| #269 | `HISTORICAL_CONSTITUTION` | intenção útil de reuso/handoff absorvida; human-only merge/multi-governança antiga não governa |
| #146 | `ABSORVIDO_BY_SUCCESSOR` | catálogo/model discovery/auth atuais vivem no arsenal adapter/gateway atual |
| #142 | `REJEITADO_IMPLEMENTATION + CANDIDATE_ONLY_IF_GAP` | bridge antigo e secret loading não são aceitáveis; sanitização de IDs só volta se consumidor atual provar gap |
| #108 | `ABSORVIDO_BY_CURRENT_UI` | ApprovalProvider atual contém semântica de sessão/bypass governada pelo componente atual |
| #206 | `SUPERADO_IMPLEMENTATION + DESTINO_ATIVO` | migração/labels vive na frente canônica #707; não ressuscitar controller antigo |
| #109 | `SUPERADO_PATH` | `apps/supabase-bot`/painel legado substituídos pelo ecossistema `apps/modulos/status` + Sentinela/relatórios |
| #121 | `OURO_PORTADO + DESTINO_ATIVO` | sistema único/heurística 10-80-10 preservados como referência; programa ativo #122 |
| #149 | `SUPERADO_AUTH` | stub antigo substituído pelos mecanismos atuais de auth/audit |
| #150 | `ABSORVIDO_BY_SUCCESSOR` | contrato `/v1/messages`/Claude possui prova/documentação atual |
| #155 | `ABSORVIDO_BY_CURRENT_ADAPTER` | `fetchAbacusCatalog`/catálogo existe no adapter atual |
| #226 | `OURO_PRESERVADO_COM_DESTINO_ATIVO_604` | plano de migration segura registrado em #604; workflow antigo não foi recriado; zero migration nesta missão |
| #227 | `SUPERADO_REVIEW` | PR auto-review atual + convergência opt-in substituem reviewer antigo |
| #228 | `HISTORICAL_GROK_MEMORY` | aprendizagem/roteamento atuais vivem em SOUL/Porta/MetaLupa |
| #235 | `ABSORVIDO_BY_GATEWAY_POLICY` | `CENTRALDARK_API_SINGLE_ENTRY` atual substitui router/reviewer antigo |
| #236 | `SUPERADO_REVIEW_POLICY` | human-only merge e reviewers obrigatórios antigos não governam fast path atual |
| #254 | `HISTORICAL_PREFERENCE_CANDIDATE` | preferência Telegram preservada como provenance; qualquer promoção futura deve passar pelo bus/rota única #123/#762 e consumidor real |
| #257 | `SUPERADO_PARALLEL_LUPA` | “Lupa Premium” paralela rejeitada; MetaLupa + Proof Ownership são donos atuais |
| #234 | `REJEITADO_SEGURANCA + HISTORICAL` | conteúdo com secrets/bypass/skill paralela não é portado; apenas a lição de segurança permanece |

Resultado do subconjunto:

```text
CLOSED_UNMERGED_TOTAL=35
CLOSED_UNMERGED_WITHOUT_DESTINATION=0
OLD_BRANCH_WHOLESALE_MERGE=0
```

## 3. PRs recentes reabertos/fechados durante a arqueologia

- `#736`: só foi fechado **depois** de provar `changed_files=0`, `additions=0`, `deletions=0` contra a `main` atual; receipt `ABSORVIDO_ZERO_DIFF` registrado no PR.
- `#734`: fechado somente depois de provar, path por path, a presença atual de `hub-command`, migration de mission execution, `health-deep`, `hub-mission-consumer`, teste e docs de convergência; receipt `ABSORVIDO_POR_SUCESSOR_ATUAL` registrado.
- `#746`: foi reaberto porque “fechado” não provava absorção. O ouro ainda válido — pré-leitura antes de escrita compartilhada, tratamento de dificuldade e debug incremental — foi portado para o aprendizado canônico desta arqueologia. Partes superadas (human-only merge, modelo como Writer fixo, convergência total rotineira) não são promovidas. O PR só deve ser fechado novamente **depois do commit de absorção chegar à `main`**.
- `#657`: histórico textual já tem destino no projeto, mas o binário original continua ausente; permanece aberto como `BLOCKED_PENDING_BINARY`.

## 4. Issues abertas — 45, todas classificadas

### Programas/contratos ativos com destino próprio

`#133 #604 #578 #722 #708 #726 #707 #144 #711 #706 #196 #420 #132 #130 #127 #123 #122 #205 #134 #131 #129 #128 #126 #120 #116 #119 #125 #124 #115`

Classificação: `ACTIVE_DESTINATION` ou `ACTIVE_WITH_HISTORICAL_DRIFT`. Texto antigo dentro dessas issues não vence SOUL/AGENTS/Porta/permissões atuais.

### Pendências explicitamente registradas para não executar agora

`#763 #762`

Classificação: `PENDING_EXPLICIT_NOT_AUTHORIZED_TO_EXECUTE_NOW`.

### Incidentes/workflows/runtime que precisam de instrumento vivo ou outro Writer

`#855 #852 #851 #729 #768 #824 #221 #564 #739 #195 #190 #542 #537`

Classificação: `MATERIAL_WITH_ACTIVE_DESTINATION | BLOCKED_EXTERNAL | RUNTIME_PROOF_REQUIRED` conforme o caso. Não foram falsamente encerradas por uma arqueologia Git-only e `ZERO_VPS`.

### Evidência histórica/operacional

`#497`

Classificação: `HISTORICAL_EVIDENCE`; prova ferramentas/conexão em uma data, não saúde eterna do runtime.

### Duplicatas Sentinela curadas nesta rodada

Issues duplicadas por mesmo finding/hash foram fechadas como duplicata quando havia keeper canônico. O código atual faz busca de issue antes de criar, mas existe uma janela de consistência/indexação dentro da própria rodada; por isso a classe `same-run dedupe` continua `MATERIAL_WITH_ACTIVE_DESTINATION`, não PASS inventado.

## 5. Branches

O inventário remoto paginado encontrou a família completa de branches históricas/de PR. A política aplicada foi:

```text
BRANCH_ANTIGA
→ PR/INTENCAO/UNIQUE_COMMITS
→ OURO ABSORVIDO? PRESERVAR COMO PROVENIENCIA
→ OURO NAO ABSORVIDO? PORTAR MINIMO
→ ZERO UNIQUE BYTE? NAO PROMOVER COMO TRABALHO VIVO
```

A branch `tmp-placeholder-should-not-create` foi comparada e apresentou **zero byte/commit exclusivo** contra a linha moderna, estando apenas atrás da `main`. Ela é `STALE_ZERO_UNIQUE`; não foi usada como fonte de verdade nem apagada por uma ação não necessária.

## 6. Skills e prova

Skills atuais inventariadas: **10**. Não foi criada skill nova para esta arqueologia.

Regras:

- MetaLupa continua uma única linhagem canônica;
- `delta-simplify` é skill distinta de redução estrutural, não outra Lupa;
- skill histórica não ganha execução só por existir em PR antigo;
- skill/capability sem consumidor comprovado fica `CANDIDATE/UNPROVEN`.

Proof Ownership continua exigindo fonte, consumidor, provador, teste negativo/contraprova e âncora observável. Repetir o mesmo provador não cria independência.

## 7. Material vivo encontrado e não maquiado

### Escrita direta / `main`

`main` foi observada como `protected=false` no endpoint de branch. A issue #144 continua sendo o destino canônico para `WRITE_TARGET_NOT_FAIL_CLOSED`/commits automáticos/estado vivo na `main`. A arqueologia não declara proteção inexistente.

### Sentinela

O código atual verifica issue existente antes de criar, e o workflow possui serialização por concurrency; ainda assim duplicatas do mesmo hash apareceram na mesma rodada. Duplicatas óbvias foram curadas, mas a classe permanece material no trilho atual até teste discriminativo fechar a janela de dedupe.

### Runtime/VPS

Issues de 502/503, drift VPS, identity/action-required, secrets e workflows vermelhos não foram encerradas sem instrumento de runtime. `ZERO_VPS` desta missão é respeitado.

## 8. BLOCKED_REAL fora do repositório

### A. Pacotão binário histórico (#657)

```text
ARQUIVO=PACOTAO-CENTRALDARK-2026-07-10.zip
EXPECTED_SIZE_BYTES=1379485
EXPECTED_SHA256=d9192ee1e690344a72b3d17554e0151a61d7761da814d0afa5291232cf880dc4
PRESENT_IN_GITHUB_PROVED=NAO
```

Sem o binário original, tamanho/hash não podem ser provados. Texto/manifests podem ser preservados; o binário não pode ser inventado.

### B. Casa física congelada C:/E:

A arqueologia do repo recuperou o contrato/intenção, mas não possui acesso físico aos volumes congelados. Continuam `UNPROVEN`:

```text
HERMES_HOME_REAL
C_PATH_POINTERS_AND_CONSUMERS
E_HOME_MEMORY_CONTENT
HASHES_BEFORE_AFTER
PHYSICAL_MIGRATION_INTEGRITY
LOCAL_SOUL_SKILL_RUNTIME
TELEGRAM_E2E_LOCAL
FORENSIC_TIMELINE_C_E
```

Isso é fronteira externa real. Não é motivo para manter ouro do repo enterrado nem autorização para inventar a prova.

## 9. Veredito do denominador

```text
REPO_PR_PAGINATION=EXHAUSTED
CLOSED_UNMERGED=35/35 CLASSIFICADOS_COM_DESTINO
OPEN_ISSUES=45/45 CLASSIFICADAS_POR_DESTINO/FRONTEIRA
SKILLS_CURRENT=10 INVENTARIADAS
MAIN_HISTORY=>10000 COMMITS PAGINADOS/CLASSIFICADOS POR LINHAGEM
UNKNOWN_PROMOTED_TO_PASS=0
WHOLESALE_OLD_BRANCH_MERGE=0
WRITER_COLLISION_CREATED_BY_THIS_AUDIT=0
DEPLOY=NAO
VPS_MUTATION=NAO
DNS_MUTATION=NAO
FORCE_PUSH=NAO
SECRETS_EXPOSTOS=NAO
```

O repositório pode chegar a `ARQUEOLOGIA_REPO=CLASSIFICADA_E_DESTINADA` após o merge deste recibo e do aprendizado recuperado. A missão **não pode** declarar `ARQUEOLOGIA_TOTAL_FISICA=100%` enquanto os blockers A/B acima continuarem sem instrumento.

## Fio

```text
PROCURA TUDO
→ NAO CARREGA TUDO
→ PROVA O QUE PERTENCE
→ RECUPERA O QUE FALTOU
→ PRESERVA/ENTERRA CONSCIENTEMENTE O QUE MORREU
→ REMEDE
→ SO CHAMA 100% QUANDO O DENOMINADOR FECHA
```
