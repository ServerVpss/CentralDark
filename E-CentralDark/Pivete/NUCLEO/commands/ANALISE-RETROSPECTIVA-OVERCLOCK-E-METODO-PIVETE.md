# COMANDO - ANALISE-RETROSPECTIVA-OVERCLOCK-E-METODO-PIVETE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\docs\RELATORIOS\2026-07-10-pacotao-centraldark\ANALISE-RETROSPECTIVA-OVERCLOCK-E-METODO-PIVETE.md
**SHA:** 0f94260b707f8dbf
**Timestamp:** 2026-08-28T02:55:17.927740
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- VALOR_PARA_O_METODO=ALTO_COM_PROVENIENCIA_HISTORICA

### Ouro Bruto (primeiros 5000 chars)
```
# Análise retrospectiva — Operação Overclock e nascimento do método do Pivete

**Fonte analisada:** `PACOTAO-CENTRALDARK-2026-07-10.zip`  
**Data dos artefatos:** 10/07/2026  
**Natureza:** auditoria externa, pública e não invasiva de performance; laboratório de avaliação de IAs; registro histórico do método CentralDark.
> **Proveniência histórica:** neste documento, “Pivete” preserva a linguagem usada na época. Na semântica ativa atual, quando se referia ao humano corresponde a `LEGACY_ALIAS_OF_SEGREDO_CHEFE`; não redefine PIVETE/HERMES como autoridade.

**Fonte analisada:** `PACOTAO-CENTRALDARK-2026-07-10.zip`
**Data dos artefatos:** 10/07/2026
**Natureza:** auditoria externa, pública e não invasiva de performance; laboratório de avaliação de IAs; registro histórico do método CentralDark.
**Custódia atual do ZIP:** `UNPROVEN` — os bytes originais não estão versionados neste diretório.

---

## 1. O que o Pivete estava fazendo de verdade

O trabalho não foi apenas “testar se um site estava lento”. O pacote mostra três missões acopladas:

1. **investigar o Overclock com dados públicos do navegador;**
2. **testar se as IAs conseguiam sair de respostas genéricas e chegar a provas;**
3. **transformar o processo que funcionou em desafios, doutrina, scripts e prompts reutilizáveis.**

A sequência observável foi:

```text
SENTIR UMA ANOMALIA
→ MEDIR REDE E MAIN THREAD
→ PERFILAR CPU COM V8/CDP
→ EXIGIR ATRIBUIÇÃO DO CHUNK
→ ATACAR A PRIMEIRA HIPÓTESE
→ REFUTAR FRAMER-MOTION
→ FORMULAR HIPÓTESE SUPABASE
→ RODAR A/B NO NAVEGADOR
→ EMPACOTAR DADOS, DESAFIOS E DOUTRINAS
```

A intenção humana forneceu o objetivo e a régua. As ferramentas e IAs forneceram vocabulário e execução.

---

## 2. O que o pacote prova sobre a investigação

### 2.1 Diagnóstico inicial

O `diagnostic.json` registra, na captura original:

```text
TTFB_APROXIMADO=716 ms
FCP_APROXIMADO=944 ms
LOAD_APROXIMADO=2179 ms
LONG_TASKS=59
LONG_TASKS_TOTAL=5450.9 ms
LONG_TASK_MAX=331.2 ms
LAYOUT_PASSES=106
LAYOUT_TOTAL=479.9 ms
HERO_IMAGE=2386676 bytes
```

Isso sustenta que existiam superfícies reais de performance: resposta inicial variável, imagens grandes, trabalho de layout e blocos longos na main thread.

### 2.2 Perfil V8

O primeiro relatório Staff usou V8 CPU Profiler via CDP, registrando 10.472 amostras e uma long task de 299 ms perto da hidratação. A evidência localizou CPU em chunks do React/Next e no runtime de módulos.

O perfil prova **onde a CPU apareceu** no bundle minificado. Sem source maps ou repositório, ele não prova sozinho qual componente-fonte gerou cada frame.

### 2.3 Correção da própria hipótese

O V2 atribuiu o gargalo a `framer-motion + Stripe`. O V3 baixou os chunks públicos e não encontrou as assinaturas esperadas de Framer Motion.

```text
HIPOTESE_V2=FRAMER_MOTION
CONTRAPROVA=ZERO_ASSINATURAS_ESPERADAS_NOS_CHUNKS
RESULTADO=HIPOTESE_REFUTADA
```

Essa retratação é um dos resultados mais fortes do pacote. A investigação não preservou uma narrativa só porque ela parecia técnica.

### 2.4 Hipótese Supabase

O V3 encontrou um chunk de aproximadamente 209 KB com várias assinaturas ligadas ao Supabase, Realtime, WebSocket, auth e checkout. Isso sustenta:

```text
CHUNK_COM_SINAIS_SUPABASE=SIM
CHUNK_GRANDE_NO_CAMINHO_PUBLICO=SIM
CAUSA_EXATA_NO_CODIGO_FONTE=NAO_PROVADA
```

A conclusão correta é “candidato prioritário para inspeção interna”, não “culpado exclusivo comprovado”.

### 2.5 Experimento A/B

Os dados preservados mostram cinco execuções baseline seguidas por cinco execuções bloqueadas.

Medianas registradas:

```text
BASELINE_TTFB=725.4 ms
BLOCKED_TTFB=216.8 ms
BASELINE_FCP=1012 ms
BLOCKED_FCP=560 ms
BASELINE_JS=321031 bytes
BLOCKED_JS=228991 bytes
DELTA_JS=-92040 bytes
```

A redução de transferência e de scripts é diretamente observada no experimento.

Contudo, o próprio `ab_test.py` bloqueia três padrões de chunks, não apenas um. Portanto, o resultado prova o efeito do **conjunto bloqueado**, não a contribuição isolada do Supabase.

---

## 3. Onde a conclusão final ultrapassou a prova

### 3.1 TTFB não é causado por JavaScript descoberto depois do HTML

TTFB mede a chegada do primeiro byte do documento. Os chunks são solicitados depois que o HTML começa a chegar. Logo, a queda de 70% no TTFB não pode ser atribuída causalmente ao bloqueio dos chunks.

A explicação mais compatível com os dados é variação de servidor, CDN, cache, rede ou aquecimento entre baterias.

### 3.2 Ordem fixa contaminou a comparação

O experimento executou:

```text
BASELINE × 5
DEPOIS BLOCKED × 5
```

Sem alternância ou randomização, o segundo grupo pode herdar cache e infraestrutura aquecida.

### 3.3 O ganho de FCP acompanha o TTFB

Ao retirar o TTFB e observar apenas o intervalo até o FCP:

```text
MEDIANA_BASELINE_FCP_MENOS_TTFB=283.1 ms
MEDIANA_BLOCKED_FCP_MENOS_TTFB=343.2 ms
DELTA=+60.1 ms
```

Naquele conjunto pequeno, o cenário bloqueado não ficou mais rápido depois da chegada do primeiro byte. Portanto, “FCP −45% causado pelo chunk” pe
```