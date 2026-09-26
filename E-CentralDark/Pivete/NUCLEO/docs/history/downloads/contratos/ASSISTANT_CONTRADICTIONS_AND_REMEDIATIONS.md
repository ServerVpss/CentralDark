# CONTRADIÇÕES DO ASSISTENTE / REMEDIAÇÕES

Cada item abaixo é tratado como material de aprendizado, não apagado.

1. **Entrega visual confundida com continuidade canônica.** Corrigido: atualizar a mesma família/owner, não criar artefato concorrente.
2. **Seção 7 confundida com 7º nó do BOOT.** Corrigido: seção 7 = HANDOFF; 7º nó do boot = EXECUTE_MINIMAL_DELTA.
3. **Receipt final externo tratado como suficiente para pacote autocontido.** Corrigido: `FINAL_RECEIPT_INTERNAL.json` entra no ZIP; hash/receipt externo prova o ZIP fechado.
4. **“O CICLO ESTÁ FECHADO” promovido de skill/ciclo local para sistema inteiro.** Corrigido: fixed point sempre escopado; projeto global está NOT_PROVEN.
5. **Skills locais declaradas como “no sistema” a partir de relato/transcrição.** Corrigido: histórico de execução não prova current repo/runtime; status atual fica UNKNOWN até medição física.
6. **Build PASS histórico tratado como se provasse instalação futura.** Corrigido: build histórico = `LAST_PROVEN_AT`, não `CURRENT_PASS`.
7. **`omit=dev` descrito como default inevitável do npm 12+.** Derrubado por documentação oficial: default `dev` só quando `NODE_ENV=production`; senão vazio.
8. **`--legacy-peer-deps` promovido como correção universal.** Derrubado como mantra: npm avisa que ignora contrato de peer deps e não recomenda uso padrão.
9. **Estado antigo do PR #1119 usado como atual.** Corrigido por remedição: head/commits atuais diferem.
10. **Corpo de PR tratado como estado operacional.** Corrigido: corpo pode ficar stale; metadata/HEAD/runtime observados vencem.
