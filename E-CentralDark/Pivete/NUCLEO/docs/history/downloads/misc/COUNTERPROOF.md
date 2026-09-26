# CONTRAPROVA — TENTATIVAS DE FALSIFICAR O HANDOFF

- **Falta arquivo obrigatório?** Verificar lista requerida no manifesto contra árvore física.
- **Hash diverge?** Recalcular todos os hashes e comparar com `SHA256SUMS.txt`.
- **ZIP corrompe?** Rodar `ZipFile.testzip()` no master e `unzip -t`/equivalente nos ZIPs históricos.
- **Projeto excede 8000 chars?** Contar `PROJECT_INSTRUCTIONS_COMPACT.md`.
- **Artefato superseded aparece como canônico?** Procurar nomes/paths do histórico dentro da área canônica.
- **Seção 7 foi confundida com 7º nó do BOOT?** Verificar README: seção 7=HANDOFF; 7º nó=EXECUTE_MINIMAL_DELTA.
- **Conceitos novos ficaram de fora?** Procurar as dez transformações em `TRANSFORMACOES_E_MARCO.md`.
- **Autoaplicação virou recursão infinita?** Exigir `NO_NEW_INFORMATION → NO_CHANGE → FIXED_POINT_CHECK`.
- **Foi alegado fixed point do sistema inteiro?** Proibido; fixed point aqui é somente do pacote/handoff.
- **GitHub foi alterado?** Estado desta entrega declara READ_ONLY e nenhuma ferramenta de escrita GitHub foi invocada.

Qualquer falha acima invalida `PACKAGE_FIXED_POINT`.

- **CWD do sidecar engana o verificador?** Sim na primeira tentativa; causa identificada e remediada. Sidecar permanece relativo por portabilidade e é verificado a partir do diretório do ZIP.
