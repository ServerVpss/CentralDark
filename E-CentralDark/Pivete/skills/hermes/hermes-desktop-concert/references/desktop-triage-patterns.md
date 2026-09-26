# Desktop triage patterns — fingerprints reais

## OpenRouter 402 fingerprint

Quando o app devolve 402, o log repetiu essa forma duas vezes neste diagnóstico:

- `HTTP 402: This request requires more credits, or fewer max_tokens. You requested up to 64000 tokens, but can only afford 1574.`
- `Provider returned error`, `code: 429`, `google/gemma-4-31b-it:free is temporarily rate-limited upstream.`

A primeira é creedit de fato esgotado (limite de crédito). A segunda é rate limit upstream do provedor (Google AI Studio via OpenRouter).

Como checar:
```bash
grep -i "402" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "rate-limited" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
```

## SSH desktop failure chain

Dois motivos distintos de "Desktop boot failed" apareceram no mesmo log, em sequência:

1. Hermes não instalado no remote:
   `Desktop boot failed: Hermes is not installed on the remote host (could not find a hermes executable).`
   Comando de fix sugerido no próprio log:
   `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | sh`

2. Hermes remoto com versão sem suporte ao SSH Desktop mode:
   `Desktop boot failed: The remote Hermes install does not support --ssh-session-token-file and --ssh-owner-nonce.`
   Informação de versão extraída no mesmo log: `remote hermes version: Python 3.11.16`.

Hierarquia de diagnóstico:
- Se os dois falhas aparecem, a versão mais recente (Python 3.11.16) é evidência de que o Hermes remoto tá instalado mas tá desatualizado pra essa flag.
- Se só o primeiro aparecer, é falta de instalação.

## Custo de diagnóstico em desktop.log grande

O desktop.log deste ambiente tá em ~7.7 MB. Ler de uma vez traz fauna de repetição de boot SSH e retry de backend.

Indispensável:
- `tail -c 40000 .../desktop.log` para ver o final vivo
- grep direto para fingerprint, não leitura linear

Padrão de leitura recomendado:
```bash
tail -c 40000 "C:/Users/danda/AppData/Local/hermes/logs/desktop.log"
grep -i "Desktop boot failed" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log" | head -5
grep -i "402" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log" | head -5
grep -i "ssh-session-token-file" "C:/Users/danda/AppData/Local/hermes/logs/desktop.log" | head -5
```

## Curator vazio

O diretório `logs/curator/` existe mas está vazio. Isso é normal quando não há trabalho do curator para processar — não é bug do app.
