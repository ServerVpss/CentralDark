# CentralDark Desktop — contrato de superfície única

Esta distribuição reaproveita o Bolt vendorizado como bancada da mesma CentralDark. Não cria segundo cérebro, segunda memória ou segundo Writer.

```text
SEGREDO/CHEFE
→ SOL (interface e janela flutuante)
→ CentralDark Desktop/Web (mesma aplicação Remix)
→ Hermes local em http://127.0.0.1:8787
→ owners/tools/memória/execução existentes
→ REALIDADE
```

## Superfícies

- Site: a aplicação Remix continua publicável como web.
- Windows: Electron empacota a mesma interface como `CentralDark`.
- Widget SOL: segunda janela do mesmo processo e da mesma sessão Electron.
- VS Code/CLI: continuam operando sobre a mesma Casa e o mesmo Hermes; não são clonados dentro do aplicativo.

## Casa local

No Windows, `CENTRALDARK_HOME` ou `APP_PATH_ROOT` define a Casa. Quando nenhum deles existe e `E:\CentralDark` está presente, esse caminho é adotado. Se o disco não existir, o aplicativo preserva o diretório padrão do sistema em vez de falhar ou mover estado destrutivamente.

## Hermes

`CENTRALDARK_HERMES_URL` permite substituir o padrão `http://127.0.0.1:8787`. A janela SOL mede `/health` e `/api/health`; `OFFLINE` é estado válido enquanto o runtime local ainda não foi iniciado.

## Atalhos

- `Ctrl+Shift+Space` no Windows/Linux ou `Cmd+Shift+Space` no macOS alterna o widget.
- Uma intenção enviada pelo widget abre a mesma conversa principal pelo parâmetro `prompt`, preservando cookies e armazenamento da sessão Electron.

## Build Windows local

```bash
cd apps/modulos/Bolt/source
corepack enable
pnpm install --frozen-lockfile
pnpm test:centraldark-desktop
pnpm electron:build:win
```

O instalador sai em `dist/`. Assinatura de código e publicação exigem credenciais externas próprias do owner; não ficam no repositório.

## Contraprova

```bash
node --test scripts/centraldark-desktop-contract.test.mjs
```

O teste bloqueia regressões de identidade, endpoint Hermes, widget, ponte Electron e isolamento do renderer.

## Registro de artefato upstream — Electron v40.10.2 / Windows x64

Este registro preserva a identidade criptográfica do arquivo fornecido pelo SEGREDO/CHEFE sem duplicar o binário upstream de 138 MB dentro do repositório.

```yaml
ELECTRON_UPSTREAM_ARTIFACT_RECEIPT:
  originator: "SEGREDO/CHEFE"
  authority: "SEGREDO/CHEFE"
  writer: "SOL"
  owner: "apps/modulos/Bolt/source/docs/CENTRALDARK-DESKTOP.md"

  supplied_filename: "electron-v40.10.2-win32-x64(2).zip"
  canonical_upstream_asset_name: "electron-v40.10.2-win32-x64.zip"
  platform: "win32-x64"
  electron_version: "40.10.2"

  measured_size_bytes: 138160256
  measured_sha256: "25ea6cfdc06deba58dafa6a3fc1fbd6dcda9e06a14035150ee1d9f73bca2e651"
  zip_integrity: "PASS"
  zip_entries: 75
  total_uncompressed_bytes: 346330166

  observed_runtime_material:
    - "electron.exe"
    - "resources/default_app.asar"
    - "v8_context_snapshot.bin"
    - "snapshot_blob.bin"
    - "icudtl.dat"
    - "LICENSES.chromium.html"

  external_anchor:
    repository: "electron/electron"
    release_tag: "v40.10.2"
    official_asset_id: 431356572
    official_asset_name: "electron-v40.10.2-win32-x64.zip"
    official_size_bytes: 138160256
    official_sha256: "25ea6cfdc06deba58dafa6a3fc1fbd6dcda9e06a14035150ee1d9f73bca2e651"

  byte_identity_with_official_asset: "PROVADO"
  historical_hermes_package_match: "UNKNOWN"
  binary_committed_to_repository: false
  artifact_role: "UPSTREAM_RUNTIME_REFERENCE"
```

### Contraprova do registro

A igualdade é sustentada por dois bearings independentes:

```text
ARQUIVO_FORNECIDO
→ SHA-256 = 25ea6cfd...
→ SIZE = 138160256

ASSET_OFICIAL electron/electron v40.10.2
→ SHA-256 = 25ea6cfd...
→ SIZE = 138160256

→ BYTE_IDENTITY_WITH_OFFICIAL_ASSET = PROVADO
```

O sufixo local `(2)` no nome do upload não altera a identidade dos bytes.

O registro **não** promove uma inferência maior que a prova:

```text
OFFICIAL_ELECTRON_ASSET_MATCH = PROVADO
ZIP_CONTAINS_ELECTRON_CHROMIUM_V8_RUNTIME_MATERIAL = PROVADO
HISTORICAL_HERMES_EXE_USED_THIS_EXACT_ASSET = UNKNOWN
```

Para provar a última afirmação seria necessário um receipt/hash/versionamento do pacote Hermes histórico causalmente ligado ao executável correspondente.

```text
MATERIAL != AUTHORITY
VALID_HASH != PROOF_OF_UNRELATED_PROVENANCE
HASH_MATCH_OF_UPSTREAM_ASSET != HERMES_PACKAGE_PROVENANCE
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
BINARY_DUPLICATION_AVOIDED=true
```
