# Lote de entrada — achievements/profiles — 2026-10-09

Registro sanitizado. Arquivos brutos permanecem fora do Git.

```text
ACHIEVEMENTS_ZIP_SHA256=f35262e92791f657a9873f3232fd731e81c818b5128e3fff7f4e5783c5f72573
ACHIEVEMENTS_ENTRIES=4
ACHIEVEMENTS_TOTAL=60
ACHIEVEMENTS_UNLOCKED=2
ACHIEVEMENTS_SECRET_COUNT=3
PROFILES_ZIP_SHA256=1fb32696faa8f42381eaa9a444c912f426561dc1b75a64afefd7764255ffba23
PROFILES_ENTRIES=2884
TRAVERSAL_PATHS=0
```

## Classificação

```text
hermes-achievements.zip = CANDIDATE / METADATA_ONLY
profiles.zip            = QUARENTENA / SENSITIVE
```

`hermes-achievements.zip` contém snapshot de achievements e estado de sessões.
Pode ajudar como telemetria de uso do Hermes, mas não é prova de capacidade
CentralDark, execução VPS, deploy ou fixed point.

`profiles.zip` contém `.env`, `auth.json`, caches, logs, bancos, sessões e
outros dados potencialmente secretos/privados. Não extrair para o repositório,
não instalar, não sincronizar com a VPS e não usar tokens dele.

```text
PROFILES_INTEGRATION=PROIBIDA
AUTH_VALUES=REDACTED
RUNTIME_MUTATION=NONE
NEXT_CURSOR=DESTILAR_ACHIEVEMENTS_METADATA_SEM_PROMOVER_HISTORICO_A_CURRENT
```

Fonte bruta preservada em `/root/.hermes/attachments/`; achievements extraídos
somente em quarentena temporária do Hermes.

## Registro do objetivo recuperado

```text
INTENCAO=recuperar conhecimentos antigos sem perda nem duplicacao
OWNER=destilador e memoria existentes da CentralDark
DELTA=garimpar achievements; manter profiles em quarentena; promover somente delta provado
PROVA=manifesto de entrada + hashes + quarentena sem travessia de caminho
BOOT=REUTILIZAR_DESTILADOR_EXISTENTE
```

```text
ENTRADA → QUARENTENA → INVENTÁRIO → GARIMPO
→ CONFRONTO_MAIN_DOCS_RECEIPTS → CONTRAPROVA
→ CRISTAL_SE_NOVO → REGISTER → BOOT
```

`profiles.zip` não é fonte autorizada para importar memória, skills, credenciais ou
estado de runtime. A prova desta rodada limita-se à entrada/quarentena; a
incorporação dos conhecimentos permanece `NOT_PROVEN` até revisão individual.
