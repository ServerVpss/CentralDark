from __future__ import annotations

import subprocess
from pathlib import Path
from urllib.parse import urlparse

from ..models import Evidence, ProbeReceipt, Status
from .common import fetch_json


class LocalProbe:
    domain = "local"

    def __init__(self, config: dict):
        self.config = config

    def run(self) -> ProbeReceipt:
        evidence: list[Evidence] = []
        blockers: list[str] = []
        root = Path(self.config.get("repo_path", "."))
        if not root.exists():
            blockers.append("REPO_PATH_MISSING")
        else:
            try:
                head = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], text=True, timeout=5).strip()
                branch = subprocess.check_output(["git", "-C", str(root), "branch", "--show-current"], text=True, timeout=5).strip()
                dirty = bool(subprocess.check_output(["git", "-C", str(root), "status", "--porcelain"], text=True, timeout=5).strip())
                evidence.extend((Evidence("git", "head", head), Evidence("git", "branch", branch), Evidence("git", "dirty", dirty)))
            except (subprocess.SubprocessError, OSError):
                blockers.append("GIT_UNAVAILABLE")

        for service in self.config.get("services", []):
            name = service["name"]
            url = service["url"]
            expected = int(service.get("expected_status", 200))
            try:
                status, payload = fetch_json(url, timeout=float(service.get("timeout_seconds", 3)))
                evidence.append(Evidence(urlparse(url).netloc, f"service:{name}", {"http": status, "body": payload}))
                if status != expected:
                    blockers.append(f"SERVICE_{name}_HTTP_{status}")
            except Exception as error:
                evidence.append(Evidence(urlparse(url).netloc, f"service:{name}", {"error": type(error).__name__}))
                blockers.append(f"SERVICE_{name}_UNREACHABLE")
        status = Status.PASS if not blockers else Status.FAIL
        return ProbeReceipt(self.domain, status, f"{len(evidence)} evidências locais", tuple(evidence), tuple(blockers))

