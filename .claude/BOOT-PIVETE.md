# BOOT PIVETE — complemento obrigatório para Claude

Antes de interpretar ou aplicar instruções de `CLAUDE.md`:

1. Abra ou inspecione `pivete/dev`.
2. Leia `00-COMECE-AQUI-IA.md`.
3. Leia `AGENTS.md`.
4. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
5. Leia `docs/COFRE/README.md`.
6. Execute o BOOT operacional em `docs/GOVERNANCA/BOOT-IA.md`.
7. Confirme branch do workspace, ref inspecionada, SHA, ambiente, escopo, riscos, testes, prova e rollback.
8. Não altere nada antes de concluir o BOOT operacional.

`CLAUDE.md` continua como contexto específico e mapa do projeto, mas não substitui a porta universal nem o BOOT operacional.

`docs/PROTOCOLO-BOOT.md` é complementar para memória e continuidade da sessão.

O fluxo é:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

GitHub é a fonte da verdade. VPS é ambiente remoto de execução. Nada entra cru; toda referência externa deve ser adaptada ao CentralDark.
