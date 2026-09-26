# 🧩 SOL POC / BRIDGEMIND — EXECUÇÃO LADO A LADO

## Estado local medido
Existe em `E:\CentralDark\sol-desktop-poc` um conjunto experimental associado a BridgeMind/SOL, com:
- `.hermes\desktop-attachments`
- `.obsidian`
- assets salvos de `BridgeMind ... Agent Super App`
- runtime fixo `Microsoft.WebView2.FixedVersionRuntime.150.0.4078.105.x64`
- executáveis auxiliares do WebView2/Copilot presentes no runtime capturado
- `index.md` e `index.txt`

## Regra de integração
SOL POC não vira segundo Core.
Ela entra como `PARALLEL_EXPERIMENTAL_SURFACE`, lado a lado com o Harness principal, para comparar UI, bridge, CLI, browser/runtime e integração de agentes.

## Arquitetura
`CENTRALDARK CORE → { HARNESS_CANONICO | SOL_POC_EXPERIMENTAL } → MESMO PROOF LEDGER → MESMO REALITY_JUDGE`

- ambos podem executar em paralelo se não disputarem o mesmo writer/runtime/porta.
- resultados devem usar o mesmo envelope de métricas.
- qualquer delta bom da SOL volta por `REUSE_BEFORE_CREATE` ao owner canônico.
- nenhum `.exe`, asset ou runtime externo é promovido só por existir.
- arquivos de credencial/chave detectados no diretório ficam fora de leitura, cópia, log e commit.
