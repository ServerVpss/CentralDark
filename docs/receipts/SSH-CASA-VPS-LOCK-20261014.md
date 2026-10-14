# 🔒 Cadeado SSH Casa ↔ VPS — registro operacional (2026-10-14)

**Owner:** CentralDark existente. **Âncora ledger:** PR #1562 (NÃO MERGEAR). **Regra:** CURRENT > HISTORY; prova ≠ declaração.

## Rota comprovada
- Origem: Windows Casa SEGREDO, arquivo `C:\Users\Administrador\.ssh\config`.
- Alias existente `segredo-vpss` → `89.117.78.124:22`, usuário Linux `root`.
- Alias alternativo existente `Segredo-VPS` → mesmo destino e usuário.
- Contraprova após proteção: `ssh -o BatchMode=yes -o ConnectTimeout=6 segredo-vpss 'whoami; hostname'` → `root`, `CENTRALDARK-OS`: **PASS**.
- Tailscale Casa `100.123.93.25`, VPS `100.90.199.124`: visibilidade de peers comprovada; SSH via Tailscale **NÃO COMPROVADO**.

## Cadeado aplicado na Casa
- Backup prévio: `C:\Users\Administrador\.ssh\config.pre-lock-20261014.bak`.
- Aviso inserido no início do config: `CENTRALDARK SSH LOCK / NAO TOCAR / DO NOT EDIT`.
- Marcadores declarativos: `PROTECTED_ROUTE=segredo-vpss`, `MUTATION_ALLOWED=false`, `SOL_ACCESS=EXISTING_AUTHORIZED_ROUTE_ONLY`, `NO_NEW_IDENTITY=true`.
- Atributo Windows `ReadOnly` aplicado e relido (`ReadOnly, Archive`). **Isso impede edição acidental, NÃO é ACL imutável nem autorização criptográfica.**
- SSH retestado com êxito depois da alteração. Nenhuma chave, ACL Tailscale ou permissão SSH de servidor foi alterada.

## Autoridade / exceções
- **Não tocar:** não alterar alias, usuário, IP, chave, permissões ou arquivo sem permissão explícita do CHEFE.
- O CHEFE pode autorizar expressamente SEGREDO ou ADMIN a realizar manutenção; autorização deve ser específica para a mudança e acompanhada de backup, teste e contraprova.
- SOL pode usar a rota já autorizada e registrar evidência; **não possui identidade SSH independente comprovada** e não pode remover o cadeado por iniciativa própria.
- `MUTATION_ALLOWED=false` é regra documental; não constitui bloqueio técnico para administradores.
- NÃO incluir segredos, chaves privadas ou tokens neste ledger.

**Status:** SSH público PASS; somente-leitura PASS; permissão independente SOL UNKNOWN; SSH Tailscale UNKNOWN; servidor imutável NÃO APLICADO.
