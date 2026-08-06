# Aprendizado de segurança — pacote de sessão, contraprovas e falso verde

**Data:** 2026-08-06  
**Autor da intenção:** SEGREDO/CHEFE  
**Categoria:** segurança, proveniência, auditoria adversarial, preservação de sessão  
**Escopo:** evidências do artefato `PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806.zip` e do artefato interno `GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO.zip`  
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
2/2 SECRET_READER=Mutantes deliberadamente inválidos para provar detecção de leitura de .env
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

```text
AUTOR_DA_INTENCAO=SEGREDO/CHEFE
MUDANCA=DE_DETECTOR_DE_ERRO_PARA_DESIGNER_DE_CONTRAPROVAS
GENERALIZACAO=GPT+FABLE+GROK+JANELAS+PACOTES+VERIFICADORES
PONTUACAO_OPERACIONAL_MEDIDA=29/32=90,625%
BASELINE_RECONSTRUIDO=17/32=53,125%
GANHO_ABSOLUTO=+37,500_PONTOS_PERCENTUAIS
GANHO_RELATIVO=+70,588%
```

Esses percentuais medem 32 gates operacionais declarados na sessão; não medem inteligência, valor pessoal ou aprovação externa.

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
