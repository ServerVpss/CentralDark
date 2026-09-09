# PDF Harness EXE

Build reproducivel:

```bash
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o dist/centraldark-pdf-harness.exe tools/pdf-harness/centraldark-pdf-harness.go
```

O binario nao contem segredo e apenas gera plano/receipt JSON deterministico.

Artefato local gerado por SOL em 2026-09-09:

```text
71f79a97c84a985edc88af3756527a18b0cceb8fc0fc5fb0c1d8625d2458bec9  dist/centraldark-pdf-harness.exe
```
