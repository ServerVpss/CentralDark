# Receipt — Learning #137 multipath route/auth

- Data: 2026-10-02
- Base main antes do delta: `afb95f6b0278d616f45dc9249f68a8e4a520d57c`
- Escopo: registro cognitivo/operacional; sem mudança de runtime.
- Owner: `docs/CONSCIENCIA/APRENDIZADOS.md`
- Relação: PR-mãe #1562 continua ledger/rendezvous, não writer.

## Evidência atual
- GitHub connector: autenticado; `ServerVpss/CentralDark` com admin/maintain/push/pull/triage.
- RDC Segredo: autenticado; `SEGREDO` online e pong.
- RDC Pessoal: autenticado; três bindings `CENTRALDARK-OS` online e pong.
- RDC `vmi3256920`: offline na superfície medida.
- Tailscale visto de SEGREDO e CENTRALDARK-OS: `vmi3256920` offline.
- SEGREDO → `89.117.78.124:22`: TCP PASS.
- CENTRALDARK-OS → `89.117.78.124:22`: TCP PASS.
- CENTRALDARK-OS → SSH público: transporte alcança sshd; auth retorna `Permission denied (publickey)`.

## Conclusão provada
`MACHINE_STATE != ROUTE_STATE != AUTH_STATE`.

Uma superfície RDC/Tailscale offline não autoriza declarar a VPS desligada quando outra aresta atual prova reachability. Cada aresta deve carregar sua própria prova de transporte, autenticação e efeito.

## Contraprova
- Porta 22 aberta não prova shell autenticado.
- Alias/receipt histórico não é CURRENT.
- Rota caída não é falha global.
- Rota declarada pelo humano orienta a busca; PASS técnico exige medição.

## Replay
1. Intenção → setor/capability.
2. Consultar owner/receita já existente.
3. Selecionar menor aresta candidata.
4. Provar transporte → autenticação/autorização → efeito.
5. Falhou uma aresta → tentar fallback existente antes de declarar bloqueio global.
6. Registrar somente o cone que mudou.

NEXT_CURSOR: reutilizar o grafo multipath e medir somente a aresta exigida pela próxima capability.
