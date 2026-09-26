---
name: backtrack-session
description: Permite salvar o estado atual de uma sessão e restaurá-lo para continuar o trabalho.
triggers:
  - '!backtrack'
  - 'restaurar sessão'
---

# Backtrack Session

Esta skill permite que você salve o ponto de parada atual de uma sessão e, posteriormente, retorne a esse estado para continuar o trabalho. É útil para missões de longa duração ou quando você precisa pausar e retomar com precisão.

## Como funciona

A skill `backtrack-session` utiliza o arquivo `VALIDATION.md` (ou um arquivo de estado similar dentro da cápsula de memória operacional) como ponto de referência para registrar o estado da sessão.

**Ao salvar o estado (implicitamente com a criação da cápsula):**

Quando uma cápsula de memória operacional é criada, ela inclui um arquivo como `VALIDATION.md` ou `ESTADO-ATUAL.json` que contém informações cruciais sobre o diretório de trabalho (`PACKAGE_DIR`), o hash do manifesto (`MANIFEST_SHA256`) e o status da missão. Este é o "checkpoint" do qual a sessão pode ser restaurada.

**Ao restaurar um estado (comando `!backtrack`):**

1.  A skill lê o `VALIDATION.md` (ou `ESTADO-ATUAL.json`) da última cápsula de memória operacional criada.
2.  Extrai o `PACKAGE_DIR` (o caminho da cápsula) e o `MANIFEST_SHA256`.
3.  Define o diretório de trabalho da sessão para o `PACKAGE_DIR` da cápsula.
4.  (Opcional, mas recomendado) Verifica a integridade dos arquivos dentro do `PACKAGE_DIR` comparando os hashes com o `MANIFEST_SHA256` registrado. Isso garante que o ambiente não foi alterado externamente.
5.  Apresenta o estado recuperado e as pendências da missão.

## Passos para usar `!backtrack`

1.  **Criar um checkpoint**: Certifique-se de que a cápsula de memória operacional foi criada e que seu `VALIDATION.md` (ou `ESTADO-ATUAL.json`) reflete o estado desejado para o ponto de retorno.
2.  **Acionar o backtrack**: Em uma nova sessão ou na mesma sessão após alguma interrupção, digite `!backtrack`.

    A skill irá:
    *   Localizar a última cápsula de memória operacional criada.
    *   Ler seu `ESTADO-ATUAL.json` (ou `VALIDATION.md`).
    *   Mudar o diretório de trabalho para o `PACKAGE_DIR` da cápsula.
    *   Reportar o estado recuperado e as pendências.

## Conteúdo do arquivo de estado (exemplo `ESTADO-ATUAL.json` da cápsula)

```json
{
  "mission": "INVENTARIO-TOTAL-HERMES-01",
  "parent_mission": "ORGANIZAR-CASA-HERMES-01",
  "nonce": "BBC03689F2C4",
  "phase": "MAPEAMENTO_READ_ONLY",
  "folder_current": null,
  "mutation_authorized": false,
  "profile_runtime": "C:\Users\danda\AppData\Local\hermes\profiles\pivete",
  "profile_runtime_proven": true,
  "hermes_version": "0.19.0 (2026.7.20)",
  "upstream": "9bf1f737",
  "executable": "C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe",
  "gateway_at_observation": "running",
  "skills_at_observation": 106,
  "env_exists_content_read": false,
  "soul_exists_content_changed": false,
  "last_valid_profile_report_sha256": "bb03aa8abe3799437c69128eb0cb47fc9524960bdac4d1817cde1158de1aac6e",
  "last_proven_instrument": "PREPARE_NUL_DIAGNOSTIC_SCRIPT_V2_RESULT",
  "last_proven_instrument_status": "INVALID",
  "scripts_prepared": {
    "stage-05b": {
      "path": "stage-05b-reserved-entry-nul-diagnostic.ps1",
      "sha256": "6b8a532c53b47b7530407fe84ae043732e4dd9986c9e3a6f7f47ceaafb644205",
      "lines": 337,
      "status": "REJECTED"
    },
    "stage-05c": {
      "path": "stage-05c-reserved-entry-nul-diagnostic.ps1",
      "sha256": "ff095024e6af0315c5ae406be6b37469267bd9f827cd96b9f2c16a4c32b92d2c",
      "lines": 190,
      "status": "REJECTED_LINE_LIMIT"
    },
    "stage-05d": {
      "path": "stage-05d-reserved-entry-nul-diagnostic.ps1",
      "sha256": "00ba8aad5f0058cab9f1cbba07619aaf7da09a12a29a053b21fdb9065b22f6e5",
      "lines": 180,
      "status": "PREPARED"
    }
  },
  "last_proven_script_executed": false,
  "next_script_05d": "INTENCAO_DECLARADA_NAO_COMPROVADA",
  "next_gate": "PIVETE_OR_SOL_REVIEW",
  "new_collector_started": false,
  "capsule_created": true,
  "capsule_timestamp": "2026-07-29T06:02:00-03:00"
}
```

## Importante

- Esta skill **não altera o estado atual do seu ambiente** automaticamente. Ela apenas lê e informa o ponto de parada.
- A decisão de restaurar arquivos ou mudar o diretório de trabalho é sempre do usuário.
- A skill assume que as cápsulas de memória operacional são criadas no diretório padrão `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO\HERMES-SESSION-CAPSULE-YYYYMMDD`.
