---
name: Escopo de trabalho — VPS + GitHub
description: Pivete opera em VPS (/root/CentralDark/) e GitHub (ServerVpss/CentralDark). Não sugerir TelePainel/Lovable Cloud como destino de código.
type: constraint
---
Escopo padrão de qualquer entrega:
- Código vai pra **VPS** em `/root/CentralDark/apps/modulos/<modulo>/` e é commitado no **GitHub** `ServerVpss/CentralDark`.
- **Nunca** propor colocar módulo/painel/página no TelePainel (Lovable atual) sem ordem explícita do Pivete.
- **Nunca** propor edge function / migration no Supabase do Lovable atual (`kagejpghnwdfymddwxuf`). Backend = HUB Supabase (`lyoigsqluyktoclwdaft`) + serviços PM2 na VPS.
- Painéis/UIs quando pedidos moram em `apps/modulos/<x>/` na VPS, servidos por Caddy, não em `src/apps/modulos/telepainel/` daqui.
**Por quê:** Pivete corrigiu explicitamente ("tira da sua mente TelePainel, vc trabalha no VPS e GitHub").
