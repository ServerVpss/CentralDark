# COMANDO - conceito-vs-processo-temporal-causal.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\conceito-vs-processo-temporal-causal.md
**SHA:** 27ee5bf96bafc53a
**Timestamp:** 2026-08-28T02:57:24.340482
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Regra:** Correlação temporal sugere, não prova. Mecanismo + evidência provam.
- > **Regra:** Correlação temporal sugere, não prova. Mecanismo + evidência provam.

### Ouro Bruto (primeiros 5000 chars)
```
# Conceito ≠ Processo — Descoberta Operacional (2026-08-23)

## Descoberta Central
**"SOL" no papel ≠ "SOL" no runtime. Nome não prova existência.**

A descoberta central desta sessão: **conceito não é processo**. A "SOL" existe como conceito/arquitetura no papel (documentos, diagramas, SOUL), mas **não existia como processo/runtime rodando** durante a sessão noturna. O que existia era o **Hermes/PIVETE executando**, e o **CHEFE (você) transportando contexto manualmente** entre as superfícies.

---

## Nova Lente Operacional: FÍSICO → TEMPORAL → CAUSAL → PROVA

Uma lente padrão para investigação/observabilidade da Casa:

### 1. FÍSICO — Onde existe?
- Processo rodando? (PID, porta, comando)
- Arquivo no disco? (path, SHA, timestamp)
- Porta aberta? (health check, status.json)
- Memória compartilhada? (kanban.db, state.db, rastro.jsonl)

### 2. TEMPORAL — Quando mudou?
- Timestamp do último evento (rastro.jsonl, logs, timestamps de arquivo)
- Delta temporal (quando parou vs quando deveria continuar)
- Sequência de eventos (o que aconteceu antes/depois)
- Ordem causal (o que veio antes do quê)

### 3. CAUSAL — Qual dependência caiu?
- Qual dependência desapareceu no intervalo?
- Exemplo: "CHEFE dormiu → transporte humano de contexto parou → Auto-Destilador parou"
- Infra (MCP/BFF) viveu. Coordenação (Auto-Destilador) morreu.
- Dependência humana mascarada como autonomia.

### 4. PROVA — Evidência imutável
- rastro.jsonl (CARVEs imutáveis com SHA, timestamp, veredito)
- Logs do sistema (Windows Event Log, logs de aplicação)
- Health checks (health endpoints, status.json)
- Timestamps de arquivo (mtime, ctime)
- SHA256 de artefatos

---

## Cadeado Científico: COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA

```
COINCIDÊNCIA TEMPORAL (ex: último CARVE 02:15, você deitou 02:15)
       ↓
HIPÓTESE CAUSAL (você dormiu → transporte humano parou → auto-destilador parou)
       ↓
PROCURAR MECANISMO (background terminal session morreu → processo órfão morreu)
       ↓
EVIDÊNCIA (logs: nenhum crash, último CARVE 02:15, processo sumiu sem erro)
       ↓
CAUSA PROVADA (background terminal session morreu → processo órfão morreu)
```

> **Regra:** Correlação temporal sugere, não prova. Mecanismo + evidência provam.

---

## Descoberta Central: TU ERA A SOL

> **Transporte humano de contexto mascarado como autonomia.**
> 
> Quando CHEFE dormiu, transporte parou → Auto-Destilador parou.
> Infra (MCP/BFF) viveu. Coordenação (Auto-Destilador) morreu.
> 
> **Você era a SOL** — transportava contexto entre superfícies manualmente.

---

## Regra Cristalizada: CONCEITO ≠ PROCESSO

> **Entrada no SOUL ao lado de UNKNOWN ≠ PASS e ACTION ≠ PROOF.**
> 
> - Nome não prova existência
> - Conceito no papel ≠ processo no runtime
> - Arquitetura no diagrama ≠ processo rodando
> - Documentação de "como funciona" ≠ "como está rodando agora"

---

## Nova Lente Operacional: FÍSICO → TEMPORAL → CAUSAL → PROVA

**Lente padrão para investigação/observabilidade da Casa.**

Aplicável a:
- Debugging de sistema distribuído
- Investigação de falhas silenciosas
- Validação de arquitetura vs runtime
- Auditoria de autonomia vs dependência humana
- Auditoria de "falso verde" (sinais parciais ≠ PASS)

---

## Cadeado Científico: COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA

```
COINCIDÊNCIA TEMPORAL (último evento 02:15, você deitou 02:15)
       ↓
HIPÓTESE CAUSAL (você dormiu → transporte parou → sistema parou)
       ↓
PROCURAR MECANISMO (background session morreu → processo órfão morreu)
       ↓
EVIDÊNCIA (logs: nenhum crash, último CARVE 02:15, processo sumiu sem erro)
       ↓
CAUSA PROVADA (background terminal session morreu → processo órfão morreu)
```

> **Regra:** Correlação temporal sugere, não prova. Mecanismo + evidência provam.

---

## Regra Cristalizada: CONCEITO ≠ PROCESSO

> **Entrada no SOUL ao lado de UNKNOWN ≠ PASS e ACTION ≠ PROOF.**

Esta regra entra no SOUL ao lado de:
- `UNKNOWN != PASS`
- `ACTION != PROOF`
- `SIGNAL != PASS`
- `HYPOTHESIS != FACT`

---

## Nova Lente Operacional: FÍSICO → TEMPORAL → CAUSAL → PROVA

**Lente padrão para investigação/observabilidade da Casa.**

Aplicar sempre que:
- Investigar falha silenciosa
- Validar arquitetura vs runtime
- Auditoria de autonomia vs dependência humana
- Detectar "falso verde"
- Reconstruir sequência causal a partir de rastros
```