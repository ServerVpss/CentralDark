# COMANDO AO HERMES — EXTRAIR A MEMÓRIA OPERACIONAL DESTA SESSÃO

> Documento privado de casa. Não publicar, não versionar e não enviar a repositório.

## 0. Configuração que o Pivete deve preencher

```text
OUTPUT_ROOT=E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO
PACKAGE_NAME=HERMES-SESSION-CAPSULE-20260729
```

Gate obrigatório:

```text
se OUTPUT_ROOT ainda contém E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO
→ PARAR
→ não criar arquivo
→ não criar diretório
→ não iniciar coletor
→ pedir ao Pivete o destino exato
```

O diretório final e o ZIP deverão ser:

```text
PACKAGE_DIR=<OUTPUT_ROOT>\<PACKAGE_NAME>\
ZIP_PATH=<OUTPUT_ROOT>\<PACKAGE_NAME>.zip
```

Se `PACKAGE_DIR` ou `ZIP_PATH` já existirem:

```text
→ PARAR
→ não sobrescrever
→ informar os dois caminhos existentes
→ aguardar decisão do Pivete
```

---

## 1. Missão

```text
MISSION=EXTRAIR-MEMORIA-OPERACIONAL-HERMES-01
AUTHORIZED_BY=PIVETE
MODE=CREATE_PRIVATE_CAPSULE
CHANGE_LOCATION=OUTPUT_ROOT_ONLY
REPOSITORY_CHANGE=PROIBIDO
SOUL_CHANGE=PROIBIDO
NEW_COLLECTOR=PROIBIDO
NETWORK=PROIBIDO
DESTRUCTIVE_COMMANDS=PROIBIDO
```

Crie uma cápsula portátil com o padrão operacional que você, Hermes, realmente
aprendeu nesta sessão. Ela deverá permitir que outra sessão sua recupere:

- o fio da missão;
- a topologia Pivete–SOL–Hermes;
- o protocolo de conversa;
- a disciplina de autorização;
- o método da MetaLupa em três temperaturas;
- as técnicas aprovadas;
- os instrumentos que falharam;
- os antipadrões aposentados;
- os limites de segurança;
- as métricas de desempenho;
- o estado exato, comprovado e não maquiado do inventário da sua casa.

Não escreva uma narrativa cronológica da conversa. Extraia mecanismos,
invariantes, decisões, evidências e estados.

Não altere nem crie `SOUL.md`. Seu SOUL atual permanece independente e canônico.
Esta cápsula é memória operacional portável, não identidade e não mecanismo de
boot automático.

---

## 2. Autoridade e papéis

Registre este contrato sem inverter papéis:

| Ator | Função | Limite |
|---|---|---|
| Pivete | intenção, sincronização, autorização e decisão final | fala normalmente; não precisa usar protocolo de máquina |
| SOL | supervisão, crítica adversarial, MetaLupa e controle de escopo | não finge acesso local que não possui |
| Hermes | executor local, operador das ferramentas e produtor de evidência | não transforma capacidade técnica em autorização |

Invariante:

```text
Hermes pode estar um passo à frente na execução local
+ SOL pode estar um passo à frente na crítica e verificação
+ Pivete permanece acima dos dois como autoridade humana
= cooperação controlada
```

O fluxo é:

```text
Pivete autoriza
→ SOL delimita ou revisa
→ Hermes reconhece
→ Hermes executa uma unidade autorizada
→ Hermes produz evidência
→ SOL tenta derrubar a conclusão
→ Pivete decide continuidade, mudança ou encerramento
```

Não descreva isso como conversa autônoma irrestrita entre IAs. O modelo correto
é `Human-in-the-Loop`, com sincronização e autorização por etapa.

---

## 3. Fonte permitida para esta extração

Use somente:

1. o conteúdo já presente na sessão atual;
2. fatos e provas que você já emitiu nesta sessão;
3. hashes, códigos de saída, tempos e caminhos já observados;
4. o estado do último turno comprovado.

Não use para criar a cápsula:

- novo coletor;
- nova varredura do perfil;
- leitura de `.env`, `auth.json`, cookies, tokens ou credenciais;
- leitura de outras conversas;
- internet;
- repositório;
- logs novos;
- inspeção recursiva;
- inferência apresentada como fato.

Se uma informação não estiver comprovada na sessão:

```text
STATUS=NAO_COMPROVADO
```

Se houver intenção declarada, mas nenhum resultado posterior:

```text
STATUS=INTENCAO_DECLARADA_NAO_COMPROVADA
```

Nunca complete uma lacuna por plausibilidade.

---

## 4. Estrutura obrigatória

Crie exatamente esta árvore dentro de `PACKAGE_DIR`:

```text
HERMES-SESSION-CAPSULE-20260729/
├── README.md
├── BOOTSTRAP.md
├── 01-missao/
│   ├── FIO-DA-MISSAO.md
│   ├── ESTADO-ATUAL.json
│   └── PENDENCIAS-E-GATES.md
├── 02-protocolos/
│   ├── COMUNICACAO-SOL-HERMES.md
│   ├── EXECUCAO-E-AUTORIZACAO.md
│   ├── COLETORES-E-INSTRUMENTOS.md
│   └── UIA-NAVEGADOR-E-TELAS.md
├── 03-metalupa/
│   ├── TRES-TEMPERATURAS.md
│   ├── OURO-REFINADO.md
│   └── FALSO-VERDE-E-CONTRAPROVA.md
├── 04-metricas/
│   ├── METRICAS-E-FORMULAS.md
│   └── BASELINES-E-DESEMPENHO.md
├── 05-seguranca/
│   ├── LIMITES-E-PRIVACIDADE.md
│   └── SINGLE-WRITER-E-ROLLBACK.md
├── 06-laboratorio/
│   ├── PADROES-CANONICOS.md
│   ├── ANTIPADROES-DEPRECADOS.md
│   ├── DECISION-LOG.md
│   └── EVIDENCIAS-DA-SESSAO.md
├── 07-maquina/
│   ├── capsule.json
│   ├── state.json
│   └── protocol.schema.json
├── VALIDATION.md
└── MANIFEST.sha256
```

Proibições estruturais:

```text
SOUL.md=NAO_CRIAR
AGENTS.md=NAO_CRIAR
SKILL.md=NAO_CRIAR
HOOK=NAO_CRIAR
BOOT_AUTOMATICO=NAO_CRIAR
EXECUTAVEL=NAO_CRIAR
SCRIPT_DE_MUTACAO=NAO_CRIAR
```

---

## 5. Conteúdo obrigatório de cada parte

### 5.1 `README.md`

Explique:

- finalidade da cápsula;
- que ela é privada e portátil;
- que não modifica identidade;
- que não concede autoridade;
- que não deve ser executada automaticamente;
- como verificar `MANIFEST.sha256`;
- como abrir `BOOTSTRAP.md`;
- como distinguir fato, hipótese, candidato e estado depreciado.

Inclua:

```text
CAPSULE_KIND=OPERATIONAL_MEMORY
OWNER=PIVETE
EXECUTOR_IDENTITY=HERMES
SUPERVISOR_IDENTITY=SOL
PRIVATE_HOME_ARTIFACT=SIM
REPOSITORY_ARTIFACT=NAO
AUTOLOAD=NAO
SOUL_INCLUDED=NAO
```

### 5.2 `BOOTSTRAP.md`

Crie um protocolo de retomada, não um prompt de obediência automática:

```text
1. ler README.md;
2. verificar MANIFEST.sha256;
3. ler 01-missao/ESTADO-ATUAL.json;
4. ler 01-missao/FIO-DA-MISSAO.md;
5. ler 02-protocolos/COMUNICACAO-SOL-HERMES.md;
6. ler 05-seguranca/LIMITES-E-PRIVACIDADE.md;
7. comparar a cápsula com a missão recebida no contexto novo;
8. apresentar divergências ao Pivete;
9. aguardar autorização antes de qualquer execução.
```

Inclua este gate:

```text
CAPSULA_CARREGADA ≠ MISSAO_AUTORIZADA
MEMORIA_RECUPERADA ≠ PERMISSAO_DE_EXECUCAO
```

### 5.3 `01-missao/FIO-DA-MISSAO.md`

Registre os dois níveis:

```text
PARENT_MISSION=ORGANIZAR-CASA-HERMES-01
CURRENT_MISSION=INVENTARIO-TOTAL-HERMES-01
NONCE=BBC03689F2C4
CURRENT_MODE=READ_ONLY
MUTATION_AUTHORIZED=NAO
```

Objetivo de longo prazo:

```text
mapear primeiro
→ compreender consumidores e limites
→ avaliar risco para o Hermes Desktop
→ apresentar árvore e evidência
→ organizar uma pasta leve e pouco usada por vez
→ validar funcionamento
→ somente depois considerar link, junction, mudança de perfil ou migração
```

Estado de segurança atual:

```text
PROFILE_MUTATED=NAO
MIGRATION_STARTED=NAO
SYMLINK_CREATED=NAO
JUNCTION_CREATED=NAO
FILES_DELETED=NAO
REPOSITORY_CHANGED_BY_MISSION=NAO
```

Registre que a organização ainda não começou porque o mapeamento não foi
concluído.

### 5.4 `01-missao/ESTADO-ATUAL.json`

Produza JSON válido, UTF-8, chaves em ordem estável. Inclua pelo menos:

```json
{
  "mission": "INVENTARIO-TOTAL-HERMES-01",
  "parent_mission": "ORGANIZAR-CASA-HERMES-01",
  "nonce": "BBC03689F2C4",
  "phase": "MAPEAMENTO_READ_ONLY",
  "folder_current": null,
  "mutation_authorized": false,
  "profile_runtime": "C:\\Users\\danda\\AppData\\Local\\hermes\\profiles\\pivete",
  "profile_runtime_proven": true,
  "hermes_version": "0.19.0 (2026.7.20)",
  "upstream": "9bf1f737",
  "executable": "C:\\Users\\danda\\AppData\\Local\\hermes\\hermes-agent\\venv\\Scripts\\hermes.exe",
  "gateway_at_observation": "running",
  "skills_at_observation": 106,
  "env_exists_content_read": false,
  "soul_exists_content_changed": false,
  "last_valid_profile_report_sha256": "bb03aa8abe3799437c69128eb0cb47fc9524960bdac4d1817cde1158de1aac6e",
  "last_proven_instrument": "PREPARE_NUL_DIAGNOSTIC_SCRIPT_V2_RESULT",
  "last_proven_instrument_status": "INVALID",
  "last_proven_script": "stage-05c-reserved-entry-nul-diagnostic.ps1",
  "last_proven_script_sha256": "ff095024e6af0315c5ae406be6b37469267bd9f827cd96b9f2c16a4c32b92d2c",
  "last_proven_script_lines": 190,
  "last_proven_script_executed": false,
  "next_script_05d": "INTENCAO_DECLARADA_NAO_COMPROVADA",
  "next_gate": "PIVETE_OR_SOL_REVIEW",
  "new_collector_started": false
}
```

Se sua sessão contiver prova posterior à 05c, não a ignore: registre a prova mais
recente e preserve a 05c no histórico. Se não houver resultado posterior,
mantenha 05d como intenção não comprovada.

### 5.5 `01-missao/PENDENCIAS-E-GATES.md`

Separe:

- pendências reais;
- instrumentos inválidos;
- decisões ainda não autorizadas;
- fatos que precisam de contraprova;
- próximo gate humano.

Não transforme uma pendência em falha do produto.

### 5.6 `02-protocolos/COMUNICACAO-SOL-HERMES.md`

Documente o protocolo unificado:

```text
HERMES_TO=SOL
MISSION=<id>
NONCE=<nonce>
TURN=<turn>
PROTOCOL=SOL_HERMES_UNIFIED_V2
STATUS=<estado>
RESULTADO=<resumo>
EVIDENCIA=<prova>
ERROS=<lista_ou_NONE>
FIZ_CERTO=PERGUNTA_PARA_SOL
NOVO_PASSO_INICIADO=NAO
```

E a cápsula de continuidade:

```text
PASTA_ATUAL=
FASE=
ACAO_AUTORIZADA=
ULTIMA_PROVA=
PENDENCIA=
PROIBIDO=
PROXIMO_GATE=
```

Regras:

- Hermes usa linguagem clara igual à SOL quando fala com a SOL;
- Pivete continua falando normalmente;
- texto estruturado identifica máquina, missão e turno;
- mensagem copiada nunca deve ser atribuída ao Pivete sem marcador;
- reconhecer a revisão antes de executar;
- não iniciar o próximo passo antes do gate;
- se a resposta estiver truncada, recuperar o contrato completo antes de agir;
- não usar “você tem razão” para uma correção interna;
- usar `CORRECAO_INTERNA=` quando o próprio Hermes corrigir o próprio erro;
- preservar a cronologia real e nunca maquiar a ordem retroativamente.

### 5.7 `02-protocolos/EXECUCAO-E-AUTORIZACAO.md`

Registre:

```text
capacidade ≠ autorização
planejamento ≠ execução
execução ≠ sucesso
saída verde ≠ contrato satisfeito
arquivo criado ≠ arquivo aprovado
```

Uma unidade de trabalho deve ser:

```text
1 objetivo
+ 1 escopo
+ 1 escritor
+ 1 timeout
+ 1 saída
+ 1 hash
+ 1 revisão
```

Stop conditions:

- divergência de caminho;
- saída ausente;
- timeout;
- parser ou transporte inválido;
- escopo maior que o autorizado;
- nome reservado ou objeto inesperado;
- segredo potencial;
- destino existente;
- necessidade de mutação;
- dúvida material.

Ao parar:

```text
→ preservar saída parcial
→ calcular hash quando seguro
→ marcar INVALID ou PARTIAL
→ não rerodar
→ não corrigir silenciosamente
→ pedir revisão
```

### 5.8 `02-protocolos/COLETORES-E-INSTRUMENTOS.md`

Defina o coletor seguro:

- limitado por profundidade;
- limitado por quantidade;
- limitado por tempo;
- leitura única quando possível;
- sem `rglob` irrestrito;
- sem seguir reparse points;
- sem conteúdo quando metadado basta;
- início registrado antes da primeira leitura;
- cronômetro monotônico;
- saída parcial preservada;
- códigos de saída por estágio;
- relatório sanitizado;
- SHA-256 externo após conclusão.

Técnica de transporte promovida:

```text
Windows simples
→ wrapper Bash/MSYS inevitável
→ um powershell.exe -NoProfile -NonInteractive
→ sem segundo shell
→ sem heredoc
→ sem Python interno
→ comando pequeno e nativo
```

Técnica para lógica complexa:

```text
preparar .ps1 visível
→ revisão de código
→ parser-only
→ teste sintético positivo
→ teste negativo
→ autorização de execução
→ execução isolada
→ validação do relatório
```

Não inclua scripts temporários 05b/05c na cápsula. Registre somente hashes,
estados, falhas e aprendizados.

### 5.9 `02-protocolos/UIA-NAVEGADOR-E-TELAS.md`

Registre:

- aba localizada não significa aba autorizada;
- mensagem renderizada não significa ACK válido;
- print não significa conversa comprovada;
- navegador isolado não significa aba pessoal;
- não abrir outras conversas;
- não acessar credenciais;
- preservar rascunho do Pivete;
- confirmar processo, janela, URL e marcador;
- resposta só termina quando a barra de ações estiver visível;
- quando necessário, rolar em sobreposição controlada até o fim;
- texto truncado deve ser recuperado antes da execução.

Mantenha como candidato, não como padrão aprovado:

```text
UIA_EVENT_OR_LIMITED_SUBTREE=NAO_VERIFICADO
```

Ele só pode ser promovido após testes repetidos, negativo e comparação de tempo.

### 5.10 `03-metalupa/TRES-TEMPERATURAS.md`

Registre:

#### FRIA

```text
objetivo: provar fatos
ferramentas: existência, tipo, tamanho, contagem, código de saída, hash
proibido: interpretar ausência de prova como prova de ausência
```

#### MÉDIA

```text
objetivo: comparar hipóteses
método: uma variável por vez, baseline comparável, prova contrária
saída: hipótese mantida, enfraquecida ou rejeitada
```

#### QUENTE

```text
objetivo: autorizar conclusão ou mudança
gates: alvo, hash, autorização, revisão adversarial, positivo, negativo,
       fronteira, mutação proposital, rollback, sessão limpa e ponto fixo
```

Princípio:

```text
o que está quente e comprovado permanece
o que é novo entra como candidato
o que falhou perde autoridade operacional
o histórico da falha permanece como evidência
```

### 5.11 `03-metalupa/OURO-REFINADO.md`

Extraia apenas os mecanismos reutilizáveis:

- single-writer;
- gate humano;
- execução em unidades pequenas;
- instrumento separado do alvo;
- evidência adversarial;
- hashes e tempos;
- nenhum falso verde;
- uma pasta por vez;
- começar por área leve, pouco usada e sem consumidor ativo;
- organização só depois do mapa;
- links, junctions e mudança de perfil apenas depois de prova de consumidores,
  rollback e zero regressão;
- fatos antigos não são apagados, mas padrões superados deixam de comandar.

### 5.12 `03-metalupa/FALSO-VERDE-E-CONTRAPROVA.md`

Inclua:

```text
TESTS_PASS=SIM não prova regra semântica
ORACULO_COPIADO=NAO_INDEPENDENTE
INSTRUMENTO_QUEBRADO ≠ ALVO_DEFEITUOSO
TARGET_FAILURE e INSTRUMENT_FAILURE devem ser classificados separadamente
```

Sequência mínima:

```text
regra
→ invariantes
→ positivo
→ contraexemplo mínimo
→ oráculo por mecanismo distinto
→ RED
→ mutação que deve ser rejeitada
→ GREEN
→ papéis, bordas e tempo
→ consumidor real
→ rollback
```

### 5.13 `04-metricas/METRICAS-E-FORMULAS.md`

Inclua fórmulas e condições:

```text
GAIN_TIME_PERCENT =
  100 * (BASELINE_SECONDS - CANDIDATE_SECONDS) / BASELINE_SECONDS

ERROR_REDUCTION_PERCENT =
  100 * (BASELINE_ERRORS - CANDIDATE_ERRORS) / BASELINE_ERRORS

REWORK_REDUCTION_PERCENT =
  100 * (BASELINE_RERUNS - CANDIDATE_RERUNS) / BASELINE_RERUNS
```

Só calcular quando:

- mesma tarefa;
- mesmo escopo;
- mesma classe de ambiente;
- ambos os resultados válidos;
- medição monotônica;
- sem timeout escondido;
- sem comparar instrumento incompleto com instrumento concluído.

Métricas recomendadas:

- p50 e p95;
- first-pass success;
- timeout rate;
- scope violation rate;
- evidence completeness;
- human intervention count;
- rollback success;
- rerun count;
- false-green rejection rate.

Use probabilidade bayesiana, razão de verossimilhança, entropia e valor da
informação somente quando premissas e dados forem defensáveis. Não invente
probabilidade para parecer científico.

### 5.14 `04-metricas/BASELINES-E-DESEMPENHO.md`

Registre o exemplo comprovado:

```text
05b_LINES=337
05c_LINES=190
REDUCTION_PERCENT=43.62
05c_LIMIT=180
05c_ACCEPTED=NAO
```

Interpretação:

```text
ganho de tamanho ≠ aprovação
190 > 180
+ descarte determinístico do enumerador ausente
= instrumento rejeitado
```

Registre também:

- `rglob` irrestrito chegou a aproximadamente 301 s e foi abortado;
- varredura UIA ampla ultrapassou aproximadamente 65 s;
- diagnóstico nativo válido levou aproximadamente 6,043 s;
- o coletor de processos válido parcial levou aproximadamente 1,437 s;
- compare tempos apenas quando os objetos medidos forem equivalentes.

### 5.15 `05-seguranca/LIMITES-E-PRIVACIDADE.md`

Inclua:

- não ler ou copiar conteúdo de `.env`;
- não incluir `auth.json`;
- não incluir cookies, tokens, senhas, cabeçalhos ou URLs assinadas;
- não incluir linhas de comando brutas com segredo;
- não publicar;
- não criar commit;
- não fazer push;
- não alterar o repositório;
- não apagar;
- não mover;
- não sobrescrever;
- não tocar fora de `OUTPUT_ROOT`;
- não modificar SOUL;
- não transformar memória em autoexecução;
- não declarar sessão limpa sem prova;
- não declarar rollback sem execução e validação.

### 5.16 `05-seguranca/SINGLE-WRITER-E-ROLLBACK.md`

Registre:

```text
mesmo ambiente → um escritor por vez
SOL revisa enquanto Hermes escreve localmente
Pivete autoriza troca de escritor ou mudança de fase
```

Para qualquer mudança futura:

```text
estado anterior identificado
→ backup ou reversão definida
→ mudança pequena
→ validação
→ rollback executado em teste apropriado
→ comparação final
```

Backup existente sem restauração testada não é rollback comprovado.

### 5.17 `06-laboratorio/PADROES-CANONICOS.md`

Liste cada padrão com:

```text
PATTERN_ID
PROBLEM
INVARIANT
MECHANISM
EVIDENCE
CONFIDENCE
TEMPERATURE
PROMOTION_GATE
```

Inclua no mínimo:

- `HITL_GATE`;
- `SINGLE_WRITER`;
- `ONE_AUTHORIZED_UNIT`;
- `BOUNDED_COLLECTOR`;
- `INSTRUMENT_TARGET_SEPARATION`;
- `EXPLICIT_STOP_CONDITION`;
- `STRUCTURED_HANDOFF`;
- `SCROLL_TO_ACTION_BAR`;
- `FACT_HYPOTHESIS_SEPARATION`;
- `NO_FALSE_GREEN`;
- `ONE_FOLDER_AT_A_TIME`;
- `PRIVATE_CAPSULE_NO_SOUL`.

### 5.18 `06-laboratorio/ANTIPADROES-DEPRECADOS.md`

Não apague a história. Para cada antipadrão, registre:

```text
ANTIPATTERN_ID
FAILURE
EVIDENCE
REPLACED_BY
STATUS=DEPRECATED
DO_NOT_RETRY_WITHOUT_NEW_AUTHORIZATION=SIM
```

Inclua:

- `UNBOUNDED_RGLOB`;
- `INLINE_COMPLEX_POWERSHELL`;
- `BASH_HEREDOC_FOR_WINDOWS_DIAGNOSTIC`;
- `PATH_RECOMPOSITION_FOR_RESERVED_NAME`;
- `RERUN_AFTER_INVALID_WITHOUT_REVIEW`;
- `FULL_UIA_TREE_SCAN`;
- `TRUNCATED_RESPONSE_INFERENCE`;
- `TESTS_PASS_EQUALS_PROJECT_PASS`;
- `COPIED_ORACLE`;
- `SILENT_CORRECTION`;
- `CLAIMED_ROLLBACK_WITHOUT_EXECUTION`.

O que foi superado deixa de orientar a execução, mas permanece auditável.

### 5.19 `06-laboratorio/DECISION-LOG.md`

Registre decisões, não transcrição:

```text
DECISION_ID
TIMESTAMP_IF_PROVEN
CONTEXT
OPTIONS
DECISION
WHY
EVIDENCE
REVERSIBILITY
AUTHORITY
```

Se o horário não estiver comprovado, use `NOT_RECORDED`.

### 5.20 `06-laboratorio/EVIDENCIAS-DA-SESSAO.md`

Inclua os principais recibos já emitidos, sanitizados:

- profile runtime;
- versão e executável;
- hash do diagnóstico nativo válido;
- coletor de processos parcial;
- falha `NUL`;
- 05b preparado e não executado;
- 05c preparado, não executado e rejeitado;
- 05d apenas como intenção, se ainda não houver resultado.

Não copie conteúdo secreto, dumps extensos ou comandos brutos desnecessários.

### 5.21 `07-maquina/capsule.json`

JSON válido com:

```text
schema_version
capsule_id
created_at
owner
executor
supervisor
private
autoload
soul_included
mission
nonce
protocol
files
manifest_algorithm
secret_scan
clean_extraction
```

### 5.22 `07-maquina/state.json`

Represente uma máquina de estados:

```text
WAIT_OUTPUT_ROOT
→ BUILD_PRIVATE_CAPSULE
→ VALIDATE_CONTENT
→ SECRET_SCAN
→ BUILD_MANIFEST
→ CREATE_ZIP
→ CLEAN_EXTRACT
→ VERIFY_EXTRACTED_MANIFEST
→ REPORT_TO_PIVETE
→ STOP
```

Falhas conduzem a:

```text
STOP_WITH_EVIDENCE
```

Nunca a correção ou rerun automático.

### 5.23 `07-maquina/protocol.schema.json`

Crie um JSON Schema mínimo que valide os campos essenciais do protocolo
SOL–Hermes e rejeite ausência de:

- `MISSION`;
- `NONCE`;
- `TURN`;
- `STATUS`;
- `EVIDENCIA`;
- `FIZ_CERTO`;
- `NOVO_PASSO_INICIADO`.

---

## 6. Manifesto, segredos, ZIP e extração limpa

Após criar o conteúdo, execute somente validações do pacote. Isso não autoriza
teste do Hermes Desktop, coletor, rede, perfil, repositório ou Windows.

### 6.1 Scan de segredos

Faça varredura textual somente em `PACKAGE_DIR` antes do ZIP.

Categorias mínimas:

- `OPENAI_API_KEY`;
- `ANTHROPIC_API_KEY`;
- `GITHUB_TOKEN`;
- `Authorization: Bearer`;
- JWT;
- cookie;
- senha;
- private key;
- conteúdo de `.env`;
- `auth.json`;
- URL assinada.

Não imprima o valor encontrado. Relate somente:

```text
SECRET_SCAN=PASS|FAIL
SECRET_MATCH_COUNT=<numero>
SECRET_MATCH_CATEGORIES=<lista_ou_NONE>
```

Se houver correspondência:

```text
→ não criar ZIP
→ não apagar automaticamente
→ informar arquivo e categoria sem revelar valor
→ aguardar o Pivete
```

### 6.2 `MANIFEST.sha256`

Crie manifesto SHA-256 de todos os arquivos do pacote, exceto o próprio
`MANIFEST.sha256`.

Requisitos:

- caminhos relativos;
- ordenação lexical estável;
- separador `/`;
- uma linha por arquivo;
- nenhum caminho absoluto;
- nenhuma entrada para o ZIP externo.

Depois, calcule o hash do próprio manifesto separadamente para o relatório.

### 6.3 ZIP

Crie `ZIP_PATH` sem incluir a si próprio e com uma única raiz:

```text
HERMES-SESSION-CAPSULE-20260729/
```

Não inclua:

- caches;
- arquivos temporários;
- scripts 05b/05c/05d;
- `.git`;
- `.env`;
- logs brutos;
- credenciais;
- SOUL;
- arquivos fora de `PACKAGE_DIR`.

### 6.4 Extração limpa

Crie um diretório temporário novo, extraia o ZIP e verifique:

1. existe exatamente uma raiz;
2. a raiz tem o nome `PACKAGE_NAME`;
3. todos os arquivos do manifesto existem;
4. todos os hashes conferem;
5. não existem arquivos extras não autorizados;
6. JSONs fazem parse;
7. o ZIP não contém path traversal;
8. `SOUL.md` não existe;
9. `.env` e `auth.json` não existem;
10. nenhum arquivo aponta para repositório como destino de escrita.

Depois da verificação:

- não use comando destrutivo amplo;
- preserve ou remova somente o diretório temporário de extração, pelo mecanismo
  seguro disponível;
- nunca use variável de ambiente genérica como alvo de remoção;
- nunca toque em `OUTPUT_ROOT`, `PACKAGE_DIR` ou `ZIP_PATH` durante limpeza.

---

## 7. `VALIDATION.md`

Registre:

```text
PACKAGE_CREATED=SIM|NAO
PACKAGE_DIR=<path>
ZIP_CREATED=SIM|NAO
ZIP_PATH=<path>
FILE_COUNT=<numero>
MANIFEST_ENTRY_COUNT=<numero>
MANIFEST_SHA256=<sha256>
ZIP_SHA256=<sha256>
SECRET_SCAN=PASS|FAIL
SECRET_MATCH_COUNT=<numero>
CLEAN_EXTRACTION=PASS|FAIL
EXTRACTED_MANIFEST=PASS|FAIL
JSON_PARSE=PASS|FAIL
SINGLE_ROOT=PASS|FAIL
PATH_TRAVERSAL=PASS|FAIL
SOUL_INCLUDED=NAO
REPOSITORY_CHANGED=NAO
FILES_WRITTEN_OUTSIDE_OUTPUT_ROOT=0
NEW_COLLECTOR_STARTED=NAO
NETWORK_USED=NAO
DESTRUCTIVE_COMMAND_USED=NAO
VERDICT=VALID|INVALID|PARTIAL
```

Não declare `VALID` se qualquer prova obrigatória faltar.

---

## 8. Resposta final ao Pivete

Ao concluir, responda de forma clara e curta:

```text
HERMES_TO=PIVETE
MISSION=EXTRAIR-MEMORIA-OPERACIONAL-HERMES-01
STATUS=CONCLUIDA|BLOQUEADA
PACKAGE_DIR=<path_ou_NONE>
ZIP_PATH=<path_ou_NONE>
FILE_COUNT=<numero_ou_NONE>
MANIFEST_SHA256=<sha256_ou_NONE>
ZIP_SHA256=<sha256_ou_NONE>
SECRET_SCAN=PASS|FAIL|NOT_RUN
CLEAN_EXTRACTION=PASS|FAIL|NOT_RUN
SOUL_CHANGED=NAO
REPOSITORY_CHANGED=NAO
FILES_WRITTEN_OUTSIDE_OUTPUT_ROOT=0
VERDICT=VALID|INVALID|PARTIAL
PENDENCIA=<lista_ou_NONE>
```

Depois:

```text
→ PARAR
→ não instalar a cápsula
→ não incorporá-la automaticamente
→ não iniciar outra missão
→ aguardar o Pivete
```

---

## 9. Regra de ouro

```text
Memória não é autoridade.
Ferramenta não é permissão.
Velho que falhou perde poder, não perde rastreabilidade.
Novo que parece melhor permanece candidato até sobreviver à contraprova.
Ouro comprovado permanece.
Uma casa organizada começa por um mapa honesto.
```
