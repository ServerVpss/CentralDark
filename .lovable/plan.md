# Plano: mover ai-proxy pro HUB e apontar VPS só pro HUB

## 1. Você cola o `sbp_...` (SUPABASE_ACCESS_TOKEN)
Assim que colar, salvo no cofre da VPS em `keys/hub/SUPABASE_ACCESS_TOKEN`.

## 2. Configurar secrets no HUB (`lyoigsqluyktoclwdaft`)
Via `supabase secrets set --project-ref lyoigsqluyktoclwdaft`:
- `LOVABLE_API_KEY` (lida de `keys/keys.env` da VPS)
- `WEBUI_LOVABLE_KEY=wlk_qPOrs99RBjX0zW5ZWFw3OBMljHneBua0DBrVerxq3N0`
- Taxas/config padrão do proxy (se existirem no atual)

## 3. Deploy da edge no HUB
- Copiar `supabase/functions/ai-proxy/index.ts` do repo pra VPS
- `supabase functions deploy ai-proxy --project-ref lyoigsqluyktoclwdaft --no-verify-jwt`

## 4. Trocar `.env` da VPS pra apontar SÓ pro HUB
No `/root/CentralDark/.env`:
- Remover: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` do Lovable atual (kagejpghnwdfymddwxuf)
- Deixar apenas as do HUB (renomeadas sem prefixo `HUB_`, viram as principais)
- Backup do `.env` antigo em `.env.backup-lovable-YYYYMMDD`

## 5. Atualizar consumidores pra nova URL
- `darkai.sh` → aponta pra `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/ai-proxy`
- `AiProxyConfig.tsx` (se existir referência hardcoded) → mesma URL
- Restart PM2 dos serviços que leem `.env`

## 6. Testar tudo no HUB
- `curl` sem chave → 401
- `curl` com `WEBUI_LOVABLE_KEY` → 200 e resposta real
- Rodar `darkai "oi"` na VPS → resposta do Gemini

## 7. Desligar o antigo (só depois do 6 passar)
- Deletar edge `ai-proxy` do Lovable Cloud atual
- Card no Telegram (@srver1bot → admin) confirmando migração

## Detalhes técnicos
- HUB fica como fonte única de secrets do proxy (respeita a regra "conexões OAuth/API keys só no HUB")
- Lovable Cloud atual (kagejpghnwdfymddwxuf) continua vivo só pro `@SEGREDOPUXADASBOT` (TelePainel) — não é tocado
- Nenhuma migration nova neste projeto Lovable (respeita a trava)
- Rollback: restaurar `.env.backup-*` e reverter URLs no `darkai.sh`
