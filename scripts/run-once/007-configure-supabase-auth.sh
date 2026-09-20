#!/bin/bash
set -o pipefail
source /root/Multizap/secrets/wabot.env 2>/dev/null
PROJECT_REF="lyoigsqluyktoclwdaft"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
SUPA_URL="${SUPABASE_URL:-}"
SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

[ -z "$ACCESS_TOKEN" ] && echo "[ERRO] SUPABASE_ACCESS_TOKEN ausente" && exit 1

echo "=== CONFIGURAR SUPABASE AUTH ==="

# 1. URLs
echo "Configurando URLs..."
curl -s -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"site_url":"https://multizap.dev","uri_allow_list":"https://multizap.dev/**,https://bot.multizap.dev/**,https://crm.multizap.dev/**"}' 2>&1 | head -3
echo "[OK] URLs"

# 2. Email templates via Management API
echo "Configurando email templates..."
python3 -c "
import json, urllib.request, os
TOKEN = os.environ.get('SUPABASE_ACCESS_TOKEN','')
API = 'https://api.supabase.com/v1/projects/lyoigsqluyktoclwdaft/config/auth'
headers = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}

reset_html = '<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body style=\"background-color:#0b0f19;font-family:-apple-system,sans-serif;margin:0;padding:40px 0;\"><div style=\"max-width:500px;margin:0 auto;background-color:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;text-align:center;\"><div style=\"font-size:24px;font-weight:bold;color:#00ff88;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:24px;\">MultiZap</div><div style=\"font-size:20px;font-weight:600;color:#ffffff;margin-bottom:12px;\">Recuperação de Senha</div><p style=\"font-size:15px;color:#9ca3af;line-height:1.6;margin-bottom:32px;\">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha segura.</p><div style=\"margin-bottom:32px;\"><a href=\"{{ .ConfirmationURL }}\" style=\"background-color:#00ff88;color:#040811;font-weight:bold;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;display:inline-block;\">Redefinir Minha Senha</a></div><p style=\"font-size:12px;color:#6b7280;\">Este link é válido por tempo limitado. Se você não solicitou esta alteração, ignore este e-mail.</p><div style=\"font-size:12px;color:#4b5563;border-top:1px solid #1f2937;padding-top:20px;margin-top:20px;\">© 2026 MultiZap</div></div></body></html>'

confirm_html = reset_html.replace('Recuperação de Senha','Confirme sua Conta').replace('Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha segura.','Bem-vindo ao MultiZap! Clique no botão abaixo para confirmar seu cadastro.').replace('Redefinir Minha Senha','Confirmar Minha Conta')

payload = {
    'mailer_templates_recovery': reset_html,
    'mailer_subjects_recovery': 'Recuperação de Senha - MultiZap',
    'mailer_templates_confirmation': confirm_html,
    'mailer_subjects_confirmation': 'Confirme sua conta - MultiZap',
}

data = json.dumps(payload).encode()
req = urllib.request.Request(API, data=data, headers=headers, method='PATCH')
try:
    with urllib.request.urlopen(req, timeout=15) as res:
        print(f'[OK] Templates configurados (HTTP {res.status})')
except Exception as e:
    print(f'[ERRO] {e}')
" 2>&1

# 3. Verificar
echo ""
echo "Verificando..."
curl -s "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" 2>&1 | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(f'site_url: {d.get(\"site_url\",\"?\")}')
    print(f'uri_allow_list: {d.get(\"uri_allow_list\",\"?\")}')
    subj = d.get('mailer_subjects_recovery','')
    print(f'recovery_subject: {subj}')
except: print('Erro ao ler')
" 2>/dev/null

# Log
[ -n "$SUPA_URL" ] && curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
  -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action":"run-once.007.auth-config","level":"info","details":{"configured":true}}' > /dev/null 2>&1

echo ""
echo "=== DONE ==="
