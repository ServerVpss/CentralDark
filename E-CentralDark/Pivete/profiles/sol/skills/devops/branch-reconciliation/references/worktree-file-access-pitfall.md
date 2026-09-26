# Worktree e leitores de arquivo genéricos no Windows

## Sintoma

- git relata o worktree e os arquivos conflitantes corretamente.
- leitores de arquivo genéricos devolvem "file not found" para caminhos dentro do worktree.
- caminhos do tipo `E:/...` ou `/e/...` podem não ser traduzidos pelo tool de leitura.

## Por que acontece

Ferramentas que leem arquivos por caminho podem não resolver worktrees em hosts Windows com caminhos MSYS/nativos misturados. O git conhece o arquivo; o leitor de caminho pode não.

## Workaround — extrair pelas etapas do git

Use estes comandos no worktree:

```bash
# versão do nosso lado, stage 2
git show :2:caminho/relativo/arquivo

# versão do lado remoto, stage 3
git show :3:caminho/relativo/arquivo

# versão base, stage 1
git show :1:caminho/relativo/arquivo
```

Para conflitos onde os markers precisam ser visíveis no arquivo físico:

```bash
git checkout --conflict=merge caminho/relativo/arquivo
```

Depois leia o arquivo no worktree se o caminho físico estiver acessível.

## Regra prática

Não confiar em leitores de arquivo arbitrários para worktrees como método primário. Preferir extração por etapas do git antes de tentar leitura direta do filesystem.
