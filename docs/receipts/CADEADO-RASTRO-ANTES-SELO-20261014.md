# 🔒 CADEADO — RASTRO ANTES DO SELO (2026-10-14)

## Falha observada
Após commits SSH, a resposta declarou conclusão sem entregar ao CHEFE os links e SHAs. O rastro existia, mas não foi apresentado na mesma resposta. Não há prova da causa interna exata do modelo.

## Contrato de encerramento
**EXECUTAR → VERIFICAR → CAPTURAR RASTRO → ENTREGAR RASTRO → SELAR.**

- `SELO_ALLOWED=false` enquanto o rastro não estiver incluído na resposta ao CHEFE.
- `NO_TRACE_NO_SEAL=true`.
- GitHub: fornecer SHA e URL do commit/PR; runtime: origem, comando ou teste, resultado e referência verificável de log.
- Sem evidência disponível: declarar `NÃO COMPROVADO`, sem afirmar `PROVADO`, `SELADO` ou `100%`.
- Mudanças neste contrato exigem autorização explícita do CHEFE. Reutilizar o owner de resposta/selo existente; não criar núcleo paralelo.

## Escopo e limite
Este commit sela a **regra documental** e seu rastro. Não comprova implementação de gate automático, testes ou deploy. A correção automática permanece pendente até ser medida.

## Rastros da ocorrência original
- Cadeado SSH: `e48c0cb0108cfd00652f394a09c9d9cf5cc5c4d1`.
- Aprendizado SSH: `567753cd04d9f09a5c5c42252fb806db771e6333`.
- PR-mãe #1562 é ledger, NÃO MERGEAR.
