import json
import time
import os
import logging
from pathlib import Path

# ===== CONFIGURAÇÃO =====
BASE_DIR = Path(r"E:\CentralDark\Sol")
RECEIPT_FILE = BASE_DIR / "HERMES_ORGANISMO_CANONICO_01-36_COMPLETO.receipt.json"
POWERSHELL_SCRIPT = BASE_DIR / "ABRIR_POWERSHELL.bat"
OBSIDIAN_URI = "obsidian://open?vault=CentralDark"
CHECK_INTERVAL = 1  # segundos
LOG_FILE = BASE_DIR / "monitor.log"

# ===== LOGGING =====
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MetaLupa-Juiz")

# ===== FUNÇÕES =====

def disparar_gatilho():
    """Abre PowerShell e Obsidian quando o juiz valida."""
    try:
        # Bip de Alerta Sonoro do Windows (Frequência: 2000Hz, Duração: 500ms)
        import winsound
        winsound.Beep(2000, 500)
        
        # Alerta Visual Piscante no Terminal
        for _ in range(3):
            print("\r🚨 [DISPARANDO GATILHO] 🚨", end="", flush=True)
            time.sleep(0.2)
            print("\r                         ", end="", flush=True)
            time.sleep(0.2)
        print("\n")

        if POWERSHELL_SCRIPT.exists():
            os.startfile(POWERSHELL_SCRIPT)
            logger.info("⚡ PowerShell aberto via ABRIR_POWERSHELL.bat")
        else:
            logger.warning(f"Arquivo não encontrado: {POWERSHELL_SCRIPT}")

        os.startfile(OBSIDIAN_URI)
        logger.info("⚡ Obsidian aberto (vault: CentralDark)")
    except Exception as e:
        logger.error(f"Falha ao disparar gatilho: {e}")


def verificar_juiz() -> bool:
    """
    Verifica se o juiz (independent_judge) está ativo ou se production_proved é True.
    Retorna True se o ciclo estiver CONCLUÍDO (juiz validou).
    """
    if not RECEIPT_FILE.exists():
        return False

    try:
        with open(RECEIPT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            
            juiz_ativo = data.get("multiagent", {}).get("independent_judge", False)
            producao_provada = data.get("production_proved", False)
            deploy_ok = data.get("deploy", False)
            
            return juiz_ativo or producao_provada or deploy_ok
            
    except json.JSONDecodeError:
        logger.error("receipt.json corrompido (JSON inválido)")
        return False
    except Exception as e:
        logger.error(f"Erro ao ler receipt.json: {e}")
        return False


def monitorar_loop():
    logger.info("🔬 Meta-Lupa ativa. Monitorando JUIZ (receipt.json)...")
    ultimo_estado = None

    while True:
        juiz_validou = verificar_juiz()

        if juiz_validou and juiz_validou != ultimo_estado:
            logger.info("🎯 JUIZ VALIDOU! CICLO_CONCLUÍDO.")
            disparar_gatilho()
            ultimo_estado = juiz_validou
        elif juiz_validou != ultimo_estado and ultimo_estado is not None:
            logger.info(f"Estado do juiz: {ultimo_estado} → {juiz_validou}")
            ultimo_estado = juiz_validou

        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    monitorar_loop()
