# Guia profissional

## Fluxo

```text
CLI ou HTTP
→ parser de `#|!`
→ perfil em commands.json
→ snapshot seguro do alvo
→ matriz provider/model
→ fallback semântico
→ crítico/juiz quando `!`
→ receipt sanitizado e hashado
```

## Contratos

- `#`: uma resposta semanticamente não vazia.
- `!`: primário, crítico e juiz distintos por `provider/model`, salvo autorização explícita de reutilização.
- alvo local: realpath dentro de `--allowed-root`, quando informado.
- URL: referência apenas; sem fetch automático.
- arquivo binário: metadados e SHA; conteúdo não lido.
- diretório: inventário recursivo, sem symlink e sem caminhos sensíveis.

## Extensão

- novo modelo do mesmo protocolo: somente `config/providers.json`;
- novo comando: somente `config/commands.json`;
- novo protocolo HTTP: criar adapter em `provider-client.mjs` e teste discriminativo.
