# Casa <-> VPS: SSH bidirecional no Sync Center (26/10/2026)

Intencao: reusar Cockpit / Minha Oficina / Sync Center / Dominio do Loop / Duas vias. Snapshot antigo de 15/10 nao equivale a estado vivo.

## Evidencia Casa Windows
- Casa -> VPS: SSH segredo-vpss, root@CENTRALDARK-OS, whoami/hostname/data UTC e FORWARD_EXIT=0.
- VPS -> Casa: script owner scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1, chave existente, VPS_TO_CASA_SSH_AUTH=PASS, VPS_TO_CASA_PID=PASS COUNT=380 e SCRIPT_EXIT=0.
- Escopo: autenticacao + leitura de processos. Nao ha prova de sincronizacao de arquivos, escrita ou deploy.

## Evidencia Supabase
- Owner existente public.agent_events, area sync-center-ssh, acao read_only_proof.
- IDs 6 e 7, estados pass, direcoes casa-vps e vps-casa; encerramento da prova 2026-10-26T09:28:37Z, TTL=7200 segundos; inseridos 2026-10-26T09:36:17Z.
- Politica SELECT existente restringia authenticated por has_role(auth.uid(), 'admin'); migracao 20261026093550 acrescentou apenas GRANT SELECT para authenticated.
- Contraprova de RLS: usuario com role admin enxergou 7 eventos (2 SSH), sem admin enxergou 0. Nenhum GRANT de escrita.

## Codigo
- SyncCenter.tsx reusa SshBridgeProof.ts no mesmo owner.
- Sessao admin, REST autenticada, polling de 60 segundos e TTL. Falta de sessao, erro e prova expirada nao promovem estado PASS.
- Novos testes passaram. Cinco falhas ja existentes nao mudaram (17,19,22,27,28); parsing TypeScript dos dois arquivos sem erros; git diff --check PASS.
- Banco pronto != UI publicada. SSH read PASS != file sync PASS != deploy PASS.

NEXT_CURSOR: confirmar CI/merge/deploy do mesmo SHA e readback do Cockpit autenticado (janela 3). Para alimentar novas provas, continuar pelo script SSH do owner existente, sem criar segundo coletor.