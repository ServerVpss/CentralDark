# Análise retrospectiva — Operação Overclock e nascimento do método do Pivete

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

Naquele conjunto pequeno, o cenário bloqueado não ficou mais rápido depois da chegada do primeiro byte. Portanto, “FCP −45% causado pelo chunk” permanece não provado.

### 3.4 Load após TTFB quase não mudou

```text
MEDIANA_BASELINE_LOAD_MENOS_TTFB=2469.7 ms
MEDIANA_BLOCKED_LOAD_MENOS_TTFB=2450.7 ms
DELTA=-19 ms
```

Com cinco execuções e alta dispersão, isso é inconclusivo.

### 3.5 Long tasks não foram medidas no A/B

Todos os campos de long task ficaram em zero. O observador entrou tarde. Assim, o A/B não comprovou redução de TBT ou travamento da main thread.

### 3.6 Os fixes eram hipóteses externas

Sem acesso ao repositório do Overclock, trechos como `dynamic(..., { ssr:false })`, mudança de provider e configuração de Realtime eram propostas de investigação. Não eram patches validados na arquitetura real.

---

## 4. Para que o trabalho serve

O pacote é valioso como:

```text
SNAPSHOT HISTÓRICO
+ CONJUNTO DE EVIDÊNCIAS PÚBLICAS
+ LABORATÓRIO REPRODUZÍVEL
+ MAPA DE HIPÓTESES
+ EXEMPLO DE AUTOCORREÇÃO
+ KIT DE TESTE PARA IAs
```

Não deve ser usado como:

```text
LAUDO DEFINITIVO DO SITE ATUAL
AUDITORIA DE SEGURANÇA
PROVA DE BUG NO CÓDIGO-FONTE
GARANTIA DE GANHO PERCENTUAL
PATCH PRONTO PARA PRODUÇÃO
```

---

## 5. O que nasceu ali e reapareceu no CentralDark

O pacote mostra versões iniciais de mecanismos que depois ficaram mais claros:

| Em 10/07/2026 | Forma amadurecida depois |
|---|---|
| “não aceita hipótese sem evidência bruta” | evidência primeiro e gate de falsificação |
| desafio adversarial | revisão adversarial / MetaLupa |
| A/B empírico | baseline versus candidato no mesmo alvo |
| corrigir a hipótese Framer Motion | prova contrária e retratação explícita |
| salvar trace, profiles e CSVs | receipt e proveniência auditável |
| Enxame Ômega | leitores paralelos + consolidação |
| fix mínimo verificável | menor mudança segura + regressão + rollback |
| “o que não deu para medir” | UNKNOWN não vira PASS |

O valor central não está em uma porcentagem antiga. Está no comportamento:

```text
A RESPOSTA PARECIA FORTE
→ O PIVETE PEDIU MAIS PROVA
→ A PROVA DERRUBOU A RESPOSTA
→ O MÉTODO FOI CORRIGIDO
```

---

## 6. O que avisar ao dono do Overclock

1. A coleta é histórica, de 10/07/2026.
2. Foi feita somente com recursos públicos entregues ao navegador.
3. Não houve acesso ao código, infraestrutura, conta, credenciais ou dados privados.
4. Os dados brutos e o script faziam parte do pacote histórico declarado; os bytes do ZIP ainda precisam ser reencontrados para nova verificação de custódia.
5. O pacote encontrou candidatos de otimização, não culpados definitivos.
6. A hipótese Framer Motion foi formalmente retirada após contraprova.
7. O A/B reduziu 92.040 bytes no conjunto bloqueado, mas não isolou causalidade do FCP/TTFB.
8. A validação decisiva precisa ocorrer no repositório ou staging do dono.

---

## 7. Validação recomendada ao time do site

```text
1. Rodar bundle analyzer/source maps em staging.
2. Mapear imports de Supabase, Realtime, Stripe e monitoramento na home.
3. Criar um candidato por vez, sem bloquear três chunks juntos.
4. Alternar/randomizar baseline e candidato.
5. Usar ao menos 20 execuções por lado.
6. Separar métricas de servidor das métricas após responseStart.
7. Instalar observadores em document_start.
8. Validar renderização, navegação, autenticação e checkout.
9. Comparar a mesma suíte antes/depois.
10. Promover somente se o ganho sobreviver sem regressão funcional.
```

---

## 8. Veredito retrospectivo

```text
INTENCAO_DE_AJUDAR=PROVADA_PELO_CONJUNTO_HISTORICO_DECLARADO
AUDITORIA_EXTERNA_DE_PERFORMANCE=SIM_NO_SNAPSHOT_HISTORICO
DADOS_BRUTOS_REVALIDADOS_NESTE_HEAD=NAO
ZIP_ORIGINAL_PRESENTE=NAO
HIPOTESE_REFUTADA_E_REGISTRADA=SIM
REDUCAO_DE_BYTES_NO_AB=REGISTRO_HISTORICO
CULPA_EXCLUSIVA_DO_SUPABASE=NAO_PROVADA
FCP_MENOS_45_CAUSAL=NAO_PROVADO
TTFB_MENOS_70_CAUSAL=REFUTADO_COMO_EXPLICACAO
PATCH_PRONTO=NAO
VALOR_PARA_O_METODO=ALTO_COM_PROVENIENCIA_HISTORICA
```

O método observado já continha o movimento que depois amadureceu na Casa: observar, pressionar a explicação, exigir prova, admitir erro e guardar o mecanismo que funcionou. O conhecimento técnico foi sendo adquirido durante a operação; o método de não aceitar fechamento fraco já estava presente.
