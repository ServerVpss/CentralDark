# CONTRAPROVA

Tentativas de quebrar a conclusão:

1. **As cinco skills estão na main?**
   - Busca remota: não encontradas.
   - Resultado: `NOT_PROVEN_REMOTE_MAIN`.

2. **O relato local prova estado atual do Hermes?**
   - Não. É histórico fornecido pelo usuário; runtime local não está acessível nesta sessão.
   - Resultado: `CURRENT_LOCAL_RUNTIME=UNKNOWN`.

3. **`omit=dev` é default sempre no npm 12+?**
   - Não segundo docs oficiais; depende de `NODE_ENV=production`.
   - Resultado: `CLAIM_REJECTED`.

4. **`omit=optional` é correção persistente para esbuild/rollup optional?**
   - Não; omitir optional conflita com o objetivo de instalar optionalDependencies.
   - Resultado: `CLAIM_REJECTED_AS_GENERAL_FIX`.

5. **`legacy-peer-deps` deve entrar em toda cura?**
   - Não; ignora peer contracts e docs oficiais não recomendam como padrão.
   - Resultado: `ONLY_IF_PEER_CONFLICT_PROVEN`.

6. **Cinco skills são a melhor arquitetura?**
   - Não provado. A main já possui `knowledge-compiler`, `session-intelligence-harvester`, metacognição e runtime Hermes.
   - Resultado: `REUSE_BEFORE_CREATE`; manter assinaturas como cristais até GAP_REAL provar owner novo.
