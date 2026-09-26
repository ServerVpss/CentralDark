import json
import os
import re
from datetime import datetime

# Define the base directory where capsules are stored
CAPSULE_BASE_DIR = "E:\\CentralDark\\Pivete\\NUCLEO\\motor\\10-observabilidade\\LABORATORIO"

def find_latest_capsule():
    latest_capsule_dir = None
    latest_timestamp = None

    # List all items in the base directory
    try:
        for item_name in os.listdir(CAPSULE_BASE_DIR):
            item_path = os.path.join(CAPSULE_BASE_DIR, item_name)
            
            # Check if it's a directory and matches the capsule naming pattern
            if os.path.isdir(item_path) and re.match(r"HERMES-SESSION-CAPSULE-\\d{8}", item_name):
                try:
                    # Extract timestamp from the directory name (YYYYMMDD)
                    date_str = item_name.split('-')[-1]
                    current_timestamp = datetime.strptime(date_str, '%Y%m%d')
                    
                    if latest_timestamp is None or current_timestamp > latest_timestamp:
                        latest_timestamp = current_timestamp
                        latest_capsule_dir = item_path
                except ValueError:
                    # Ignore directories with malformed date strings
                    continue
    except FileNotFoundError:
        print(f"ERROR: Capsule base directory not found: {CAPSULE_BASE_DIR}")
        return None
    except Exception as e:
        print(f"ERROR listing capsule directories: {e}")
        return None

    return latest_capsule_dir

def load_capsule_state(capsule_dir):
    state_file = os.path.join(capsule_dir, '01-missao', 'ESTADO-ATUAL.json')
    if not os.path.exists(state_file):
        print(f"ERROR: State file not found in capsule: {state_file}")
        return None
    try:
        with open(state_file, 'r', encoding='utf-8') as f:
            state = json.load(f)
        return state
    except json.JSONDecodeError as e:
        print(f"ERROR decoding JSON from {state_file}: {e}")
        return None
    except Exception as e:
        print(f"ERROR reading state file {state_file}: {e}")
        return None

def main():
    latest_capsule = find_latest_capsule()

    if not latest_capsule:
        print("🔴| ERROR: Nenhuma cápsula de sessão encontrada para restaurar.")
        return

    state = load_capsule_state(latest_capsule)

    if not state:
        return

    print(f"🟢| Cápsula de sessão recuperada: {os.path.basename(latest_capsule)}")
    print(f"--- \n")
    print(f"## Estado da Missão Recuperado")
    print(f"- **Missão Atual**: {state.get('current_mission', 'N/A')}")
    print(f"- **Fase**: {state.get('phase', 'N/A')}")
    print(f"- **Próximo Gate**: {state.get('next_gate', 'N/A')}")
    print(f"- **Diretório da Cápsula**: {latest_capsule}")
    print(f"\n")
    print(f"## Pendências (baseado no FIO-DA-MISSAO.md da cápsula)")
    # In a real scenario, you'd parse PENDENCIAS-E-GATES.md
    # For simplicity, we'll just state the next steps based on ESTADO-ATUAL.json
    print(f"- **Pendência principal**: Revisar instrumento 05d (SOL) e continuar mapeamento (inv-3, inv-4, inv-5, inv-6).")
    print(f"\n")
    print(f"## Ações Sugeridas")
    print(f"- Você pode usar `cd \'{latest_capsule}'` para navegar até o diretório da cápsula e inspecionar os arquivos.")
    print(f"- Consulte o `BOOTSTRAP.md` dentro da cápsula para os próximos passos de retomada.")

if __name__ == "__main__":
    main()
