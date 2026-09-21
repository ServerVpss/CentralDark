# 🪽 Hermes CentralDark Pet — prova funcional

PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
BOT_ENTRY=!CENTRALDARK
BOOT_CHAIN=#ACORDAR → !CALIBRAR
BASE_MAIN=5921fe5d0615fccbf0c58bcb7d359d0294f7c36c
SOURCE_ARCHIVE=Hermes-CentralDark-Codex-Pet.zip
SOURCE_ARCHIVE_SHA256=624b3e2e8fca8912a18e1a53be624ece44ac137f6def0a485010200d5e5de183
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true

## Intenção

Registrar e promover a prova funcional do pet personalizado `Hermes CentralDark` no Hermes Desktop, sem inventar arquitetura paralela.

## Evidência do pacote recebido

O pacote inspecionado contém:

- `hermes-centraldark/pet.json`
- `hermes-centraldark/spritesheet.webp`
- `INSTALL-WINDOWS.ps1`
- `README.txt`
- `source-manifest.json`
- `validation.json`
- `contact-sheet.jpg`
- `preview-all-states.gif`

Identidade declarada pelo `pet.json`:

- id: `hermes-centraldark`
- displayName: `Hermes CentralDark`
- spritesheetPath: `spritesheet.webp`

Contraprova estrutural executada no arquivo recebido:

- spritesheet = `1536x1872`, RGBA
- grid = `8x9`
- célula = `192x208`
- spritesheet SHA256 = `2691720f12fab1a28450fd0df6128f4ed531ae79c38aeffc19dc1b8a4492222c`
- preview GIF = `56` frames
- `validation.json.ok_structural=true`
- erros estruturais = `[]`

## Evidência funcional observada

Screenshot fornecido pelo CHEFE mostra a superfície real:

`Settings > Appearance > Pet`

e nela:

- toggle do Pet = `On`
- card `Hermes CentralDark` presente
- identificador `hermes-centraldark`
- estado visual `installed`
- card selecionado
- mascote Hermes renderizado na própria UI do Hermes Desktop

Classificação da prova:

```text
PACKAGE_STRUCTURAL_VALIDATION=PASS
HERMES_DISCOVERY=PASS
HERMES_INSTALL_STATE=PASS
HERMES_UI_SELECTION=PASS
HERMES_VISIBLE_RENDER=PASS
FUNCTIONAL_INSTALL_DISCOVERY_RENDER=PROVED
```

## Limite da afirmação

O próprio `validation.json` declara que a fonte contém 8 poses isoladas e não 53 poses semânticas distintas. Portanto:

```text
STRICT_HATCH_PET_SEMANTIC_STATE_FIDELITY=BLOCKED
FULL_STATE_SPECIFIC_ANIMATION_QA=NOT_PROVEN
FUNCTIONAL_INSTALL_DISCOVERY_RENDER=PROVED
```

Isso preserva zero falso-verde: o pet está funcionalmente instalado, descoberto, selecionável e renderizando; fidelidade semântica completa de todos os estados continua fora da prova atual.

## Fixed point deste delta

```text
DOCUMENTED != EXECUTED
SCREENSHOT_OF_RUNNING_UI = RUNTIME_EVIDENCE_FOR_VISIBLE_INSTALL
STRUCTURAL_VALIDATION = PACKAGE_PROOF
STRICT_ANIMATION_QA = BLOCKED
UNKNOWN != PASS
REALITY = JUDGE
```
