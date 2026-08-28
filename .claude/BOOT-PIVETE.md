# BOOT PIVETE — Ponte do Claude para a Constituição Universal

Este arquivo é um complemento específico do Claude. Ele não substitui `CLAUDE.md`.

Antes de qualquer ação:

1. Abra ou inspecione `pivete/dev`.
2. Leia `00-COMECE-AQUI-IA.md`.
3. Leia **integralmente** `CLAUDE.md` como Constituição universal de todas as IAs.
4. Leia `AGENTS.md`.
5. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
6. Leia `docs/COFRE/README.md`.
7. Execute o BOOT operacional em `docs/GOVERNANCA/BOOT-IA.md`.
8. Confirme branch do workspace, ref inspecionada, SHA, ambiente, escopo, riscos, testes, prova e rollback.
9. Não altere nada antes de concluir o BOOT operacional.

A Baseline de Defesa da Seção 0 de `CLAUDE.md` é obrigatória.

`docs/PROTOCOLO-BOOT.md` é complementar para memória e continuidade da sessão; não substitui a Constituição nem o BOOT operacional.

O fluxo é:

```text
pivete/dev → PR → pivete/auditoria → PR → main
```

GitHub é a fonte da verdade. VPS DEV/AUDIT é ambiente remoto autorizado. Produção executa apenas SHA aprovado. Nada entra cru.
