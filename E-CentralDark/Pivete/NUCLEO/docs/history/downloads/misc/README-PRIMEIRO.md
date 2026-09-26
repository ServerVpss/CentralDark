# CENTRALDARK — CASA LOCAL RECONCILIADA

Este pacote NÃO cria uma CentralDark nova. Ele é um launcher/recibo local que reutiliza a Casa existente e reconcilia o estado antes de qualquer build.

## Entrada única

Execute `START-CASA.cmd`.

O launcher descobre a Casa em `E:\CentralDark` ou `C:\CentralDark`, mede o estado, valida owners canônicos, inventaria Git/arquivos/superfícies locais, reaproveita o `CENTRALDARK_PORTABLE_KERNEL` existente e, quando seguro, executa testes/builds locais já definidos no próprio repositório.

### Cadeia interna — sem inventar gatilho novo

`START-CASA` é só um launcher físico. O significado continua pertencendo aos owners canônicos:

`#ACORDAR → !CALIBRAR → !MULTIBUSSOLA → [se houver mutação: !EXECUÇÃO_REVERSÍVEL] → EXECUÇÃO → [se houve mutação: !REMEDIÇÃO] → REALITY JUDGE → CRISTALIZAR|NO_CHANGE → FIXED_POINT`

Todos os gatilhos convergem no mesmo fluxo; não há sexto cérebro, outro orquestrador, V1/V2/V3.

## Barreiras locais

- NO_DEPLOY=true
- NO_VPS_MUTATION=true
- NO_GIT_PUSH=true
- NO_GIT_PULL_OR_FETCH=true
- NO_FORCE_PUSH=true
- NO_RESET_HARD=true
- NO_CCLEANER_ACTION=true
- NO_BROWSER_COOKIE_OR_CREDENTIAL_EXTRACTION=true
- RAW_BROWSER_STATE != CANONICAL
- SCREENSHOT != CURRENT_TRUTH
- ONE_SYSTEM_ONLY=true
- REUSE_BEFORE_CREATE=true
- ONE_WRITER_PER_SCOPE=true
- PARALLELIZE_PERCEPTION=true
- SERIALIZE_MUTATION=true
- UNKNOWN != PASS

## Saída única

O pacote escreve somente em:

`.artifacts\casa-local\`

Os snapshots atuais são sobrescritos; nada de V1/V2/V3. O histórico fica em um único `history.jsonl`.

## Modos

- `START-CASA.cmd` → Full: reconcilia + prova + tenta testes/builds locais seguros com dependências já instaladas.
- `START-CASA.cmd Audit` → reconciliação/inventário/provas.
- `START-CASA.cmd Build` → build local seguro, sem instalar dependências e sem rede.

Se a worktree já estiver suja antes do build, o launcher bloqueia o build para não atropelar trabalho vivo.

## Privacidade

Notepad/Chrome/Edge/Chromium/Firefox são sensores locais. O launcher inventaria caminhos, tamanhos, horários e hashes quando seguro; não despeja conversa, cookie, token, senha, Login Data ou conteúdo bruto no relatório. A matéria bruta fica local; só delta útil deve subir ao canônico pelo owner próprio.
