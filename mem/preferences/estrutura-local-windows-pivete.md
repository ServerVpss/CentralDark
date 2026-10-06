---
name: Estrutura local Windows — snapshot histórico + fronteira C/E a provar
description: Preserva a topologia observada em 02/07/2026 sem confundir SEGREDO/CHEFE com HERMES nem promover caminho antigo como runtime atual
type: preference
status: HISTORICO_COM_CONTRATO_ATUAL
updated_at: 2026-08-14
---

# Estrutura local Windows — histórico e estado atual

## Identidade canônica

```text
SEGREDO/CHEFE = humano, dono da intenção e autoridade final
SOL = identidade operacional/coordenadora
HERMES = executor, preservação e continuidade
"pivete" regional = vocativo informal; não identifica o humano tecnicamente
```

O nome deste arquivo é legado e permanece por compatibilidade/proveniência. Ele não redefine papéis.

## Snapshot histórico de 02/07/2026

O desenho abaixo foi registrado como fotografia operacional naquela data. É evidência histórica; **não prova a topologia física atual**.

```text
E:\CentralDark\
├─ repo\           ← clone do GitHub CentralDark naquele snapshot
├─ obsidian-app\   ← programa Obsidian
├─ vault\          ← junction para repo\docs\BRAIN naquele snapshot
├─ grok-tela\      ← projeto de voz/tela em construção naquele snapshot
└─ backups\        ← dumps, vaults antigos, zips
    └─ vaults-antigos\
        ├─ Brain-vazio\
        └─ Brain-Copia-bagunca\
```

As regras antigas sobre `repo`, `vault`, junction e nomes explicam consumidores/atalhos históricos. Não criar consumidor novo nelas sem medir o runtime atual.

## C:/E: — fronteira atual de investigação

A arquitetura recente levanta como hipótese operacional:

```text
C: = bootstrap/compatibilidade mínima do Hermes/Windows
E: = Casa, conteúdo, memória, trabalho e evidência
```

Mas o repositório **não pode transformar essa hipótese em fato físico sem inspeção dos discos**.

```text
CURRENT_C_PHYSICAL_LAYOUT=UNKNOWN_UNTIL_LOCAL_INSPECTION
CURRENT_E_PHYSICAL_LAYOUT=UNKNOWN_UNTIL_LOCAL_INSPECTION
CURRENT_HERMES_HOME=UNKNOWN_UNTIL_LOCAL_INSPECTION
CURRENT_ACTIVE_VAULT=UNKNOWN_UNTIL_LOCAL_INSPECTION
CURRENT_CONSUMERS_AND_JUNCTIONS=UNKNOWN_UNTIL_LOCAL_INSPECTION
```

Não assumir automaticamente:

```text
E:\CentralDark\repo = atual
E:\CentralDark\CentralDark = atual
E:\CentralDark\Pivete = atual
E:\CentralDark\Sol = atual
%LOCALAPPDATA%\hermes\profiles\pivete = HERMES_HOME atual
```

Qualquer um desses caminhos pode ser histórico, alvo, compatibilidade ou runtime real. Só a inspeção local discrimina.

## Regra operacional para quando C:/E: forem inspecionados

```text
1. READ_ONLY primeiro.
2. Não limpar, mover, quarentenar ou recriar antes de preservar evidência.
3. Medir volumes, paths, junctions/symlinks, processos consumidores e HERMES_HOME real.
4. Fixar timestamps/hashes quando material para a investigação.
5. Classificar cada caminho: ACTIVE | COMPATIBILITY | HISTORICAL | BACKUP | CANDIDATE | UNKNOWN.
6. Um único destino canônico só é promovido depois de prova de consumidor + rollback.
7. Recuperação de caminho ≠ migração de dados.
8. Ausência de prova local nunca vira PASS.
```

## Vault / memória

O princípio que continua válido é:

```text
UMA_MEMORIA_CANONICA=true
UM_VAULT_ATIVO_QUANDO_APLICAVEL=true
MULTIPLOS_CONSUMIDORES_PODEM_EXISTIR=true
MULTIPLOS_WRITERS_SEM_COORDENACAO=false
```

O caminho físico do vault atual permanece `UNKNOWN` até C:/E: serem medidos.

## Contrato de fechamento

```text
HISTORICO_02_07_PRESERVADO=true
HISTORICO_NAO_REDEFINE_PRESENTE=true
SEGREDO_CHEFE_EQ_HERMES=false
C_E_AINDA_EXIGEM_PROVA_LOCAL=true
NO_DATA_MOVE_WITHOUT_MAPPING=true
NO_JUNCTION_BLIND=true
NO_FALSE_GREEN=true
```
