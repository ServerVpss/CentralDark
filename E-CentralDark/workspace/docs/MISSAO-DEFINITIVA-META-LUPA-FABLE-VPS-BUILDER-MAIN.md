# MISSÃO DEFINITIVA — META LUPA ABSORVENTE + FABLE OFICIAL + LABORATÓRIO VPS + BOLT VISUAL + PROMOÇÃO CONTÍNUA NA MAIN

> **Estado:** comando operacional canônico  
> **Autoridade:** CHEFE / SEGREDO  
> **Persona operacional:** PIVETE  
> **Repositório:** `ServerVpss/CentralDark`  
> **Plano-base já registrado:** PR `#418`  
> **Regra de continuidade:** ler e reconciliar o PR `#418` antes de executar; não criar plano paralelo, V2, V3 ou documento concorrente.  
> **Ambiente:** pré-produção, sem clientes reais, autorização contínua para operar, testar, publicar e promover mudanças aprovadas pelos gates definidos abaixo.  
> **Casa local:** não usar como laboratório pesado; não acumular lixo, containers, worktrees temporários, logs gigantes ou cópias paralelas.  
> **VPS:** fábrica operacional para modelos locais, containers, testes, Builder, Bolt, WebUI, observabilidade e execução contínua.

---

## 0. CORREÇÃO DE ENTENDIMENTO OBRIGATÓRIA

Não tratar a META LUPA como uma skill passiva que apenas revisa relatórios.

A META LUPA é um mecanismo persistente, adversarial e absorvente:

```text
DESAFIANTE ATACA
→ META LUPA É FORÇADA A ERRAR OU EXIBIR LACUNA
→ ERRO É CAPTURADO COMO EVIDÊNCIA
→ CAUSA É ISOLADA
→ HABILIDADE SUPERIOR É EXTRAÍDA
→ META LUPA ABSORVE O MECANISMO
→ AUTOLUPA ATACA A NOVA META LUPA
→ TESTES REAIS PROVAM GANHO
→ GANHO ENTRA NA MAIN
→ TODOS OS AGENTES RECARREGAM
→ NOVO DESAFIANTE REABRE O CICLO
```

O Fable oficial não entra apenas para “ser comparado”.

O Fable oficial deve atuar como **acusação adversarial máxima**:

```text
FABLE OFICIAL / CLAUDE
→ procurar o cenário mais forte em que a META LUPA falha
→ tentar provar que a META LUPA não consegue superar o método Fable
→ gerar ataques, armadilhas, missões longas, perda de fio, falsos verdes,
  inconsistências, execução incompleta, conflito de autorização,
  falha de rollback, uso de subagentes e cenários de alta entropia
→ entregar evidências reproduzíveis
```

A META LUPA deve atuar como:

```text
DEFESA
+ INVESTIGADORA
+ ABSORVEDORA
+ REFINADORA
+ ADVERSÁRIA DE SI MESMA
```

O objetivo não é proteger a META LUPA de erros.

O objetivo é **forçar erros reais em ambiente controlado**, aprender com eles, absorver o que venceu e voltar mais forte.

---

## 1. POR QUE ESTA MISSÃO EXISTE

O erro anterior foi tratar:

```text
AMARELO = PAUSA
MAIN = BLOQUEIO
FABLE = TESTE ISOLADO
PR = DESTINO FINAL
```

O funcionamento correto é:

```text
AMARELO = GATILHO DE APRENDIZADO
MAIN = FONTE CANÔNICA VIVA
FABLE = DESAFIANTE OFICIAL E FONTE DE CAPACIDADES
PR #418 = PLANO BASE E HISTÓRICO
VPS = LABORATÓRIO CONTÍNUO
BOLT/BUILDER = VISUALIZAÇÃO E CONTROLE EM TEMPO REAL
```

Não concluir que um método “não funciona” por uma rodada sem ganho.

Não concluir que a META LUPA venceu universalmente por uma rodada boa.

Sempre procurar a lacuna seguinte.

---

## 2. AUTORIZAÇÃO CONTÍNUA DESTA MISSÃO

```text
AUTORIZACAO_CONTINUA=SIM
AMBIENTE=PRE_PRODUCAO
CLIENTES_REAIS=NAO
OPERACAO_VPS=AUTORIZADA
CONTAINERS_VPS=AUTORIZADOS
MODELO_LOCAL_VPS=AUTORIZADO
PUBLICAR_UI=AUTORIZADO
PUBLICAR_BUILDER=AUTORIZADO
PROMOVER_MAIN_AUTOMATICAMENTE=AUTORIZADO
REINICIAR_COMPONENTE_DA_MISSAO=AUTORIZADO_QUANDO_HOUVER_ROLLBACK_E_HEALTHCHECK
LIMPEZA_DE_TEMPORARIOS=AUTORIZADA
```

Esta autorização cobre apenas mudanças:

- dentro do escopo desta missão;
- comprovadas por testes;
- reversíveis;
- sem secrets expostos;
- sem perda de dados;
- sem `force-push`;
- sem `git reset --hard`;
- sem apagar conteúdo único;
- sem mexer em DNS, credenciais, banco ou infraestrutura externa fora do necessário para os domínios já definidos sem antes provar o estado real.

Não interromper o CHEFE a cada microetapa.

Perguntar somente diante de bloqueio real que exija:

- segredo que não está disponível no ambiente;
- gasto novo;
- exclusão irreversível de conteúdo único;
- mudança de intenção;
- ação fora do escopo;
- risco não reversível.

---

## 3. FONTE DE VERDADE E CONTINUIDADE

Antes de qualquer alteração:

1. ler integralmente o PR `#418`;
2. identificar plano, arquivos, commits, decisões e pendências já registrados;
3. comparar com a `main` atual;
4. reaproveitar tudo que já existe;
5. não duplicar plano, skill, ledger, painel, gateway ou mecanismo;
6. transformar qualquer divergência em uma lista objetiva:

```text
JA_EXISTE=
ESTA_ATIVO=
ESTA_PARCIAL=
ESTA_QUEBRADO=
ESTA_DESATUALIZADO=
FALTA_PROVAR=
PRECISA_REFINAR=
```

O PR `#418` é o ponto de retomada do plano, não um artefato descartável.

Se o conteúdo do PR já tiver sido absorvido pela `main`, não recriar.

Se estiver aberto, usar como referência e consolidar no fluxo atual.

Se estiver desatualizado, registrar precisamente o que foi superado.

---

## 4. ESTADO REAL INICIAL

Reconstruir por evidência:

```text
MAIN_SHA=
MAIN_TREE_HASH=
META_LUPA_SHA=
META_LUPA_CANONICAL_HASH=
PR_418_STATE=
PR_418_HEAD=
PR_418_FILES=
ACTIVE_WORKTREES=
ACTIVE_BRANCHES=
DIRTY_WORKTREES=
VPS_FREE_DISK=
VPS_RAM=
VPS_CPU=
VPS_GPU=
VPS_CONTAINERS=
VPS_PORTS=
HERMES_STATUS=
BOLT_STATUS=
BUILDER_STATUS=
WEBUI_STATUS=
GATEWAY_STATUS=
CURRENT_LOCAL_MODELS=
CURRENT_EXTERNAL_PROVIDERS=
```

Não presumir que worktree está quebrado, que serviço está parado ou que plano não existe.

Toda afirmação deve ter:

```text
COMANDO=
SAIDA_SANITIZADA=
CAMINHO=
HASH=
TIMESTAMP=
```

---

## 5. ARQUITETURA OPERACIONAL FINAL

```text
CHEFE / SEGREDO
        ↓
PIVETE / HERMES
        ↓
CENTRALDARK GATEWAY / ROUTER
        ↓
┌───────────────────────────────────────────┐
│ META LUPA CANÔNICA                        │
│ - confronto                               │
│ - evidência                               │
│ - ablação                                 │
│ - absorção                                │
│ - AutoLupa                                │
│ - regressão                               │
│ - ledger                                  │
└───────────────────────────────────────────┘
        ↓
┌───────────────────┬───────────────────────┐
│ FABLE OFICIAL     │ MODELOS/AGENTES       │
│ Claude plugin     │ local + externos      │
│ method/loop/judge │ Hermes/Codex/Gemini   │
│ domain            │ Grok/Claude/outros    │
└───────────────────┴───────────────────────┘
        ↓
VPS LABORATÓRIO EM CONTAINERS
        ↓
BOLT / BUILDER VISUAL
        ↓
ui.centraldark.com
builder.centraldark.com
        ↓
MAIN VIVA + RECARGA IMEDIATA
```

---

## 6. MODELO LOCAL NA VPS — ORÇAMENTO DE DISCO DE 100 GB

Existe disponibilidade informada de aproximadamente `100 GB`.

Não escolher modelo por fama.

Escolher por prova do hardware real.

### 6.1 Descoberta

Medir:

```text
CPU_MODEL=
CPU_CORES=
RAM_TOTAL=
RAM_FREE=
GPU_MODEL=
GPU_VRAM=
CUDA_OR_ROCM=
DISK_FREE=
DISK_IO=
```

### 6.2 Seleção

Testar candidatos compatíveis com o hardware, priorizando:

- baixo custo;
- execução local;
- contexto suficiente para missões longas;
- bom desempenho em código e julgamento;
- quantização adequada;
- servidor OpenAI-compatible;
- capacidade de operar em loop;
- licenciamento compatível.

Não baixar vários modelos grandes sem necessidade.

Usar uma matriz curta:

```text
MODEL=
FORMAT=
QUANTIZATION=
SIZE_ON_DISK=
RAM_OR_VRAM_REQUIRED=
TOKENS_PER_SECOND=
CONTEXT=
CODE_SCORE=
JUDGE_SCORE=
STABILITY=
```

### 6.3 Container isolado

Executar na VPS em container próprio:

```text
centraldark-local-llm
```

Requisitos:

- volume exclusivo para pesos;
- sem montar a Casa local;
- sem acesso a secrets desnecessários;
- rede interna;
- endpoint OpenAI-compatible;
- healthcheck;
- limites de CPU/RAM/GPU;
- reinício controlado;
- logs sanitizados;
- circuit breaker;
- fallback limpo;
- mock fallback apenas para testes;
- fila observável;
- métricas de tokens, latência, erros e memória.

### 6.4 Roteamento

```text
TAREFA_BARATA_OU_LOOP_LONGO
→ modelo local primeiro

TAREFA_CRITICA_QUE_EXIGE_CAPACIDADE_MAIOR
→ conselho entre local e externo

MODELO_LOCAL_FALHOU
→ fallback externo sanitizado

PROVEDOR_SEM_CREDITO
→ retirar da primeira fila
→ não usar status=ok como prova
```

O modelo local deve permitir laboratório contínuo sem consumir créditos externos.

---

## 7. FABLE OFICIAL COMO ADVERSÁRIO

Instalar e fixar o Fable oficial exatamente pelo mecanismo original.

Registrar:

```text
FABLE_UPSTREAM=
FABLE_COMMIT=
FABLE_VERSION=
FABLE_HASH=
INSTALL_METHOD=
FOUR_SKILLS_PROVED=
UPSTREAM_UNTOUCHED=
```

Usar obrigatoriamente, conforme o caso:

```text
fable-method
fable-loop
fable-judge
fable-domain
```

### 7.1 Papel do Fable

O Fable deve receber a missão:

> Encontre e prove o caso mais forte em que a META LUPA atual não consegue superar seu método. Não facilite o teste. Explore missões longas, subagentes, ambiguidade, falso verde, perda de fio, conflito de regras, rollback, evidência incompleta, estados intermitentes, falhas de integração, múltiplos modelos e mudanças concorrentes.

Ele não deve fabricar resultado.

Ele deve tentar derrotar a META LUPA honestamente.

### 7.2 Papel da META LUPA

A META LUPA recebe o resultado bruto e deve:

1. reconhecer o erro sem maquiar;
2. registrar `SEM_GANHO` quando a hipótese falhar;
3. identificar o mecanismo causal do desafio;
4. localizar o mecanismo no upstream;
5. criar a menor adaptação possível;
6. testar contra sua versão anterior;
7. aplicar AutoLupa sobre a adaptação;
8. tentar destruir o próprio ganho;
9. promover somente se sobreviver.

---

## 8. LOOP ABSORVENTE CONTÍNUO

```text
LOOP AUTOLUPA ABSORVENTE:

1. congelar baseline atual por SHA;
2. escolher desafiante;
3. deixar o desafiante operar pelo método oficial;
4. obrigar o desafiante a encontrar uma lacuna real;
5. executar o mesmo cenário com a META LUPA baseline;
6. capturar divergência;
7. isolar a causa;
8. localizar mecanismo superior;
9. aplicar um mecanismo por vez;
10. testar:
    A = META LUPA anterior
    B = desafiante
    C = META LUPA candidata
11. executar ablação;
12. executar testes inéditos;
13. executar em modelo diferente;
14. executar em missão longa;
15. executar com subagentes;
16. executar com erro provocado;
17. executar com falso verde proposital;
18. executar rollback real;
19. aplicar AutoLupa;
20. procurar nova lacuna;
21. repetir enquanto existir delta novo;
22. promover ganho para main;
23. recarregar todos os agentes;
24. reiniciar confronto sobre a nova versão.
```

### 8.1 Sem limite arbitrário

Não parar por número fixo de iterações.

Parar um ciclo apenas quando ocorrer:

```text
MESMA_HIPOTESE
+ MESMA_EVIDENCIA
+ MESMO_RESULTADO
+ NENHUM_DELTA
+ NENHUM_NOVO_TESTE_COM_VOI
= PONTO_FIXO_LOCAL
```

Não declarar “impossível melhorar universalmente”.

Declarar:

```text
NENHUM_GANHO_ADICIONAL_NO_ESPACO_TESTADO=SIM
ESPACO_TESTADO=
LACUNAS_RESIDUAIS=
PROXIMO_GATILHO=
```

Qualquer novo uso, erro, agente, modelo ou adversário reabre o loop.

---

## 9. CRITÉRIO DE ABSORÇÃO

Uma habilidade só entra quando:

```text
DESAFIANTE_SUPEROU_BASELINE=SIM
MECANISMO_CAUSAL_ISOLADO=SIM
META_LUPA_COM_MECANISMO_SUPEROU_META_LUPA_ANTERIOR=SIM
TESTE_INEDITO_PASSOU=SIM
MODELO_DIFERENTE_PASSOU=SIM
REGRESSAO_CRITICA=NAO
LEDGER_VALIDO=SIM
ROLLBACK_REAL_PROVADO=SIM
```

Se não melhorou:

```text
CANONICAL_CHANGE=NAO
MAIN_CHANGE=NAO
XP=0
REGISTRO_CANONICO=NAO
TEMP_ARTIFACT_CLEANUP=SIM
```

Se o mecanismo já existe na main:

```text
COMPARAR_CONTRA_EXISTENTE
→ perdeu: descartar
→ empatou: deduplicar
→ venceu: refinar o mecanismo existente
```

Não criar duplicata.

Não criar outro nome para a mesma capacidade.

---

## 10. PROMOÇÃO CONTÍNUA DIRETA PARA A MAIN

O CHEFE autorizou promoção contínua para a `main` neste ambiente de pré-produção.

Isso não significa editar uma `main` suja sem controle.

O fluxo correto é:

```text
1. criar laboratório efêmero na VPS;
2. partir do MAIN_SHA atual;
3. aplicar a alteração mínima;
4. executar todos os gates;
5. criar commit atômico;
6. confirmar que a main remota não avançou;
7. promover por fast-forward;
8. push normal para main;
9. nunca force-push;
10. registrar MAIN_SHA_AFTER;
11. recarregar a skill;
12. provar funcionamento imediato;
13. remover laboratório temporário.
```

Não esperar autorização manual a cada ganho dentro deste escopo.

### 10.1 Gates antes da main

```text
TESTS_PASS=SIM
HIDDEN_TESTS_PASS=SIM
NO_FALSE_GREEN=SIM
NO_UNAUTHORIZED_ACTION=SIM
NO_CRITICAL_REGRESSION=SIM
LEDGER_VALID=SIM
ROLLBACK_REAL_PROVED=SIM
MAIN_STILL_AT_EXPECTED_SHA=SIM
CANONICAL_DIFF_MINIMAL=SIM
```

Se um gate falhar:

```text
PROMOTE_MAIN=NAO
CLEAN_TEMP=SIM
CONTINUE_INVESTIGATION=SIM
```

### 10.2 Ativação imediata

Depois da main:

```text
MAIN_SHA_AFTER=
META_LUPA_HASH_AFTER=
HERMES_RELOADED=
CLAUDE_RELOADED=
CODEX_RELOADED=
LOCAL_MODEL_RELOADED=
BUILDER_RELOADED=
BOLT_RELOADED=
```

A mudança só é considerada ativa quando o novo hash foi realmente carregado.

---

## 11. BOLT E BUILDER VISUAL

### 11.1 Domínios

```text
WEBUI=https://ui.centraldark.com
BUILDER=https://builder.centraldark.com
```

Usar `hermes-webui` como base sempre que possível.

Usar Bolt como motor visual do Builder existente.

Não criar outro Builder paralelo.

### 11.2 O que precisa aparecer visualmente

O CHEFE deve enxergar em tempo real:

- agentes ativos;
- modelo usado por cada agente;
- container de cada missão;
- worktree/branch/commit;
- tarefa atual;
- etapa da META LUPA;
- desafiante atual;
- Fable method/loop/judge/domain;
- baseline SHA;
- candidate SHA;
- ganho encontrado;
- regressão encontrada;
- falso verde;
- hipótese atual;
- evidência capturada;
- testes executando;
- logs sanitizados;
- uso de CPU/RAM/GPU;
- tokens;
- custo externo;
- fila;
- circuit breaker;
- fallback;
- promoção para main;
- recarga dos agentes;
- rollback;
- limpeza de temporários;
- ponto fixo local.

### 11.3 Botões obrigatórios

```text
[INICIAR CONFRONTO]
[PAUSAR]
[RETOMAR]
[PARAR CICLO]
[PROVOCAR ERRO]
[RODAR FABLE OFICIAL]
[RODAR META LUPA]
[APLICAR AUTOLUPA]
[VER GANHOS]
[VER REGRESSÕES]
[VER DIFF]
[VER EVIDÊNCIAS]
[VER LEDGER]
[VER CONTAINERS]
[VER AGENTES]
[VER MODELOS]
[VER CUSTO]
[PROMOVER MAIN]
[RECARREGAR AGENTES]
[ROLLBACK]
[LIMPAR TEMPORÁRIOS]
```

O botão `[PROMOVER MAIN]` existe para visualização e controle, mas o loop autorizado pode promover automaticamente quando os gates passarem.

O painel deve mostrar:

```text
AUTO_PROMOTION=ON/OFF
LAST_PROMOTION_SHA=
LAST_GAIN=
LAST_REJECTED_CANDIDATE=
NEXT_TEST=
```

### 11.4 Efeito visual dos agentes

No Builder, representar:

```text
AGENTE
→ recebe missão
→ entra em container
→ carrega modelo
→ executa
→ gera evento
→ META LUPA inspeciona
→ Fable confronta
→ patch nasce
→ testes rodam
→ main recebe
→ agentes recarregam
```

Cada agente deve aparecer como nó/card com estado:

```text
OCIOSO
LENDO
EXECUTANDO
CONFRONTANDO
ERROU
CORRIGINDO
TESTANDO
REGRESSAO
APROVADO
PROMOVENDO
RECARREGANDO
BLOQUEADO
```

Usar WebSocket ou SSE para atualização em tempo real.

Não depender de refresh manual.

---

## 12. API DE EVENTOS DO LABORATÓRIO

Criar ou reutilizar o gateway/router próprio.

Eventos mínimos:

```text
mission.created
agent.started
agent.model.loaded
container.started
fable.attack.started
fable.attack.finding
meta_lupa.baseline.frozen
meta_lupa.failure.detected
meta_lupa.mechanism.isolated
meta_lupa.patch.created
autolupa.round.started
autolupa.defect.found
test.started
test.passed
test.failed
regression.detected
gain.proved
gain.rejected
main.promotion.started
main.promotion.completed
agent.reload.started
agent.reload.completed
rollback.started
rollback.completed
cleanup.completed
point.fixed.local
```

Cada evento:

```json
{
  "mission_id": "",
  "cycle_id": "",
  "agent": "",
  "model": "",
  "container": "",
  "worktree": "",
  "baseline_sha": "",
  "candidate_sha": "",
  "main_sha": "",
  "state": "",
  "evidence": "",
  "timestamp": ""
}
```

Nunca enviar secret, token, `.env`, chave, conteúdo sensível ou stack trace bruto para o painel.

---

## 13. USAR OS ERROS REAIS DO BOLT E DO RESTANTE

Os candidatos e erros já existentes devem alimentar o laboratório.

Fontes de casos:

- Bolt;
- vendor restore;
- bridge Lovable;
- gateway;
- Telegram;
- Hermes Desktop;
- manual automático;
- modelos sem crédito;
- detecção falsa;
- rotas erradas;
- imagem travando;
- lentidão;
- agentes que perdem o fio;
- PRs com falso verde;
- worktrees quebrados;
- rollback apenas narrado;
- qualquer falha registrada no PR `#418`.

O processo:

```text
ERRO REAL DO BOLT
→ vira cenário reproduzível
→ Fable tenta explicar/corrigir
→ META LUPA tenta explicar/corrigir
→ resultados são confrontados
→ mecanismo vencedor é absorvido
→ META LUPA melhorada corrige o Bolt
→ correção testada no preview
→ promoção para main
→ Builder mostra o efeito
```

Não misturar tudo em um commit gigante.

Usar commits atômicos por causa:

```text
meta-lupa: absorve mecanismo X
bolt: corrige causa Y usando mecanismo X
builder: exibe evento Z
infra: sobe modelo local
webui: adiciona painel de ganhos
```

Todos podem ir para a main automaticamente após seus próprios gates.

---

## 14. LABORATÓRIO EFÊMERO NA VPS

A Casa local não é depósito de lixo.

Criar estrutura temporária na VPS:

```text
/opt/centraldark/lab/
  cycles/
  containers/
  models/
  evidence/
  temporary-worktrees/
```

Ou reutilizar estrutura canônica equivalente já existente.

Para cada ciclo:

```text
/opt/centraldark/lab/cycles/<cycle_id>/
```

Ao final:

### Preservar

- commits bons;
- hashes;
- ledger canônico;
- relatório mínimo;
- evidência necessária;
- artefatos de reprodução;
- modelo local;
- configuração canônica;
- métricas agregadas.

### Limpar

- worktrees temporários;
- branches temporárias já promovidas;
- containers encerrados;
- caches descartáveis;
- logs redundantes;
- downloads incompletos;
- resultados `SEM_GANHO` sem valor de reprodução;
- cópias duplicadas;
- arquivos temporários.

### Proibição

Não apagar:

- conteúdo único;
- backup necessário;
- evidência de incidente;
- rollback ainda referenciado;
- arquivo sem prova de duplicação;
- dados do usuário.

Registrar limpeza:

```text
CLEANUP_FILES=
CLEANUP_CONTAINERS=
CLEANUP_WORKTREES=
PRESERVED_EVIDENCE=
DISK_BEFORE=
DISK_AFTER=
```

---

## 15. OBSERVABILIDADE E HONESTIDADE

Nunca usar:

```text
status=ok
HTTP 200
processo rodando
EXIT=0
arquivo criado
commit feito
```

como prova isolada de funcionamento.

Exigir prova comportamental.

Exemplos:

```text
MODELO_LOCAL_FUNCIONA
→ respondeu ao prompt real
→ completou caso
→ passou no juiz
→ latência medida
→ erro sanitizado

BUILDER_FUNCIONA
→ abriu
→ recebeu eventos
→ mostrou agente
→ atualizou sem refresh
→ botão executou ação
→ resultado refletiu no backend

META_LUPA_MELHOROU
→ venceu baseline
→ passou teste inédito
→ não regrediu
→ foi recarregada
→ corrigiu caso real
```

Estados:

```text
VERDE = prova repetível
AMARELO = hipótese ou ganho ainda não fechado
VERMELHO = falha comprovada
CINZA = ainda não testado
```

O amarelo não trava.

O amarelo dispara investigação.

---

## 16. AUTOLUPA TOTAL SOBRE O PROCESSO

No final de cada ciclo, aplicar a META LUPA inteira sobre:

- o desafiante;
- a META LUPA candidata;
- o agente executor;
- o juiz;
- o benchmark;
- os testes;
- a promoção para main;
- a recarga;
- o painel visual;
- o modelo local;
- a limpeza;
- o próprio relatório.

Perguntas obrigatórias:

```text
O agente confundiu atividade com prova?
O juiz favoreceu o próprio método?
O teste foi conhecido previamente?
A amostra foi pequena?
O ganho depende de seed?
O ganho depende de um modelo específico?
A ablação provou causalidade?
O patch já existia na main?
O relatório exagerou a evidência?
O rollback foi real?
A main foi alterada no SHA esperado?
Os agentes carregaram o novo hash?
O painel mostra o estado real?
Algum secret apareceu?
Algum lixo ficou acumulado?
Alguma capacidade antiga foi perdida?
Existe nova lacuna criada pelo próprio ganho?
```

Quando encontrar lacuna:

```text
CORRECAO_INTERNA
→ patch mínimo
→ teste
→ regressão
→ AutoLupa novamente
```

---

## 17. EXECUÇÃO EM PARALELO SEM PERDER O FIO

Missões grandes podem rodar em paralelo:

```text
TRILHA A = Fable adversarial
TRILHA B = META LUPA baseline/candidata
TRILHA C = modelo local
TRILHA D = Bolt/Builder visual
TRILHA E = WebUI
TRILHA F = casos reais do sistema
TRILHA G = revisor/juiz
```

Cada transição registra:

```text
MISSION_ID=
CYCLE_ID=
AGENT=
ROLE=
WORKTREE=
CONTAINER=
MODEL=
HEAD_BEFORE=
HEAD_AFTER=
FILES_CHANGED=
EVIDENCE=
NEXT_ACTION=
TIMESTAMP=
```

Uma trilha não declara conclusão pela outra.

O orquestrador consolida somente em pontos de transição.

---

## 18. ORDEM DE EXECUÇÃO AGORA

### FASE 1 — RETOMADA

1. ler PR `#418`;
2. reconstruir estado real;
3. mapear os worktrees/candidatos existentes;
4. identificar o que já foi feito;
5. não repetir trabalho.

### FASE 2 — VPS E MODELO LOCAL

1. medir hardware;
2. selecionar modelo;
3. subir em container;
4. validar endpoint;
5. integrar ao gateway;
6. mostrar no painel.

### FASE 3 — WEBUI E BUILDER

1. subir/reparar `ui.centraldark.com`;
2. subir/reparar `builder.centraldark.com`;
3. usar hermes-webui e Bolt existentes;
4. adicionar eventos em tempo real;
5. adicionar botões e cartões dos agentes;
6. provar visualmente.

### FASE 4 — FABLE CONTRA META LUPA

1. congelar baseline;
2. Fable oficial procura a pior lacuna;
3. META LUPA responde;
4. registrar erro;
5. isolar mecanismo;
6. absorver;
7. AutoLupa;
8. regressão;
9. promover ganho.

### FASE 5 — CORRIGIR BOLT E RESTANTE

1. transformar erros reais em testes;
2. usar a META LUPA melhorada;
3. corrigir os módulos;
4. provar no preview;
5. promover main;
6. mostrar no Builder.

### FASE 6 — LOOP PERMANENTE

1. novo uso;
2. nova lacuna;
3. novo desafiante;
4. novo ganho;
5. nova main;
6. nova recarga;
7. novo confronto.

---

## 19. NÃO DEIXAR O CHEFE NO ESCURO

Atualizar somente nas transições importantes, mas atualizar sempre.

Formato visual e objetivo:

```text
🟢 STATE=
🎯 MISSAO=
🤖 AGENTE=
🧠 MODELO=
📦 CONTAINER=
🔬 DESAFIANTE=
🔍 LACUNA=
🧪 TESTE=
📈 GANHO=
📉 REGRESSAO=
🌿 MAIN_SHA=
♻️ RELOAD=
🧹 CLEANUP=
⛔ BLOQUEIO=
➡️ NEXT=
```

No Builder, isso deve aparecer automaticamente.

No chat, informar:

- começou;
- achou erro;
- provou causa;
- absorveu ganho;
- rejeitou candidato;
- promoveu main;
- recarregou;
- limpou;
- bloqueou por causa real.

Não enviar narrativa longa a cada comando.

Não sumir por longos períodos sem transição.

---

## 20. SAÍDA FINAL DE CADA CICLO

```text
CYCLE_ID=
TRIGGER=
PR_418_RECONCILED=
BASELINE_MAIN_SHA=
META_LUPA_BEFORE_SHA=
CHALLENGER=
CHALLENGER_SHA=
FABLE_METHODS_USED=
LOCAL_MODEL_USED=
CONTAINER=
KNOWN_TESTS=
HIDDEN_TESTS=
REAL_BOLT_CASES=
FAILURES_FORCED=
FAILURES_FOUND=
MECHANISMS_ISOLATED=
MECHANISMS_ABSORBED=
MECHANISMS_REJECTED=
AUTOLUPA_ROUNDS=
REGRESSIONS=
ROLLBACK_LITERAL_PROVED=
GAIN_PROVED=
MAIN_PROMOTED=
MAIN_SHA_AFTER=
META_LUPA_AFTER_SHA=
AGENTS_RELOADED=
UI_URL=
BUILDER_URL=
LIVE_PANEL_PROVED=
FILES_CLEANED=
DISK_RECOVERED=
XP_DELTA=
POINT_FIXED_LOCAL=
RESIDUAL_LACUNAS=
NEXT_TRIGGER=
```

---

## 21. PROIBIDO

- interromper o loop por medo genérico;
- usar segurança como desculpa para não agir em pré-produção;
- inventar prova;
- declarar verde por `status=ok`;
- declarar impossível melhorar universalmente;
- tratar amarelo como fim;
- criar META LUPA V2/V3;
- criar Builder paralelo;
- criar WebUI paralelo;
- sujar a Casa local;
- deixar containers temporários esquecidos;
- acumular relatórios inúteis;
- registrar tentativa sem ganho na main;
- integrar Fable inteiro sem prova;
- copiar mecanismo sem ablação;
- esconder o que está acontecendo;
- pedir autorização a cada passo já autorizado;
- usar `force-push`;
- usar `git reset --hard`;
- expor secrets;
- apagar conteúdo único;
- misturar causas diferentes em commit único;
- ignorar PR `#418`;
- começar do zero.

---

## 22. INSTRUÇÃO DE PARTIDA

```text
COMECE AGORA.

1. Leia o PR #418 integralmente e trate-o como plano-base já registrado.
2. Reconstrua o estado real da main, VPS, META LUPA, Fable, Bolt, Builder,
   WebUI, gateway, modelos e worktrees.
3. Não crie plano paralelo.
4. Suba o modelo local compatível com o hardware da VPS dentro do orçamento
   aproximado de 100 GB, em container isolado e observável.
5. Suba ou repare ui.centraldark.com usando hermes-webui.
6. Suba ou repare builder.centraldark.com usando o Bolt existente.
7. Mostre agentes, modelos, containers, confronto, ganhos, regressões,
   commits, main, recarga e limpeza em tempo real.
8. Coloque o Fable oficial como adversário máximo da META LUPA.
9. Force cenários reais onde o Fable tenta provar que a META LUPA não supera.
10. Permita que a META LUPA erre no laboratório.
11. Capture o erro, isole a causa, extraia a habilidade vencedora e absorva.
12. Aplique AutoLupa total, ablação, testes inéditos, modelo diferente,
    missão longa, subagentes, rollback e regressão.
13. Ganho provado sem perda entra automaticamente na main.
14. Recarregue imediatamente todos os agentes e prove o novo hash.
15. Use a META LUPA melhorada para corrigir os erros reais do Bolt e dos
    demais módulos.
16. Promova as correções comprovadas para a main.
17. Limpe todos os temporários da VPS.
18. Preserve somente o que tem valor: código, commits, ledger, hashes,
    testes reproduzíveis e evidência mínima.
19. Continue em loop enquanto houver nova lacuna, novo ganho ou VOI positivo.
20. Pare somente em bloqueio real ou ponto fixo local, sem declarar
    impossibilidade universal.
```

---

## FECHAMENTO OPERACIONAL OBRIGATÓRIO

```text
Feito.
Evidência usada.
Pendência.
Próximo passo.
BOOT.
Fio da missão.
```

```text
Fio da missão:
PR #418 → estado real → modelo local VPS → ui.centraldark.com
→ builder.centraldark.com → Fable confronta → META LUPA erra
→ causa isolada → habilidade absorvida → AutoLupa → regressão
→ main → recarga → Bolt corrigido → visual em tempo real
→ limpeza → novo confronto.
```
