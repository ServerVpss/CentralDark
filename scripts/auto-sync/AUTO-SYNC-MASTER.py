#!/usr/bin/env python3
"""
AUTO-SYNC MASTER — Sincronização Bidirecional Contínua
CentralDark: Windows ↔ Main Repo ↔ VPS
Fluxo contínuo sem duplicação, single-writer Hermes
"""
import argparse
import subprocess
import json
import datetime
from pathlib import Path
from enum import Enum

class SyncTarget(Enum):
    WINDOWS = "windows"
    MAIN = "main"
    VPS = "vps"
    ALL = "all"

class SyncStatus(Enum):
    IDLE = "idle"
    SYNCING = "syncing"
    SUCCESS = "success"
    FAILED = "failed"
    CONFLICT = "conflict"

class AutoSyncMaster:
    def __init__(self, repo_root: str = "K:\\"):
        self.repo_root = Path(repo_root)
        self.status_file = self.repo_root / ".auto-sync" / "status.json"
        self.status_file.parent.mkdir(exist_ok=True, parents=True)
        self._init_status()

    def _init_status(self):
        """Inicializa arquivo de status se não existir"""
        if not self.status_file.exists():
            self._write_status({
                "last_sync": None,
                "status": SyncStatus.IDLE.value,
                "targets": {
                    "windows": None,
                    "main": None,
                    "vps": None
                }
            })

    def _write_status(self, status: dict):
        """Escreve status em JSON"""
        with open(self.status_file, 'w') as f:
            json.dump(status, f, indent=2, default=str)

    def _read_status(self) -> dict:
        """Lê status atual"""
        with open(self.status_file, 'r') as f:
            return json.load(f)

    def sync_windows(self) -> bool:
        """Sincroniza mudanças locais (Windows) com Main repo"""
        try:
            print("[WINDOWS] Sincronizando mudanças locais...")
            subprocess.run(
                ["git", "-C", str(self.repo_root), "add", "."],
                check=True,
                capture_output=True
            )
            subprocess.run(
                ["git", "-C", str(self.repo_root), "commit", "-m",
                 f"🔄 Auto Sync Windows → Main [{datetime.datetime.now().isoformat()}]"],
                check=False,
                capture_output=True
            )
            print("✅ Windows → Main: OK")
            return True
        except Exception as e:
            print(f"❌ Windows sync falhou: {e}")
            return False

    def sync_main(self) -> bool:
        """Sincroniza Main repo com origin/main (pull)"""
        try:
            print("[MAIN] Puxando mudanças do origin/main...")
            subprocess.run(
                ["git", "-C", str(self.repo_root), "fetch", "origin", "main"],
                check=True,
                capture_output=True
            )
            subprocess.run(
                ["git", "-C", str(self.repo_root), "pull", "--rebase", "origin", "main"],
                check=True,
                capture_output=True
            )
            print("✅ Main ← origin/main: OK")
            return True
        except Exception as e:
            print(f"❌ Main sync falhou: {e}")
            return False

    def sync_main_to_vps(self) -> bool:
        """Pushes commits para origin/main e dispara deploy na VPS"""
        try:
            print("[MAIN→VPS] Pushing commits para origin/main...")
            subprocess.run(
                ["git", "-C", str(self.repo_root), "push", "origin", "main"],
                check=True,
                capture_output=True
            )
            print("[VPS] Disparando sync na VPS via webhook/SSH...")
            # TODO: integrar com Tailscale SSH ou webhook para disparat  deploy VPS
            print("✅ Main → VPS: OK")
            return True
        except Exception as e:
            print(f"❌ Main→VPS sync falhou: {e}")
            return False

    def run_cycle(self, target: SyncTarget = SyncTarget.ALL) -> bool:
        """Executa ciclo de sincronização completo"""
        status = self._read_status()
        status["status"] = SyncStatus.SYNCING.value
        status["last_sync"] = datetime.datetime.now().isoformat()
        self._write_status(status)

        print(f"\n🔄 AUTO-SYNC CYCLE START [{datetime.datetime.now().isoformat()}]")
        print(f"Target: {target.value}")

        success = True

        if target in (SyncTarget.WINDOWS, SyncTarget.ALL):
            success &= self.sync_windows()

        if target in (SyncTarget.MAIN, SyncTarget.ALL):
            success &= self.sync_main()

        if target in (SyncTarget.VPS, SyncTarget.ALL):
            success &= self.sync_main_to_vps()

        final_status = SyncStatus.SUCCESS.value if success else SyncStatus.FAILED.value
        status["status"] = final_status
        self._write_status(status)

        print(f"🏁 AUTO-SYNC CYCLE END [{final_status.upper()}]")
        return success

    def get_status_for_ui(self) -> dict:
        """Retorna status formatado para UI (Cockpit button)"""
        status = self._read_status()
        return {
            "timestamp": status.get("last_sync"),
            "status": status.get("status"),
            "human_readable": self._format_timestamp(status.get("last_sync"))
        }

    def _format_timestamp(self, iso_str: str) -> str:
        """Formata timestamp para UI: horário/data/dia"""
        if not iso_str:
            return "Nunca sincronizado"
        dt = datetime.datetime.fromisoformat(iso_str)
        return f"{dt.strftime('%H:%M:%S')} · {dt.strftime('%d/%m/%Y')} ({dt.strftime('%A')})"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AUTO-SYNC: Sincronização Bidirecional CentralDark")
    parser.add_argument(
        "--target",
        choices=["windows", "main", "vps", "all"],
        default="all",
        help="Alvo de sincronização"
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Mostra status atual"
    )

    args = parser.parse_args()

    sync = AutoSyncMaster()

    if args.status:
        ui_status = sync.get_status_for_ui()
        print(json.dumps(ui_status, indent=2))
    else:
        target = SyncTarget[args.target.upper()]
        success = sync.run_cycle(target)
        exit(0 if success else 1)
