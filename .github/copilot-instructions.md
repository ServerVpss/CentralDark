# GitHub Copilot — instruções do CentralDark

Antes de sugerir ou alterar código:

1. Abra ou inspecione `pivete/dev`.
2. Leia `00-COMECE-AQUI-IA.md`.
3. Leia `AGENTS.md`.
4. Leia `docs/GOVERNANCA/HIERARQUIA-INSTRUCOES-IA.md`.
5. Leia `docs/COFRE/README.md`.
6. Leia `docs/GOVERNANCA/FLUXO-PIVETE-DEV-AUDITORIA.md`.
7. Execute o BOOT operacional descrito em `docs/GOVERNANCA/BOOT-IA.md`.
8. Confirme branch do workspace, ref inspecionada, SHA, ambiente, escopo, riscos, testes, prova e rollback.

`docs/PROTOCOLO-BOOT.md` é complementar para memória e continuidade; não substitui o BOOT operacional.

Nunca editar diretamente na `main`. DEV implanta apenas em DEV. AUDITORIA implanta apenas em AUDIT/STAGING. Nenhum deploy de código não commitado.

Responder ao Pivete no formato FORMA → LEIGO → DESCRIÇÃO TÉCNICA.

Nada entra cru: toda referência externa deve ser adaptada ao CentralDark.
