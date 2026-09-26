# EXECUÇÃO LOCAL DO KIT

Requer Node.js 20+.

```bash
npm test
npm run verify
npm run example
```

Saída do exemplo:
`out/example-receipt.json`

## Importante

Executar o kit isoladamente **não prova integração com a CentralDark**.

Prova apenas:
- normalização;
- sanitização;
- hash/delta;
- dedupe;
- roteamento de capacidade;
- estrutura de causalidade;
- Reality Judge local de referência.

E2E com HERMES/browser/runtime permanece `UNKNOWN` até medição no alvo real.
