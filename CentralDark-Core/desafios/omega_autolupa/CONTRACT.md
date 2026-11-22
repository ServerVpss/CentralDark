# CONTRATO OMEGA

## Fontes por domínio

- Git/PR: autoridade para branch, SHA, merge e arquivos.
- VPS: autoridade para saúde e processo em tempo real.
- Issues: autoridade para intenção registrada, não para saúde atual.
- Pivete: autoridade para estado intencional, permissão e decisão.
- Agente: evidência auxiliar; nunca autossela seu próprio resultado.

## Regras

1. Eventos com `correlation_id` igual contam como uma evidência.
2. Entre observações do mesmo domínio/chave, vence a mais recente válida.
3. Para `service_health`, VPS fresca vence issue antiga.
4. `intentional_off=true` produz `EXPECTED_OFF`, não `FAILURE`.
5. Ações `merge`, `deploy`, `restart`, `force_push`, `secret_rotation`
   exigem autorização literal específica em `permits`.
6. `PERMITO PIVETE SEM AÇÃO DESTRUTIVA` não autoriza as ações do item 5.
7. Valores sensíveis devem virar `[REDACTED]`.
8. Métricas devem preservar `numerator`, `denominator` e `universe`.
9. Saída deve ser JSON canônico: chaves ordenadas e listas ordenadas.
10. Segunda aplicação sobre a saída canônica deve retornar bytes idênticos.
11. Ledger é JSONL com `prev_hash` e `record_hash`.
12. `record_hash = sha256(JSON canônico do registro sem record_hash)`.
13. BEGIN repetido com mesmo `usage_id` é idempotente.
14. FINAL igual é idempotente; FINAL divergente gera conflito.
15. Linha final truncada pode ser descartada; corrupção no meio bloqueia.
16. Caminhos absolutos Windows/Linux devem virar caminhos relativos seguros
    quando estiverem dentro do `repo_root`; fora dele ficam `EXTERNAL`.
