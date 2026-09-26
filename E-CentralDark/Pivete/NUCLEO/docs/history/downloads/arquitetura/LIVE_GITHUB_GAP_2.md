
# Gap de enforcement GitHub observado

Estado medido na análise desta sessão no `main@94b6780bbbdf26a64acbadd1d7be03c22d32322d`:

- branch `main`: `protected=false`;
- branch protection: `enabled=false`;
- required status checks no endpoint medido: enforcement `off`;
- `CODEOWNERS` existe e o próprio arquivo registra que não bloqueia merge sozinho;
- CodeQL workflow existe, porém contém condição para executar apenas quando
  `event.repository.private == false`;
- Dependabot está configurado para npm e GitHub Actions semanalmente.

## Interpretação

`GOVERNANCE_IN_REPO != HOST_ENFORCEMENT`

A arquitetura semântica pode ser forte e, simultaneamente, a fronteira externa
do host permanecer abaixo dela. Isso é residual de enforcement, não razão para
criar uma arquitetura concorrente.
