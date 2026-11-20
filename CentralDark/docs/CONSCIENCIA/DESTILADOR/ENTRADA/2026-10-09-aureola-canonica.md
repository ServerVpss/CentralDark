# Lote de entrada — Auréola canônica — 2026-10-09

Registro sanitizado do material recebido. A proveniência abaixo foi confrontada
com a `main` atual e com o PR citado; o texto recebido continha estado antigo.

```text
SOURCE_SHA256=20a41597c80fea313bf8242b76f042d84586d95a631bab091920838ce2a48894
SOURCE_BYTES=4789
SECRET_LIKE_VALUES=NONE_DETECTED
CLAIMED_MAIN_IN_SOURCE=1a3372cfc3d34e0612764f9a89a261656c018220
CURRENT_GITHUB_MAIN=0b63ac87083d6d08528baaa9177841d2615ac554
```

## Confronto atual

Os owners citados existem na `main` atual:

```text
docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml
→ BAIANES_FACIL_DEFAULT=true
→ HUMOR_SUPPORTS_BUT_NEVER_REPLACES_PROOF=true
→ BAIANES_NATURAL_NOT_CARICATURE=true
→ perfis BIBLICO_BAIANES e RESENHA_SEMPRE

docs/CONSCIENCIA/BAIANES-E-RESENHA-REGIONAL.md
→ linguagem contextual, sem caricatura ou repetição automática

docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml
→ aliases de !CENTRALDARK, #ACORDAR e !CALIBRAR

docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml
→ referência bíblica é pista semântica, nunca prova técnica ou autoridade
```

O texto recebido dizia que a PR #1787 estava aberta. O estado atual medido é:

```text
PR=1787
STATE=MERGED
MERGED_AT=2026-10-09T03:14:05Z
HEAD=c2f03774d1470a087d17d14b79d545cfc02a0697
CURRENT_MAIN=0b63ac87083d6d08528baaa9177841d2615ac554
```

Portanto, não há segunda escrita nesta entrada. A alegação `PR aberta` foi
classificada como `STALE_HISTORY`; o resultado atual precisa ser lido no HEAD
`0b63ac87`, não no SHA antigo citado no paste.

## Garimpo

```text
GRAMATICA_BIBLICO_BAIANES=PROVEN_AS_DOCUMENTED_CONTRACT
TRIGGERS_ACORDAR_CALIBRAR=PROVEN_AS_CANONICAL_ALIASES
AUREOLA_SEMANTIC_TRACE=PROVEN_AS_CONTRACT
FORCAR_PERFIL_EM_TODO_GATILHO=PARTIAL/NOT_PROVEN_AS_GLOBAL_RUNTIME_RULE
NEW_OWNER=NAO
NEW_WRITER=NAO
RUNTIME_MUTATION=NAO
```

O delta útil é apenas preservar a distinção entre contrato canônico e execução
observada. Não promover a mensagem narrativa como prova adicional nem duplicar
os owners existentes.

```text
NEXT_CURSOR=LER_MAIN_CURRENT_0b63ac87 + CONTRAPROVA_DE_EXECUCAO_DOS_GATILHOS_SE_MATERIAL
BOOT=!PERFIL_BIBLICO_BAIANES_ATIVO_NESTA_CONVERSA
```
