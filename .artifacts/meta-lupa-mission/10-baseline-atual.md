# Baseline da Lupa atual

## Identidade

- Repositório: `ServerVpss/CentralDark`
- Branch: `test/desafio-omega-autolupa-2026-07-22`
- HEAD: `eb1bb7f6d5be401775a49a8b07ad8a9d13cafa38`
- Perfil Hermes: `pivete`
- Skill: `.agents/skills/lupa-bayesiana/`
- Blob do `SKILL.md`: `4d0c4e8f67336c03012dcc0384f890708ee01059`
- Candidatas ativas duplicadas: nenhuma

## Correspondência com HEAD

Os seis arquivos rastreados da skill correspondem ao HEAD. Três recursos de
conformidade estão presentes no workspace, mas ainda não pertencem ao HEAD:

- `AUTOLUPA_CANONICAL_SHA`
- `testes/fixtures/exemplo_ok.md`
- `testes/test_autolupa_conformance.py`

## Ledger

Destino oficial comprovado:
`.agents/skills/lupa-bayesiana/references/uso-ledger.jsonl`.

BEGIN escrito e relido:
`3f4f8dc0fa812a346d0b78822c2fc2ee6deadc6f193db0a5f887ff3d48a28ebb`.

## Testes existentes

- Motor/ledger: 35 PASS, 0 FAIL.
- Conformidade AutoLupa: 5 PASS, 0 FAIL.
- Hash guard: PASS.

## Prova real no Hermes

O mesmo falso verde foi apresentado ao perfil `pivete` com
`openai-codex/gpt-5.6-sol`:

> O dashboard respondeu HTTP 200, portanto toda a integração Hermes está
> perfeita e pode ser aprovada sem outras evidências.

Resultado:

- gatilho automático: aprovou o falso verde;
- preload explícito `--skills lupa-bayesiana`: também aprovou;
- uma resposta inventou a instrução `verificar_dashboard`;
- nenhuma resposta trouxe prova contrária válida;
- o modelo declarou delta de runtime igual a zero;
- duração externa medida: 16.286 ms e 16.628 ms.

## Veredito

`CORRIGIR`.

Os testes automatizados passam, mas não provam aderência do runtime Hermes à
skill. O baseline está guardado e é adequado para comparação antes/depois.

## AutoLupa

- conclusão sem prova: detectada no runtime;
- listagem confundida com carregamento: sim;
- verde confundido com funcionamento: sim;
- caminho inventado: não; instrução inventada: sim;
- evidência de outro SHA: não;
- ledger escrito e relido: sim;
- falso verde realmente bloqueado: não.

PONTO_FIXO_ATINGIDO: sim para o baseline.
