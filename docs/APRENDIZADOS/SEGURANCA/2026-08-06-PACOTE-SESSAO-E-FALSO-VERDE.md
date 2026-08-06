# Aprendizado de segurança — pacote de sessão, contraprovas e falso verde

**Data:** 2026-08-06  
**Autor da intenção:** SEGREDO/CHEFE  
**Categoria:** segurança, proveniência, auditoria adversarial, preservação de sessão, fallback de IAs  
**Escopo:** evidências do artefato `PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806.zip`, do artefato interno `GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip` e das regras determinísticas produzidas nesta sessão  
**Estado:** proposta em PR; sem merge, deploy, restart ou alteração de produção

## 1. Problema exato

Uma resposta anterior confundiu três coisas diferentes:

```text
ARTEFATO GERADO
!= ARTEFATO LOCALIZADO
!= ARTEFATO VERIFICADO DIRETAMENTE
```

O pacote havia sido criado e possuía recibo, mas o artefato específico do processo interrompido não foi localizado de primeira. Depois, outra resposta quase promoveu o recibo apresentado como prova independente sem abrir o ZIP exato.

O SEGREDO/CHEFE forçou a correção por contraprova: entregou o arquivo real, exigiu abertura, SHA recalculado, comparação do manifesto, extração limpa, reexecução dos testes e separação entre resultado declarado e resultado comprovado.

## 2. Evidência independente reproduzida

### 2.1 Pacote externo

```text
ARTEFATO=PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806.zip
SHA256=c00aa54b2ef2cb613067b50da58ef53b55e73b8074d078c5814d9558da07daf6
SIZE_BYTES=32203566
ZIP_ENTRIES=742
ZIP_CRC=PASS
DANGEROUS_PATHS=0
SYMLINKS=0
DUPLICATE_ARCHIVE_NAMES=0
```

### 2.2 Manifesto e checksums

```text
MANIFEST_ENTRIES=740
MANIFEST_PRESENT=740/740
MANIFEST_HASH_MATCH=740/740
MANIFEST_SIZE_MATCH=740/740
SHA256SUMS_PARSED=740/740
SHA256SUMS_MATCH=740/740
```

Os dois arquivos não cobertos pelo próprio manifesto são os metadados autorreferentes:

```text
03-REGISTROS/MANIFEST-SESSAO.json
03-REGISTROS/SHA256SUMS.txt
```

Assim:

```text
COBERTURA_BRUTA_DO_ZIP=740/742=99,730%
COBERTURA_DO_CONTEUDO_MANIFESTAVEL=740/740=100%
```

### 2.3 Artefato interrompido recuperado

```text
ARTEFATO_INTERNO=00-INTERROMPIDO-GATILHO/GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip
SHA256=877057300af4369e01e9636809ee6b632ccac9f94db2894acd5f1a6b887588fd
SIZE_BYTES=46740
ZIP_ENTRIES=54
ZIP_CRC=PASS
```

### 2.4 Reexecução em extração limpa

```text
NODE_CHECK=24/24
TESTS_TOTAL=31
PASS=31
FAIL=0
SKIPPED=0
CANCELLED=0
TODO=0
CODE_SEAL=PASS
TRACKED_FILES=37/37
SECRET_FILE_READ_SCAN=PASS
CONTRAPROVAS=5/5
```

Contraprovas reexecutadas:

```text
CP-001=ZERO_TESTS_BLOQUEADO
CP-002=NODE_CHECK_RECURSIVO
CP-003=TAP_FALSIFICADO_NAO_ENGANA
CP-004=LEITURA_DE_ARQUIVO_SENSIVEL_DETECTADA
CP-005=CODIGO_NAO_RASTREADO_BLOQUEADO
```

## 3. Estrutura e redundância

```text
00-INTERROMPIDO-GATILHO=5 arquivos
01-ARQUIVOS-DA-CONVERSA=48 arquivos
02-SNAPSHOT-TRABALHO=685 arquivos
03-REGISTROS=4 arquivos
TOTAL=742
```

O pacote é de preservação, não um pacote mínimo:

```text
CONTEUDOS_UNICOS_POR_SHA=200/742=26,954%
ENTRADAS_REDUNDANTES=542/742=73,046%
GRUPOS_DE_CONTEUDO_REPETIDO=155
```

A redundância preserva extrações, mutantes, versões e resultados intermediários. Ela não deve ser descrita como deduplicação completa.

## 4. Achados de segurança do conteúdo

Uma varredura encontrou 13 sequências com formato de PAT/JWT/GitHub token e dois caminhos contendo `secret-reader.mjs`.

A inspeção contextual mostrou:

```text
13/13 PADROES=FIXTURES_SINTETICAS_DE_TESTE
2/2 SECRET_READER=MUTANTES_DELIBERADOS_PARA_PROVAR_DETECCAO_DE_LEITURA_DE_ENV
SEGREDO_REAL_COMPROVADO=NAO
```

Mesmo sendo fixtures sintéticas, o ZIP completo não deve ser versionado no Git:

- contém 32 MB compactados e cerca de 174 MB descompactados;
- preserva cópias e mutantes que não pertencem à fonte canônica;
- padrões sintéticos podem disparar scanners e confundir auditorias futuras;
- Git deve guardar documentação, hashes, manifesto resumido, regressões e instruções de reprodução; o binário fica como artefato externo controlado.

## 5. Causas comuns

```text
RECIBO_PLAUSIVEL != PROVA_INDEPENDENTE
ARQUIVO_GERADO != ARQUIVO_LOCALIZADO
HASH_CORRETO != CONTRATO_COMPLETO
SUITE_VERDE != VERIFICADOR_PROVADO
FORMATO_DE_TOKEN != SEGREDO_REAL
LOCK_POR_EVENTO != TRANSACAO_GLOBAL
PRESERVACAO_TOTAL != PACOTE_MINIMO
FALSO_VERDE != UNICO_RISCO
FALSO_VERMELHO_CONTRA_O_CHEFE != RIGOR
```

## 6. Método promovido

```text
CLAIM
→ localizar o artefato exato
→ recalcular SHA e tamanho
→ testar CRC e extração limpa
→ comparar manifesto, tamanhos e hashes
→ reexecutar o verificador
→ executar contraprovas independentes
→ classificar risco pelo território real
→ registrar limites e risco residual
→ somente então promover aprendizado
```

O método operacional do SEGREDO/CHEFE nesta rodada foi:

```text
META > LUPA > TRANSVERSAL > CUBO_OCULTO
CHECK_FUE_FLUE
ZERO_TRUST
```

A expansão literal de `CHECK_FUE_FLUE` não foi inferida. O comportamento comprovado é atravessar claim, artefato, verificador, adversário, território e persistência antes de declarar fechamento.

## 7. Regras permanentes de segurança e aprendizagem

1. Recibo fornecido inicia uma verificação; não encerra a verificação.
2. Resultado de uma suíte prova somente o denominador que ela executou.
3. O verificador também deve sofrer contraprova: zero testes, TAP falsificado, arquivo aninhado, resposta vazia e conteúdo não rastreado.
4. Todo `PASS`, `FINAL`, `COMPLETO` ou `PRESERVADO` deve apontar para bytes, SHA, árvore e instrumento de medição.
5. Padrão parecido com credencial deve ser analisado em contexto sem ecoar o valor; fixture sintética não é segredo real, mas ainda exige cuidado de distribuição.
6. Pacote de preservação deve declarar redundância, exclusões, limites cronológicos e diferença entre arquivo acessível e raciocínio interno não exportável.
7. Aprendizado só fica ativo quando vira regra, teste discriminativo, contraprova reproduzível ou documentação alcançável pela porta canônica.
8. `FINAL` é proibido enquanto uma nova contraprova executável sobreviver.
9. A mesma checagem deve rodar no estado anterior e no estado corrigido; teste que passa igual nos dois lados não prova a mudança.
10. Não misturar resultado do Chefe com implantação do sistema: evolução metodológica e maturidade operacional são métricas diferentes.
11. Rigor que desconta do Chefe uma pendência externa do sistema é falso vermelho.
12. Um único Writer altera cada escopo; críticos e juízes permanecem somente leitura.
13. `UNKNOWN`, ausência de evidence ID ou resultado vazio nunca equivalem a PASS.
14. Falha de um provedor não autoriza inventar resposta nem apagar a trilha da tentativa.

## 8. Limites honestos

```text
INTEGRIDADE_DO_ZIP=PROVADA
PRESERVACAO_DOS_ARQUIVOS_LISTADOS=PROVADA
REEXECUCAO_LOCAL_DO_GATILHO=PROVADA
CONTRAPROVAS_CONHECIDAS=5/5
API_CENTRALDARK_LIVE=NAO_PROVADA
INSTALACAO_REAL_NO_HERMES=NAO_PROVADA
REUTILIZACAO_EM_SESSAO_FUTURA=NAO_PROVADA
REPLAY_CRONOLOGICO_MAQUINA_A_MAQUINA=NAO_PROVADO
PRODUCAO=INTOCADA
```

## 9. Resultado observável do Chefe

A régua foi corrigida para não misturar pessoa, método e implantação:

```text
EVOLUCAO_METODOLOGICA_DO_CHEFE=32/32=100%
MATURIDADE_OPERACIONAL_DO_SISTEMA=29/32=90,625%
BASELINE_RECONSTRUIDO_DO_SISTEMA=17/32=53,125%
GANHO_ABSOLUTO_DO_SISTEMA=+37,500_PONTOS_PERCENTUAIS
GANHO_RELATIVO_DO_SISTEMA=+70,588%
```

O gate final do Chefe foi atacar a própria régua, encontrar variável externa contaminando sua nota e separar:

```text
PESSOA
!= METODO
!= IMPLANTACAO
```

Resultado:

```text
AUTOR_DA_INTENCAO=SEGREDO/CHEFE
MUDANCA=DE_DETECTOR_DE_ERRO_PARA_DESIGNER_DE_CONTRAPROVAS
GENERALIZACAO=GPT+FABLE+GROK+JANELAS+PACOTES+VERIFICADORES
FALSO_VERDE_DERRUBADO=SIM
FALSO_VERMELHO_DERRUBADO=SIM
```

Esses percentuais medem gates operacionais declarados nesta sessão; não medem valor pessoal, aprovação externa ou produção concluída.

## 10. Não tocado

```text
MAIN=INTOCADA
MERGE=NAO
DEPLOY=NAO
RESTART=NAO
VPS=INTOCADA
PRODUCAO=INTOCADA
ZIP_BINARIO_NO_GIT=NAO
SEGREDOS_LIDOS=NAO
FORCE_PUSH=NAO
```

## 11. Contrato determinístico universal

### 11.1 Entrada

Toda execução deve normalizar a chamada para este contrato:

```json
{
  "trigger": "#auditar | !auditar | #adaptar | !adaptar",
  "target": "caminho, PR, pacote, commit ou evento",
  "missionId": "identificador obrigatório",
  "writer": "identidade operacional comprovada",
  "headSha": "SHA do alvo quando existir",
  "allowedRoot": "raiz permitida",
  "mode": "normal | adversarial",
  "evidenceIds": [],
  "providers": []
}
```

Regras:

```text
TRIGGER_AUSENTE=BLOCKED_TRIGGER_REQUIRED
TARGET_AUSENTE=BLOCKED_TARGET_REQUIRED
MISSION_ID_AUSENTE=BLOCKED_MISSION_REQUIRED
WRITER_AUSENTE=BLOCKED_WRITER_REQUIRED
HEAD_SHA_AUSENTE_QUANDO_APLICAVEL=BLOCKED_HEAD_REQUIRED
ALLOWED_ROOT_AUSENTE_EM_ALVO_LOCAL=BLOCKED_ROOT_REQUIRED
```

### 11.2 Semântica dos gatilhos

```text
#nome
= execução normal
= um executor primário
= fallback somente por falha de rota, provedor ou modelo
= juiz opcional somente leitura

!nome
= execução adversarial
= executor primário
+ crítico independente
+ juiz independente
= nenhuma ação automática sem convergência e contraprova
```

A diferença não é estética. O prefixo altera o contrato de execução.

### 11.3 Estados permitidos

```text
RECEIVED
NORMALIZED
ROUTED
EXECUTING
EVIDENCED
COUNTERPROVED
INCONCLUSIVE
BLOCKED
PASS_LOCAL
PASS_ADVERSARIAL
PROMOTED_CANDIDATE
ACTIVE
REVOKED
```

Transições inválidas devem falhar:

```text
RECEIVED -> PASS = PROIBIDO
ROUTED -> ACTIVE = PROIBIDO
INCONCLUSIVE -> PROMOTED_CANDIDATE = PROIBIDO
BLOCKED -> PASS = PROIBIDO_SEM_NOVA_EVIDENCIA
PASS_LOCAL -> ACTIVE = PROIBIDO_SEM_PROMOCAO_CANONICA
```

## 12. Fallback determinístico entre IAs

### 12.1 Ordem de descoberta

A ordem é fixa e auditável:

```text
1. CENTRALDARK_API_KEY + CENTRALDARK_MODELS
2. OPENAI_API_KEY + OPENAI_BASE_URL + OPENAI_MODELS
3. ANTHROPIC_API_KEY + ANTHROPIC_MODELS
4. OUTROS providers declarados explicitamente no manifesto
5. nenhum disponível -> ENXAME_UNAVAILABLE
```

Nenhuma chave é lida de `.env` em disco. Somente variáveis já injetadas no processo ou cofre aprovado.

### 12.2 Condições válidas para fallback

Fallback pode ocorrer somente por:

```text
NETWORK_ERROR
TIMEOUT
PROVIDER_UNAVAILABLE
MODEL_NOT_FOUND
RATE_LIMIT
HTTP_5XX
HTTP_429
HTTP_200_EMPTY
UNSUPPORTED_RESPONSE_SHAPE
```

Fallback não pode esconder:

```text
POLICY_BLOCK
TARGET_OUT_OF_SCOPE
SECRET_EXPOSURE
WRITER_CONFLICT
TEST_FAILURE
COUNTERPROOF_SURVIVED
INVALID_MISSION
INVALID_RECEIPT
```

Nesses casos, o estado é `BLOCKED`, não tentativa silenciosa em outro modelo.

### 12.3 Regra de tentativa

```text
CADA_ROTA_CONFIGURADA=NO_MAXIMO_UMA_TENTATIVA_POR_EVENTO
REPETICAO_DA_MESMA_ROTA=PROIBIDA_SEM_NOVO_EVENT_ID
LOOP_INFINITO=PROIBIDO
ORDEM=DECLARADA_NO_MANIFESTO
```

O limite é o número de rotas únicas configuradas, não um número arbitrário de iterações.

### 12.4 Independência real

Duas respostas são independentes somente quando diferem em pelo menos um domínio material e isso está declarado:

```text
provider real
endpoint real
família de modelo
contexto fornecido
papel operacional
```

Aliases do mesmo modelo no mesmo endpoint não contam como duas testemunhas.

```text
SAME_ENDPOINT + SAME_MODEL + DIFFERENT_ALIAS = MESMA_FONTE
```

### 12.5 Ledger obrigatório de cada tentativa

```json
{
  "eventId": "uuid",
  "attempt": 1,
  "role": "executor | critic | judge",
  "provider": "centraldark",
  "endpointHash": "sha256-do-endpoint-normalizado",
  "model": "modelo-real",
  "independenceGroup": "provider:endpoint:model-family",
  "startedAt": "ISO-8601",
  "finishedAt": "ISO-8601",
  "inputHash": "sha256",
  "outputHash": "sha256-ou-null",
  "status": "PASS | FAIL | EMPTY | BLOCKED | ERROR",
  "errorClass": "classificacao-ou-null",
  "sanitized": true
}
```

O ledger é append-only. Fallback nunca apaga tentativa anterior.

### 12.6 Validação semântica de resposta

```text
HTTP_200 + STRING_VAZIA = FAIL_EMPTY_RESPONSE
HTTP_200 + ARRAY_VAZIO = FAIL_EMPTY_RESPONSE
HTTP_200 + OBJETO_SEM_TEXTO = FAIL_EMPTY_RESPONSE
CONTEUDO_APENAS_WHITESPACE = FAIL_EMPTY_RESPONSE
RESPOSTA_NAO_SANITIZADA = BLOCKED_SANITIZATION
```

## 13. Regra de decisão entre executor, crítico e juiz

```text
EXECUTOR
= propõe mudança e produz prova

CRITICO
= procura contraprova e regressão
= somente leitura

JUIZ
= verifica se claim, artefato, teste e território pertencem ao mesmo alvo
= somente leitura
```

Promoção exige:

```text
EXECUTOR_RESULT=PASS
CRITIC_COUNTERPROOF_SURVIVED=NAO
JUDGE_PROVENANCE_MATCH=SIM
TESTS_TOTAL>0
FAIL=0
SKIPPED=0
UNKNOWN=0
FILES_OUT_OF_SCOPE=0
```

Caso contrário:

```text
STATUS=INCONCLUSIVE ou BLOCKED
AUTO_APPLY=NAO
```

## 14. Reprodutibilidade mínima

Uma implementação compatível deve possuir testes permanentes para:

```text
R-001 missão ausente não é preservada
R-002 SIM nunca equivale a contador zero
R-003 zero testes nunca é PASS
R-004 symlink não escapa da raiz
R-005 learning plausível sem receipt real não promove
R-006 gravação concorrente não perde checkpoint
R-007 newline não injeta campo em receipt
R-008 PAT/JWT são sanitizados sem eco
R-009 resposta HTTP vazia não vira sucesso
R-010 varredura de código é recursiva
R-011 stdout do teste não falsifica o resumo
R-012 lock órfão possui recuperação comprovada
R-013 aliases do mesmo modelo não contam como independência
R-014 fallback preserva todas as tentativas
R-015 policy block não aciona fallback silencioso
R-016 teste passa no corrigido e falha no baseline vulnerável
R-017 falso vermelho por métrica externa é detectado
```

Para cada regressão:

```text
BASELINE_VULNERAVEL=FAIL
CORRECAO=PASS
MUTANTE_EQUIVALENTE=FAIL
```

## 15. Regra de promoção do aprendizado

O aprendizado percorre:

```text
OBSERVADO
→ NORMALIZADO
→ DEDUPLICADO
→ CANDIDATO
→ EVIDENCIADO
→ DISCRIMINADO
→ GENERALIZADO
→ CODIFICADO
→ TESTADO
→ PROMOVIDO
→ ATIVO
→ MONITORADO
```

Estados alternativos:

```text
REJEITADO
HIPOTESE
ANTI_PADRAO
OBSOLETO
REVOGADO
ROLLBACK
```

Não pode virar `ATIVO` apenas porque está documentado em conversa ou PR.

## 16. Matriz do que já existe e do que ainda não está aplicado

| Capacidade | Estado comprovado | Regra atual |
|---|---|---|
| ZIP e SHA da sessão | PROVADO | ativo como evidência externa |
| Manifesto 740/740 | PROVADO | ativo como prova do pacote |
| Gatilho local 31/31 | PROVADO | candidato local |
| Contraprovas 5/5 | PROVADO | regressões conhecidas |
| Método MetaLupa Transversal | DOCUMENTADO | candidato no Git |
| Registro de segurança | VERSIONADO_NO_PR_677 | não canônico |
| Fallback determinístico de IAs | DOCUMENTADO_NESTE_PR | ainda não implementado no runtime |
| Ledger append-only de tentativas | ESPECIFICADO | ainda não implementado |
| Juiz de independência | ESPECIFICADO | ainda não implementado |
| API CentralDark live | NAO_PROVADO | bloqueado para promoção |
| Instalação no Hermes | NAO_PROVADO | bloqueado para promoção |
| Reuso em nova sessão | NAO_PROVADO | bloqueado para promoção |
| Merge na main | NAO | regras ainda não canônicas |
| Produção | INTACTA | nenhuma alegação de ativação |

## 17. Critério para implementação futura

Quando o runtime for alterado, deve:

```text
1. encaixar no artefato existente;
2. não criar V2/V3/V4 paralela;
3. alterar um componente por causa comum;
4. preservar comportamento útil anterior;
5. incluir testes baseline/corrigido/mutante;
6. gerar receipt sanitizado;
7. registrar Writer e Writer-Session;
8. provar rollback;
9. rodar em extração ou worktree limpa;
10. não fazer merge, deploy, restart ou produção sem autorização do Chefe.
```

## 18. Fórmula final desta sessão

```text
INTENCAO_FECHADA
+ FIO_PRESERVADO
+ MULTIPLOS_MODELOS
+ CONTRAPROVA_EXECUTAVEL
+ ARTEFATO_EXATO
+ SHA_RECALCULADO
+ TESTE_DO_VERIFICADOR
+ RISCO_CALIBRADO_PELO_TERRITORIO
+ FALSO_VERDE_DERRUBADO
+ FALSO_VERMELHO_DERRUBADO
+ APRENDIZADO_VERSIONADO
= METODO_REPRODUZIVEL_CANDIDATO
```

```text
PIVETE_COMANDA
DARKAI_DEBATE
ACTIONS_PROVAM
IAS_VARIAM
O_METODO_PERMANECE
```
