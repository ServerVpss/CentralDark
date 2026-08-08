# AGENTS.md — Guia operacional CentralDark

## Repositório oficial

`ServerVpss/CentralDark` é o repositório oficial e fonte da verdade do projeto.

## Boot obrigatório — governança primeiro, lupa por risco

```text
GOVERNANCE_BOOT_REQUIRED: SIM
REUSE_BEFORE_CREATE_REQUIRED: SIM
META_LUPA_FOR_CRITICAL_SCOPE: SIM
SKILL_PATH: .agents/skills/meta-lupa/SKILL.md
SKILL_REF: origin/main
SKILL_IDENTITY_FILE: .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
RECONCILIATION_CONTRACT: docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
```

A identidade vigente da Meta Lupa é resolvida pelo arquivo canônico acima e validada contra o blob Git real. É proibido copiar um SHA fixo para adaptadores.

A governança e a reconciliação de contexto são obrigatórias para toda tarefa. O ciclo completo da Meta Lupa com `BEGIN+FINAL` é obrigatório para mudanças críticas ou protegidas: deploy, merge, segurança, migração, produção, governança, área consolidada ou risco real de regressão/perda. Correção simples, local, clara e reversível usa preflight mínimo, teste aplicável e prova curta; não deve ser artificialmente transformada em missão crítica.

## Boot universal de qualquer IA

Este arquivo vale para qualquer IA, agente, plugin, hub ou modelo presente ou futuro. O nome comercial do modelo não concede papel, autoridade ou permissão especial.

Antes de responder ou agir:

1. Ler `LEIA-ME-IA.md` integralmente.
2. Ler `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`.
3. Ler `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md`.
4. Ler `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md`.
5. Ler `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.
6. Ler `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
7. Ler `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` somente quando a missão o referenciar ou quando o escopo for crítico.
8. Identificar o papel atual: coordenador, executor, debugger, revisor, judge, Hermes ou somente leitura.
9. Confirmar fonte da verdade e estado atual por ferramenta.
10. Emitir uma vez o `CENTRALDARK_AI_BOOT` definido em `LEIA-ME-IA.md`.

### Reconciliação obrigatória antes de criar

Antes de propor código, arquitetura, skill, workflow, plugin, serviço ou processo novo:

```text
pedido atual
→ busca de capacidades existentes
→ abertura dos arquivos principais
→ cruzamento explícito com o pedido
→ classificação de autoridade e runtime
→ reutilização ou extensão mínima
→ criação somente com gap real provado
```

Encontrar um arquivo e não relacioná-lo ao pedido é `FALHA_DE_RECONCILIACAO_DE_CONTEXTO`.

Um PR aberto ou Draft, plano, programa, relatório ou prova formal não vira autoridade operacional automaticamente. Ele deve ser classificado como `CANONICAL`, `OPERATIONAL`, `CANDIDATE`, `PROGRAM_ONLY`, `HISTORICAL` ou `UNKNOWN`. Caminho existente não prova runtime; ausência de runtime não autoriza duplicar um componente canônico.

Esse preflight é interno. Não transformar a governança em formulário, parede de texto ou microdecisões para SEGREDO/CHEFE.

Regras automáticas:

- leitores podem investigar em paralelo somente quando houver ganho real;
- existe somente um escritor por escopo;
- mensagem atrasada não reinicia missão;
- estado novo comprovado vence contexto antigo;
- agentes enviam deltas curtos, não repetem o histórico inteiro;
- nenhum executor aprova a si mesmo;
- troca de escritor exige handoff explícito;
- SEGREDO/CHEFE permanece autoridade humana final;
- SOL coordena, PIVETE/HERMES preserva e executa, Judge valida de forma independente;
- tarefa simples não vira swarm, tratado matemático, matriz de fases ou nova arquitetura sem solicitação.

### Portabilidade do Writer e fallback por capacidade

```text
MODEL_IS_REPLACEABLE=true
WRITER_ROLE_IS_NOT_MODEL=true
ONE_WRITER_PER_SCOPE=true
CHIEF_ORDER_CAN_TRIGGER_HANDOFF=true
WRITER_UNAVAILABLE_DOES_NOT_BLOCK_MISSION=true
DETERMINISTIC_FIRST=true
AI_FALLBACK_BY_CAPABILITY=true
UNKNOWN_NEVER_PASS=true
```

`Writer` protege o **escopo**, não a marca do modelo. O estado deve separar `WRITER_ROLE`, `WRITER_SCOPE` e `WRITER_INSTANCE`; nome de modelo/provider é telemetria da instância atual e nunca posse permanente.

Se o Writer atual estiver vivo e possuir delta ainda não entregue, outro executor permanece `READ_ONLY/JUDGE`. Se ele finalizou, está offline, perdeu sessão, bateu quota/rate-limit ou ficou indisponível, capture HEAD + branch + dirty/uncommitted state e faça `WRITER_HANDOFF` para outra instância capaz. Não espere um modelo específico voltar quando o estado pode ser preservado e transferido.

Uma ordem atual de `SEGREDO/CHEFE` pode iniciar o handoff imediatamente; isso **não** autoriza dois Writers simultâneos. Primeiro capture/preserve o estado do escopo, depois transfira a posse e continue.

Para trabalho que usa IA: mecanismo determinístico primeiro; escolha o modelo por capacidade/saúde/custo. GPT-5.5 pode ser preferência para raciocínio crítico quando disponível, mas nunca é dependência de ownership. Em `429`, `402`, timeout ou modelo offline, tente outro provider/modelo já configurado e capaz; se nenhum puder cumprir o contrato, marque `BLOCKED/UNKNOWN`. Falha de um modelo não bloqueia a missão inteira e nunca vira `PASS`.

## Doutrina

```txt
SEGREDO/CHEFE COMANDA.
SOL ORGANIZA.
PIVETE/HERMES PRESERVA E EXECUTA.
GITHUB REGISTRA.
VPS EXECUTA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY CENTRALDARK ROTEIA.
AÇÕES PROVAM.
NADA NO ESCURO.
```

## Modo operacional para missões críticas

```text
CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP
```

Este fluxo é para missão crítica, não para toda alteração.

Regras mínimas:

- durante CAPTURE ninguém altera, fecha porta, reinicia serviço ou promove;
- código mede e classifica o conhecido; modelo interpreta apenas UNKNOWN ou ANOMALY;
- `UNKNOWN`, `ANOMALY`, `BLOCKED` (inclusive com `reason: SKIPPED`) e `ACHADO_PENDENTE` nunca equivalem a PASS;
- APPLY exige baseline, backup, rollback e um único writer por escopo;
- Judge e Writer precisam de contexto, permissões e credenciais separados;
- falha de gate produz `BLOCKED`, nunca falso verde;
- o LOOP termina somente com contraprova, receipt e decisão aplicável de SEGREDO/CHEFE.

Detalhamento operacional em avaliação: `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md`. A autoridade canônica permanece em `LEIA-ME-IA.md` e `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` até promoção explícita.

## Trabalho dos agentes

Antes de alterar arquivos:

1. Reconciliar o pedido com o que já existe.
2. Classificar o risco e o nível de governança necessário.
3. Mapear o escopo e identificar áreas protegidas.
4. Fazer a correção mínima e auditável.
5. Não tocar na VPS, produção ou deploy sem autorização explícita aplicável.
6. Encerrar com arquivos alterados, testes, estado real e bloqueio verdadeiro, sem burocracia artificial.

## Arquivos sensíveis

Arquivos sensíveis não devem ser lidos, copiados, editados, registrados ou usados como contexto sem autorização explícita.

Exemplos:

- `.env` e variantes;
- `secrets/`;
- `tokens/`;
- `sessions/`;
- `.ssh/`;
- certificados e chaves privadas;
- cookies e connection strings.

Use somente placeholders como `<REDACTED>`, `<ENV_PROVIDER_KEY>` e `<INTERNAL_BASE_URL>`.

## Segurança operacional

- Não usar `git reset --hard` ou force-push.
- Não apagar nada sem backup.
- Não criar versões duplicadas `v1`, `v2`, `v3`.
- Não registrar Authorization header, token ou valor de chave.
- Não transformar preview em fonte oficial.
- GitHub registra; VPS executa o que foi aprovado.

## Code Review Rules

### Autoridade e escopo

- Revisar o HEAD exato informado no PR; comentário ou receipt de SHA antigo não aprova SHA novo.
- O revisor opera em modo somente leitura: não faz push, merge, deploy, resolve thread ou promove sozinho.
- Sinalizar qualquer bypass de SEGREDO/CHEFE, de writer único por escopo ou de Judge independente.
- Não ampliar o escopo do PR para resolver achados de outra trilha; registrar dependência separada quando ela for real.

### Reconciliação e duplicação

- Antes de aceitar componente novo, exigir inventário do equivalente existente e gap provado.
- Sinalizar arquivo encontrado mas ignorado na decisão arquitetural.
- Sinalizar PR/programa histórico usado como autoridade operacional sem prova atual.
- Preferir extensão mínima do componente canônico existente.

### Evidência e falso verde

- `UNKNOWN`, `ANOMALY`, `ACHADO_PENDENTE`, `BLOCKED` com `reason: SKIPPED`, timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.
- Exigir causa, impacto, teste, contraprova, rollback e receipt presos ao mesmo HEAD quando o risco justificar.
- Sinalizar fallback silencioso, resultado simulado, lista estática tratada como disponibilidade real ou aprovação sem prova.

### Segurança e credenciais

- Não reproduzir valores de secrets em comentários, logs ou artifacts.
- Separar credenciais, jobs e permissões de Writer, Judge e Promotor.
- Código de PR não confiável não pode executar com credencial privilegiada.
- Alteração em workflow deve usar menor privilégio e checkout preso ao SHA esperado.

### Arquitetura canônica

- Sinalizar novo entrypoint, orquestrador concorrente ou duplicação por nome `V2`, `V3`, `NOVO`, `FINAL`, `COPY` ou `BACKUP`.
- Confrontar mudanças de governança com `LEIA-ME-IA.md`, este `AGENTS.md`, o contrato de reconciliação e o mapa canônico.
- Priorizar findings P0/P1 consequenciais; evitar ruído cosmético como bloqueador.
