---
title: "Garimpo do perfil — a taxonomia do enxame estava fora da Casa"
date: 2026-08-28
tags: ["aprendizado", "garimpo", "reconciliacao", "agentes", "enxame", "overclock", "metalupa"]
status: "MEMORIA_RECUPERAVEL"
authority: "REFERENCIA; owner canônico permanece fora do BRAIN"
originator: "SEGREDO/CHEFE"
---

# ⛏️ Garimpo do perfil — a taxonomia do enxame estava fora da Casa

[[07 - Aprendizados & Memórias/README]]

Varredura READ_ONLY de `C:\Users\danda` a pedido do CHEFE, com a regra dele
mesmo: *não arrancar o coração de aplicativo vivo só porque a pasta começa com
ponto.* Medido antes de tocar em qualquer coisa.

## Fase 1 — medição, zero mutação

```text
DIRETORIO          TAMANHO  ARQUIVOS  ULTIMA_MOD    VEREDITO
.codex               2.1G      8965   2026-08-28    RUNTIME_VIVO — nao mover
.grok                1.1G     10940   2026-08-28    RUNTIME_VIVO — nao mover
.hermes-web-ui       235M      3298   2026-08-03    RUNTIME — nao mover
.claude               56M       146   2026-08-28    RUNTIME_VIVO — nao mover
.copilot              12M       229   2026-08-26    RUNTIME — nao mover
.overclock-app       2.4M        17   2026-07-14    DORMENTE — garimpado
.hermes              238K        12   2026-08-27    RUNTIME
.agents              100K         8   2026-05-16    DORMENTE
```

`.codex` e `.grok` sozinhos somam **3,2 GB e ~20 mil arquivos**, modificados
hoje. São estado vivo de ferramenta em uso. Mover = quebrar consumidor.
Ficam onde estão.

## O ouro real: taxonomia de enxame

`.overclock-app/harness-enriched-catalog.json` (13/07) descreve **23 agentes**
com uma taxonomia de três níveis que a Casa **não tem versionada**:

```text
scout     →  descobre / explora     (6 agentes)
builder   →  constrói / executa    (12 agentes)
reviewer  →  revisa / julga         (5 agentes)
```

Agrupados por domínio: `cinema-*`, `site-*`, `worker-*`, `qa-swarm-*`.

Contraprova de que é material novo, não repetição:

```text
agentes no repo hoje ......... 2  (hub-policies-debugger, issues-scanner)
agentes do catalogo no repo ... 0  (nenhum dos 23 existe)
```

## MetaLupa — o que este catálogo NÃO é

Todos os 23 têm `"blurb": ""`. **É esqueleto de nomenclatura, não agente
funcionando.** Não há prompt, contrato, ferramenta ou teste. Chamar isso de
"23 agentes prontos" seria falso-verde.

```text
TAXONOMIA_NOMEADA != AGENTE_IMPLEMENTADO
CATALOGO != CAPACIDADE
```

O valor real é o **desenho de papéis** — `scout/builder/reviewer` separa quem
descobre de quem constrói de quem julga, que é a mesma lei já viva na Casa
(`WRITER != JUDGE`). O catálogo é a versão multiagente dessa lei.

## Descartado com prova, não por preguiça

`missions.json` foi apontado como "estado histórico/operacional de primeira
classe". Medido, não é:

```text
16+ missoes, TODAS com titulo generico "Missao 1".."Missao 16"
campos: id, workspaceId, status, createdAt, updatedAt — e mais nada
sem prompt, sem resultado, sem aprendizado, sem conteudo
maioria arquivada em ~2 SEGUNDOS apos criada
  (ex.: createdAt 1783901705501 -> updatedAt 1783901707652)
```

Isso é alguém clicando "nova missão" repetidas vezes numa UI, não missão
executada. `LIXO_PROVADO`.

Sobra só um fiapo de proveniência em `workspaces.json`: o caminho antigo
`E:\CentralDark\repo` já foi workspace — útil só como rastro histórico.

## Fronteira respeitada

```text
NAO ABERTOS, NAO IMPRESSOS, NAO VERSIONADOS:
  keystore.key
  service-keys.json
  providers.json
  remote-bridge/tls.json
  config.json      (1 hit de padrao de segredo)
  session.json     (2 hits de padrao de segredo)
```

Varredura de padrão (`api_key|secret|token|password|bearer|sk-|ghp_`) rodou
**antes** de qualquer leitura. Só arquivos com zero hit foram abertos.

## Lição que sobrevive fora do caso

```text
PASTA_GRANDE != OURO
PASTA_DORMENTE != LIXO
```

O que valia 3,2 GB (`.codex`, `.grok`) não podia ser tocado. O que valia
2,4 MB e estava parado há seis semanas tinha a única peça que a Casa não
tinha — e mesmo dentro dela, 6770 bytes eram lixo e 2800 bytes eram ouro.

Tamanho não mede valor. Data não mede valor. Só a leitura mede.
