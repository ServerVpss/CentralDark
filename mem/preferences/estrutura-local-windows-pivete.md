---
name: Estrutura Local do Pivete — Casa em E:\CentralDark
description: Residência física da Casa, fronteira do profile Hermes no disco C e contrato de recuperação determinística de caminho
type: preference
status: CANDIDATO_PR_677
intent_author: SEGREDO/CHEFE/PIVETE
updated_at: 2026-08-06
---

# Estrutura local — Casa CentralDark no Windows

## 0. Decisão atual e histórico preservado

A organização registrada em 02/07/2026 usava este desenho:

```text
E:\CentralDark\
├── repo\
├── obsidian-app\
├── vault\              # junction para repo\docs\BRAIN
├── grok-tela\
└── backups\
```

Essa estrutura permanece no histórico Git e explica artefatos e atalhos antigos. Ela **não é mais a direção final** depois da decisão explícita do Pivete em 06/08/2026.

```text
DECISAO_ANTIGA=HISTORICA_SUPERADA_PARA_NOVAS_MIGRACOES
APAGAR_CAMINHO_ANTIGO_AUTOMATICAMENTE=NAO
QUEBRAR_CONSUMIDOR_EXISTENTE=NAO
HISTORICO_PRESERVADO_NO_GIT=SIM
```

## 1. Mapa definitivo de residência

```text
CASA_FISICA_ROOT=E:\CentralDark
SISTEMA_CANONICO_ALVO=E:\CentralDark\CentralDark
PROFILE_BOOTSTRAP_ROOT=%LOCALAPPDATA%\hermes\profiles\pivete
```

Interpretação:

- `E:\CentralDark` é o **terreno físico da Casa**: aplicações, sistema, memória, vault, projetos, evidências, worktrees, backups e artefatos pesados.
- `E:\CentralDark\CentralDark` é o **alvo canônico do sistema principal** e do material que precisa sobreviver, ser auditado, indexado pelo Obsidian/Graphify e evoluído fora do disco do sistema.
- `%LOCALAPPDATA%\hermes\profiles\pivete` é o **bootstrap/profile mínimo** necessário para o Hermes localizar a Casa e iniciar o papel correto. Ele não deve virar depósito do sistema inteiro.

```text
DISCO_C=BOOTSTRAP+COMPATIBILIDADE_MINIMA
DISCO_E=CASA+CONTEUDO+MEMORIA+TRABALHO+EVIDENCIA
```

## 2. Estado observado versus alvo

As capturas de 06/08/2026 mostram, entre outros itens:

```text
E:\CentralDark\Pivete\
├── _quarantine\
├── BACKUPS\
├── cache\
├── CentralDark\
├── config\
├── EVIDENCE_ROOT\
├── imagens\
├── inbox\
├── logs\
├── MARKDOWN\
├── NUCLEO\
├── scripts\
├── TEMP\
└── worktrees\

E:\CentralDark\Sol\
```

Essas raízes são **estado existente e evidência**, não lixo e não autorização de mudança automática.

```text
E:\CentralDark\Pivete=RAIZ_EXISTENTE_A_MAPEAR
E:\CentralDark\Sol=RAIZ_EXISTENTE_A_MAPEAR
E:\CentralDark\CentralDark=ALVO_CANONICO_DECLARADO
```

Até a migração ser provada:

```text
RENOMEAR_PIVETE_OU_SOL=NAO
MOVER_CONTEUDO_AUTOMATICAMENTE=NAO
EXCLUIR_DUPLICATA_APARENTE=NAO
CRIAR_JUNCTION_CEGA=NAO
```

## 3. O que deve permanecer no disco C

Somente o mínimo que o Hermes/Windows realmente exige e que foi comprovado como consumidor ativo:

```text
C:\Users\danda\AppData\Local\hermes\
├── executavel/arquivos controlados pela aplicação, quando obrigatórios
├── bootstrap do profile ativo
├── seletor/ponteiro sanitizado para a Casa
├── configuração mínima exigida pelo runtime
├── locks e receipts pequenos necessários ao boot
└── dados que o upstream ainda não suporta mover, até laboratório provar
```

Não mover cegamente bancos, WAL/SHM, autenticação, sessão ou arquivos pertencentes a processo vivo.

Não devem permanecer no C como residência final:

```text
REPOSITORIOS_PESADOS
WORKTREES
VAULT_OBSIDIAN
GRAPHIFY_INDEXES_PESADOS
MEMORIA_CANONICA
EVIDENCIAS_E_CAPTURAS
PACOTES_ZIP
BACKUPS
DATASETS
ARTEFATOS_DE_TESTE
CACHE_GRANDE
LOGS_SEM_RETENCAO
MODELOS_OU_DOWNLOADS_GRANDES
```

## 4. Organização candidata dentro da Casa

A organização interna deve encaixar o que já existe, sem criar outra CentralDark concorrente:

```text
E:\CentralDark\
├── CentralDark\                 # sistema/repositório/casa canônica alvo
│   ├── docs\
│   ├── mem\
│   ├── .agents\
│   ├── apps\
│   ├── scripts\
│   └── ... conteúdo versionado existente
├── Pivete\                     # estado legado/operacional a consolidar com prova
├── Sol\                        # identidade/config existente a consolidar com prova
├── Apps\                       # aplicações externas, quando inventariadas
├── Vault\                      # visão Obsidian; sem segundo vault ativo
├── Graphify\                   # índices derivados e reconstruíveis
├── Worktrees\                  # ou TEMP\worktrees, após escolher um único padrão
├── Evidence\                   # receipts, relatórios e provas
├── Backups\                    # cópias com manifesto e retenção
├── Quarantine\                 # desconhecido preservado, não apagado
└── Temp\                       # descartável com TTL e ownership
```

Os nomes acima são alvo de consolidação. Antes de qualquer move, o executor deve descobrir consumidores, atalhos e processos atuais.

## 5. Um vault, uma memória, vários consumidores

```text
UM_VAULT_ATIVO=SIM
UMA_MEMORIA_PESSOAL_CANONICA=SIM
MULTIPLOS_CONSUMIDORES_READ_ONLY=SIM
MULTIPLOS_WRITERS_SEM_COORDENACAO=NAO
```

Obsidian e Graphify são visões/índices sobre o conteúdo canônico. Eles não viram segunda memória nem segunda fonte de verdade.

```text
CONTEUDO_CANONICO=E:\CentralDark\CentralDark
OBSIDIAN=VISAO_E_EDICAO_CONTROLADA
GRAPHIFY=INDICE_DERIVADO_RECONSTRUIVEL
GITHUB=RASTRO_VERSIONADO
```

Junction só pode existir como compatibilidade de uma raiz comprovada. Não criar uma teia de links por subpasta.

## 6. Contrato determinístico de localização da Casa

O runtime precisa reencontrar a Casa quando o caminho mudar, mas **não pode procurar e começar a mexer em arquivos**.

### 6.1 Identidade do destino

O destino canônico deve possuir um marcador não secreto e versionado/gerenciado, por exemplo:

```json
{
  "schema": "centraldark.home.v1",
  "home_id": "CENTRALDARK-CASA-PIVETE",
  "canonical_relative_root": "CentralDark",
  "intent_author": "SEGREDO/CHEFE",
  "data_mutation_allowed": false
}
```

A implementação final deve reutilizar arquivo canônico equivalente se já existir; não criar dois manifests concorrentes.

O ponteiro mínimo no profile deve guardar somente:

```text
HOME_ID
ULTIMO_CAMINHO_VALIDO
IDENTIDADE_DO_VOLUME_OU_DISPOSITIVO
HASH_DO_MARCADOR
SCHEMA_VERSION
```

Nunca guardar token, segredo, conversa ou conteúdo da memória nesse ponteiro.

### 6.2 Algoritmo de recuperação

```text
LER_PONTEIRO_MINIMO
→ NORMALIZAR_CAMINHO_SEM_SEGUIR_ATALHO_NAO_CONFIAVEL
→ VERIFICAR_VOLUME+HOME_ID+HASH_DO_MARCADOR
→ DESTINO_VALIDO?
   ├─ SIM: USAR_SEM_REESCREVER_DADOS
   └─ NAO: PROCURAR_MARCADOR_EM_VOLUMES_LOCAIS_PERMITIDOS
            → ZERO_MATCH: BLOCKED_HOME_NOT_FOUND
            → MAIS_DE_UM: BLOCKED_HOME_AMBIGUOUS
            → UM_MATCH: ATUALIZAR_SOMENTE_O_PONTEIRO_DE_FORMA_ATOMICA
```

A letra `E:` não é identidade suficiente. Se o Windows trocar a letra da unidade, o resolvedor deve usar também identidade estável do volume/dispositivo e o marcador da Casa.

### 6.3 Limites inegociáveis do resolvedor

```text
RESOLVEDOR_COPIA_ARQUIVOS=NAO
RESOLVEDOR_MOVE_ARQUIVOS=NAO
RESOLVEDOR_EXCLUI_ARQUIVOS=NAO
RESOLVEDOR_REESCREVE_SOUL=NAO
RESOLVEDOR_REESCREVE_CONFIG_HERMES=NAO
RESOLVEDOR_ALTERA_DESKTOP_JSON=NAO
RESOLVEDOR_MIGRA_BANCO=NAO
RESOLVEDOR_CRIA_JUNCTION=NAO
RESOLVEDOR_FAZ_FALLBACK_SILENCIOSO_PARA_C=NAO
RESOLVEDOR_ATUALIZA_APENAS_PONTEIRO=SIM
```

Atualização do ponteiro:

```text
LOCK_EXCLUSIVO
→ ESCREVER_TEMP_COM_NOME_UNICO
→ FSYNC/FLUSH_QUANDO_SUPORTADO
→ VALIDAR_CONTEUDO_TEMP
→ RENAME_ATOMICO
→ RELER
→ EMITIR_RECEIPT_SANITIZADO
→ LIBERAR_LOCK
```

Se o ponteiro não puder ser atualizado, o caminho encontrado pode ser relatado, mas não deve ser promovido silenciosamente.

## 7. Migração é missão separada da recuperação

Recuperar direção não significa migrar conteúdo.

```text
PATH_RECOVERY=REENCONTRAR+VALIDAR+REPONTAR
DATA_MIGRATION=INVENTARIAR+COPIAR+COMPARAR+TROCAR_CONSUMIDOR+ROLLBACK
```

Migração segura:

```text
1. INVENTARIO READ-ONLY de processos, consumidores, arquivos e tamanhos.
2. IDENTIFICAR bancos abertos, WAL/SHM, locks e ownership.
3. FIXAR origem, destino, manifest e baseline.
4. FAZER backup testável fora do destino.
5. COPIAR para staging; nunca mover como primeira ação.
6. COMPARAR contagem, tamanho e SHA-256 dos arquivos elegíveis.
7. TESTAR novo caminho em laboratório com profile descartável/sanitizado.
8. TROCAR um consumidor por vez.
9. PROVAR Desktop, CLI, sessão, memória, skills, Telegram e restart.
10. MANTER origem intacta em quarentena durante a janela de rollback.
11. REMOVER origem somente por decisão posterior explícita e prova de não consumo.
```

## 8. Contraprovas obrigatórias do futuro código

```text
T01 caminho correto e marcador válido → PASS sem escrita de dados
T02 letra do volume mudou, identidade única → atualiza somente ponteiro
T03 destino ausente → BLOCKED_HOME_NOT_FOUND
T04 dois marcadores válidos → BLOCKED_HOME_AMBIGUOUS
T05 marcador adulterado → BLOCKED_HOME_IDENTITY_MISMATCH
T06 ponteiro corrompido → bloqueia ou recupera por marcador único; nunca inventa
T07 C quase cheio → boot não copia conteúdo para C
T08 arquivos do Hermes Desktop antes/depois → hash e conteúdo preservados
T09 banco/WAL ativo → migração bloqueada
T10 symlink/junction fora da raiz → bloqueado
T11 falha durante escrita do ponteiro → ponteiro anterior preservado
T12 rollback → consumidor volta ao caminho anterior comprovado
T13 Graphify/Obsidian indisponível → Casa continua válida
T14 Telegram em outra interface → mesma missão/profile, sem nova memória
```

## 9. Conflitos com registros anteriores

### Preferência de 02/07/2026

O antigo `E:\CentralDark\repo` e a junction `E:\CentralDark\vault` são históricos. Não devem ganhar novos consumidores depois da promoção desta decisão. Consumidores existentes precisam ser mapeados e migrados, não quebrados.

### PR-mãe #554

O PR-mãe já mapeia a Casa em `E:\CentralDark`, reconhece raízes espalhadas e proíbe mover `HERMES_HOME` antes do inventário. Sua arquitetura de destino ainda era candidata e usava `E:\CentralDark\Hermes\03-root-de-dados`. Esta decisão mais nova fixa a residência física e exige que qualquer implementação futura seja reconciliada no PR-mãe como delta, não executada por surpresa.

### PR #637

O candidato Obsidian usa `E:\CentralDark\Pivete\CASA-VAULT`. Ele está desalinhado com o novo alvo `E:\CentralDark\CentralDark` e não está mergeável no estado verificado. Não promover nem executar esse caminho antes de rebase/reconciliação e teste de um único vault.

### PR #662

O validador de identidade já aceita `E:\CentralDark\Sol` e `E:\CentralDark\Pivete` como raízes observadas. Isso prova capacidade de inspeção de perfis; não implementa residência, migração nem recuperação automática de caminho.

## 10. Estado honesto

```text
CASA_E_ROOT_OBSERVADA=SIM
PASTAS_PIVETE_E_SOL_OBSERVADAS=SIM
SISTEMA_CANONICO_ALVO_E_CENTRALDARK_CENTRALDARK=DECISAO_REGISTRADA_NO_PR_677
PROFILE_C_MINIMO=CONTRATO_REGISTRADO_NO_PR_677
CODIGO_DE_PATH_RECOVERY_IMPLEMENTADO=NAO
CODIGO_DE_PATH_RECOVERY_TESTADO=NAO
HERMES_HOME_MOVIDO=NAO
ARQUIVOS_DO_DESKTOP_ALTERADOS=NAO
DADOS_MIGRADOS=NAO
JUNCTION_CRIADA=NAO
MAIN_ATUALIZADA=NAO
```

## 11. Ordem para o executor da Casa

```text
MAPEAR
→ PROVAR HERMES_HOME E CONSUMIDORES REAIS
→ LOCALIZAR CONFIG/PONTEIRO CANÔNICO EXISTENTE
→ ENCAIXAR O RESOLVEDOR NO ARTEFATO EXISTENTE
→ ESCREVER TESTES T01–T14 ANTES DA MIGRAÇÃO
→ RODAR EM MODO READ_ONLY/SHADOW
→ PROVAR QUE NENHUM ARQUIVO DO HERMES DESKTOP MUDOU
→ APRESENTAR RECEIPT E PLANO DE ROLLBACK
→ SOMENTE DEPOIS PROPOR A MIGRAÇÃO PARA E:
```

## 12. Fórmula final

```text
C: ACORDA E APONTA
E: GUARDA, TRABALHA E PRESERVA
HERMES: EXECUTA
SOL: GOVERNA E REVISA
PIVETE: DECIDE
```
