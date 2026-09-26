# WSL docker-desktop drop zone (profile pivete)

## Paths that work (git-bash)

```text
//wsl.localhost/docker-desktop
//wsl$/docker-desktop
```

PowerShell `Test-Path '\\wsl.localhost\docker-desktop'` may return False while bash `ls` succeeds — prefer bash UNC.

## Wait protocol

1. `ls` the root; note mtime of any `*.txt`.
2. Empty `Novo(a) Documento de Texto.txt` (0 bytes) = placeholder only.
3. Tell user you are waiting.
4. On "lê"/"pronto": re-`ls`; read only if size > 0 or new file name appears.
5. Do not invent file contents.

## Not this

- Not Bolt/VPS docker-compose inventory
- Not automatic container exec
