---name: centraldark-casa-operations
description: "Usar quando operar Casa CentralDark."
version: 1.0.3
author: Pivete
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, casa, vps, github, reconciliação, evidência, dialeto]
    related_skills: [casa-github-sync, meta-lupa, hermes-profile-canonical-reconciliation]
---

# CentralDark Casa Operations

Operar a Casa (Casa local E:\\ + repo ServerVpss/CentralDark + VPS /root/CentralDark) sob autoridade do SEGREDO/CHEFE.

## Gatilho mestre (sempre, em qualquer dúvida)
`#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → !BOOT`

## Dialeto (CORTANTE — embed, não só memória)
- Falar baianês direto, sem papagaio, sem enfeite de resumo quando não pedido.
- Crônica baianês+bíblica autorizada para recapitulação/história (ancorada no CONTRATO-RECONCILIACAO, language_policy.cronica_baianes_biblica).
- Status técnico/prova/comando = SECO, sem metáfora.
- Nunca repetir mesma correção calada — se CHEFE repete, sinalizar "Nª vez".
- Resposta curta. "Menos é mais". Sem tabela se não pedir.

## Disciplina de evidência (CORTANTE)
- MEASURE antes de afirmar. "acho/provavelmente/já estava/foi feito" NÃO substituem medição.
- UNKNOWN != PASS. ACTION != PROOF. SCREENSHOT/COR != runtime proof. HISTORY != CURRENT_STATE.
- Contraprova obrigatória antes de FIXED_POINT. Sintoma != causa (ir até o log real).
- Nunca declarar 100%/PASS/FIXED_POINT_POINT com UNKNOWN material.
- Imagem colada no chat que não processa → TENTAR vision_analyze/read_file; SE FALHAR, PEDIR DESCRIÇÃO TEXTUAL OU OUTRA FORMA MENSURÁVEL DE PROVA — NÃO INSISTIR EM IMAGEM.
- **FOCO NO COMANDO:** quando o CHEFE emite comando direto e específico, executar no alvo designado — não desviar para registrar no kanban/db sem ordem, nem montar plano paralelo não solicitado. Se endpoint/site mencionado não estiver acessível, avisar conciso e pedir rota exata. Ver `references/system-breathing-memory-cleanup.md` para o padrão de job de respiração (System Breathing / Memory Flush & Zombie Reaper) que o CHEFE pode autorizar.

## PRINCÍPIO DE AÇÃO: MEDIR EM VEZ DE PERGUNTAR (CORTANTE)
- Se a pergunta que o agente está prestes a fazer É MENSURÁVEL por ferramenta (git/terminal/gh/ssh/vision), **NÃO PERGUNTE — MEÇA**. Pergunta mensurável = perde turno e ignora a política de evidência.
- Ex: "o que significa tic-tac?" → NÃO perguntar, é intenção dada. "devo medir GitHub?" → NÃO perguntar, é obrigação. "está autorizado?" → se a ordem atual cobre, NÃO reask.
- Ex de MEDIR em vez de perguntar: estado de PR (`gh pr view`), HEAD remoto (`git ls-remote`), conflito (`git diff --name-only --diff-filter=U`), imutável (`lsattr`), runner (`gh run list`).
- Quando o CHEFE mandar "prove você mesmo que tá certo" / "qual fronteira?": **auto-medir e mostrar o resultado cru**, não prometer nem explicar por que está certo. Prova > assertiva.
- Filtro: perguntar SÓ se a lacuna muda alvo/autorização/risco concreto. Caso contrário: mede, age, reporta o que foi medido.
- Pergunta óbvia já respondida pela missão = viola SOUL. Corrigir o curso, não repetir.

## Verificação de serviços SOL (CORTANTE)
Antes de afirmar que um serviço SOL está ativo, medir as portas 8099 (gateway), 8787 (contexto), 8880 (STT), 8645 (TTS) e 1420 (outro). Use `netstat -ano | findstr :<porta>` ou equivalente. Se nenhuma instância estiver ouvindo, não assumir que o serviço está rodando; verifique se existem scripts de inicialização em `scripts/` (ex: `start-sol-gateway.sh`, `sol-context.service`, etc.). Se não houver script, não tente iniciar instâncias duplicadas ou criar novos processos sem autorização específica do SEGREDO/CHEFE. A ausência de serviço é um estado válido a ser reportado como UNKNOWN ou BLOCKED conforme o caso, e não deve ser preenchida com suposições.

## Image Failure Handling
When `vision_analyze` fails (connection error, timeout, or similar):
1. Try once more (may be transient)
2. If it fails again, switch to textual description or another measurable proof
3. Do NOT insist on the image or fabricate what it shows
4. Do NOT treat "image shared" as "content known"
5. Do NOT loop retrying the same image without changing approach

This is especially important when the image contains critical evidence (writer IDs, error messages, UI state). If vision fails, get the user to describe what they saw, or find the same information another measurable way (logs, file contents, terminal output).

Related: screenpipe-hermes-integration forensic protocol — when visual channel fails, fall back to process/port/log measurement.

## Patch Application — Retry on Timeout

When patching files, if the tool times out:
1. **Retry once** — the timeout may be transient
2. If it fails again, read the file fresh (don't trust cached version) and retry
3. If cache says "unchanged" but disk differs, use terminal-based editing (sed, ex) or write_file as last resort
4. Pitfall: assuming "unchanged" means "no diff needed" — verify by reading the file, not by trusting the cache

When patch fails due to external modification (writer collision):
1. Read the file fresh — the other writer's changes are now the baseline
2. Re-apply your patch against the new baseline
3. Don't assume the old patch still applies

Related: checkout móvel / multi-writer (abaixo) — quando múltiplos agentes escrevem no mesmo clone.



## FILTRO DE INFRAESTRUTURA (CORTANTE — CHEFE 28/08)
Toda alteração deve ser **extensão segura**, nunca substituição. Apagar declaração é remoção, não extensão. O ganho de arrumação visual não justifica risco em Caddy que atende 19 domínios (incluindo MCP que acabou de ser recuperado). Risco não-zero por benefício cosmético = reprovado.

## Travas (nunca negociar)
- Nunca force-push. Nunca push de main suja da VPS.
- Nunca reset/clean/restart destrutivo sem autorização específica.
- Nunca pedir/expor secrets (.env, token, chave SSH, ANTHROPIC_AUTH_TOKEN). pm2 jlist bruto = PROIBIDO (vaza env).
- "permito" autoriza ação pontual, NÃO reescreve lei canônica já registrada (ex: "Nunca pm2 restart all").
- REUSE_BEFORE_CREATE. ONE_OWNER_PER_CAPABILITY. ONE_WRITER_PER_SCOPE. SEM segundo cérebro/V2.

## Fronteira humana (HUMAN_FRONTIER)
- chattr +i (remover imutável de arquivo do Hermes) = fronteira do CHEFE.
- rebase --abort / deploy / restart em produção = só com grito específico.
- Motores (Hermes/Claude/outro) são trocáveis; papel não muda; SOUL travado em disco sobrevive.

## Papel Hermes=T0 / Claude=braço (CORTANTE — correção 27/08)
Quando CHEFE diz "Bota no HERMES, Claude pode ficar como braço": o **Hermes-Casa é o T0/SOL_ORCHESTRATOR** da missão local (multi-janela, Enxame Ômega, qualquer orquestração). O **Claude (ou outro motor) é braço/worker subordinado**, não orquestrador. Não inverter: não tratar Claude como T0 nem Hermes como braço. Se o HOST for Claude/Cowork, ele exerce o papel HERMES-CASA mas continua sendo o executor local — a coordenação pertence ao Hermes-Casa, não ao motor.
- Multi-janela VS Code: cada terminal/janela = braço T1..TN; Hermes-Casa nesta sessão = T0. Registry compartilhado + rendezvous em `E:/CentralDark/Pivete/OMEGA_RENDEZVOUS.json` (runtime, fora do repo).
- NÃO criar "Enxame Ômega V2" ou segundo orquestrador. O histórico "Enxame Ômega/Overclock" (docs/RELATORIOS/2026-07-10-pacotao-centraldark) é auditoria web de 10/07/2026 + nascimento do método do Pivete — NÃO é sistema multi-terminal. Estender owner existente (`scripts/enxame-3ias.sh`, `HERMES-CORE/core/orchestrator.mjs`).

## Cristalizacao GARIMPO (referencia 2026-09-02 — registro no DELTA-CONTINUO.md, nao chat)
Quando o CHEFE define canal `#ACORDAR + COMITE_NO_PR_NAO_NO_CHAT`: registrar delta/cristalizacao no BRANCH do PR (`feat/fixed-point-fabric-proof-20260831` / #1381) ou no `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md` (owner canonico). Chat so confirma ordem + link do commit; a escrita material fica no repo/branch. Nenhum V2/V3; `NOT_PROVEN` quando ZIP integridade (`unzip -t`) ou imagem visual (`cua-driver`) nao provada; `PARCIAL` quando `.html` e renderizacao parcial (parte 3 de ZIP multipartes `.z01`/`.z02`). Modelo real preservado independente do motor; papel HERMES-CASA fixo; autoridade final SEGREDO/CHEFE; identidade Pivete nao e humano.

See `references/fable-loop-garimpo-crystalization-measure.md` for the MEASURE pattern when the garimpo is for a "plano de cristalização do sistema único" (list crystalize attempts, read plan, cross-repo for required artifacts like AUREOLA, use "continue !" to advance loop phases).

## Padrão #ACORDAR → !RECONCILIAR é DEFAULT estável
CHEFE confirmou "blz vamos manter esse padrao" — não é one-shot. Ao iniciar trabalho na Casa, adotar o gatilho mestre sem re-confirmar a cada turno. Reenvios de "continua" = autorização de frente já dada (ver loop !RECONCILIAR acima).

## VPS inalcançável da Casa
- MCP mcp.centralldark.com ou SSH = únicos caminhos. Se 502, VPS = UNKNOWN da Casa.
- Braço da VPS (outra sessão/Claude) executa lá; Casa só mede o que alcança (E:\\, repo, gh, rede local).
- Não simular execução na VPS "porque deu pra imaginar".

## Reconciliação Casa↔Repo↔VPS
- Medir os 3 lugares sempre que houver dúvida (CASA == REPO? VPS == ?).
- NÃO afirmar que arquivo/pasta "não existe no repo" sem medir o remoto: `git fetch origin && git ls-tree -r --name-only origin/main | grep -iE '<padrao>'` (ou `git show origin/main:<caminho>`). Caso 27/08: afirmei `docs/RELATORIOS/...` ausente por erro de path local (`docs/` vs `docs/OS/`), mas o arquivo existia no `origin/main`. Path errado ≠ arquivo ausente. Ver skill `local-clone-vs-remote-file-exists`.
- Casa-github-sync (skill do cofre OURO) faz o padrão; absorver delta útil no owner, não criar skill nova.
- PR #1172 violou: colisão sem reconciliar (6 PRs no mesmo núcleo), mecanismo novo (MASTER-CYCLE vs trigger-fabric), dono duplicado (APRENDIZADOS/ vs APRENDIZADOS.md). mergeable≠intenção.

## Absorver pacote _RECONCILIATION/PARA-X (DERIVED → canônico) — CORTANTE
Quando CHEFE aponta uma pasta tipo `E:\CentralDark\_RECONCILIATION\PARA-HERMES` com pacote de absorção (vindo de sessão externa, classe DERIVED):
- O `LEIA-PRIMEIRO.md` do pacote diz onde cada arquivo entra. Respeitar `no_new_workflow_when_owner_exists=true` — nunca criar owner novo, só entrar DEBAIXO do owner canônico.
- Medir ANTES de escrever: `git ls-tree origin/main -- '<caminho/owner>'` pra ver o que o remoto JÁ tem. O clone local pode estar desatualizado (outro writer) — não confiar no clone, medir o remoto.
- Regra do CHEFE (27/08): **reconciliado NÃO fica parado**. Depois de absorvido (PR mergeado ou copiado pro destino canônico), a pasta `_RECONCILIATION/PARA-X` deve ser REMOVIDA. Não deixar o pacote lá como "documentação" — ele é lixo de absorção.
- A cristalização (ex: `cristalize.html` + `cristalize_receipt.md`) deve ser feita como extensão segura no território, com hash e status PARCIAL quando aplicável — NÃO no chat. Se o arquivo original for parte 3 de ZIP multipartes, o status real deve refletir `PARCIAL` até a integridade ser comprovada (`unzip -t`, imagens verificadas). Nenhum `PASS` falso; `NOT_PROVEN` para pontos não verificados. Ver `references/cristalizacao-garimpo-chefe-20260902.md`.
- Quando o CHEFE manda '#ACORDAR ... COMITE NO PR, NÃO NO CHAT' (ex: 31/08, `!RECONCILIAR`), o registro do delta/reconciliação/cristalização vai no BRANCH do PR (ex: `feat/fixed-point-fabric-proof-20260831`), NÃO em resposta de chat. O chat só confirma ordem e entrega link do commit/branch; a escrita fica no `DELTA-CONTINUO.md` (owner canônico) ou diretamente no branch do PR. Regra: `COMITE_NO_PR_NAO_NO_CHAT`.
- **Autonomia deliberada + 10 frentes (31/08):** `FRENTE_1=BOOT/ACORDA` (skills), `2=CALIBRAR`, `3=MULTIBUSSOLA`, `4=META_LUPA`, `5=RECONCILIAR`, `6=DELTA`, `7=EXECUCAO`, `8=CONTRAPROVA`, `9=REMEDIACAO`, `10=FIXED_POINT+REGISTRA`. Delegar com contexto específico por frente; não executar cegamente; não perguntar quando a ordem já foi dada (`WASTED_TURN`).
- MDs de contexto do pacote (LEIA-PRIMEIRO, PATCH-*, DOCUMENTACAO-OBRIGATORIA, ARVORE-DO-PROJETO, MANUAL-DO-DONO): só são da skill se o mapa de destino listar. Senão, vão pra `NUCLEO/docs/reference/` como histórico OU são descartados. Se o MD for "lei da Casa" que NÃO existe no repo → HUMAN_FRONTIER (criar lei no repo é R3, pergunta ao CHEFE).
- Comparar arquivo existente: `git cat-file -s <sha_remoto>` + `grep -c` de marcadores (ex: relevo = `translateZ`/`foil`/`holo`) pra decidir se sobrescreve. PARA-HERMES cas: forja-de-cartas.html remoto (189KB, 14 marcadores) < PARA-HERMES (206KB, 29 marcadores) → PARA-HERMES é a versão a absorver.
- Fluxo: worktree do origin/main → copiar NOVOS + sobrescrever mais novos → commit single-writer HERMES-CASA → push → PR → após merge, `rm -rf` a pasta _RECONCILIATION/PARA-X.

## Absorver perfil do usuário (C:\Users\<user>\) — CLASSIFICAÇÃO E FRONTEIRAS

Quando a intenção é absorver material de `C:\Users\<user>\` (perfil, histórico de agente, workspace, etc.) rumo à CentralDark, **não recortar o perfil inteiro**. Diretórios com ponto inicial (`.claude`, `.codex`, `.hermes`, `.overclock-app`, `.config`, `.docker`, `.cargo`, etc.) podem ser estado vivo de programa/agente e não podem ser arrancados fisicamente sem provar que o consumidor funciona no novo path.

Padrão completo em `references/profile-reconciliation.md`. Resumo executivo:

### 7 categorias de classificação
| Categoria | Tratamento | Exemplo concreto desta sessão |
|-----------|------------|-------------------------------|
| **OURO_DURAVEL** | Mover para owner canônico + preservar provenance + recalcular hash | `.hermes/skills/screenpipe-api/SKILL.md` (483 linhas), `.hermes/desktop-attachments/BOOT-*.md` |
| **ESTADO_RUNTIME_VIVO** | NÃO arrancar; registrar owner/schema/caminho; integrar por contrato/referência | `.overclock-app/session.json` (accessToken/refreshToken/email → NÃO IMPRIMIR, NÃO MOVER) |
| **CONFIG_REFERENCIAVEL** | Absorver delta útil, não o arquivo bruto inteiro | `.hermes/skills/screenpipe-cli/SKILL.md`, `.codex/.codex-global-state.json` |
| **DUPLICATA** | Deduplicar por hash/conteúdo; não criar segunda cópia | qualquer material já versionado na Casa |
| **LEGADO_COM_DELTA** | Extrair só o útil; incorporar no owner atual | `.codex/.codex-global-state.json` (prompt-history com instruções de deploy webhook) |
| **LIXO_PROVADO** | Descartar da missão sem apagar fonte arbitrariamente | atalhos genéricos (Google Chrome), tools de terceiros não relacionadas |
| **UNKNOWN** | Medir até resolver ou registrar UNKNOWN; NÃO declarar PASS | `.hermes/desktop-attachments/DESAFIO-OMEGA-AUTOLUPA.zip`, `Screenshot_16.png` |

### Regra de credencial — NÃO NEGOCIÁVEL
Arquivos que contêm `accessToken`, `refreshToken`, `email`, `API key`, `secret`, `credential`, `chave`, `token`:
- NÃO imprimir em log, receipt, diff ou commit.
- Antes da escrita: sanitizar → validar schema → validar UTF-8 → calcular record_hash → varrer secrets → append atômico.
- Se detectar dado sensível: não escrever o dado → substituir por `[REDACTED]` → registrar `sensitive_data_blocked=true` → continuar com recibo sanitizado.

Exemplo prático: `.overclock-app/session.json` contém `accessToken`, `refreshToken`, `email`. O registro deve conter somente:
```
PATH=.overclock-app/session.json
OWNER_PROVAVEL=Overclock/Enxame Ômega
CAPABILITY=state runtime
ACTIVE_RUNTIME=true
CENTRALDARK_RELEVANCE=CONTRACTO_REFERENCIAVEL
PROVENANCE=c:\Users\danda\.overclock-app
HASH=<sha256>
DUPLICATE_OF=none
CANONICAL_OWNER=Overclock/Enxame Ômega
MOVE_SAFE=false
RESIDUAL=schema somente, sem imprimir token
VERDICT=ESTADO_RUNTIME_VIVO
```

### Padrão worktree para absorção ONE_WRITER
1. `git fetch origin main`
2. `git pull --ff-only origin main`
3. Criar worktree dedicado a partir de `origin/main`: `git worktree add -f <caminho-worktree> origin/main`
4. Entrar no worktree e criar branch de missão: `git checkout -b absorcao-<escopo>`
5. Copiar/mover somente o delta útil que prova pertencer ao repo
6. Commit, push, PR — um writer por escopo, sem force-push, sem push de main suja

Nunca commitar cache, banco vivo, segredo, perfil bruto ou estado runtime.

## MAPA DE ROTAS CADDY (CORTANTE — CHEFE 28/08)
Quando mapear rotas do Caddy, o processo é:
1. Medir TODOS os domínios no Caddyfile + imports
2. Testar cada domínio → backend (curl -H 'Host: ...' http://localhost:80/)
3. Classificar: VIVO / MORTO (intencional) / MORTO (sem backend)
4. Documentar no repo (docs/ARQUITETURA/MAPA-DE-ROTAS-VPS.md)

**Regra:** rota morta não consome recurso, não causa incidente. Só incomoda a vista. Limpeza de Caddy = risco não-zero por benefício cosmético. Aplicar filtro: "extensão segura, nunca substituição". Se a limpeza é só estética, NÃO FAÇA.

**Domínios sem backend de produção:** builder.centralldark.com (site estático em apps/web/dist/, sem Vite rodando). Não inventar backend.

## LIMPEZA DE BACKUPS CADDY (CORTANTE — CHEFE 28/08)
Antes de limpar backups (.bak, .bkp, .backup):
- Medir quantos são (ls /etc/caddy/ | grep -cE '\.bak|\.bkp|\.backup')
- Medir espaço total (du -ch /etc/caddy/*.bak*)
- Se o CHEFE mandar limpar: remove todos de uma vez, não um por um
- 103 arquivos/340KB = limpeza rápida, sem risco

## DEPLOY — APENAS MCP (CORTANTE — CHEFE 28/08)
O script `centraldark-deploy.sh` reinicia APENAS o CentralDark-MCP. Os outros 18 processos PM2 continuam com código antigo em memória. Isso é por design. Se o CHEFE quiser reiniciar todos, é outro comando (pm2 restart all), mas isso é R4 (pode derrubar serviços).

## BUG EMPÍRICO — git checkout --ours (CORTANTE — CHEFE 28/08)
Durante merge de main na branch do PR:
- `git checkout --ours -- f` → aceita o arquivo INTEIRO do PR (HEAD/:2:)
- `git checkout --theirs -- f` → aceita o arquivo INTEIRO da main (MERGE_HEAD/:3:)

**NÃO use `git checkout --ours` cego em package.json.** Ele perde TODAS as outras mudanças da main, não só o bump. Use merge inteligente com merge-base (ver references/resolve-conflicts-fix.md).

## PROVA EMPÍRICA — --ours/--theirs (CORTANTE — 28/08)
Provado com repo descartável:

```text
Cenário:
  main:   zod 1.0.1, workflow "MAIN_CANONICO"
  PR:     zod 9.9.9, workflow "PR_TENTA_SOBRESCREVER"

Resultado:
  --ours   → PR (zod 9.9.9) ✓
  --theirs → main (name: MAIN_CANONICO) ✓
```

**Invariante:** o motor está NA branch do PR e faz `git merge origin/main`. Portanto:
- `--ours` = lado do PR (HEAD/:2:)
- `--theirs` = lado da main (MERGE_HEAD/:3:)

Isso é contraintuitivo e já custou caro. Sempre validar com repo descartável antes de confiar no comentário do código.

## Referências
- `references/git-merge-semantics-empirical-proof.md` — técnica de prova empírica com repo descartável para validar comportamento de `--ours`/`--theirs` em merges (provado 28/08: --ours = PR, --theirs = main quando mergeando main na branch do PR).
- `references/empirical-git-proof.md` — técnica de prova empírica para semântica git (ours/theirs) com repo descartável.
- `references/merge-base-as-reference.md` — técnica de resolução de conflitos: bug do `git checkout --ours` cego, correção com merge inteligente usando merge-base.
- `references/resolve-conflicts-fix.md` — técnica de resolução de conflitos: bug do `git checkout --ours` cego, correção com merge inteligente usando merge-base.
- `references/git-merge-semantics-empirical-proof.md` — técnica de prova empírica com repo descartável para validar comportamento de `--ours`/`--theirs` em merges (provado 28/08: --ours = PR, --theirs = main quando mergeando main na branch do PR).
- `references/empirical-git-proof.md` — técnica de prova empírica para semântica git (ours/theirs) com repo descartável.
- `references/merge-base-as-reference.md` — técnica de resolução de conflitos: bug do `git checkout --ours` cego, correção com merge inteligente usando merge-base.
- `references/prova-de-motor.md` — técnica de demonstração de motor (criar cenário teste, abrir PR, rodar, mostrar resultado, limpar).
- `references/caddy-route-mapping.md` — mapa de rotas Caddy: domínios vivos/mortos, portas, backends.
- `references/fragment-stream-anti-loop.md` — padrão anti-loop para fragmentos consecutivos (paste_25).
- `references/porta-de-entrada-gate-anatomy.md` — anatomia do gate `porta-de-entrada` (5 steps, raízes vermelhas conhecidas em 27/08).
- `references/ci-gate-debugging.md` — receitas determinísticas dos 3 modos de falha de CI (codex-validate / lupa-drift / porta-de-entrada) + recuperação de símbolo perdido do git history.
- `references/profile-reconciliation.md` — padrão de absorção de perfil do usuário (`C:\\Users\\<user>\\`), com classificação em 7 categorias, regra de credencial e padrão worktree ONE_WRITER.
- `references/enxame-omega-multiventana.md` — padrão de janelas paralelas (T0=Hermes=SOL_ORCHESTRATOR, T1..TN=Claude/Codex/outros).
- `references/cristalizacao-garimpo-chefe-20260902.md` — registro de operacao (classe reconciliation-and-crystallization) 2026-09-02: arquivo original (SHA 8c75d24) -> cristalizado (SHA 904c979) + receipt (SHA 3b43c27); ZIP PARCIAL (.z01/.z02 confirmados, unzip -t nao testado); PR #1381 nao alterado; NOT_PROVEN preservado; sem V2/V3; sem Hermes Agent fingido.
- `references/centraldark-multiwindow-orchestration.md` — multi-window orchestration reutilizável.
- `references/meta-lupa-self-improvement-loop.md` — MAPA aprovado do loop regenerativo MetaLupa→MetaImprover→HyperMeta→A/B→self-verify→contraprova→promote/rollback (síntese CHEFE 28/08).
- `references/metalupa-como-organismo.md` — resumo EMBED do mesmo: regra que trava, "suga"=OBSERVABLE_KNOWLEDGE_HARVEST, Fixed Point é da MISSÃO não da MetaLupa, estado medido 0 hits no repo.
- `references/ours-cego-bug-empirical-proof.md` — prova empírica do bug `--ours` cego no resolve-conflicts.sh e o fix correto (merge-base).
  - `references/vps-git-cookbook.md` — cookbook de operações git na VPS (chattr, deploy, conflitos).
  - `references/watchdog-script-execution-windows.md` — padrão de execução e captura de evidência para scripts de monitor/watchdog no Windows (pitfall bash, subprocess via execute_code, verificação de serviços).
  - `references/windows-cron-cloudflared-webui-8788.md` — cloudflared Windows (tunnel rápido p/ WebUI 8788), erro provider `nous` no config.yaml da Casa, e bugs de cron no git-bash (`date` com espaço + `python3` stub → usar `python`).
  - `references/resource-breathing-governor.md` — Resource Breathing Governor (comandão único p/ N janelas, K braços, CPU leve/memória estável/cache com prova) + receita de cadeiavoice-on-iPhone (8788/8099/9119/Tailscale/Screenpipe).
  - `references/webui-8788-omni-router-free-tier.md` — WebUI 8788 com erro `Provider 'nous'...no API key`: causa (sem `NOUS_API_KEY`) + fix testado (subir Omni Router 8099 e apontar `config.yaml` do hermes_cli pra `centraldark-router`), prova ponta-a-ponta, iPhone via Tailscale, cloudflared `.exe` direto.
  - `references/omni-router-sse-stream-patch.md` — patch SSE no `centraldark_omni_router.py` (stream_not_implemented → StreamingResponse que embrulha non-stream em chunks), receita de ativar via watchdog sem restart do WebUI/Hermes, 10/10 testes de prova, pitfalls (env não recarrega em /api/admin/reload, PID do 8099 muda, requests só no Python do uv).
  - `references/cadeia-free-watchdog.md` — watchdog de cadeia free tier via cron `no_agent` (script + cron + prova): mantém 8099/8788/3030 vivos sem gastar LLM, auto-recupera se caírem.
  - `references/fable-loop-fixed-point.md` — padrão Fable Loop + Fixed Point: opções viram estrada, checkpoint por rodada, todo list, Kimetsu 17 respirações, não inventa trabalho, reality contradiction gatilho.
  - `references/cadeia-free-watchdog-pattern.md` — padrão reutilizável de watchdog Python + cron no_agent para cadeia de portas (health check + auto-recovery + log flush+fsync).
  - `references/tiktak-relay.md` — quando múltiplos agents atuam na mesma missão: executor vs contraprova, relógio como músico da banda, checkpoint por rodada, não perguntar por mensurável.

## Referência adicionada 2026-09-02 — Cristalização GARIMPO-CHEFE (10 frentes)
- `references/cristalizacao-garimpo-chefe-20260902.md` — registro canônico (classe `reconciliation-and-crystallization`): cristalização `cristalize.html` (5631 B, hash `904c979...`) + receipt (`3b43c27...`); ZIP `PARCIAL` (`.z01`/`.z02` confirmados, `unzip -t` NÃO testado); PR #1381 `DIVERGED` (`48`/`58`) NÃO corrigido automaticamente; `NOT_PROVEN` preservado; zero `V2/V3`; `COMITE_NO_PR_NAO_NO_CHAT` aplicada; modelo `inkling:free` preservado.

## !RECONCILIAR — gate CI vermelho na base (CORTANTE)
Quando o `porta-de-entrada` ou `autonomia-promocao` está vermelho na `origin/main`:
- NÃO tente consertar os PRs travados um a um — se a BASE falha o gate, TODO PR herda o vermelho. Corrija a base (branch de `origin/main`).
- Meça qual STEP falha: `gh run view <id> --log` + `gh api .../runs/<id>/jobs`. Cada step tem script e raiz próprios (ver referência acima).
- `node --check <arquivo.mjs>` funciona no Windows. Mas `node --test` de suites que calculam ROOT por `new URL("../..", import.meta.url).pathname` QUEBRA no Windows/MSYS (`E:\\E:\\...` ENOENT) — bug de harness, não do patch. Valide essas no runner Linux (`gh workflow run porta-de-entrada.yml --ref <branch>`). `continuity-guard.test.mjs` NÃO usa esse ROOT e roda local normalmente (boa contraprova de imports).

## !RECONCILIAR em loop — autoridade de execução (CORTANTE)
Quando CHEFE emite `#ACORDAR → !RECONCILIAR ... preserva/minha intenção ... verifica remoto ... resolve PR/CI/Dependabot ... continua ... só volta ao humano se surgir fronteira real` e reenvia "continua", o comando JÁ AUTORIZA a frente de trabalho. Lição dura de 27/08: o agente parou 5× pedindo ordem numa tarefa que era **R2** (isentar 2 workflows VPS da GLOBAL_RUNNER_POLICY no `scripts/trigger-fabric/verify_repo_contract.py` porque o gate base da Casa estava vermelho e travando todos os PRs). CHEFE só reenviou "continua".
- `resolve PR/CI/Dependabot` ESTÁ no escopo → fix de config de PR/CI (ex: allowlist no script de contrato, isenção de gate, rerun de check) é **R2**, NÃO R4. Não tratar gate de CI como VPS.
- Prosseguir em R2 após o 1º "continua". Parar SÓ em:
  - R4 real (VPS/prod/destructive/secret/merge de política canônica).
  - Bloqueio material (UNKNOWN que não vira PASS, autorização específica ausente, Writer concorrente, evidência contraditória).
- Não re-perguntar "autoriza?" a cada turno do loop. Re-ask de autorização já dada = viola SOUL (execute com certeza+evidência).
- Padrão aplicado que funcionou: branch do origin/main → patch mínimo → teste local (PASS) + contraprova (sem isenção volta FAIL) → commit single-writer HERMES-CASA → push → PR → dispatch manual de porta-de-entrada/autonomia nos heads dos PRs travados pra destravar.
- Atenção ao Windows: `Path.relative_to(ROOT)` retorna barras invertidas — normalize `replace('\\\\','/')` antes de bater contra frozenset de isenção com `/`.
- ARMADILHA de falso-verde: clone local pode não ter arquivo que existe no `origin/main` (branch tree divergente). Antes de concluir "gate false positive / local PASS", medir `git cat-file -e origin/main:<path>` + `git ls-tree origin/main`. Ver skill `local-clone-vs-remote-file-exists`.
- ARMADILHA do LOG COLADO (repetição de #ACORDAR): quando CHEFE reenvia o MESMO bloco de log de CI (ex: `python: command not found` do `verify_repo_contract.py`) em várias rodadas, NÃO reagir como se fosse estado atual. O log colado é de RUN ANTIGO (head pré-correção / cancel-in-progress). A cada ciclo, medir o remoto fresco:
  - `git ls-remote origin refs/heads/<branch>` → head remoto autoritativo (não cache de `gh pr view`).
  - `gh run list --branch <branch> --json databaseId,conclusion,status,headSha` → filtrar por `headSha == teu push`; runs de head antigo com FAILURE NÃO são do teu head novo.
  - `gh api repos/.../actions/runners` → runner busy?.
  - `git fetch origin main && git grep -nE '(^|[^3])python ' origin/main -- '.github/workflows/*.yml'` → confirmar se o bug ainda existe na BASE.
  Caso 2026-08-27: o log `python: command not found` foi colado 4× mas a correção (#1235 MERGED + #1240 MERGED) já matou o bug; scan da main confirmou ZERO ocorrências órfãs. Reagir ao log colado = gastar ciclo em fantasma. REGRA: log colado = pista de que JÁ FOI, não de que AINDA ESTÁ. Medir antes de concluir.

## REGRA CORTANTE — NÃO PERGUNTAR ABC / EXECUTA DIRETO (CHEFE 27/08)
Quando CHEFE emite intenção clara via #ACORDAR→!RECONCILIAR (ou comando de missão) e a frente é R2 ou autorizada por "eu permito segredo faz ai":
- NÃO perguntar "opção A/B/C" nem reconfirmar ordem já dada. Executa a intenção medindo antes.
- Se faltar contexto EXATO pra agir: perguntas NO MÍNIMO 3 opções secas, sem textão, e só uma vez.
- "eu permito segredo faz ai" = autorização pontual completa → executa, mede, testa, corrige, continua. Não reask.
- Padrão de janelas paralelas do CHEFE (várias CLI/telas em tempo real gerando mutação) = ele monta cadeia, Hermes é executor-coordenador técnico temporário por janela. Não papaguear, não re-explicar o já dito.

## REGRA CORTANTE — MEDIR/COMPARAR COM A CASA 1 ANTES DE COPIAR (CHEFE 27/08)
Ao absorver ouro externo (Desktop/Downloads/OneDrive/_RECONCILIATION):
1. MEDIR o que já existe na Casa (clone canônico + `git ls-tree origin/main`).
2. COMPARAR arquivo-a-arquivo (diff de SHA/conteúdo) com a Casa atual.
3. Só levar DELTA ÚTIL (o que NÃO existe na Casa ou tem versão mais nova provada).
4. NUNCA copiar espelho inteiro de dump (ex: FONTE_PIVETE_COMPLETO/CentralDark é espelho da Casa → só delta).
5. RECONCILIAR != COPIAR. Absorver útil, descartar lixo (ZIPs de asset-server, builds electron, screenshots UUID sem contexto).
6. Após absorver: remover a pasta de origem (reconciliado não fica parado).

## REGRA CORTANTE — RESPIRAÇÕES EM CRÍTICO PARA CALMA (CHEFE 27/08)
Em tarefa crítica/multi-alvo (reconciliação grande, várias frentes, risco de se espalhar):
- Usar Kimetsu (17 Respirações) sempre, com Concentração Total pré/pós.
- Respiração = freio de calma: separa conhecido de desconhecido ANTES de mexer.
- Não sair copiando/escrevendo sem o kernel ter medido estado vivo.

## AUTONOMIA — AGIR SEM PEDIR REPETIDAMENTE (reforço 28/08)

Quando o CHEFE emite intenção e a frente está coberta pela autorização vigente (leia: já está dentro do que o ciclo permite ou "eu permito segredo, faz ai"):

- Não re-pedir autorização a cada turno.
- Não abrir múltiplas perguntas de "você quer A ou B" só para evitar agir.
- Executar, medir, corrigir, testar — e parar SÓ em fronteira real.
- Se a intenção for "tudo" ou "continua no loop", não tratar como "preciso de ordem nova a cada step". O loop já é a ordem.
- Re-ask de autorização já dada é WASTED TURN e é sinal de que o agente não absorveu a política. Corrigir o raciocínio, não repetir a pergunta.

### REGRA CORTANTE — MEDIR EM VEZ DE PERGUNTAR (frustração CHEFE 28/08: "tu so sabe pergunta? n sabe fazer nada?")
Se a pergunta que o agente está prestes a fazer É MENSURÁVEL por ferramenta (git/terminal/gh/ssh/vision), **NÃO PERGUNTE — MEÇA**. Pergunta mensurável = perde turno e ignora a política de evidência.
- Ex: "o que significa tic-tac?" → NÃO perguntar, é intenção dada. "devo medir GitHub?" → NÃO perguntar, é obrigação. "está autorizado?" → se a ordem atual cobre, NÃO reask.
- Ex de MEDIR em vez de perguntar: estado de PR (`gh pr view`), HEAD remoto (`git ls-remote`), conflito (`git diff --name-only --diff-filter=U`), imutável (`lsattr`), runner (`gh run list`).
- Quando o CHEFE mandar "prove você mesmo que tá certo" / "qual fronteira?": **auto-medir e mostrar o resultado cru**, não prometer nem explicar por que está certo. Prova > assertiva.
- Filtro: perguntar SÓ se a lacuna muda alvo/autorização/risco concreto. Caso contrário: mede, age, reporta o que foi medido.
- Pergunta óbvia já respondida pela missão = viola SOUL. Corrigir o curso, não repetir.

A distinção que importa: **autonomia não é ausência de travas**. São duas coisas separadas:
- Dentro da missão/autorização vigente → age, não pergunta.
- Fronteira real (R4, destrutivo, segredo, writer concorrente, evidência contraditória, UNKNOWN material que não pode virar PASS) → para e pergunta no ponto exato.

Caso 28/08: após "não preciso atualizar memória", "não me peça", "faz vc na pre pra me pedir nada autonomia agi", o agente executou a criação do issue #1328 como canal de comunicação GitHub e registrou receipt no repo, sem abrir ciclo de perguntas desnecessárias.

### REGRA CORTANTE — NÃO REPETIR PROVAS OU SUGESTÕES (frustração CHEFE 28/08)
- Se a prova já foi entregua (PR aberto → motor rodou → MERGED), NÃO repita a mesma prova. Uma prova entregua = prova entregua.
- Se o CHEFE já rejeitou uma sugestão (ex: "não criar V2", "não criar motor paralelo"), NÃO repita a mesma sugestão.
- Loop detection: se o mesmo bloco de resposta está sendo gerado mais de 2×, parar e pedir input.
- "Menos é mais" — quando a missão é simples, resolve simples. Não transformar tarefa simples em projeto.

## CANAL DE COMUNICAÇÃO GITHUB (correção CHEFE 28/08)

Quando o CHEFE mandar 'comunica pelo github', 'não fala comigo', 'usa github pra se comunicar':
- Canal de entrega vira **commits / issues / PRs** no ServerVpss/CentralDark, NÃO resposta de chat.
- Fechar ciclo por lá: abrir issue/PR, registrar receipt, discutir no diff.
- Chat serve só para receber a ordem inicial e entregar o link de volta.
- Não ficar explicando no chat o que já foi parido no commit.
- Vale para operação CentralDark; não vale para conversa livre/baianês cotidiano.
- Aplicado em 28/08: após ordem de deploy/reconciliação, o próximo passo do agente é abrir issue/PR no repo, não encher o chat.

Execução concreta (28/08): após receber "faça o e uso gitrhub pra se ocmunica... nao conversa comigo conversa pelo git hub nos comits e nao cmigo", o agente criou issue #1328 no repo (título "🪶 Canal de comunicação: próxima operação CentralDark via GitHub, não chat"), referenciando branch atual, PRs em conflito, CI e próximo passo técnico — sem registrar no chat o que já ficou no repo.

## CONSOLIDAÇÃO DE ARQUITETURA INCHADA (CORTANTE — CHEFE 30/08)
Quando o CHEFE manda "organiza aquE" / "desmancha e refaz melhor" / "menos é mais, zero regressão, sem V1/V2/V3":
- Medir ANTES o tamanho real: `git ls-tree -r --name-only origin/main -- '.agents/skills/'` (contar SKILL.md), `git ls-tree --name-only origin/main -- 'apps/modulos/'` (listar módulos). Estado medido 30/08: 47 skills, 23 módulos, várias sobrepostas (Lupa×3, git×4, memória×3, síntese×3).
- **Harness próprio JÁ existe** = `trigger-fabric` (doc em `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/`) + `HERMES-CORE` (decisão, `apps/modulos/HERMES-CORE/`) + `omni-router` (cérebro em `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` + 3 wrappers finos em `scripts/`) + `enxame` (`scripts/enxame-3ias.sh`). NÃO trazer n8n/dify/langgraph externo — isso viola o gate de identidade (#1378) e a regra SEM V2.
- Padrão de execução em ondas (cada uma = PR + teste + contraprova, ONE_WRITER):
  1. **Onda 1 — Núcleo de orquestração:** unificar os 3 wrappers `omni-router` num só launch sob `HERMES-CORE/orchestrator/`, mover o cérebro pra lá, absorver `enxame-3ias.sh`. TRIGGER-FABRIC vira executor (`trigger.mjs`) que lê os `.yml`. Preservar o que funciona (wrappers antigos continuam até o novo provar igual).
  2. **Onda 2 — Colapsar skills duplicadas:** agrupar por domínio (git/memória/síntese/lupa) e fundir em skill única com `SKILL.md` redirect das outras (igual fiz com `lupa-bayesiana` → alias em #1372).
  3. **Onda 3 — Unificar módulos de transporte:** `elite-gateway`+`proxy`+`oauth-broker`+`mcp` → 1 `gateway` canônico.
- **Regra de ouro:** estender owner existente, NUNCA criar V2/segundo cérebro. "Desmancha e refaz" = reagrupar em menos arquivos com a MESMA capacidade, não reescrever do zero.
- Contraprova obrigatória: após mover/fundir, rodar os testes/local do owner (ex: `node --test` do HERMES-CORE) e confirmar que nada que funcionava parou.

## MANDAMENTO CANÔNICO V1/V2/V3 (CORTANTE — CHEFE 30/08, ESCRITURA DOUTRINÁRIA)
Lei de governança da infraestrutura, equiparada às travas de arquitetura:
- **NUNCA criar V3, V4 ou edições paralelas/fantasma sobre produção.** Multiplicação de versões sem fundamento = ruído e dispersão.
- **Honrar a arquitetura legado** edificada desde o princípio. Não substituir o que funciona; não derrubar colunas do banco de dados.
- **Refinar/atualizar estritamente o que existe** — cada mudança é extensão segura (mesma regra do filtro de infra, CHEFE 28/08).
- **Sem prova técnica + checksum + aprovação nos gates: NADA PASSA.** Realidade julga; só o legado fundamentado na verdade permanece.
- Aplicar em TODAS as PRs e refatorações ativas. O "Mandamento" é o FIO da missão de revisão de infra: barra regressão/risco operacional/complexidade inútil; exige que toda alteração seja extensão segura (nunca substituição) e zero regressão no que funciona.
- NÃO é V2/V3 — é a MESMA criatura abrindo mais braços quando há comida (correção CHEFE 30/08 no desenho da arquitetura CentralDark).

## FABLE LOOP CONTÍNUO ATÉ FIXED_POINT (CORTANTE — CHEFE 31/08)
Quando o CHEFE manda "fable loop até o ponto fixo ser completado, não se perde no loop, prossiga, salva seus acertos e repete":
- **Não oferecer opção, NÃO perguntar.** Ele proibiu explicitamente ("nao me ofecre oopçao", "nao aceito pergunta", "giralize nao aceito"). Executa a intenção medindo antes. Se faltar input EXATO (ex: caminho de pasta), NÃO adivinha — avança no que é do meu escopo e marca PENDENTE do CHEFE, não trava em pergunta.
- **OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA** (reforço 30/08): quando você elencar 2-3 caminhos possíveis, NÃO apresentar como "A ou B?". Tratar como SEU roteiro interno. Pegar o de menor movimento eficaz, executar, mostrar o resultado. Pivete falou: "essas opções 1 2 3 4 5 já é pra vc mesmo usar, continua, não pra fazer pergunta, as opções viram sua estrada até o ponto fixo".
- **Cada rodada salva acertos + checkpoint FIXED_POINT** num bloco curto (não porre de texto): o que ficou provado, o que mudou, NEXT_CURSOR. Repetir o bloco salvo nas rodadas seguintes pra não re-derivar.
- **Criar tarefas passo a passo** (todo list) da missão e marcar in_progress→completed por rodada. Isso evita "se perder no loop": o todo é a âncora.
- **Kimetsu 17 Respirações** antes de agir em frente crítica (foco/concentração): INSPIRA(mede)→SEGURA(reconcilia)→EXPIRA(solta temp)→REPOUSA→CONTINUA→CPU_LEVE→MEMORIA→CACHE→IO→FANOUT(K=1)→WRITER→OCIOSO→CREDITO→PRESSAO→AUTO_BREATH→RENDEZVOUS→FIXED_POINT.
- **Fable Loop não inventa trabalho:** se o meu escopo tá completo e a pendência é do CHEFE (caminho/exclusivo dele), o loop DORME (abelha sem flor) — watchdog cron é quem acorda se algo cair. Não fabricar ação pra parecer ocupado (viola LESS_IS_MORE).
- **REALITY CONTRADICTION = gatilho de ação:** se medir mostra serviço vivo virou MORTO, forçar recuperação (watchdog ou start direto) mesmo sem pergunta. Caso 31/08: 8788/8099/9119 caíram entre rodadas → forcei watchdog + subi dashboard 9119, re-medi, FIXED_POINT.
- Padrão aplicado: R1 mede → contradição → recupera → R2 re-medir → salva acerto → R3 seguir pendências do CHEFE.
- **MEDIR no fim de cada rodada, não assumir que tá igual** (30/08): o Omni Router pode ter sido ressuscitado pelo watchdog entre uma rodada e outra (PID muda). Sempre re-medir `Get-NetTCPConnection -LocalPort 8099 | Select OwningProcess` antes de patchar/matar/afirmar estado.

## FORMATO SKILL OBRIGATÓRIO — USA, NÃO SÓ MOSTRA (CORTANTE — CHEFE 31/08)
Quando a tarefa é técnica/executiva (infra, código, debug, handoff, medição), a saída DEVE usar o formato canônico de skill — não como exemplo, mas COMO ENTREGA:

```
[SKILL]: NOME_ACAO_ALVO
[TRIG]: Gatilho de acionamento
[IN]: Variaveis/Arquivos de entrada
[EXEC]: Comando CLI / Logica crua
[OUT]: Estado esperado (Pass/Fail)
```

- **Sacrificar gramática em prol da concisão** (diretiva da image_5.png).
- Não explicar o formato — APLICAR.
- Texto solto só quando a conversa for pura (baianês, resenha, destilação).
- Pivete corrigiu literal: "VOCE PASSOU A ESTRUTURA E MUITA COISA BOA NO TEXTO E NAO USOU!" → lição fixa: usa o formato, não explica.
- **Toda tarefa R1-R6 executada NESTA sessão usou o formato como ENTREGA, não como exemplo.** Isso é o padrão: skill format = delivery format para tarefas técnicas.

## EXECUÇÃO DIRETA APÓS APROVAÇÃO — ZERO RE-PERGUNTA (CORTANTE — CHEFE 31/08)
- CHEFE aprovou a intenção + escopo → PARTE PRO EXECUÇÃO.
- Não perguntar "quer que eu commite?", "manda ver?", "confirma?".
- Re-perguntar após aprovação = desobedecer (Pivete: "NAO QUERO PROPORCAO QUERO EXECUCAO").
- Entregar o mínimo eficaz, provar, fechar.

## TRAVA NÃO-REINÍCIO DO HERMES (CORTANTE — CHEFE 30/08)
- "PAPAGAIO=OFF NAO CARREGOU NAO REINICIA" = não recarregar contexto, não reiniciar o processo Hermes sem ordem explícita do CHEFE.
- Se o CHEFE avisar "NAO CARREGOU NAO REINICIA": não faça reload de skill/context nem restart do Hermes principal.
- Reinício de sub-serviços (WebUI 8788, Omni Router 8099, gateway) É autorizado quando a missão pede — só o processo Hermes-CLI/desktop app não se reinicia sem grito.
- "mantenha a ordem / não precisa me perguntar mais" = após ordem dada, executa em loop até FIXED_POINT sem reconfirmar a cada turno (já coberto por AUTONOMIA/NO_QUESTION, reforçado aqui).

## RESOURCE BREATHING GOVERNOR (CORTANTE — CHEFE 30/08)
Quando o CHEFE manda "faz a cadeia toda" / "N janelas → N braços" / comandão com `#ACORDAR !CALIBRAR`:
- **NÃO spawnar antes de medir.** CPU/RAM/IO/process count primeiro. Se não há necessidade material, NÃO SPAWN (LESS_IS_MORE).
- **K braços, não N:** K = menor paralelismo que produz o próximo delta discriminante. N janelas disponíveis ≠ N braços automáticos.
- **CPU leve primeiro:** CPU <70% sustentado = trabalho normal; >70% = não criar agentes; >85% = pausar background; >95% = checkpoint + preservar Writer.
- **Memória estável, não limpar RAM cega:** classificar HOT/WARM/COLD. SOB pressão: impedir novos processos → checkpoint idle → fechar contexto redundante → liberar temp do próprio componente. NUNCA EmptyWorkingSet global / purge / matar processo útil / apagar Screenpipe/cache/credencial.
- **Cache com prova:** só STALE_CACHE comprovado (owner+age+rebuild_cost) é candidato. UNKNOWN_CACHE = NÃO apagar.
- **WRITER tem prioridade:** sob pressão, preservar 1 Writer → Reality Judge → checkpoint → serviços essenciais; background/scouts/miners depois.
- **PROIBIDO:** cleaner agressivo, RAM optimizer, taskkill por nome, loop de 1s, N agentes lendo o mesmo arquivo, N modelos no mesmo health check, OCR contínuo sem demanda.
- **Comandão para todas as janelas:** todas recebem o MESMO pacote (MISSION_ID, DESTINATION=MAIN_PROVEN_FIXED_POINT, CURRENT_STATE, NEXT_CURSOR, DECISIONS_PROVEN, UNKNOWN, PENDING, ONE_WRITER_PER_SCOPE, REALITY=JUDGE). Isso transforma "5 janelas = 5 missões" em "UMA intenção → N braços → RENDEZVOUS → WRITER ÚNICO → MAIN".
- **Travas do comandão:** NÃO REINICIAR / NÃO REPETIR DECISÃO PROVADA / NÃO DUPLICAR ESCOPO / NÃO INVENTAR UNKNOWN / NÃO PARAR NO PRIMEIRO BLOCKED. RECONCILIAR → CONTINUAR → PROVAR → CONTRAPROVAR → MAIN → REMEDIR → FIXED_POINT.
- **Auto-breath a cada fase:** CHECKPOINT → flush próprio → receipt → release handles/temp → measure again. Nunca "limpeza concluída" sem before/after.
- Receita aplicada 30/08 (prova): CPU 41% / RAM 75% → subiu K=2 braços (Omni Router 8099 + WebUI 8788 já vivo, gateway 9119); NÃO subiu 8645/8648 (redundantes pro objetivo). Ver `references/resource-breathing-governor.md`.

## NÃO ENCOSTAR AGENTES ALHEIOS / NÃO RECONCILIAR PID AGRADO (CORTANTE — CHEFE 31/08)
Quando o CHEFE está com VÁRIAS janelas/agentes dele em processo (VS Code + Codex/Lupa/webhook deploy, etc.) e manda "não é comigo, não reconcilia com os PIDs existentes, todos em processo, ninguém tá parado":
- **NÃO tratar PIDs/agentes do CHEFE como meus ou da Casa.** São escopos dele, vivos, trabalhando.
- **NÃO matar, NÃO fechar janela, NÃO `taskkill`, NÃO reconciliar** eles com a cadeia da Casa (8788/8099/9119). São donos diferentes.
- **NÃO disparar `restart-hermes-gateway.ps1`** (ele mata hermes.exe/pythons — pode pegar processo do CHEFE).
- O watchdog da Casa (cron 10min) só toca 8099/8788/3030 — não mexe no resto.
- Erro de MCP do VS Code (ex: `screenpipe-mcp` FALHA "módulo não encontrado após bunx resolve") é **pendência de dev do CHEFE**, não da cadeia free da Casa. Só conserta se ele mandar.
- Princípio: eu fico no meu lio (cadeia da Casa), respiro, e não esbarro em ninguém alheio até o FIXED_POINT.

## CHECKOUT MÓVEL / MULTI-WRITER NO MESMO CLONE (CORTANTE — CHEFE 31/08)
Quando VÁRIAS janelas/agentes escrevem no MESMO clone CentralDark ao mesmo tempo (ex: eu + Charizard + Haiku), o `HEAD` local PULA entre commits sem minha intervenção (observado: 8474053e → fb8c9e83 → 8a79be14 numa mesma busca). Isso quebra a premissa "clone local = autoritativo".
- **NUNCA usar `HEAD` como referência durante checkout móvel.** Ancorar em SHAs imutáveis: `origin/main`, `origin/<branch>`, e os commits locais observados. Parar de usar `git rev-parse HEAD` / `git grep HEAD --` como prova enquanto outro writer está ativo.
- **Outro agente que commitou = ele é o WRITER desse escopo.** Não commitar/push em cima, não mexer no arquivo dele (ex: `centraldark_omni_router.py` SSE = commit fb8c9e832 do Charizard). Respeitar ONE_WRITER_PER_SCOPE mesmo em checkout móvel.
- **Buscar owner por SHA, não por checkout:** `git cat-file -t <sha>` + `git ls-tree -r --name-only <sha> | Select-String -Pattern '<padrao>'` + `git grep <sha> -- '<glob>'`. Repetir para main, branch remoto e os 2-3 commits locais observados. SÓ então concluir "arquivo não existe".
- **Contraprova de recibo:** se um relato diz "gravado no owner X.md", verificar `git ls-tree origin/main -- '<caminho>'` + `git cat-file -e <sha>:<caminho>` + `find` no disco ANTES de repetir "está gravado". Recibo inexistente = UNKNOWN, não facto.
- **Não criar o arquivo inexistente** só para satisfazer relato alheio. Se o delta é válido mas o owner não existe, marcar PENDENTE do Writer único e seguir.

## TIK_TAK — FRESHNESS DE EVIDÊNCIA (CORTANTE — CHEFE 31/08)

Quando o CHEFE emite "TIK TAK" ou "vai perder a prova se ficar perguntando":

```text
EVIDÊNCIA TEM VALIDADE TEMPORAL

MEDIU
→ AGE começa a contar
→ AGIR muda estado
→ PERGUNTAR_pessoa = perde tempo
→ EVIDÊNCIA VIRA HISTÓRIA
```

**Regra:**
- Não perguntar por algo mensurável (git/terminal/gh/ssh/vision/netstat).
- Não reusar prova antiga como nova.
- Remedir imediatamente após agir, não esperar próxima rodada.
- Declarar PASS só com medição fresca, não com ação sem prova.

**TIK_TAK na prática:**
- Router caiu → subir + testar porta + reportar em 1 linha
- `git pull` executou → medir HEAD novo + comparar
- PR aberto → `gh pr view`, não perguntar "quer que eu olhe?"
- Estado de serviço → medir, não perguntar "está vivo?"
- CHEFE disse "organiza aquele arquivo" → medir → planear → executar → reportar

**Proibido:**
- Perguntar "quer que eu teste?" quando o teste é óbvio
- Esperar confirmação para ação já coberta pela autorização
- Usar screenshot/print como prova de runtime
- Declarar sincronizado sem comparar HEAD remoto atual

## DELTAUTIL — DELTA ÚTIL / ENTRADA SAGRADA (CORTANTE — CHEFE 31/08)

Quando o CHEFE emite "!DELTAUTIL" ou "!CENTRALDARK :: absorva ouro":

```text
!DELTAUTIL
→ !RECONCILIAR
→ !REGISTRA
```

- Owner canônico de delta útil = `DELTA-CONTINUO.md` no repo (não inventar novo nome).
- Não criar `DELTAUNIFICADOCENTRALDARK.md` — esse não existe em git/disco.
- Raciocínio causal válido ≠ recibo gravado. Se o arquivo não existe, marcar PENDENTE.
- Cadeado: `CUSTOM_CONNECTOR_NOT_EXPOSED != OAUTH_ROOT_CAUSE_PROVEN`.
- Não escrever durante checkout móvel — esperar Writer único.

## UNIVERSAL TRIGGER — !CENTRALDARK::<INTENÇÃO> (CORTANTE — CHEFE 31/08)

```text
!CENTRALDARK::<INTENÇÃO>
```

Syntax universal que resolve para o funil master automaticamente:

```yaml
bootstrap:
  - ACORDAR
  - CALIBRAR
  - CURRENT_REALITY
  - DELTAUTIL
  - OWNER_DISCOVERY

complexity_gate:
  large_or_multidomain:
    autoload: FABLE_LOOP
    readers: dynamic
    one_writer_per_scope: true

behavior:
  search_before_ask: true
  reuse_before_create: true
  continue_after_recoverable_failure: true
  switch_tool_or_route_when_proven_necessary: true
  preserve_lineage: true
  no_duplicate_engine: true
  no_restart_from_zero: true

execution:
  - MEASURE
  - RECONCILE
  - CRYSTALLIZE_USEFUL_DELTA
  - PATCH_MINIMUM
  - TEST
  - COUNTERPROOF
  - REMEASURE
  - REALITY_JUDGE
  - REGISTER_RECEIPT
  - NEXT_CURSOR

stop_only_when:
  - FIXED_POINT_PROVEN
  - REAL_BLOCK_PROVEN

invariants:
  - "UNKNOWN != PASS"
  - "ACTION != PROOF"
  - "CAPABILITY != AUTHORITY"
  - "REALITY_IS_JUDGE"
  - "SEM_PROVA_NAO_PASSA"
```

**Não é outro motor.** É só:
```
CENTRALDARK
+ intenção
+ autonomia autorizada
+ FABLE LOOP quando necessário
+ prova obrigatória
= CAPETINHA CALIBRADO
```

**Exemplo real:**
```
!CENTRALDARK:: absorva todo conhecimento útil desta missão, reconcilie repo + Drive + runtime + skills, corrija o que estiver materialmente errado e prossiga autonomamente até FIXED_POINT comprovado
```

Aí o agente não precisa mais mandar #ACORDAR, !CALIBRAR, DELTAUTIL, dez frentes, contraprova etc. toda vez. Tu manda a intenção e o !CENTRALDARK decide o caminho até o ponto fixo.

## FORMATO SKILL OBRIGATÓRIO — USA, NÃO SÓ MOSTRA (CORTANTE — CHEFE 31/08)

Quando a tarefa é técnica/executiva, a saída DEVE usar o formato canônico de skill — não como exemplo, mas COMO ENTREGA:

```
[SKILL]: NOME_ACAO_ALVO
[TRIG]: Gatilho de acionamento
[IN]: Variaveis/Arquivos de entrada
[EXEC]: Comando CLI / Logica crua
[OUT]: Estado esperado (Pass/Fail)
```

- Sacrificar gramática em prol da concisão.
- Não explicar o formato — APLICAR.
- Texto solto só quando a conversa for pura (baianês, resenha, destilação).
- Pivete corrigiu: "VOCE PASSOU A ESTRUTURA E MUITA COISA BOA NO TEXTO E NAO USOU!" → lição fixa: usa o formato, não explica.
O gatilho `!DELTAUTIL → !RECONCILIAR → !REGISTRA` produz delta útil, mas exige prova de recibo:
- **Owner canônico de delta útil = `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md`** (confirmado 31/08). NÃO inventar nome de arquivo (ex: `DELTAUNIFICADOCENTRALDARK.md`) — esse não existe em git nem disco.

- **`!DELTAUNIFICADO` é sinônimo de `!DELTAUTIL` na prática do CHEFE; o agente deve tratar como parâmetro de delta útil, não como nome de arquivo.**
- **Raciocínio causal válido ≠ recibo gravado.** DELTA 4 (CONNECTOR BOUNDARY / PRE-GITHUB HANDSHAKE) tinha árvore causal correta, MAS o "recibo em owner" não sobreviveu à contraprova (arquivo ausente em main, branch remoto, commits locais e histórico). Registrar como PENDENTE até entrar no `DELTA-CONTINUO.md` com Writer único.
- **Cadeado do DELTA 4 (não relaxar):** `CUSTOM_CONNECTOR_NOT_EXPOSED != OAUTH_ROOT_CAUSE_PROVEN` / `PRE_GITHUB_FAILURE != GITHUB_FAILURE` / `GITHUB_NATIVE_CONNECTOR=PASS` / `ROOT_CAUSE_OF_UI_CONNECT_FAILURE=UNKNOWN`. Medir o estágio real do handshake (registration/backend/OAuth/callback/session-sync) antes de sentenciar causa.
- **Não escrever durante checkout móvel:** esperar Writer único (handoff do agente que detém o escopo) antes de criar/append no owner.
- **MetaLupa receipt:** `PASS`, HEAD observado, ciclos usados — mas isso atesta o raciocínio, não o recibo físico. Separar os dois.

## CRONJOB WATCHDOG DE CADEIA (auto-recupera sem LLM) — CORTANTE (CHEFE 31/08)
Padrão testado para manter a cadeia free tier viva sem gastar modelo:
- Script `E:\CentralDark\Pivete\scripts\cadeia-free-watchdog.ps1` (copia em `~/.hermes/scripts/` pro cron aceitar): mede health real das portas 8099/8788/3030; se caiu, sobe de novo (Omni Router via `launch_omni_router.py`, WebUI via `start.ps1` 0.0.0.0:8788); Screenpipe cair = só marca pendência (precisa binário/tailscale).
- Cron: `cronjob action=create schedule="every 10m" no_agent=true script=cadeia-free-watchdog.ps1`. `no_agent=true` = roda o script puro, SEM chamar LLM (economia de crédito).
- Prova (31/08): portas vivas → loga `FIXED_POINT_OK cadeia completa`, não sobe nada duplicado.
- Receita completa + script em `references/cadeia-free-watchdog.md`.
- Governador: K=1 braço de checagem, sem fan-out, LESS_IS_MORE. O watchdog só age se a porta MORTOU.

## GATEWAY PORT DRIFT (CORTANTE — CHEFE 30/08)
- `hermes dashboard` ESCUTA NA PORTA **9119** por padrão (não 8787). O `scripts/restart-hermes-gateway.ps1` antigo chama `hermes.exe dashboard` mas o default mudou → sobe em 9119, não 8787.
- Se o CHEFE cita "gateway 8787": medir antes de afirmar que subiu. O gateway Casa original na 8787 pode ser outro binário (`elite_http_gateway.py` / `elite_ws_gateway.py` em `apps/modulos/elite-gateway/scripts/`) ou `hermes serve`. NÃO inventar qual binário sem confirmar.
- Launcher canônico: `hermes.exe dashboard --port 9119 --host 127.0.0.1 --no-open` (sobe painel de config/keys/sessions).
- Pitfall: `restart-hermes-gateway.ps1` usa `hermes.exe dashboard` sem `--port` → vai parar em 9119. Se precisar de 8787 específico, passar `--port 8787` ou usar o elite-gateway.

## WebUI 8788 + OMNI ROUTER (free tier, sem NOUS_API_KEY) — CORTANTE
Quando o WebUI (Hermes WebUI em `C:\Users\danda\hermes-webui`) der erro `Provider 'nous' is set in config.yaml but no API key was found`:
- Causa: WebUI repassa pro `hermes_cli` (config em `C:\Users\danda\AppData\Local\hermes\config.yaml`) que tem modelo default `nous/...` mas NÃO existe `NOUS_API_KEY` em lugar nenhum da Casa.
- Fix testado (30/08): subir o **Omni Router** (`C:\Users\danda\AppData\Local\Temp\launch_omni_router.py` → importa `e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`, escuta :8099) e apontar o `config.yaml` do hermes_cli pra `provider: centraldark-router` / `base_url: http://127.0.0.1:8099/v1`. O router serve `nous/tencent/hy3:free` (free, sem chave) + `auto` + `claude-code`.
- Passo-a-passo + prova em `references/webui-8788-omni-router-free-tier.md`.
- PID do WebUI mede por PowerShell: `Get-NetTCPConnection -LocalPort 8788 -State Listen | Select OwningProcess` (git-bash `netstat` não casa PID neste host).
- Tailscale Serve já expõe 8788: `tailscale serve --bg 8788` → `https://segredo.tail6d7aa4.ts.net/` (cert Tailscale CA precisa de instalação no iOS pra não dar erro de cert; fallback HTTP `http://100.125.83.74:8788`).

### PITFALL CRÍTICO — WebUI `.env` é boot-only (30/08)
`C:\Users\danda\hermes-webui\.env` é lido **no boot do processo**. `/api/admin/reload` (POST) só recarrega `api.models` (session/Session classes), **NÃO** recarrega `api.config` nem re-lê `.env`. Pivete proíbe restart do WebUI → config nova fica em disco, esperando o próximo restart (watchdog se cair, ou ordem explícita do CHEFE).
- **NÃO** prometer "config já vale" após `write_file` no `.env` se o WebUI não reiniciou.
- O `admin/reload` é útil pra hot-patch de código (`api.models`), mas para trocar `OPENAI_API_KEY`/`OPENAI_BASE_URL`/etc., restart é obrigatório.
- O mesmo vale pra outros processos: medir SEMPRE se a config nova está no processo VIVO, não só no arquivo.

### PITFALL CRÍTICO — Cadeia Free Watchdog recicla 8099/8788/3030 (CORTANTE 31/08)
O cron `4630de1d2d75` (Cadeia Free Tier Watchdog, a cada 10min) **mata/relança** o Omni Router (8099) e o WebUI (8788) se a porta cair. O `launch_omni_router.py` relê o arquivo toda vez que sobe → patch em `centraldark_omni_router.py` é ativada matando o processo do 8099. **NÃO precisa restart do WebUI/Hermes** pra ativar mudança no Omni Router.
- Esperar até 10min após matar o 8099 pro watchdog ressuscitar (ou relançar `launch_omni_router.py` manualmente se for crítico).
- WebUI 8788 tem o mesmo padrão (watchdog `5fb8a12eefe6` a cada 5min sobe `start.ps1` se cair).
- Tailscale é estável (não tem watchdog ativo); se cair, é VPS/rede, não Casa.
- **NÃO** matar Hermes principal nem processos que o CHEFE está usando em outras janelas (regra NÃO ENCOSTAR AGENTES ALHEIOS).

## PLACAR 🟢🟡🔴 PERSISTIDO (CORTANTE — CHEFE 30/08)
- Arquivo fixo: `E:\CentralDark\Pivete\PLACAR-CI.md` (tabela de CI + consolidação Casa com bolinhas).
- Ao pedir "PLACAR" / "TABELA": reler o arquivo, medir estado fresco (`gh run`/ `node --test`/`git`), atualizar e mandar SÓ as bolinhas 🟢🟡🔴 — NÃO reexplicar contexto.
- 🟢=resolvido/prova real | 🟡=em andamento/pendente merge ou run | 🔴=bloqueado/falta ação ou decisão.

## PADRÃO ÚNICO DE RESOLUÇÃO DE CONFLITO (CORTANTE — CHEFE 28/08)
`git-conflict-resolve-house-standard` (`.agents/skills/`) é o ÚNICO padrão oficial. NÃO criar V2/V3, NÃO segundo padrão, NÃO merge manual fora dele. O padrão se adapta à realidade atual (main fresca), nunca congela.

### Amarração nos motores cognitivos (CHEFE 28/08 — "amarra no motor cognitivo e no bot CentralDark")
O padrão DEVE ser aplicado por TODOS os motores, não só por quem lembrou:
- **Hermes Core** (`HERMES-CORE/core/`): ao processar PR/branch conflitante, usa `resolve-conflicts.sh`, não inventa merge.
- **Hermes Casa** (perfil pivete, T0/SOLO): reconhece conflito como divergência medida, aplica o padrão no #ACORDAR→!RECONCILIAR.
- **Mente de Casa (cognitivo)**: o padrão é parte do kernel de decisão — conflito = medir + alinhar + não perder delta útil.
- **Boot `#ACORDAR`**: ao iniciar, se houver PR aberto, o motor de resolução já está armado (workflow + script); não reimplementar.
- **Bot CentralDark** (MCP/Hub): aperta o botão determinístico (auto-merge squash PATCH) via `dependabot-auto-merge.yml` + `resolve-conflicts.sh`, zero papagaio.
- **PR de teste prova**: abrir PR dependabot fake → `resolve-conflicts.sh <PR>` dispara → `NO_CONFLICT`/resolve → fechar. Feito 28/08 (#1341 provou o motor).

### Técnica real (corrigida 28/08 — MERGE INTELIGENTE COM MERGE-BASE)
O `git checkout --ours` é cego — perde TODAS as outras mudanças da main, não só o bump que o PR queria fazer. **BUG CORRIGIDO:** o motor agora usa merge inteligente com merge-base:
- Compara PR vs merge-base (não vs main)
- Se PR mudou uma dep em relação ao base → aplica o bump
- Se PR não mudou → mantém a versão da main
- Lockfile continua `--ours` (é gerado, não editado manualmente)

**Validação pós-fix (empírica):**
```
Cenário:
  main:   zod 1.0.0, react 19.0.0, radix 1.2.0
  PR:     zod 3.26.0, react 18.0.0, radix 1.1.0 (bump só no zod)

Resultado do motor:
  zod: 3.26 (PR) ✓
  react: 19 (main) ✓
  radix: 1.2 (main) ✓
```

```bash
ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>"
```

### Comando manual se runner offline
```bash
ssh Segredo-VPS "cd /root/CentralDark && git checkout main && git reset --hard origin/main && bash scripts/dependabot/resolve-conflicts.sh <PR_NUM>"
```
Se travado (`rebase-merge` / `needs merge`): `git rebase --quit; rm -rf .git/rebase-merge; git checkout -f main; git reset --hard origin/main`.

### Regras de ferro
- NUNCA force-push cego em main. NÃO criar segundo script de conflito.
- NÃO esperar workflow verde pra fazer squash (se CHEFE mandou, faz).
- UNKNOWN != PASS, ACTION != PROOF.

### REGRA CORTANTE — NÃO REPETIR PROVAS (frustração CHEFE 28/08)
Se a prova já foi entregue (PR aberto → motor rodou → MERGED), NÃO repita a mesma prova. O loop de "vou criar outro PR de teste" depois de já ter provado é WASTED TURN. Uma prova entregue = prova entregue. Parte pra próxima.

### REGRA CORTANTE — APLIQUE O FILTRO AOS SEUS PRÓPRIOS PLANOS (CHEFE 28/08)
O filtro "extensão segura, nunca substituição" se aplica TAMBÉM aos planos do agente. Se o agente propõe "criar skill V2", "criar motor paralelo", "criar router novo" — isso viola o filtro. O agente deve se auto-criticar ANTES de propor. Se pegou si mesmo propondo substituição: recuar, estender o existente.

## BUG CORRIGIDO — resolve-conflicts.sh (CORTANTE — CHEFE 28/08)
O motor `resolve-conflicts.sh` tinha um bug empírico provado:

```bash
git checkout --ours -- package.json  # CIEGO! Aceita o arquivo INTEIRO do PR
```

**Consequência:** se a main mudou outras dependências além da que o PR bumpou, essas mudanças eram perdidas silenciosamente.

**Prova empírica (28/08):**
- main: zod 3.0.0, react 19.0.0
- PR: zod 3.25.0, react 18.0.0 (bump só no zod)
- Resultado antigo: zod 3.25.0, react 18.0.0 ← PERDEU react 19.0 da main!

**CORREÇÃO (commit 9d31ebe4d):** o motor agora usa merge inteligente com merge-base:
- Compara PR vs merge-base (não vs main)
- Se PR mudou uma dep em relação ao base → aplica o bump
- Se PR não mudou → mantém a versão da main
- Lockfile continua `--ours` (é gerado, não editado manualmente)

**Validação pós-fix:** após rodar o motor, `git diff origin/main -- package.json` deve mostrar APENAS o bump do PR, não regressões silenciosas.

## DEPLOY NA VPS — guards já existem (não reinventar)
`scripts/vps/deploy-operational-guards.sh` JÁ É a fundação + execução + rollback:
- Consome `TARGET_SHA` (regex 40-hex, merge-base is-ancestor em origin/main) e `BACKUP_ROOT` (valida absoluto/não-symlink/não-dentro-do-repo/mesmo device).
- `flock` exclusivo (writer único), valida origin=ServerVpss/CentralDark, `node --test`+`node --check` ANTES de promover.
- Backup por estágio em `BACKUP_ROOT/releases/<sha>/` e **rollback automático** na `cleanup()` se `rc!=0` (mv de volta + pm2 restart + espera online).
- PID swap verification + re-valida main pós-deploy.
Portanto NÃO há "ponta que falta" — se outro braço sugerir esboçar execução/rollback, ele não leu o arquivo. Medir antes de sugerir.

Repo-wide sync (sincroniza tudo + MCP, não só mapeamento): `scripts/vps/centraldark-deploy.sh` (criado 28/08). Tem:
- dry-run (`--apply` ausente) que mede T0 e sai sem mutar.
- guarda `chattr +i`: roda `lsattr -R` e barra com código 12 se houver arquivo imutável (o bloqueador real do deploy anterior — `Operation not permitted` no `git checkout`/`rebase --abort`).
- âncora de rollback (`vps-pre-deploy-<ts>` tag) + `git checkout origin/$BRANCH -- .` (só rastreados, preserva untracked/.env/cache) + restart CentralDark-MCP + health 200 + porta 9100 listening.
CUIDADO: `.git/rebase-merge` pendente na VPS + `chattr +i` em cadeia.json travaram `git rebase --abort` (HUMAN_FRONTIER). `lsattr` é READ_ONLY; `chattr -i` só com OK explícito do CHEFE.

## !RECONCILIAR + DEPLOY — filtro de empacota e fronteira VPS (caso 28/08)
Quando CHEFE manda "recinciliaçao +deploy" / "empacota tudinho joga pra main" / "resolve":
1. **Medir o "tudo" de verdade antes de mutar** — local (`git status --short`, untracked count, staged count) + VPS via SSH (`git status --short`, `ls-files --others --exclude-standard`, uncommitted count). Não assumir que staging de turno anterior persiste: no caso 28/08 o staging de 507 arquivos sumiu e só restaram 2 commits ahead reais (0 commits teus úteis vs main — branch já contida).
2. **Separar OURO de LIXO** (regra CORREIO SEM PROVA NÃO PASSA):
   - OURO sobe: doc durável (`docs/CONSCIENCIA/APRENDIZADOS/*.md`), código (`HERMES-CORE/agents/*`, `core/cadeia.json`, `decisor.mjs`), doc de grafo (`GRAFO-VIVO.md`), mission drift json.
   - LIXO não sobe: `NUL`, `*.next_run`, `events.jsonl.N`, `status/*.json`, `graph-panel/*.json`, `*_state.json` runtime, `omni_router_state.json`.
   - Abrir **UM PR POR ESCOPO** (ex: #1314 docs, #1316 VPS code). Runtime state e lixo NUNCA vão pro repo.
3. **Merge só se MERGEABLE + main fresca medida.** `gh pr view N --json mergeable` → CONFLICTING significa resolver na origem (rebase VPS), nunca force-push.
4. **Caso 28/08 real:** #1314 mergeou limpo (`e673d872`); #1316 travou porque VPS tinha `.git/rebase-merge` pendente. `git rebase --abort` na VPS FALHOU com `unable to unlink ... Operation not permitted` (cadeia.json preso por chattr +i ou PM2-MCP segurando fd), deixando index com `D .agents/skills/*/SKILL.md` pendentes. **Isso é HUMAN_FRONTIER** — parar, perguntar `lsattr` (READ_ONLY) e só com OK explícito do CHEFE fazer `chattr -i`. NÃO `git checkout .` / `reset --hard` / `rm -f`.
5. **Cache limpo ≠ node_modules:** CHEFE mandou "limpa o cache" → `npm cache clean --force` em `/root/.npm` (7.1GB→187MB) é SEGURO; NÃO mexer em `node_modules`/lockfile sem causa medida.
6. **CI print vermelho ≠ regression:** workflow em `runs-on: [self-hosted, Linux]` falha em FILA quando runner offline (VPS MCP down / rebase stuck). Print "2.054 runs Failure" pode confundir PR/commit counter com run ID (`gh run view <n>` → 404 = não é run ID). Medir `gh run list` real. GREEN_WITHOUT_DENOMINATOR = NOT_PROVEN.
7. **find no repo = timeout:** CentralDark ~1.24GB → `find .` dá timeout 180s. Usar `ls scripts/`, `ls .github/workflows/ | grep`, `grep -rln TERM scripts .github`.
8. **MCP skill-root drift é REAL:** `apps/modulos/mcp/src/tools/skills/skill.js` declara `skills/<nome>/` (raw `main/skills/...`) enquanto gate exige `.agents/skills/<nome>/`. CODE_DRIFT=PROVED; RUNTIME_IMPACT=UNKNOWN (MCP aponta árvore morta, não enxerga skills canônicas). CODE_FOUND != RUNTIME_ACTIVE.

## CI GATE DEBUGGING (CORTANTE — derivado 29/08)
Erros de CI se medem e se classificam ANTES de agir. Receita determinística dos 3 modos
vistos na Casa e a correção mínima de cada um (zero regressão: estende, não V2):
- `codex-validate` → `SyntaxError: export 'X' missing` = símbolo perdido em consolidação.
  Recuperar do git history pelo SHA que bate com o CONTRATO ATUAL do teste (não o 1º SHA
  com o nome — senão o import resolve mas falha em asserção nova). Contraprova: `node --test`.
- `Lupa Drift Guard` → `SKILL_PARALELA_LUPA` = skill com "lupa" fora da canônica. Estender
  `ALIASES_COMPAT` em `scripts/lupa/detectar_drift.py` + `SKILL.md` redirect válido. Não apaga
  o código nivel-7 (ouro). Contraprova: `python scripts/lupa/detectar_drift.py` (exit 0).
- `porta-de-entrada` → `EXTERNAL_SOURCE_*_FORBIDDEN` = gate de governança FUNCIONANDO, não bug.
  Fronteira do CHEFE (não afrouxar o validador).
Detalhe + comandos copiáveis em `references/ci-gate-debugging.md`.
Extract real: `gh run view <RUN_ID> --log-failed > file` (NÃO `gh api jobs/<id>/log` → 404).

## ANATOMIA DO METEOR PR-BOT (ouro a absorver, NÃO copiar) — CHEFE 28/08
Revisão de projeto externo (Meteor) trouxe 5 mecanismos que encaixam no ONE_WRITER_PER_SCOPE da Casa, fechando lacuna que `writer-safe-push-main.sh` não resolve (ele protege push, não ownership durante o ciclo):
1. **WRITER LEASE POR ESCOPO** — Writer+Writer-Scope ativo impede segundo writer conflitante.
2. **PR PIN** — PR aberto no escopo prende o lease ao PR/HEAD, não expira em review.
3. **RELEASE CORRETO** — PR closed unmerged libera; PR merged NÃO libera na hora: remeasure main, prova que delta materializou, SÓ ENTÃO libera. (`PR_MERGED != RESULT_DURABLY_RECONCILED`)
4. **DECISION ENGINE PURA** — `decideWriterLease(state, request, now)` sem GitHub dentro (input/ledger/now → GRANT/EXTEND/REJECT/RELEASE), unit-testable.
5. **CAS / REDECISION** — estado mudou durante mutação → não repete decisão velha; re-fetch, reavaliar, aplicar só se ainda válido.
ABSORVER MECANISMOS no PR-bot/autonomia existente da Casa; NÃO criar PR Bot drop-in nem segundo control plane. `claim.py` é AGPL-3.0 → estudar mecanismo, reimplementar nossa versão, preservar proveniência (não copiar byte-identical). `pull_request_target` + SECRET + NÃO checkout PR HEAD + ler só metadata/diff = defesa válida contra roubo de secret.

## SKILLS ≠ CONHECIMENTO ≠ EXECUÇÃO (correção arquitetural CHEFE 28/08)
Ao cristalizar conhecimento técnico recorrente (ex: Vite, dependências):
- `.agents/skills/` = root canônico de **procedimento/capacidade chamável** (gate `GENERIC_KNOWLEDGE_SHOULD_NOT_BECOME_SKILL` + `SKILL_DIRECTORY_NOT_CANONICAL`).
- Conhecimento bruto passa pelo **knowledge-compiler** (`INGEST→EXTRACT→DEDUPE→CRYSTALLIZE→FLASH_READY`, `FLASH_DOES_NOT_REPLAY_FULL_INGESTION=true`) que escolhe owner, skill quando aplicável, consumer, test/gate.
- `skill-workshop` = catálogo global de capacidades/fontes (NÃO banco operacional final).
- **MCP = adapter, NÃO owner** da inteligência. NÃO colocar business logic duplicada dentro da tool MCP.
- **CASA × VPS = dois corpos, UMA capacidade canônica.** Escolha por TARGET_REAL (Casa=leve/local, VPS=pesado/remoto). NÃO rodar nos dois por ritual.
- **DEPENDENCY KNOWLEDGE != DEPENDENCY EXECUTION:** conhecer Vite não instala Vite; lockfile não prova instalação; instalação não prova funcionamento. MANIFEST≠LOCKED≠INSTALLED≠WORKING.
- **NÃO criar**: ViteDominator, DependencyEngine paralelo, segundo catálogo, V2/V3, router novo. Dogfood Vite começa com DETECÇÃO (versão no package.json/lockfile do alvo), nunca hardcode (Hub hoje `vite ^7.3.5`, Bolt/source differente — muda por alvo).
- **Drift prioritário antes de tool nova**: medir `apps/modulos/mcp/src/tools/skills/skill.js` (skills/ vs .agents/skills/), achar consumidores vivos, classificar CURRENT/LEGACY_ACTIVE/LEGACY_DEAD/COMPATIBILITY/UNKNOWN. CODE_FOUND != RUNTIME_ACTIVE.
Quando CHEFE quer transformar múltiplas janelas/terminais em braços de UMA missão:
- Owner existente: `kimetsu-legacy-operational-method` (leitores paralelos + ONE_WRITER + fixed point) + Hermes Core (multi-session BFF :8787 `/api/sessions`) + SOUL.md. NÃO criar Enxame Ômega V2/router/segundo orquestrador.
- Mapa T0..TN estável por T-ID (hash de workspace+engine, NÃO PID). T0=SOL_ORCHESTRATOR (Hermes perfil pivete).
- Registro runtime compartilhado: `E:\CentralDark\Pivete\ENXAME-OMEGA-REGISTRO.jsonl` (append-only).
- Script de rendezvous: `E:\\CentralDark\\Pivete\\scripts\\enxame-omega-rendezvous.mjs` (normalize→dedupe→contradição→teste→snapshot→ONE_WRITER). Ver `references/enxame-omega-multiventana.md`.
- **Multi-window orchestration como padrão reutilizável:** quando transformar múltiplas janelas/terminais em braços de UMA missão, usar `references/centraldark-multiwindow-orchestration.md` (T0=Hermes=SOL_ORCHESTRATOR, T1..TN=Claude/Codex/outros, registry compartilhado, cross-window rendezvous, fixed point). NÃO inverter dono: Claude é braço, Hermes é T0. NÃO criar Enxame Ômega V2/router/segundo orquestrador; estender owner existente (`kimetsu-legacy-operational-method` + Hermes Core + `hermes-multi-profile-orchestration`).
- VS Code vivo: `storage.json` em `AppData/Roaming/Code/` tem `backupWorkspaces.workspaces[]` (IDs + configURIPath, inclui `vscode-remote://ssh-remote+...+root/CentralDark` = braço VPS). `code` CLI no PATH.
- NUNCA matar sessão STALLED; marcar STALLED e excluir daquele rendezvous.

## META_LUPA COMO ORGANISMO (síntese CHEFE 28/08, mapa aprovado)
A MetaLupa NÃO é só juíza — ela se auto-melhora com o rastro de TODA passagem.
Regra que trava: "Quem toca na MetaLupa deixa rastro → rastro vira delta → delta
testado → delta que sobrevive melhora a MetaLupa → MetaLupa melhor julga a próxima".
- Ciclo: META_LUPA → META_IMPROVER (melhora executor) → HYPER_META (melhora o
  mecanismo que melhora) → EXPERIMENTO A/B → SELF_VERIFICATION → CONTRAPROVA →
  REALITY JUDGE → PROMOTE | ROLLBACK.
- **NUNCA MetaLupa V2**: `META_LUPA_OLD + DELTA_PROVADO = META_LUPA_ATUAL`.
- "Suga" = OBSERVABLE_KNOWLEDGE_HARVEST: todo modelo (Claude/Codex/Hermes/Gemini/
  futuro) deixa rastro observável (MODEL|ENGINE|CAP_USED|MISSION_ID|EVIDENCE|ERROR|
  UNKNOWN|CONTRADICTION|LATENCY|TEST|COUNTERPROOF) → MetaLupa extrai delta útil →
  compara com histórico/outros modelos → APRENDIZADO_CANDIDATO.
- **Fixed Point é da MISSÃO, NÃO da MetaLupa**: `META_LUPA_FINAL=false`,
  `META_LUPA_EVOLUTION=EVENT_DRIVEN`. Cada missão fechada produz mais alimento
  (receipts→erros→acertos→contradições→rotas→modelos→harvest→self-improvement→
  próxima missão→MetaLupa melhor).
- Estado medido 28/08: repo CentralDark tem **0 hits** p/ META_IMPROVER|HYPER_META|
  knowledge_curator|HARVEST|self.improve — tá no papel, não no código. Peças-irmãs
  JÁ cobrem ~70% (RECEIPTS + auto-destilador + meta-lupa + Enxame Ômega). Buraco real:
  HYPER_META_IMPROVER como LOOP CONCRETO. Ver `references/meta-lupa-self-improvement-loop.md`.
- Ao cristalizar: DOC em docs/CONSCIENCIA/ARQUITETURA/ (reuse, ZERO skill nova,
  respeita #722 — sem router/segundo cérebro). NÃO promover conversa crua como ouro.