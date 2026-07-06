
# Plano — Migrar ai-proxy pro HUB Supabase (lyoigsqluyktoclwdaft)

## Ideia curta
Usar a infra que já existe no HUB + VPS. Eu faço tudo pela VPS (via MCP admin), sem depender do Lovable Cloud atual.

## Passos que eu executo (nessa ordem)

### 1. Copiar código do ai-proxy pra dentro do repo CentralDark
- Origem: `supabase/functions/ai-proxy/index.ts` (versão atual, já com 18 modelos + aliases + rate limit)
- Destino no repo: `supabase/functions/ai-proxy/index.ts` do `CentralDark`
- Ferramenta: `github_create_or_update_file`

### 2. Salvar as secrets no HUB (via VPS)
Comandos rodados por `execute_command` na VPS, usando Supabase CLI já instalado:
```
supabase secrets set --project-ref lyoigsqluyktoclwdaft \
  WEBUI_LOVABLE_KEY=wlk_qPOrs99RBjX0zW5ZWFw3OBMljHneBua0DBrVerxq3N0 \
  LOVABLE_API_KEY=<pega do cofre /root/CentralDark/secrets/LOVABLE_API_KEY> \
  AI_PROXY_RATE_PER_MIN=<valor atual> \
  AI_PROXY_RATE_PER_HOUR=<valor atual>
```

### 3. Deploy da edge no HUB (via VPS)
```
supabase functions deploy ai-proxy \
  --project-ref lyoigsqluyktoclwdaft \
  --no-verify-jwt
```

### 4. Trocar URL nos consumidores
Um único ponto no frontend:
- `src/apps/modulos/telepainel/pages/AiProxyConfig.tsx`
  - `AI_PROXY_URL` passa a apontar pro HUB: `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/ai-proxy`

E no CLI (via GitHub):
- `docs/CONSCIENCIA/DARKAI/darkai.sh` → mesma troca de URL

### 5. Testar
- No console `/ai-proxy` do painel: colar a chave, clicar **Ler configuração** → HTTP 200
- Bater `/v1/models` sem chave → HTTP 401
- `darkai --model gpt-5 "ping"` → resposta real

### 6. Desligar o antigo (só depois do 5 passar)
- Deletar edge `ai-proxy` do Lovable Cloud atual
- Deletar secret `WEBUI_LOVABLE_KEY` do Lovable Cloud atual
- `LOVABLE_API_KEY` do Lovable atual fica (é gerenciado, outras funções usam)

## O que eu preciso confirmar com você antes de disparar

- **`LOVABLE_API_KEY` pro HUB**: você tem uma chave Lovable AI própria salva no cofre da VPS (`/root/CentralDark/secrets/LOVABLE_API_KEY`)? Se sim, uso ela. Se não, você gera uma no dashboard e me diz o nome do arquivo — sem isso o proxy no HUB não fala com o gateway.

Se responder **"tem sim, usa"** eu executo tudo do 1 ao 6 direto.
