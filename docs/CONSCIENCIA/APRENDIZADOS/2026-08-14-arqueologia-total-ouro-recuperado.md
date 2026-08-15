---
title: "Arqueologia Total — ouro recuperado e reconciliado"
status: "CANONICAL_LEARNING"
date: 2026-08-14
authority: "SEGREDO/CHEFE"
scope: "Deltas úteis recuperados de PRs/planos históricos sem reintroduzir governança superada"
---

# Arqueologia Total — ouro recuperado

Este registro existe para garantir que **PR fechado, branch antiga ou incapacidade passada de agente não enterrem intenção útil**. Ele não ressuscita árvores antigas inteiras: preserva somente deltas que continuam válidos sob o canônico atual.

```text
HISTORICO_AJUDA_A_ENTENDER=true
LIVE_STATE_DECIDES_PRESENT=true
CLOSED_PR_IS_NOT_ABSORPTION_PROOF=true
REUSE_BEFORE_CREATE=true
```

## 1. Pré-leitura antes de escrever em estado compartilhado

Fonte histórica principal: PR #746. A regra continua válida e complementa Writer único/Delta Partner.

```text
PREWRITE_READ_AVAILABLE=SIM
→ LER OBJETO/CANAL ATUAL
→ COMPARAR HEAD + WRITER + HANDOFF + REGISTRO EQUIVALENTE
→ USAR CAS|ETAG|EXPECTED_SHA|LEASE QUANDO A SUPERFICIE OFERECER
→ REVALIDAR IMEDIATAMENTE ANTES DA ESCRITA
→ ESTADO MUDOU? RELER + RECONCILIAR
→ MESMO REGISTRO? ATUALIZAR EM VEZ DE DUPLICAR
→ NOVA ESCRITA SOMENTE COM DELTA MATERIAL

PREWRITE_READ_AVAILABLE=NAO
→ READ_STATE=UNPROVEN
→ NAO AFIRMAR AUSENCIA
→ NAO TRANSFORMAR UNPROVEN EM AUTORIZACAO/PASS
→ PREFERIR FORMATO IDEMPOTENTE/DEDUPLICAVEL QUANDO A ESCRITA FOR NECESSARIA
```

## 2. Dificuldade não encerra missão

Fonte histórica principal: PR #746.

```text
DIFICULDADE
→ REPRODUZIR/MEDIR ERRO
→ BUSCAR REPO + HISTORICO + DOCS + SKILLS INSTALADAS
→ BUSCAR CAPABILITY/TOOL CONECTADA
→ SE AINDA FALTAR E HOUVER INTERNET: FONTE PRIMARIA
→ ESPECIALISTA PODE ENTRAR READ_ONLY
→ ESCRITA EXIGE HANDOFF SE HOUVER OUTRO WRITER
→ CORRECAO MINIMA
→ TESTE + CONTRAPROVA + METALUPA QUANDO APLICAVEL
→ PADRAO RECORRENTE ESTAVEL: DETERMINIZAR NO MECANISMO EXISTENTE
→ SEM PROVA: UNKNOWN/BLOCKED COM FRONTEIRA EXATA
```

`SEARCH_SKILL` significa **descobrir/reutilizar** skill/capability existente. Não significa fabricar skill nova por uma hipótese bonita.

## 3. Debug incremental em tempo real

Fonte histórica principal: PR #746.

```text
NOVO_COMANDO_OU_TELEMETRIA
→ PRESERVAR MISSION_ID + SCOPE + HEAD + EVIDENCIA PROVADA
→ REMEDIR SE O ESTADO PUDER TER MUDADO
→ CLASSIFICAR NOVO | AINDA_APLICAVEL | SUPERADO | FORA_DO_ESCOPO
→ EXECUTAR SOMENTE NOVO + AINDA_APLICAVEL
→ NAO REPETIR ACAO CONCLUIDA
→ SEM CANETA: DELTA AO WRITER
→ COM CANETA: CORRIGIR MINIMO + REPROVAR
→ CHEFE VOLTA AO LOOP SOMENTE COM DECISAO HUMANA REALMENTE NOVA
```

## 4. Sistema único — intenção antiga preservada, topologia atual decide

Fontes históricas principais: PRs #576, #554, #121 e programa/issue atuais #604/#722/#711/#122.

O ouro que sobrevive:

```text
CENTRALDARK = UM ORGANISMO / UM PRODUTO
CRM + BUILDER + WEBUI + HERMES + CASA + VPS + GITHUB + GRAFO + MEMORIA
= MODULOS/SUPERFICIES/CAPACIDADES DO MESMO SISTEMA
```

Não criar DeskcommCRM, Lina Space, OmniRoute ou outro nome histórico como produto paralelo por apego ao plano antigo. Quando possuírem capacidade útil, tratar como `CANDIDATE/REFERENCE` e absorver somente o ouro na CentralDark canônica.

A heurística histórica `10-80-10` permanece como **referência de alocação de capacidade/custo**, nunca como quota rígida ou autoridade superior ao estado real.

## 5. HERMES-CASA / C: + E: — contrato candidato preservado para prova física

Fontes históricas principais: PRs #554 e #677. Este bloco **não declara runtime provado**; preserva o plano que deve ser confrontado com a Casa física.

```text
C: = BOOTSTRAP + COMPATIBILIDADE MINIMA
E: = CASA + CONTEUDO + MEMORIA + TRABALHO + EVIDENCIA

C: ACORDA E APONTA
E: GUARDA, TRABALHA E PRESERVA
```

Fronteiras que continuam exigindo prova na Casa/C:E:

- `HERMES_HOME` real;
- consumidores/processos que dependem de caminhos antigos;
- ponte/pointer/path recovery;
- hashes antes/depois e integridade de migração;
- testes locais aplicáveis (incluindo a bateria histórica T01–T14 quando ainda pertinente);
- SOUL/skills/runtime realmente carregados;
- Telegram E2E;
- memória/conteúdo realmente preservados no volume correto.

Sem acesso aos discos congelados, tudo isso permanece `UNPROVEN`, nunca PASS.

## 6. Percentual honesto

Fonte histórica principal: PR #658; reforçado pelo padrão Delta/Judge atual.

```text
PERCENTUAL_EXATO
→ EXIGE BASELINE VERIFICAVEL
→ EXIGE DENOMINADOR FECHADO
→ EXIGE CLASSES PASS|OPEN|DEBT|UNKNOWN
→ UNKNOWN/SKIPPED/PENDING/QUEUED NAO VIRAM PASS
```

Sem denominador fechado, usar `UNKNOWN`, faixa ou contagem objetiva. Nunca fabricar `99%/100%` por sensação.

## 7. Material histórico conscientemente rejeitado

Durante a arqueologia, algumas ideias antigas foram **preservadas como proveniência, mas não promovidas**:

- merge em `main` obrigatoriamente humano a cada PR → superado pela autorização atual `NO_HUMAN_REASK_FOR_MERGE`;
- convergência adversarial total como gate rotineiro → superada; continua opt-in do SEGREDO/CHEFE;
- PIVETE como humano/autoridade final → alias histórico; autoridade atual é SEGREDO/CHEFE;
- parallel skills/engines/routers/V2/V3 → rejeitados pelo `REUSE_BEFORE_CREATE`;
- qualquer plano que leia/commite secrets ou crie bypass direto de provider → rejeitado por segurança;
- topologia local histórica tratada como fato sem nova medição → rejeitada; vira candidato de forense.

## 8. Regra final desta recuperação

```text
OURO_ANTIGO
→ PROVAR SE AINDA E UTIL
→ ENCAIXAR NO DONO ATUAL OU REGISTRAR DESTINO ATIVO
→ NAO RESSUSCITAR BRANCH INTEIRA
→ NAO DEIXAR INTENCAO UTIL SEM DESTINO
```

**Princípio:** enxergar tudo; mexer só onde dói; não perder ouro; não carregar lixo; provar; incorporar; continuar.

## 9. Capacidade no centro; nome somente na proveniência

Cruzamento da sessão de 2026-08-14 com a arqueologia já consolidada: nome de pessoa, modelo, provider, janela ou agente não deve ser o eixo da seleção operacional. O nome continua importante para autoria e rastreabilidade, mas a capacidade demonstrada é o que pode ser reaproveitado pelo organismo.

```text
NOME|MODELO|PROVIDER|AGENTE
→ PROVENIENCIA

CAPACIDADE
→ CONTRIBUICAO
→ EVIDENCIA
→ CONTRAPROVA
→ ESTADO
→ PROVA APLICAVEL
→ ABSORCAO NO DONO CANONICO
→ CAPACIDADE REUTILIZAVEL
```

Regras:

- roteamento e seleção usam **capacidade observada no escopo**, não prestígio ou nome próprio;
- proveniência preserva quem trouxe, descobriu, formalizou, implementou, contraprovou ou validou o delta;
- uma mesma capacidade pode ter múltiplas proveniências e uma mesma proveniência pode contribuir com capacidades diferentes;
- contribuição que não sobreviveu à contraprova permanece `CANDIDATE|HISTORICAL|UNKNOWN`; não vira capacidade absorvida;
- `ABSORPTION_WITHOUT_VALIDATION=UNPROVEN`;
- depois de absorvido no dono canônico, o funcionamento não deve depender da presença do ator original;
- não criar módulo, skill, memória ou identidade nova só para registrar quem trouxe o ouro: registrar a proveniência no mecanismo existente.

```text
NOME_CAI_DO_CENTRO=true
CAPACIDADE_SOBE_PARA_SELECAO=true
PROVENIENCIA_PRESERVADA=true
DEPENDENCIA_NO_ATOR_ORIGINAL_APOS_ABSORCAO=false
```

Esse refinamento não cria outro motor de proveniência. Ele fecha semanticamente o que já existia em SOUL, JARVIS, MetaLupa e nesta arqueologia: **o organismo preserva autoria sem ficar dependente do autor para reutilizar a capacidade comprovada**.
