# Decision log

## D-001 — Humano no meio

Decisão: Pivete sincroniza intenção e é gate final; SOL revisa; Hermes executa.

## D-002 — Envelope unificado

Decisão: SOL e Hermes usam estrutura idêntica, diferenciada por `FROM/TO`.

## D-003 — Single writer

Decisão: somente Hermes escreve no ambiente local durante a missão; SOL não
muta concorrentemente.

## D-004 — Perfil antes da Casa

Decisão: inventariar `profiles\pivete` antes de links ou migração.

## D-005 — Arquitetura provisória

Preferência: perfil gerenciado inteiro. Fallback: junction única. Rejeitado por
enquanto: links em várias subpastas.

## D-006 — Wrapper Windows

Uma única chamada PowerShell pelo Bash/MSYS inevitável foi aceita para comandos
simples. Lógica complexa inline foi depois depreciada.

## D-007 — Nome reservado

`NUL` é tratado como anomalia de namespace. Nenhum tipo, origem ou ação foi
inferido.

## D-008 — Código antes de execução

Scripts 05b/05c foram revisados e rejeitados sem execução. 05d tornou-se o
próximo instrumento em preparação.

## D-009 — Métrica honesta

Não comparar tempo de coletor inválido com coletor válido. Percentual só entra
com trabalho equivalente.

## D-010 — Cápsula portátil

Identidade, protocolos, estado, laboratório e formatos de máquina foram
separados para retomada sem o chat original.

