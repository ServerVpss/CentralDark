"""
integrations/telegram_notifier.py — Notificações inteligentes via Telegram
"""
import time
try:
    import requests
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

from config import (
    TELEGRAM_TOKEN, TELEGRAM_CHAT_ID,
    LIXO_SIZE_MIN_MB, DUPLICATAS_NOTIFY, ROOT_DIR
)


class TelegramNotifier:
    def __init__(self):
        self.enabled = bool(TELEGRAM_TOKEN and TELEGRAM_CHAT_ID and _HAS_REQUESTS)
        if not self.enabled:
            reason = []
            if not TELEGRAM_TOKEN:   reason.append("token ausente")
            if not TELEGRAM_CHAT_ID: reason.append("chat_id ausente")
            if not _HAS_REQUESTS:    reason.append("requests não instalado")
            print(f"[TELEGRAM] Notificações desativadas: {', '.join(reason)}")

    def send(self, text: str) -> bool:
        if not self.enabled:
            return False
        try:
            r = requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"},
                timeout=10,
            )
            return r.status_code == 200
        except Exception as e:
            print(f"[TELEGRAM] Erro ao enviar: {e}")
            return False

    def notify_start(self) -> bool:
        ts  = time.strftime("%d/%m/%Y %H:%M", time.localtime())
        msg = (
            f"🔍 <b>Elite Mapper iniciado</b>\n"
            f"📁 Root: <code>{ROOT_DIR}</code>\n"
            f"🕐 {ts}"
        )
        ok = self.send(msg)
        if ok:
            print("[TELEGRAM] Notificação de início enviada")
        return ok

    def notify_complete(self, stats: dict) -> bool:
        """
        Envia notificação de conclusão SOMENTE se há algo relevante:
        - Lixo > LIXO_SIZE_MIN_MB
        - Duplicatas > DUPLICATAS_NOTIFY
        - Itens suspeitos > 0
        Anti-spam: silêncio se nada relevante.
        """
        lixo_mb   = stats.get("lixo_total_mb", 0)
        duplicatas = stats.get("duplicatas", 0)
        suspeitos  = stats.get("suspeitos", 0)
        duracao_s  = stats.get("duracao_s", 0)
        total_gb   = stats.get("total_gb", 0)

        relevante = (
            lixo_mb   >= LIXO_SIZE_MIN_MB or
            duplicatas >= DUPLICATAS_NOTIFY or
            suspeitos  > 0
        )

        if not relevante:
            print("[TELEGRAM] Nada relevante para notificar — silêncio (anti-spam)")
            return False

        alertas = []
        if lixo_mb >= LIXO_SIZE_MIN_MB:
            alertas.append(f"🔴 <b>Lixo detectado:</b> {lixo_mb:.0f} MB para limpar")
        if duplicatas >= DUPLICATAS_NOTIFY:
            alertas.append(f"🟠 <b>Duplicatas:</b> {duplicatas} pares encontrados")
        if suspeitos > 0:
            alertas.append(f"⚪ <b>Suspeitos:</b> {suspeitos} itens para investigar")

        ts  = time.strftime("%d/%m/%Y %H:%M", time.localtime())
        msg = (
            f"✅ <b>Elite Mapper concluído</b>\n"
            f"📦 Total: {total_gb:.1f} GB | Scan: {duracao_s:.0f}s\n"
            f"\n" + "\n".join(alertas) +
            f"\n\n📄 Relatórios em: <code>docs/agente/elite-mapper/relatorios/</code>\n"
            f"🕐 {ts}"
        )

        ok = self.send(msg)
        if ok:
            print("[TELEGRAM] Notificação de conclusão enviada")
        return ok
