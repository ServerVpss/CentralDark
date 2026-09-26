# Fio da missão

## Missão principal

```text
MISSION=INVENTARIO-TOTAL-HERMES-01
PARENT_MISSION=ORGANIZAR-CASA-HERMES-01
AUTHORITY=PIVETE
MODE=READ_ONLY_AT_CAPTURE
```

Objetivo: mapear integralmente o perfil ativo do Hermes antes de organizar sua
Casa em `E:\CentralDark\Pivete\NUCLEO\motor`, preservando Hermes Desktop,
gateway, Telegram, memória, sessões, skills e autenticação.

## Princípio de execução

```text
inventário completo
→ consumidores
→ classificação por uso/risco/tamanho
→ uma pasta leve e comprovadamente inativa
→ baseline
→ mudança reversível
→ regressão + rollback
→ confirmações Hermes/SOL/Pivete
→ próxima pasta
```

## Última fronteira confirmada

```text
PROFILE_NAME=pivete
PROFILE_HOME=C:\Users\danda\AppData\Local\hermes\profiles\pivete
HERMES_VERSION=0.19.0
HERMES_BUILD_DATE=2026.7.20
UPSTREAM=9bf1f737
EXECUTABLE=C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe
GATEWAY_AT_PROOF=running
SKILLS_AT_PROOF=106
.ENV_EXISTED_AT_PROOF=SIM
SOUL_EXISTED_AT_PROOF=SIM
```

Esses dados foram reportados por Hermes em execução válida, mas continuam
voláteis e devem ser reconfirmados antes de qualquer mudança.

## Estado no instante da cápsula

O inventário top-level encontrou uma anomalia de instrumento ao reconstruir o
nome reservado `NUL`. Nenhuma conclusão foi aceita sobre o tipo real da
entrada. O coletor foi interrompido sem mutação.

Dois instrumentos complexos inline falharam por transporte/tokenização. O
padrão foi depreciado. Foram preparados scripts visíveis:

- `stage-05b...ps1`: rejeitado após revisão;
- `stage-05c...ps1`: rejeitado por limite e descarte incompleto;
- `stage-05d...ps1`: estava em preparação, ainda sem resultado nesta cápsula.

## Próximo gate lógico

1. receber e revisar o código integral do instrumento 05d;
2. não assumir que a autorização antiga permanece válida;
3. somente depois, e com autorização atual, validar parser sem executar;
4. executar apenas após revisão do parser e contrato renovado;
5. voltar ao mapa top-level adaptado a nomes reservados.

## Nada foi migrado

```text
PASTA_ATUAL=NENHUMA
SYMLINK_CRIADO=NAO
JUNCTION_CRIADA=NAO
PROFILE_CONFIG_CHANGED=NAO
HOME_WINDOWS_CHANGED=NAO
HERMES_UPDATED=NAO
GATEWAY_RESTARTED=NAO
FILES_DELETED=0
```

