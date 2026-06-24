#!/bin/bash
set -o pipefail
source /root/Multizap/secrets/wabot.env 2>/dev/null

PROJECT_REF="lyoigsqluyktoclwdaft"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "[ERRO] SUPABASE_ACCESS_TOKEN não encontrado no wabot.env"
  exit 1
fi

echo "=== 1. CONFIGURAR AUTH URLs ==="
curl -s -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://multizap.dev",
    "uri_allow_list": "https://multizap.dev/**,https://bot.multizap.dev/**,https://crm.multizap.dev/**,https://multizap.dev/auth/reset-password,https://multizap.dev/auth/callback"
  }' 2>&1 | head -5
echo "[OK] Auth URLs configuradas"

echo ""
echo "=== 2. CONFIGURAR EMAIL TEMPLATE - RESET PASSWORD ==="
RESET_HTML='<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0;padding:40px 0;"><div style="max-width:500px;margin:0 auto;background-color:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#00ff88;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:24px;">MultiZap</div><div style="font-size:20px;font-weight:600;color:#ffffff;margin-bottom:12px;">Recuperação de Senha</div><p style="font-size:15px;color:#9ca3af;line-height:1.6;margin-bottom:32px;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha segura.</p><div style="margin-bottom:32px;"><a href="{{ .ConfirmationURL }}" style="background-color:#00ff88;color:#040811;font-weight:bold;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;display:inline-block;">Redefinir Minha Senha</a></div><p style="font-size:12px;color:#6b7280;margin-top:12px;">Este link é válido por tempo limitado. Se você não solicitou esta alteração, ignore este e-mail.</p><div style="font-size:12px;color:#4b5563;border-top:1px solid #1f2937;padding-top:20px;margin-top:20px;">© 2026 MultiZap - Todos os direitos reservados.</div></div></body></html>'

CONFIRM_HTML='<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0;padding:40px 0;"><div style="max-width:500px;margin:0 auto;background-color:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;text-align:center;"><div style="font-size:24px;font-weight:bold;color:#00ff88;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:24px;">MultiZap</div><div style="font-size:20px;font-weight:600;color:#ffffff;margin-bottom:12px;">Confirme sua Conta</div><p style="font-size:15px;color:#9ca3af;line-height:1.6;margin-bottom:32px;">Bem-vindo ao MultiZap! Clique no botão abaixo para confirmar seu cadastro.</p><div style="margin-bottom:32px;"><a href="{{ .ConfirmationURL }}" style="background-color:#00ff88;color:#040811;font-weight:bold;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;display:inline-block;">Confirmar Minha Conta</a></div><p style="font-size:12px;color:#6b7280;">Se você não criou esta conta, ignore este e-mail.</p><div style="font-size:12px;color:#4b5563;border-top:1px solid #1f2937;padding-top:20px;margin-top:20px;">© 2026 MultiZap - Todos os direitos reservados.</div></div></body></html>'

# Usar Python para enviar JSON corretamente
python3 << PYEOF
import json, urllib.request, os

ACCESS_TOKEN = os.environ.get('SUPABASE_ACCESS_TOKEN', '')
PROJECT = "lyoigsqluyktoclwdaft"
API = f"https://api.supabase.com/v1/projects/{PROJECT}/config/auth"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Email templates
payload = {
    "mailer_templates_recovery": """$RESET_HTML""",
    "mailer_subjects_recovery": "Recuperação de Senha - MultiZap",
    "mailer_templates_confirmation": """$CONFIRM_HTML""",
    "mailer_subjects_confirmation": "Confirme sua conta - MultiZap",
    "mailer_templates_invite": """$CONFIRM_HTML""",
    "mailer_subjects_invite": "Convite - MultiZap"
}

data = json.dumps(payload).encode()
req = urllib.request.Request(API, data=data, headers=headers, method="PATCH")

try:
    with urllib.request.urlopen(req, timeout=15) as res:
        print(f"[OK] Email templates configurados (HTTP {res.status})")
except Exception as e:
    print(f"[ERRO] {e}")
PYEOF

echo ""
echo "=== 3. VERIFICAR ==="
curl -s "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" 2>&1 | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(f'site_url: {d.get(\"site_url\",\"?\")}')
    print(f'uri_allow_list: {d.get(\"uri_allow_list\",\"?\")}')
    print(f'recovery_subject: {d.get(\"mailer_subjects_recovery\",\"?\")[:50]}')
except: print('Erro ao ler config')
" 2>/dev/null

# Log no Supabase
SUPA_URL="${SUPABASE_URL:-}"; SUPA_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
[ -n "$SUPA_URL" ] && curl -s -X POST "${SUPA_URL}/rest/v1/system_logs" \
  -H "apikey: ${SUPA_KEY}" -H "Authorization: Bearer ${SUPA_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action":"run-once.006.auth-config","level":"info","details":{"configured":true}}' > /dev/null 2>&1
