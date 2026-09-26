#!/usr/bin/env python3
from pathlib import Path
import sys

CHECKS = {
    Path("conexao-ia/MEMORIA_OPERACIONAL_IA.md"): [
        "GitHub",
        "workflow",
        "webhook",
        "run-once",
        "/root/Multizap/revisoes/",
        "CRM",
        "apps/bot",
        "/root/Multizap/api/whatsapp/qrcode/",
        "confirmação",
        "sensíveis",
    ],
    Path("conexao-ia/CHECKLIST_EXECUCAO.md"): [
        "GitHub",
        "Workflow",
        "Webhook",
        "run-once",
        "/root/Multizap/revisoes/",
        "Não mexer no CRM",
        "apps/bot",
        "/root/Multizap/api/whatsapp/qrcode/",
        "confirmação",
        "ação sensível",
    ],
}

failed = False

for path, required_terms in CHECKS.items():
    if not path.exists():
        print(f"FALHA: arquivo obrigatório ausente: {path}")
        failed = True
        continue

    content = path.read_text(encoding="utf-8")
    content_lower = content.lower()

    print(f"Verificando: {path}")

    for term in required_terms:
        if term.lower() not in content_lower:
            print(f"FALHA: termo obrigatório ausente em {path}: {term}")
            failed = True

if failed:
    print("Resultado: FALHA - memória/checklist precisam ser ajustados.")
    sys.exit(1)

print("Resultado: OK - memória operacional e checklist estão coerentes.")
