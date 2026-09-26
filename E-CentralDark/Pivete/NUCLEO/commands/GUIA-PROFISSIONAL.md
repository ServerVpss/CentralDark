# COMANDO - GUIA-PROFISSIONAL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\GUIA-PROFISSIONAL.md
**SHA:** 74ce2e6fe62364b1
**Timestamp:** 2026-08-28T02:57:24.804190
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - novo comando: somente `config/commands.json`;

### Ouro Bruto (primeiros 5000 chars)
```
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

```