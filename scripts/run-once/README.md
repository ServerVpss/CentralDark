# Run-Once Scripts — Execução Remota via Push

## Como funciona:
1. Coloque um script `.sh` nesta pasta
2. Faça commit + push na main
3. O post-deploy na VPS executa automaticamente
4. Após executar, move o script para `done/` com timestamp
5. O resultado fica em `/var/log/clone-deck-run-once.log`

## Regras:
- Cada script roda apenas 1 vez
- Scripts executados vão para `done/` (não são deletados)
- Log completo em `/var/log/clone-deck-run-once.log`
- NÃO colocar secrets nos scripts (eles vão pro Git)
- Para ler secrets, use `source /root/Multizap/secrets/wabot.env`

## Exemplo:
```bash
#!/bin/bash
echo "Rodou na VPS em $(date)"
pm2 status
```
