---
title: "CENTRALDARK GOLDEN COMMAND — skin central-dark"
status: "PASS_PENDING_HUMAN_VISUAL"
date: 2026-11-09
updated: 2026-11-09T14:36:14Z
language: pt-BR
category: "RECEIPT"
sensitivity: INTERNAL
owner: "/data/skins/central-dark.yaml"
consumer: "Hermes CLI native Rich banner renderer"
writer: "HERMES"
source_rule: "DOCUMENTED != EXECUTED; ACTION != PROOF; UNKNOWN != PASS"
---

# CENTRALDARK GOLDEN COMMAND

## Intenção

Aperfeiçoar a skin `central-dark` existente sem alterar a engine Hermes,
sem criar segunda skin, sem criar segundo renderer e sem alterar as nove skins
builtin.

## Owner e persistência

```text
HERMES_HOME=/data
SKIN_PATH=/data/skins/central-dark.yaml
CONFIG_PATH=/data/config.yaml
ACTIVE_SKIN=central-dark
LANGUAGE=pt
```

Backup verificável:

```text
/data/cache/scratch/central-dark-rov-backup-20261109T143425Z/
```

SHA antes do delta desta rodada:

```text
8811806287b134a217019c627ccb504eb9290ce931c1f396028aa7b5e659e8b9
```

SHA final:

```text
6cdb4da84ee6ab291091c7b46a77cde7150253e995e932a5683c117ecd82849d
```

## Delta aplicado

Somente `central-dark.yaml` recebeu alteração visual nesta rodada:

- `banner_logo`: logo grande de seis linhas.
- `banner_hero`: monograma compacto `CENTRAL DARK`.
- Dourado primário/secundário e ciano funcional.
- Paleta funcional herdada de `default` preservada.
- Branding, prompt, tool prefix, spinner e painel de dados preservados.

## Renderer

Fonte oficial instalada:

```text
/opt/hermes/hermes_cli/skin_engine.py
/opt/hermes/hermes_cli/banner.py
```

Provas de compatibilidade:

```text
banner_logo: suportado
banner_hero: suportado
large_logo_gate: shutil.get_terminal_size().columns >= 95
```

## Testes

```text
YAML_SCHEMA=PASS
RICH_MARKUP=PASS
COLORS_HEX=PASS
DEFAULT_FUNCTIONAL_PALETTE=PASS
LOGO_LINES=6
LOGO_MAX_CHARS=73
WIDTH_60=PASS LOGO=no
WIDTH_80=PASS LOGO=no
WIDTH_94=PASS LOGO=no
WIDTH_95=PASS LOGO=yes
WIDTH_100=PASS LOGO=yes
WIDTH_120=PASS LOGO=yes
WIDTH_160=PASS LOGO=yes
WIDTH_200=PASS LOGO=yes
PERSISTENCE_PROCESS_1=PASS
PERSISTENCE_PROCESS_2=PASS
DUPLICATE_OWNER=PASS
SECRET_SCAN=PASS
BACKUP_READBACK=PASS
```

## Regressão funcional

```text
Hermes v0.22.7
active_skin=central-dark
language=pt
gateway=running
engine_modified=false
banner_renderer_modified=false
builtin_skin_ids_preserved=true
```

## Referências instaladas em staging

```text
skins_pack=/data/cache/scratch/hermes-skin-tools/hermes-skins-pack
skins_pack_head=e559b8d3082857a6e6788a8302812166629c2eef
skins_pack_count=101
hermes_mod_version=0.2.0
hermes_mod_live_integration=false
```

As referências comunitárias foram instaladas somente em staging para análise.
Nenhum pacote externo foi conectado ao Hermes ativo e nenhuma skin externa foi
copiada para `/data/skins`.

## Git

O worktree CentralDark já possuía alterações externas e permaneceu preservado.
Nenhum reset, clean, descarte, pull ou push foi executado nesta rodada.

```text
main...origin/main [ahead 1, behind 1]
DIRTY_WORKTREE_PRESERVED=true
```

## Contraprova

A skin foi carregada em novo processo Hermes, inicializada pela configuração
atual e renderizada pelo `build_welcome_banner` oficial em larguras de 60 a 200
colunas. O logo grande só aparece a partir de 95 colunas, conforme o código
oficial; o hero permanece no painel compacto abaixo desse limite.

## Limite

Não foi capturada imagem do terminal físico do usuário. A prova visual disponível
é captura textual do renderer Rich oficial. A confirmação humana do aspecto final
permanece `PENDING`, não `PASS` automático.

## NEXT_CURSOR

```text
HUMAN_VISUAL_REVIEW_AT_95_PLUS_COLUMNS
```
