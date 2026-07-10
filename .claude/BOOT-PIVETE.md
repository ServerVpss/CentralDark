# BOOT PIVETE — complemento obrigatório para Claude

Além das regras existentes em `CLAUDE.md`, antes de qualquer alteração:

1. Leia `AGENTS.md`.
2. Leia `docs/COFRE/README.md`.
3. Execute `docs/GOVERNANCA/BOOT-IA.md`.
4. Confirme branch, SHA, ambiente, escopo, riscos, testes e rollback.
5. Não altere nada antes de concluir o BOOT.

O fluxo novo é:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

GitHub é a fonte da verdade. VPS é ambiente remoto de execução. Nada entra cru; toda referência externa deve ser adaptada ao CentralDark.
