---
name: Backend/VPS liberado quando o Pivete pede e as chaves estão no cofre
description: Regra escopo — Lovable é frontend-only por padrão, MAS quando o Pivete pedir diagnóstico/correção de VPS/backend e as credenciais existirem (secrets do sandbox + $VPS_SSH_KEY_LOVABLE), agir direto via SSH sem pedir autorização adicional
type: preference
---

# Escopo expandido sob demanda: pode mexer no backend quando o Pivete pedir

**Contexto:** a regra padrão "só frontend" continua valendo — Lovable não sai propondo backend sozinho. Mas quando o Pivete **pede explicitamente** ("investiga", "conserta", "olha lá na VPS") e as chaves estão no cofre do sandbox (`$VPS_SSH_KEY_LOVABLE`, `$VPS_HOST_LOVABLE`, `$VPS_USER_LOVABLE`, secrets Supabase, etc.), **agir direto**, sem perguntar "posso?".

## Como aplicar

1. **Diagnóstico** (ler PM2, logs, cron, arquivos read-only na VPS): fazer direto, sempre que pedido.
2. **Escrita/patch em áreas 🔒 protegidas** do `CLAUDE.md §9` (MCP, guardião, infra, hermes, etc.): ainda pedir confirmação curta antes de commitar mudança (ex: "vou patchar X, ok?"), mas NÃO pedir permissão pra abrir SSH e olhar.
3. **SSH via nix** (chave em env vem em uma linha só — reformatar em base64 de 70 chars por linha antes de usar):
   ```python
   # ~/.ssh/vps_key precisa ser reformatado (env var vem numa linha)
   head='-----BEGIN OPENSSH PRIVATE KEY-----'
   tail='-----END OPENSSH PRIVATE KEY-----'
   b64=''.join(os.environ['VPS_SSH_KEY_LOVABLE'].replace(head,'').replace(tail,'').split())
   lines=[b64[i:i+70] for i in range(0,len(b64),70)]
   open('/root/.ssh/vps_key','w').write(head+'\n'+'\n'.join(lines)+'\n'+tail+'\n')
   ```
   Depois: `nix run nixpkgs#openssh -- -i ~/.ssh/vps_key -o BatchMode=yes -o StrictHostKeyChecking=no $VPS_USER_LOVABLE@$VPS_HOST_LOVABLE 'cmd'`

**Why:** o Pivete já autorizou uso de secrets ("autonomia absoluta") e reforçou agora que em casos como este eu **devo** usar SSH+cofre em vez de travar dizendo "sou só frontend". Redundante ficar pedindo permissão a cada vez.

**Não aplicar quando:** o Pivete estiver pedindo mudança visual/UI comum, ou quando não houver pista de que o problema é backend. Aí segue frontend-only.
