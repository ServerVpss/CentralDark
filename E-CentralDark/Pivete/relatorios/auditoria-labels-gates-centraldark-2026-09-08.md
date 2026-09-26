# Auditoria de labels e gates — CentralDark

Data da medição: 2026-09-08 11:16 -0300
Repositório: ServerVpss/CentralDark
Escopo: labels remotos, contratos de promoção, testes, workflows, PR #1444 e PR #1463.

## Resumo direto

O problema não é “o GPT precisa ser juiz”.

O problema real é conflito entre contratos:

1. O motor atual de promoção trata labels de agente como PROVENIÊNCIA.
2. Um teste velho na `main` ainda trata `🧠 AGENTE-CHATGPT` como requisito.
3. A skill `centraldark-pr-label` ainda declara label de agente como obrigatória.
4. O catálogo remoto mistura labels de promoção, executor, capacidade, categoria, status, histórico e labels genéricas.
5. O PR #1463 corrigiu outra ferida: regra visual não deve ficar escondida em YAML com Node inline; deve ter script reutilizável + testes + workflow chamando o script.

Conclusão: há rigidez duplicada e donos sem alinhamento. A correção certa é reduzir os contratos a classes claras, não simplesmente apagar labels.

## Evidência viva

### PR #1444

- Estado: aberto
- HEAD vivo: `81d183c1bc7ab6fdc50197347b313e70ca3a13d1`
- Título: `🧿 DOCS(GOVERNANÇA): PR-MÃE CENTRALDARK — CONVERGÊNCIA TOTAL ATÉ CENTRALDARK_TERMINADA`
- Labels: mistura labels de revisão, erro, capacidades IA, agentes, categorias, painel, infra, divergência, autoridade e checksum.
- O HEAD do PR já removeu a exigência de `🧠 AGENTE-CHATGPT` do teste corrigido.

### PR #1463

Medição viva, que vence o texto colado antigo:

- Estado: aberto
- Mergeado: não
- Mergeable: `MERGEABLE`
- HEAD vivo: `d6090d329abc2f49d3a92d44abf45ea63d624c93`
- 11 commits
- 10 arquivos alterados
- Título: `🧿 DOCS+TEST: PREANSWER GITHUB GATE · CONTINUIDADE VIVA`

O paste dizia `c894f7d...`, 7 commits e 6 arquivos. Isso é HISTÓRICO/STALE, não estado atual.

## Catálogo remoto atual

A API remota mostrou 62 labels.

### 1. Labels de promoção/autoridade

- `👑 PERMITO-SEGREDO`
- `🔄 GIT`
- `🤖 AUTO`
- `🟡 IA-PRECISA-REVISAR`
- `🟢 SUCESSO`
- `✅ PR CONFIRMADO`
- `permito-segredo`
- `SEGREDO`

Problema: há aliases de autoridade misturados com a label canônica. Isso pode gerar decisões diferentes dependendo do código que lê a label.

### 2. Labels de executor/proveniência

- `🧠 AGENTE-CHATGPT`
- `🧠 AGENTE-CLAUDE`
- `🧠 AGENTE-CODEX`
- `🧠 AGENTE-GROK`
- `🧠 AGENTE-HERMES`
- `🧠 AGENTE-JARVIS`
- `🧠 AGENTE-SENTINELA`
- `🧠 AGENTE-SUPABASE`

Essas labels devem identificar quem trouxe/escreveu a matéria. Não devem decidir autoridade, capacidade nem promoção sozinhas.

### 3. Labels de capacidade/ação

- `🤖 IA-DOCUMENTAR`
- `🤖 IA-EXECUTAR`
- `🤖 IA-FRONTEND`
- `🤖 IA-INFRA`
- `🤖 IA-PESQUISAR`
- `🤖 IA-REVISAR`
- `🤖 IA-VALIDAR`
- `🤖 AGENTIC-DEVOPS`

Essas podem representar capacidade ou função de trabalho. Precisam de consumidor claro. Não devem ser confundidas com identidade do modelo.

### 4. Labels de categoria

- `✨ MELHORIA`
- `🐞 BUG`
- `📚 DOCS`
- `🎨 FRONTEND`
- `🛠️ INFRA`
- `🔐 SEGURANÇA`
- `🟢 SUPABASE`
- `🕸️ GRAPHIFY`
- `🔧 SELF-HEAL`
- `🧭 PAINEL`

Categoria ajuda triagem, mas não deve bloquear promoção se não houver risco real ou contrato explícito que dependa dela.

### 5. Labels de estado/resultado

- `🔴 ERRO`
- `🔴 FALTA-EVIDÊNCIA`
- `🔴 PRIORIDADE-ALTA`
- `🔴 RISCO-SERVIDOR`
- `🟡 ATENÇÃO`
- `🟡 PENDÊNCIA`
- `🟡 PRIORIDADE-MÉDIA`
- `🟢 CORREÇÃO-SEGURA`
- `🟢 PRIORIDADE-BAIXA`
- `🟢 PRONTO-PARA-IA`
- `🧊 NÃO-FAZER`
- `🧊 PARADO`
- `🚫 INVÁLIDO`
- `❓ DÚVIDA`
- `🆘 AJUDA-NECESSÁRIA`

Essas são telemetria/triagem. Cor nunca deve ser tratada como prova. `PASS` exige execução, denominador, SHA e evidência.

### 6. Labels de pacote/proveniência especial

- `🕊️ POMBO-CHECKSUM OBRIGATÓRIO DE PACOTE`
- `POMBO-CORREIO COM CHECKSUM`
- `🧩 DIVERGÊNCIA`
- `♻️ DUPLICADO`
- `🌱 BOM-PARA-INICIAR`
- `🧊 PARADO`

Precisam de consumidor definido. Se não houver gate lendo, são ruído de painel e não devem bloquear PR.

### 7. Labels genéricas sem alinhamento ao seed canônico

A API mostrou também:

- `dependencies`
- `javascript`
- `python`
- `skills`
- `codex`
- `🧠 CONSCIÊNCIA`

Essas são candidatas a metadado histórico/integração GitHub, não labels operacionais de promoção. Não apagar automaticamente: primeiro classificar uso, PRs, workflows e histórico.

## Onde nasce a exigência falsa do ChatGPT

### Motor atual

Arquivo:

- https://github.com/ServerVpss/CentralDark/blob/main/scripts/github-autonomia-varredura.mjs

Pontos importantes:

- linhas 49–62: `WRITER_AGENT_LABELS` é compatibilidade de proveniência;
- linhas 97–109: `agentLabelsFromWriter()` diz que não serve para autorização;
- linhas 118–123: `requiredOperationalLabels()` exige somente selo de promoção + revisão;
- o selo atual é:
  - `👑 PERMITO-SEGREDO`
  - `🔄 GIT`
  - `🤖 AUTO`
  - `🟡 IA-PRECISA-REVISAR`

### Teste velho na base confiável

Arquivo:

- https://github.com/ServerVpss/CentralDark/blob/main/scripts/github-autonomia-varredura.test.mjs#L67

Trecho que causa a exigência:

```js
assert.ok(pending.missingLabels.includes("🧠 AGENTE-CHATGPT"));
```

Isso não significa “GPT é o juiz”. Significa que o teste antigo ainda esperava a label do agente ChatGPT.

### Skill conflitante

Arquivo local:

- `E:\CentralDark\Pivete\skills\software-development\centraldark-pr-label\SKILL.md`

Ela ainda diz:

```text
OBRIGATÓRIAS: 👑 PERMITO-SEGREDO + 🧠 AGENTE-HERMES ou agente correspondente
```

Esse é outro ponto que pode recriar o mesmo erro depois que o teste for corrigido. A skill está desalinhada com o motor atual.

### Seed de labels

Arquivo:

- `.github/workflows/bots-labels-seed.yml`

O seed contém 54 labels canônicas, mas a API viva contém 62 labels. `SUPERSEDED` aparece no seed e não apareceu no catálogo vivo; outras labels vivas não aparecem no seed.

Isso prova deriva entre:

```text
SEED_DECLARADO != CATALOGO_VIVO
```

## PR #1463 — delta útil absorvido

O paste novo trouxe uma correção importante, confirmada como linha de trabalho atual do PR:

- o contrato de título saiu do Node inline dentro do YAML;
- foi criado `scripts/ci/pr-title-contract.mjs`;
- foi criado `scripts/ci/pr-title-contract.test.mjs`;
- o workflow passa a chamar o script;
- erros ficaram nomeados:
  - `PR_TITLE_EMPTY`
  - `PR_TITLE_MISSING_EMOJI_PREFIX`
  - `PR_TITLE_EMOJI_PREFIX_NOT_CANONICAL`
  - `PR_TITLE_TEXT_EMPTY_AFTER_EMOJI`
  - `PR_TITLE_TEXT_HAS_NO_LETTERS`
  - `PR_TITLE_TEXT_NOT_UPPERCASE`

O padrão é bom e deve ser reaproveitado para labels:

```text
regra bruta reutilizável
→ teste unitário
→ workflow chamando script
→ erro nomeado
→ sugestão de correção
```

Estado do PR #1463 ainda não é Fixed Point: CI final no HEAD vivo precisa ser medido.

## Diagnóstico MetaLupa

### Risco 1 — label de agente virou autoridade

Classificação: `CONFLICTING_CONTRACT`.

- motor: agente = proveniência;
- skill antiga: agente = obrigatório;
- teste velho: ChatGPT = requisito implícito.

### Risco 2 — labels demais no PR

Classificação: `PANEL_NOISE / UNKNOWN_CONSUMER`.

Um PR com muitas labels pode parecer completo, mas nenhuma label adicional prova CI, runtime ou segurança.

### Risco 3 — status visual velho carregado como dívida atual

Classificação: `HISTORICAL_UNLESS_REPRODUCED`.

Regra correta:

```text
STATUS = origem + escopo + artefato + HEAD/SHA + timestamp + causa
```

- vermelho resolvido depois vira histórico resolvido;
- amarelo concluído não continua pendente;
- verde antigo precisa ser revalidado se HEAD mudou;
- status sem SHA ligado ao estado atual = `UNKNOWN`.

### Risco 4 — YAML bonito sem código testável

Classificação: `BASELINE_GAP`, corrigido pelo padrão do PR #1463.

Regra: contrato material deve viver em script reutilizável e teste, não só em `run:` inline.

## Plano enxuto para acabar com o quebra-pau

### Fase 1 — congelar as classes

Um único contrato deve separar:

```text
PROMOTION = autoridade + selo + intenção + rollback quando aplicável
PROVENANCE = quem escreveu/trouxe
CAPABILITY = qual função foi usada
CATEGORY = sobre o que é o PR
STATUS = como está agora
HISTORICAL = o que aconteceu antes
```

Nenhuma classe pode substituir outra.

### Fase 2 — reduzir o gate obrigatório

Obrigatório para promoção normal:

```text
👑 PERMITO-SEGREDO
🔄 GIT
🤖 AUTO
🟡 IA-PRECISA-REVISAR
```

Label de agente deve ser opcional/proveniência.

Para deploy, só adicionar os requisitos de classe `MICRO_DEPLOY` ou `DEPLOY` quando essas variáveis estiverem presentes e o escopo autorizar.

### Fase 3 — um script bruto para labels

Criar no owner existente, sem segundo motor:

```text
scripts/lupa/label-gate.mjs
```

O script deve devolver:

```text
PASS
FAIL
UNKNOWN
```

Com erros nomeados, por exemplo:

```text
LABEL_CATALOG_EMPTY
PROMOTION_LABEL_MISSING
PROVENANCE_LABEL_OPTIONAL
UNKNOWN_LABEL_CONSUMER
DUPLICATE_AUTHORITY_ALIAS
STATUS_LABEL_NOT_PROOF
```

### Fase 4 — alinhar os donos

Atualizar no mesmo delta, sem V2:

- teste velho em `main`/owner correspondente;
- skill `centraldark-pr-label` para remover obrigatoriedade de agente;
- seed e catálogo, com aliases classificados;
- workflows que ainda usam `AGENTE-CHATGPT` diretamente;
- documentação do contrato.

### Fase 5 — limpeza segura

Não apagar 62 labels de uma vez.

Para cada label:

```text
buscar uso em workflows
buscar uso em scripts
buscar uso em testes
buscar uso em PRs/issues
classificar owner/consumidor
marcar KEEP / ALIAS / HISTORICAL / DEPRECATE / UNKNOWN
```

Só remover depois de provar consumidor zero, substituto válido e ausência de necessidade histórica.

### Fase 6 — contraprova

Testes mínimos:

1. PR com label de agente diferente de ChatGPT passa no gate de promoção.
2. PR sem label de agente continua sendo avaliável.
3. PR sem `👑 PERMITO-SEGREDO` bloqueia quando autorização é exigida.
4. Label desconhecida não vira PASS silencioso.
5. Alias de autoridade não cria carta branca.
6. Status verde sem execução não passa.
7. Workflow chama script externo e o mesmo script passa localmente.
8. Teste executa no SHA que o workflow declara.

## Pendências reais

| Status | Item | Evidência |
|---|---|---|
| 🔴 | CI do PR #1444 | juiz da base ainda lê teste antigo com `AGENTE-CHATGPT` |
| 🟡 | Contrato de labels | motor e skill `centraldark-pr-label` divergem |
| 🟡 | Seed vs catálogo | 54 labels no seed, 62 no remoto; deriva não reconciliada |
| 🟡 | PR #1463 | aberto e mergeable; CI final no HEAD vivo ainda precisa de prova |
| 🟡 | Labels genéricas | `dependencies`, `javascript`, `python`, `skills`, `codex` sem classe operacional provada |
| 🟢 | Diagnóstico da causa | arquivo, linha e conflito encontrados |
| 🟢 | Padrão de título | PR #1463 já moveu regra para script + teste |

## Veredito

```text
GPT_IS_REQUIRED_AS_JUDGE = FALSE
AGENTE_CHATGPT_AS_OLD_TEST_REQUIREMENT = TRUE
AGENT_LABEL_AS_PROVENANCE = TRUE
CONTRACTS_CONFLICTING = TRUE
LABEL_CATALOG_DRIFT = TRUE
PR_1463_HAS_USEFUL_FIX_PATTERN = TRUE
FIXED_POINT = FALSE
```

## Próximo cursor

1. Reconciliar primeiro o contrato `centraldark-pr-label` com `github-autonomia-varredura.mjs`.
2. Revalidar o teste velho na base confiável sem executar código do PR em `pull_request_target`.
3. Classificar as 62 labels por classe e consumidor.
4. Só depois propor limpeza mínima, em um único owner/PR.
5. Rodar contraprova no mesmo HEAD e registrar receipt.

Fonte nova absorvida: `E:\CentralDark\Pivete\pastes\paste_37_111157.txt`.
Repetição descartada: regras já conhecidas de `UNKNOWN != PASS`, `ONE_WRITER`, `REUSE_BEFORE_CREATE` e `NO_V2/V3/V4`.
