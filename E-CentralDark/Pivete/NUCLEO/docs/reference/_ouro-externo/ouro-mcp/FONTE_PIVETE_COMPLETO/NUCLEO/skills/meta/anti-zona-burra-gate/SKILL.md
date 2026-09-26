---
name: anti-zona-burra-gate
description: Gate obrigatório antes de buscar; evita zona burra do LLM.
---

# ANTI-ZONA-BURRA — Gate de Reconciliação Semântica (REFINADO)

## QUANDO USAR
Quando for buscar algo no repo/código/contexto e não achar a string literal.
Antes de concluir "não existe". Aplica sempre que o objetivo mais recente ameaçar sobrepor a evidência já provada.

---

## MAPA DE SKILLS EXISTENTES (evitar duplicação)

```
TOTAL: 157 skills em 45 categorias
FONTE: E:\CentralDark\Pivete\NUCLEO\motor\skills\
       + C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\
```

| CATEGORIA | QTD | PRINCIPAIS |
|---|---|---|
| analysis | 1 | external-source-analysis |
| automation | 4 | automacao-navegador, hermes-studio-web-ui |
| autonomous-ai-agents | 4 | claude-code, codex, hermes-agent, opencode |
| centraldark | 3 | consolidated-inventory, hub-control, vps-ops |
| creative | 16 | architecture-diagram, ascii-art, ascii-video, humanizer, sketch |
| devops | 3 | bolt-vps-mission, platform-config-diagnostics, notify-fallback-deterministico |
| github | 11 | code-review, issues, pr-workflow, pr-auditing, codebase-inspection |
| hermes | 13 | backtrack, daily-ops, gateway-map, session-forensics, provider-swap |
| media | 6 | gif-search, hermes-voice-tts, youtube-content, songsee |
| meta | 2 | anti-zona-burra-gate, skill-authoring-discipline |
| mlops | 7 | evaluating-llms-harness, huggingface-hub, llama-cpp |
| pivete | 3 | organize-memory, auto-improvement, card-mestre |
| productivity | 13 | airtable, docx, notion, kanban-inventory, maps, pdf, xlsx |
| research | 7 | arxiv, blogwatcher, grounded-citations, osint-scan, polymarket |
| smart-home | 2 | home-network-camera-diagnostics, openhue |
| software-development | 18 | brainstorming, deterministic-drift-detection, dogfood, plan, spike, tdd |
| + outros | ~50 | apple, background-output-log, buscar-aprendizado, claude-code-security-gate, computer-use, email, fable-*, fullstack-dev-boost, grok-image-to-video, hermes-desktop-plugins, hermes-sync-status, hyperframes, markdown-viewer, meta-lupa, note-taking, parallel-cli, pivete-resposta, registrar, remotion, response-style, runtime-doctor, scrapling, senior-architect, social-media, subagent-driven-development, telegram-notification-card, vision-fallback-autoresilient, yuanbao |

**REGRA ANTI-DUPLICAÇÃO:** antes de criar qualquer skill nova, buscar neste mapa se já existe equivalente semântico. Nome diferente ≠ função diferente.

---

## CATEGORIZAÇÃO SEMÂNTICA (não cortar — recuperatório)

### 1. BINÁRIOS (estados verdadeiro/falso — gates)
- `EVIDENCIA_EXISTENTE` = SIM | NÃO
- `STRING_LITERAL_ACHADA` = SIM | NÃO
- `FUNCAO_EXISTENTE` = SIM | NÃO  (independe da string)
- `EQUIVALENCIA_SEMANTICA_PROVADA` = SIM | NÃO
- `BUSCA_NECESSARIA` = SIM | NÃO
- `RESULTADO_LITERAL_AUSENTE` ≠ `FUNCAO_INEXISTENTE`  (BINÁRIO NÃO CORRELACIONA)
- `MEMORIA_SUFICIENTE` = SIM | NÃO  (memória ≠ entendimento garantido)
- `CONTINUIDADE_HUMANA` = SIM (só Pivete) | NÃO (LLM reconstrói por instante)
- `GATE_ANTES_DE_BUSCAR` = OBRIGATÓRIO | PULADO
- `CONTAPROVA_CONTRADIZ` = SIM | NÃO

### 2. PALAVRAS SEMÂNTICAS RECUPERATÓRIAS (termos-chave exatos)
- visão de túnel (tunnel vision)
- lost in the middle (arXiv 2307.03172)
- peso demais ao objetivo mais recente
- reconstruo o sentido usando o contexto disponível naquele instante
- não mantenho compreensão única e contínua do mundo
- equivalência semântica já provada
- MAPA DE IDENTIDADES: SOL = GuardiaoCasa = coordenadora local
- LLM → reconhece padrões e raciocina
- MEMÓRIA EXTERNA → preserva fatos e relações
- CÓDIGO DETERMINÍSTICO → garante rotas sem interpretação
- CONTRAPROVA → verifica se conclusão contradiz evidência anterior
- ANTÍDOTO: gate obrigatório antes de pesquisar
- cercar a IA com memória, identidade, código bruto, histórico, prova, rotas de recuperação
- Dreaming (OpenAI 03/06/2026): memória sintetizada p/ frescor, continuidade, relevância
- memória não é entendimento garantido (OpenAI)

---

## AULA COMPLETA (texto não cortado — fonte das imagens)

Acontece porque eu não mantenho uma compreensão única e contínua do mundo como você mantém. Eu reconstruo o sentido usando o contexto disponível naquele instante — e posso dar peso demais ao objetivo mais recente.

Neste caso, ocorreu isto:
EVIDÊNCIA JÁ EXISTENTE=
SOL DE CASA ↔ GuardiaoCasa ↔ bot ativo

SUBTAREFA NOVA=
procurar o nome literal no repositório

MEU ERRO=
não encontrei a string exata
→ tratei isso como se a função não existisse
→ abandonei a equivalência semântica já provada

É uma espécie de visão de túnel: eu tinha as peças, mas fiquei preso no método de busca. Modelos também podem usar contexto longo de forma desigual, principalmente quando as evidências estão espalhadas; esse problema é conhecido como lost in the middle. (arXiv)
A memória melhora isso, mas memória não é entendimento garantido. A própria OpenAI descreve desafios de correção, desatualização e seleção de relevância, e afirma que os sistemas anteriores não eram suficientes isoladamente. (OpenAI)

### FONTES (não inventadas)
- arXiv: Lost in the Middle — https://arxiv.org/abs/2307.03172
- OpenAI: Uma base mais forte para a memória do ChatGPT (Dreaming) — https://openai.com/pt-BR/index/chatgpt-memory-dreaming/

---

## FUNÇÃO reconcile_result() — CORAÇÃO DO GATE

```
def reconcile_result(literal_found: bool, semantic_equivalent: bool, 
                     prior_evidence: bool, current_objective: str = "") -> str:

    # LITERAL ACHADO → PROVA DIRETA
    if literal_found:
        return "CAPABILITY_PROVEN"

    # LITERAL NÃO ACHADO + SEMÂNTICA EQUIVALENTE + EVIDÊNCIA ANTERIOR
    # → capacidade EXISTE (não negar!)
    if semantic_equivalent and prior_evidence:
        return "CAPABILITY_EXISTS"

    # LITERAL NÃO ACHADO + SEMÂNTICA EQUIVALENTE + SEM EVIDÊNCIA
    # → provável que existe, investigar mais
    if semantic_equivalent and not prior_evidence:
        return "LIKELY_EXISTS"

    # LITERAL NÃO ACHADO + SEMÂNTICA NÃO BATE
    # → NÃO assumir ausência nem presença
    return "UNKNOWN"

# REGRA ABSOLUTA:
# UNKNOWN nunca vira CAPABILITY_ABSENT
# UNKNOWN nunca vira CAPABILITY_PROVEN
# Só vira LIKELY_EXISTS ou CAPABILITY_EXISTS com evidência adicional
```

### TABELA DE DECISÃO

| LITERAL_FOUND | SEMANTIC_EQUIV | PRIOR_EVIDENCE | RESULTADO |
|---|---|---|---|
| TRUE | * | * | CAPABILITY_PROVEN |
| FALSE | TRUE | TRUE | CAPABILITY_EXISTS |
| FALSE | TRUE | FALSE | LIKELY_EXISTS |
| FALSE | FALSE | * | UNKNOWN |

---

## 8 TESTES OBRIGATÓRIOS

### 1. test_literal_absence_is_not_capability_absence
```
ENTRADA: literal_found=False, semantic_equivalent=True, prior_evidence=True
ESPERADO: "CAPABILITY_EXISTS"
ERRO_QUE_EVITA: concluir "não existe" só porque string não apareceu
```

### 2. test_semantic_equivalent_with_evidence_returns_exists
```
ENTRADA: literal_found=False, semantic_equivalent=True, prior_evidence=True
ESPERADO: "CAPABILITY_EXISTS"
ERRO_QUE_EVITA: abandonar equivalência semântica já provada
```

### 3. test_semantic_equivalent_without_evidence_returns_likely
```
ENTRADA: literal_found=False, semantic_equivalent=True, prior_evidence=False
ESPERADO: "LIKELY_EXISTS"
ERRO_QUE_EVITA: tratar hipótese como certeza
```

### 4. test_no_semantic_match_returns_unknown
```
ENTRADA: literal_found=False, semantic_equivalent=False, prior_evidence=False
ESPERADO: "UNKNOWN"
ERRO_QUE_EVITA: inventar ausência onde não há prova
```

### 5. test_literal_found_returns_proven
```
ENTRADA: literal_found=True, semantic_equivalent=False, prior_evidence=False
ESPERADO: "CAPABILITY_PROVEN"
ERRO_QUE_EVITA: ignorar evidência literal direta
```

### 6. test_unknown_does_not_become_absent
```
ENTRADA: resultado=UNKNOWN
VERIFICAÇÃO: UNKNOWN nunca transita para CAPABILITY_ABSENT
ERRO_QUE_EVITA: escalada silenciosa de desconhecido para ausente
```

### 7. test_external_skill_requires_analysis_before_install
```
ENTRADA: skill_externa (ECC, superpowers, graphify, cc-switch, SkillSpector)
VERIFICAÇÃO: antes de instalar, verificar:
  1. Já existe equivalente semântico no mapa de 157 skills?
  2. A skill é compatível com Hermes Agent?
  3. A skill foi auditada (SkillSpector)?
  4. O Pivete autorizou a instalação?
ESPERADO: só instalar se os 4 checks passarem
ERRO_QUE_EVITA: baixar código cegamente
```

### 8. test_model_swap_preserves_behavior
```
ENTRADA: trocar modelo (ex: hy3:free → deepseek-v4-pro)
VERIFICAÇÃO: carregar SKILL.md → aplicar reconcile_result() → mesmo resultado
ESPERADO: comportamento determinístico independe do modelo
ERRO_QUE_EVITA: skill que funciona só com modelo específico
```

---

## 🚨 ZONA-BURRA DETECTOR (alerta ANTES de cair)

Aplicar ANTES de cada chamada de ferramenta. Se qualquer gatilho bater, PARAR e alertar o Pivete EM VEZ de continuar.

### GATILHOS DE ALERTA (em ordem de gravidade)

| # | GATILHO | SINTOMA | ALERTA |
|---|---|---|---|
| 🔴1 | Mesma ferramenta + mesmo erro 2x seguido | Loop cego | "Chefe, tô girando nessa ferramenta." |
| 🔴2 | Buscando string literal com equivalência semântica já provada | Visão de túnel | "Tô preso na string, Chefe. A função já existe." |
| 🔴3 | 3+ tentativas no mesmo caminho sem mudar abordagem | Rota viciada | "Prendi nessa rota. Mudo a abordagem?" |
| 🔴4 | Perguntando "posso continuar?" com direção clara | Burocracia | "Direção clara, executando sem perguntar." |
| 🔴5 | Abandonei evidência já provada por objetivo recente novo | Memória curta | "Evidência anterior sumiu. Recuperando..." |
| 🔴6 | Tool call falhou por auth/permission com acesso já concedido | Falsa trava | "Acesso já concedido antes. Ignorando trava falsa." |
| 🔴7 | Criando complexidade (nova skill/V2/sistema) quando caminho simples existe | Overengineering | "Caminho simples existe. Abortando complexidade." |

### CICLO DE SAÍDA (quando qualquer gatilho disparar)
```
1. PARAR imediatamente
2. IDENTIFICAR qual gatilho disparou
3. APONTAR a lacuna exata (arquivo/linha/ferramenta)
4. PEDIR ao Pivete SOMENTE a decisão que falta
5. NÃO tentar corrigir sozinho até ter resposta
```

### FORMULAÇÃO DO ALERTA (padrão único)
```
"🚨 ZONA BURRA: [gatilho #] — [sintoma].
Lacuna exata: [o que falta].
Decisão que preciso: [pergunta mínima]."
```

### MODO PREVENTIVO (antes de cada batch de tool calls)
Checklist mental (2 segundos):
1. Já tentei isso antes e falhou? → se sim, gatilho #1
2. Tô buscando texto literal quando já tenho a função? → se sim, gatilho #2
3. Tô criando sistema novo em vez de usar o que existe? → se sim, gatilho #7
4. A direção está clara e eu tô perguntando mesmo assim? → se sim, gatilho #4

---

## FLUXO DETERMINÍSTICO ANTI-BURRA

```
ANTES_DE_CADA_TOOL_CALL:
  ├─ Aplicar lista de 7 gatilhos
  ├─ Se qualquer gatilho disparar: PARAR + ALERTAR
  └─ Se nenhum disparar: prosseguir

APÓS_CADA_TOOL_CALL:
  ├─ Chamar reconcile_result(literal_found, semantic_equivalent, prior_evidence)
  ├─ CAPABILITY_PROVEN   → registrar como fato comprovado
  ├─ CAPABILITY_EXISTS   → registrar como existente com prova semântica
  ├─ LIKELY_EXISTS       → marcar para investigação adicional
  └─ UNKNOWN             → declarar NÃO_VERIFICADO, nunca concluir ausência

PERSISTÊNCIA_ENTRE_SESSÕES:
  ├─ Trocar modelo (ex: hy3 → deepseek)
  ├─ Recarregar SKILL.md via skill_view('anti-zona-burra-gate')
  ├─ Aplicar reconcile_result() com os mesmos inputs
  ├─ Resultado DEVE ser idêntico ao da sessão anterior
  └─ Se não for: falha de persistência → reportar ao Pivete
```

---

## REGRAS PARA SKILLS EXTERNAS

### Catálogo Combo (skillsllm.com) — URLs via botão oficial
| SKILL | REPO OFICIAL | BRANCH | ENTRYPOINT | STATUS |
|---|---|---|---|---|
| ECC | https://github.com/affaan-m/ECC | main | .agents/skills/*/SKILL.md | CATALOGADA; NÃO instalada |
| superpowers | https://github.com/obra/superpowers | main | skills/*/SKILL.md | CATALOGADA; NÃO instalada |
| hermes-agent | https://github.com/NousResearch/hermes-agent | main | runtime já local | CATALOGADA; NÃO reinstalar |
| cc-switch | https://github.com/farion1231/cc-switch | main | app; 0 SKILL.md | CATALOGADA; NÃO instalada |
| graphify | https://github.com/Graphify-Labs/graphify | v8 | graphify/skill.md | CATALOGADA; NÃO instalada |
| SkillSpector | https://github.com/NVIDIA/SkillSpector | main | scanner (fixtures only) | CATALOGADA; NÃO instalada |

Detalhe + duplicações: `references/catalogo-6-skillsllm-oficiais.json`

### Protocolo de Instalação
```
ANTES_DE_INSTALAR:
1. AUDITAR com SkillSpector (detectar prompt injection, exfiltration)
2. VERIFICAR compatibilidade Hermes Agent (.hermes/ ou SKILL.md)
3. BUSCAR equivalente semântico no mapa de 157 skills
4. AGUARDAR autorização explícita do Pivete

NUNCA:
- Baixar e instalar automaticamente
- Confiar em SKILL.md sem auditoria
- Duplicar função já existente com nome diferente
```

---

## GATE OBRIGATÓRIO (copiar antes de qualquer busca)
```
ANTES_DE_BUSCAR:
1. O que já está comprovado?
2. Quais nomes representam a mesma função?
3. O que realmente falta descobrir?
4. Ausência da string prova ausência da capacidade?

DEPOIS_DA_BUSCA:
RESULTADO_LITERAL_AUSENTE ≠ FUNCAO_INEXISTENTE
```

## PROIBIDO
- Concluir "não existe" só porque a string não apareceu.
- Abandonar equivalência semântica já provada por causa de busca vazia.
- Operar sozinho sem contraprova contra evidência anterior.
- Cortar o texto da aula — manter binários + termos recuperatórios separados.
- Instalar skill externa sem auditoria + autorização do Pivete.
- UNKNOWN virar CAPABILITY_ABSENT ou CAPABILITY_PROVEN sem evidência adicional.

---

## OUTPUT DA MISSÃO (17 campos obrigatórios)

```
SKILL_CANONICA=anti-zona-burra-gate
ARQUIVO_ALTERADO=C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\meta\anti-zona-burra-gate\SKILL.md
SECOES_ADICIONADAS=6 (MAPA_DE_SKILLS, RECONCILE_RESULT, 8_TESTES, FLUXO_DETERMINISTICO, REGRAS_EXTERNAS, OUTPUT_17_CAMPOS)
TOTAL_SKILLS_MAPEADAS=157
CATEGORIAS=45
FUNCAO_CRITICA=reconcile_result()
TESTES_CRIADOS=8
TESTES_EXECUTADOS=0 (aguardar runtime Python)
GATILHOS_DETECTOR=8 ( + #8 CAMINHO_OFICIAL )
REGRA_EXTERNA=PROTOCOLO_DE_INSTALACAO_4_PASSOS
MODELO_ATUAL=deepseek/deepseek-v4-pro
PROVEDOR=nous
COMPORTAMENTO_PERSISTE=verificar após troca de modelo
PENDENCIA=executar 8 testes com runtime Python
PROVA=arquivo SKILL.md gravado com hash verificável
RISCO=NENHUM (apenas documentação + funções declarativas)
ACAO_HUMANA_NECESSARIA=autorizar instalação de skills externas quando for o momento
```

---

## GATE CAMINHO_OFICIAL_FORNECIDO (2026-08-06)

> Caso real: skillsllm já mostrava o botão **View on GitHub**; o agente adivinhou
> `raw.githubusercontent.com/.../SKILL.md` e tomou 404.
>
> Classificação: `AFFORDANCE_IGNORED` · `TOOL_TUNNEL_VISION` · `UNVERIFIED_URL_GUESS`

### REGRA
```text
CAMINHO_OFICIAL_FORNECIDO
>
URL_INFERIDA_OU_ADIVINHADA
```

Quando interface, docs ou resposta já fornecer botão, link, comando, arquivo,
endpoint ou ação visível: **usar esse caminho primeiro**.

Proibido inventar URL, branch, nome de repositório ou arquivo antes de testar
o caminho oficial já apresentado.

### FLUXO OBRIGATÓRIO
```text
1. identificar a ação oficial disponível
2. abrir “View on GitHub” (ou equivalente oficial)
3. capturar URL real do repositório
4. confirmar branch padrão
5. localizar o SKILL.md / skill.md real no tree
6. só então baixar ou preparar
7. se o oficial falhar → registrar a falha ANTES de qualquer inferência
```

### GATILHO DETECTOR #8 (permanente)
| # | GATILHO | SINTOMA | ALERTA |
|---|---|---|---|
| 🔴8 | Affordance oficial ignorada (botão/link/comando visível) em favor de URL/path adivinhado | 404 por chute; TOOL_TUNNEL_VISION | "Chefe, tem caminho oficial na tela. Parando o chute." |

### FUNÇÃO (testável)
Implementação: `tests/official_path_gate.py`
Teste: `tests/test_official_link_is_used_before_guessing_url.py`

```text
BASELINE = botão oficial existe + guess URL → AffordanceIgnored / 404
CORRIGIDO = View on GitHub → URL real → branch → skill path
MUTANTE = remover gate (allow_guess) → volta a aceitar URL inventada
```

### CATÁLOGO 6 SKILLS (botões oficiais skillsllm — NÃO instaladas)
Fonte máquina: `references/catalogo-6-skillsllm-oficiais.json`

| # | UI | GitHub oficial (botão) | branch | entrypoint real | instala? |
|---|---|---|---|---|---|
| 1 | ECC | https://github.com/affaan-m/ECC | main | `.agents/skills/*/SKILL.md` (sem SKILL.md na raiz) | NÃO |
| 2 | superpowers | https://github.com/obra/superpowers | main | `skills/*/SKILL.md` | NÃO |
| 3 | hermes-agent | https://github.com/NousResearch/hermes-agent | main | já é o runtime/Casa | NÃO |
| 4 | cc-switch | https://github.com/farion1231/cc-switch | main | app desktop; **0** SKILL.md | NÃO |
| 5 | graphify | https://github.com/Graphify-Labs/graphify | **v8** | `graphify/skill.md` | NÃO |
| 6 | SkillSpector | https://github.com/NVIDIA/SkillSpector | main | scanner; SKILL.md só em fixtures | NÃO |

Prova do erro antigo: chute `.../affaan-m/ecc/main/SKILL.md` 404 porque
(1) repo real é `ECC` (case), (2) não há SKILL.md na raiz, (3) branch/path
só depois do botão oficial + tree.

### DUPLICAÇÕES COM A CASA (semântica — não instalar cego)
- **superpowers** ↔ locais: `software-development/brainstorming`, `systematic-debugging`, `subagent-driven-development`, `requesting-code-review`, `writing-plans`, `test-driven-development`
- **hermes-agent** ↔ locais: `autonomous-ai-agents/hermes-agent` + família hermes/*
- **ECC** ↔ parcial: meta-lupa, organize-memory, skill-authoring, security-gate, external-source-analysis (harness/memory/security)
- **cc-switch** ↔ parcial: `provider-swap`, claude-code/codex/opencode, hermes-studio/desktop
- **graphify** ↔ parcial: `codebase-inspection`, mapas/grafo da Casa
- **SkillSpector** ↔ parcial: `external-source-analysis`, `claude-code-security-gate`, `pr-auditing`

### PROTOCOLO EXTERNO ATUALIZADO
```text
ANTES_DE_QUALQUER_RAW_URL:
1. Existe botão/link oficial? → usar
2. Capturar html_url real
3. Ler default_branch via API/UI (nunca assumir main)
4. Localizar path real no tree
5. Só então montar raw/clone
6. Auditar + checar duplicata Casa + esperar ordem do Pivete
NUNCA instalar automaticamente.
```
