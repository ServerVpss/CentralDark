# Runner zumbi (self-hosted)

Assinatura medida 2026-08-26:

```
gh api .../actions/runners  -> status=online busy=true
gh run list --status in_progress -> []
gh run view ID -> status=pending por 30-60min
cancel de dezenas de pending -> busy continua true
```

Isso NAO e "runner processando a fila". E processo morto/preso com flag busy.

O que NAO prova trabalho:
- busy=true sozinho
- run pending sozinho
- cancelar pending (nao limpa busy)

O que desbloqueia de verdade:
1. SSH no host e `systemctl restart actions.runner.centraldark.service`
2. Se SSH timeout: reboot Contabo (secrets no env do Codex, nao no Hermes local)
3. Depois: `gh workflow run vps-exec-selfhosted.yml --ref main` SEM inputs

Nao declarar deploy PASS enquanto o run ficar pending sem job in_progress.
