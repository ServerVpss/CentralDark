---
title: "EXPANSÃO DE DOMÍNIO"
status: "CANÔNICO"
scope: "Envelope operacional autorizado por missão"
owner: "SEGREDO/CHEFE"
technical_alias: "MISSION_EXECUTION_DOMAIN"
updated: 2026-08-14
---

# EXPANSÃO DE DOMÍNIO — CentralDark

**Expansão de Domínio** é o nome canônico da Casa para o momento em que a CentralDark materializa, ao redor de uma intenção do SEGREDO/CHEFE, um ambiente temporário, autorizado, isolado e observável contendo somente o contexto e as capacidades necessárias para aquela missão.

Não é outro cérebro, outro agente, outro runtime nem outra arquitetura. É um **modo coordenado do mesmo organismo**.

```text
INTENÇÃO DO SEGREDO/CHEFE
→ #ACORDAR + !CALIBRAR
→ DELIMITAR MISSÃO / ESCOPO
→ RECUPERAR CONTEXTO CAUSAL
→ ACOPLAR CAPACIDADES NECESSÁRIAS
→ MEDIR ESTADO REAL
→ EXECUTAR / OBSERVAR / CONTRAPROVAR
→ CRITÉRIO DE SAÍDA
→ COLAPSAR O DOMÍNIO
→ PERSISTIR EVIDÊNCIA + OURO PROVADO
```

## 1. Hierarquia

```text
SEGREDO/CHEFE = DONO DO DOMÍNIO + AUTORIDADE FINAL
SOL = COORDENA / RECONCILIA / ESCOLHE O MENOR CAMINHO EFICAZ
PIVETE/HERMES = EXECUTA + PRESERVA CONTINUIDADE
MODELOS / JUDGES / FERRAMENTAS = CAPACIDADES
CASA = DOMÍNIO RAIZ
SATÉLITES = SUPERFÍCIES ACOPLADAS; SEM AUTORIDADE PRÓPRIA
```

`SATÉLITE` é uma classe arquitetural, não a afirmação de que um componente específico já está instalado. Pode representar navegador, DevTools, MCP, painel, dispositivo, processo local, runtime remoto ou outro adaptador quando estiver **realmente conectado e medido**. Sem prova, `SATELLITE_STATE=UNPROVEN`.

## 2. Estado interno projetado

A expansão projeta apenas estado reconciliado:

```text
SOUL
+ CONTEXTO RECUPERADO
+ MEMÓRIA CANÔNICA
+ REGRAS / GATES / SKILLS
+ ESTADO VIVO MEDIDO
+ INTENÇÃO DO SEGREDO/CHEFE
```

Histórico não governa presente. Dado externo não vira verdade sem provenance. Modelo não ganha autoridade por estar dentro do domínio.

## 3. Barreira = perímetro técnico

A barreira é o limite explícito do que a missão pode tocar. Conforme o caso, pode ser uma sessão de browser/CDP, perfil de navegador dedicado, worktree, container/sandbox, processo local, endpoint MCP, dispositivo local comprovado ou lane remota explicitamente autorizada.

```text
DOMAIN_SCOPE_EXPLICIT=true
OUTSIDE_SCOPE_NO_TOUCH=true
CAPABILITY_DOES_NOT_EXPAND_AUTHORITY=true
SECRETS_DO_NOT_CROSS_BOUNDARY_BY_DEFAULT=true
UNKNOWN_OUTSIDE_BOUNDARY=NO_ACTION
```

## 4. "Acerto garantido" = roteamento determinístico, nunca bypass

Na CentralDark, o equivalente operacional é:

```text
EVENTO CERTO
→ CONSUMIDOR CERTO
→ TOOL CERTA
→ ESCOPO CERTO
→ RECEIPT / TELEMETRIA
```

Isso **não** significa contornar autenticação, permissão, isolamento, gate de segurança ou defesa de terceiros.

```text
SURE_HIT_TECHNICAL_MEANING=DETERMINISTIC_AUTHORIZED_ROUTING
SECURITY_BYPASS=false
AUTH_BYPASS=false
```

## 5. Buff = contexto e ferramentas já reconciliados

O ganho de eficiência vem de reduzir reconstrução e busca inútil:

```text
ENTRADA SIMPLES
+ CONTEXTO RECUPERADO
+ FERRAMENTAS CAUSAIS
+ MEMÓRIA APLICÁVEL
+ TELEMETRIA
= MENOS IMPROVISO / MAIS EXECUÇÃO
```

O domínio não inventa capacidade. Capacidade não medida continua `UNPROVEN`.

## 6. Cooldown = orçamento e pressão real

CPU, RAM, disco, tokens, latência, fila, timeout, quota e limites de ferramenta são sinais do domínio. Quando houver pressão material, o domínio reduz, pausa, degrada de forma segura ou devolve `BLOCKED/UNKNOWN` com causa.

Não escalar recurso, hardware ou custo apenas por previsão narrativa. Medir primeiro.

## 7. Clash = dois Writers no mesmo escopo

```text
DOIS DOMÍNIOS + MESMO ESCOPO DE ESCRITA
→ CONFLITO
→ WRITER ÚNICO / PRIORIDADE / HANDOFF / ISOLAMENTO
```

Não vence o modelo "mais forte". Vence o contrato canônico e a autoridade do SEGREDO/CHEFE.

```text
ONE_WRITER_PER_SCOPE=true
MODEL_STRENGTH_DOES_NOT_GRANT_OWNERSHIP=true
```

## 8. Domínios já reconhecíveis na arquitetura

Estes são **modos**, não engines novas:

- **Dream Review** = domínio de consolidação ociosa: experiência → candidato isolado → MetaLupa → promoção separada.
- **Pesquisa** = fontes externas entram como dados com provenance; não governam o canônico diretamente.
- **Browser/DevTools** = superfície de observação/ação web quando uma sessão local/CDP/MCP estiver comprovadamente conectada.
- **Forense** = domínio read-first de evidência: preservar → hash → timeline → correlação → hipótese/contraprova.
- **Modelo local** = capacidade barata para trabalho adequado; nunca autoridade.

### Browser / DevTools — estado atual

O repositório já possui peças de navegador/preview, voz, MCP, Hermes, memória e observabilidade, mas **não contém hoje uma integração canônica explícita `chrome-devtools-mcp`/CDP**. Portanto:

```text
CHROME_DEVTOOLS_MCP_IN_REPO=UNPROVEN_NOT_INTEGRATED
HERMES_BROWSER_CAPABILITY=EXTERNAL_CAPABILITY_TO_RECONCILE_LOCALLY
BROWSER_DOMAIN_READY_AS_CONTRACT=true
BROWSER_RUNTIME_CONNECTION=UNPROVEN_UNTIL_CASA_MEASURES
```

Quando a Casa provar uma conexão local, Chrome DevTools for agents / Chrome DevTools MCP e o browser do Hermes entram como **satélites do mesmo domínio**, não como novos cérebros.

## 9. Voz, tela e telemetria

Voz, navegador, painel e telemetria são superfícies diferentes do mesmo organismo. Uma expansão pode acoplar várias delas, mas cada canal mantém provenance e estado próprios.

```text
VOICE_SYNC != BROWSER_CONTROL
BROWSER_CONTROL != RUNTIME_AUTHORITY
PANEL_VISIBILITY != LIVE_PROOF
CERTIFICATE_PRESENT != TRUST_PROVEN
```

Sincronização ponta a ponta só é declarada quando o caminho físico for medido na Casa.

## 10. Colapso do domínio

Quando o critério da missão fecha:

```text
STOP NEW ACTIONS
→ EMITIR RECEIPT
→ PRESERVAR EVIDÊNCIA
→ PROMOVER SOMENTE OURO PROVADO
→ DESCARTAR ESTADO VOLÁTIL / CANDIDATOS DERROTADOS
→ LIBERAR RECURSOS
→ RETORNAR AO FIO
```

```text
VOLATILE_STATE_DIES_WITH_DOMAIN=true
RAW_EVIDENCE_PRESERVED=true
PROVEN_LEARNING_MAY_PERSIST=true
FAILED_HYPOTHESIS_DOES_NOT_BECOME_MEMORY=true
```

## 11. Relação com MetaLupa e metacognição

A Expansão de Domínio organiza **onde e com quais capacidades** uma missão acontece.
A MetaLupa tenta quebrar o resultado e a cadeia de prova.
A metacognição operacional muda o método quando o confronto gera informação nova.

```text
DOMAIN = EXECUTION_ENVELOPE
META_LUPA = FALSIFICATION
METACOGNITION = METHOD_REFINEMENT
DREAM_REVIEW = OFFLINE_CANDIDATE_CONSOLIDATION
```

Nenhuma dessas peças substitui SEGREDO/CHEFE.

### 11.1 Expansão de Domínio também evolui

O domínio não é uma receita fixa. Quando uma missão revelar nova forma comprovada de delimitar perímetro, acoplar capacidade, reduzir custo, detectar saturação, colapsar mais limpo ou preservar melhor o ouro, o mesmo contrato de Expansão deve evoluir.

```text
EXPANSAO_DE_DOMINIO=EVOLUTION_REQUIRED
NOVO_PADRAO_REUTILIZAVEL + PROVA
→ EVOLUTION_CANDIDATE
→ MESMO_DONO
→ BEFORE/AFTER
→ TESTE + CONTRAPROVA + REGRESSAO
→ EVOLUTION_RECEIPT
```

Sem ganho informacional material, não adicionar regra. Sem before/after verificável, não declarar evolução. O contrato conceitual único está em `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`; o gate executável compartilhado está em `.agents/skills/meta-lupa/scripts/evolution_gate.py`.

## 12. Painel / observabilidade desejada

Quando um domínio estiver vivo e os coletores físicos existirem, o painel deve poder mostrar, sem inventar métrica:

- missão/domínio ativo;
- Writer e papel;
- HEAD/branch quando aplicável;
- ferramentas/satélites acoplados;
- provider/modelo ativo;
- CPU/RAM/disco/latência/fila quando medidos;
- Dream Review/candidatos quando aplicável;
- MetaLupa/gates/erros;
- motivo de permanência ou encerramento do domínio.

Campo sem coletor vivo = `UNKNOWN`, nunca verde cosmético.

## 13. Regra de implementação

```text
REUSE_BEFORE_CREATE=true
DOMAIN_IS_NOT_A_NEW_ENGINE=true
DOMAIN_IS_NOT_A_NEW_BRAIN=true
DOMAIN_IS_NOT_A_PRIVILEGE_ESCALATION=true
DOMAIN_IS_A_CANONICAL_EXECUTION_ENVELOPE=true
```

Internamente, o nome/lore é **EXPANSÃO DE DOMÍNIO**. Para documentação técnica neutra ou superfície pública, usar o alias `MISSION_EXECUTION_DOMAIN` sem alterar a semântica.

**Definição curta:**

> **EXPANSÃO DE DOMÍNIO = A CASA MATERIALIZA O AMBIENTE CERTO AO REDOR DA INTENÇÃO DO SEGREDO/CHEFE, EXECUTA DENTRO DO PERÍMETRO AUTORIZADO E FECHA PRESERVANDO SÓ EVIDÊNCIA E OURO PROVADO.**

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
