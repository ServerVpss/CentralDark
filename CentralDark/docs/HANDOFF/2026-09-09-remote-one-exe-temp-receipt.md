# CentralDark Remote ONE-EXE

Status: CRYSTALLIZED_ON_MAIN
Owner: scripts/remote-bridge

## Evidência recebida

A execução temporária iniciou Node, NPX e o sidecar de contexto, mas o Desktop Commander encerrou com `MCP error -32603` e `Unexpected end of JSON input`. O device não ficou online e o processo terminou com exit code 1.

## Evolução no mesmo owner

Foi adicionado `scripts/remote-bridge/CentralDark-Remote-One.go` para concentrar a orquestração em um único executável Windows. O binário integra preflight, Remote, sensor local de contexto, logs, receipt atômico, detecção do erro -32603, uma tentativa de reparo de cache, cache isolado e reconnect com backoff.

A rota antiga permanece temporária. A rota CentralDark própria continua desabilitada até ser provada por handshake real.

## Build

`GOOS=windows`, `GOARCH=amd64`, `CGO_ENABLED=0`.

`go vet`: PASS.

Build Windows: PASS.

SHA-256 do binário gerado: `23a28be82aa8143d68370256bcc6846633aef4a9a90a01d70771d9acdb198f75`.

`BUILD_PASS != CASA_RUNTIME_PASS`.

Estado atual: ONE_EXE_BUILT=PROVED_IN_BUILD_SCOPE; CASA_RUNTIME_NEW_EXE=UNKNOWN; GLOBAL_FIXED_POINT=NOT_PROVEN.
