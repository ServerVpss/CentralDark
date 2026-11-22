"""Gerenciador de sessões Xvfb+Chrome+x11vnc+websockify."""
import asyncio, os, secrets, signal, pathlib, time, shutil, socket
from dataclasses import dataclass, field
from typing import Dict

WEBSOCKIFY_PORT_BASE = 6080
DISPLAY_BASE = 90
MAX_SESSIONS = 4
TIMEOUT_SEC = 15 * 60

@dataclass
class Sess:
    id: str
    provedor: str
    display: int
    ws_port: int
    vnc_port: int
    senha: str
    profile: str
    pids: list = field(default_factory=list)
    iniciada: float = field(default_factory=time.time)

def _porta_livre(start):
    for p in range(start, start + 50):
        try:
            with socket.socket() as s:
                s.bind(("127.0.0.1", p))
            return p
        except OSError: continue
    raise RuntimeError("sem porta livre")

class SessionManager:
    def __init__(self, profiles_root: pathlib.Path):
        self.profiles_root = profiles_root
        self.sessoes: Dict[str, Sess] = {}
        asyncio.get_event_loop().create_task(self._gc_loop())

    async def _gc_loop(self):
        while True:
            await asyncio.sleep(30)
            agora = time.time()
            for sid in list(self.sessoes):
                if agora - self.sessoes[sid].iniciada > TIMEOUT_SEC:
                    self.stop(sid)

    def list(self):
        return [{"id": s.id, "provedor": s.provedor, "ws_port": s.ws_port,
                 "iniciada": int(s.iniciada), "expira_em": int(s.iniciada + TIMEOUT_SEC - time.time())}
                for s in self.sessoes.values()]

    async def start(self, provedor: str, url: str):
        if len(self.sessoes) >= MAX_SESSIONS:
            raise RuntimeError("limite de sessões atingido")
        display = DISPLAY_BASE + len(self.sessoes)
        # checa display livre
        while pathlib.Path(f"/tmp/.X{display}-lock").exists():
            display += 1
        ws_port = _porta_livre(WEBSOCKIFY_PORT_BASE)
        vnc_port = _porta_livre(5900 + (display - DISPLAY_BASE))
        senha = secrets.token_urlsafe(6)
        sid = secrets.token_urlsafe(8)
        profile = str(self.profiles_root / provedor)
        os.makedirs(profile, exist_ok=True)
        env = {**os.environ, "DISPLAY": f":{display}"}
        # Xvfb
        xvfb = await asyncio.create_subprocess_exec(
            "Xvfb", f":{display}", "-screen", "0", "1280x800x24", "-nolisten", "tcp",
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await asyncio.sleep(0.6)
        # x11vnc — com senha
        pwfile = f"/tmp/x11vnc-{sid}.pw"
        proc = await asyncio.create_subprocess_exec("x11vnc", "-storepasswd", senha, pwfile,
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await proc.wait()
        x11vnc = await asyncio.create_subprocess_exec(
            "x11vnc", "-display", f":{display}", "-rfbport", str(vnc_port),
            "-rfbauth", pwfile, "-forever", "-shared", "-localhost", "-quiet",
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await asyncio.sleep(0.5)
        # chrome
        chrome = await asyncio.create_subprocess_exec(
            "google-chrome", f"--user-data-dir={profile}", "--no-first-run",
            "--no-default-browser-check", "--disable-features=ChromeWhatsNewUI",
            "--start-maximized", url,
            env=env, stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        # websockify -> 127.0.0.1:vnc_port; serve novnc
        ws = await asyncio.create_subprocess_exec(
            "websockify", "--web=/usr/share/novnc", str(ws_port), f"127.0.0.1:{vnc_port}",
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        s = Sess(id=sid, provedor=provedor, display=display, ws_port=ws_port,
                 vnc_port=vnc_port, senha=senha, profile=profile,
                 pids=[xvfb.pid, x11vnc.pid, chrome.pid, ws.pid])
        self.sessoes[sid] = s
        # URL noVNC via Caddy proxy /novnc/<id>/ -> 127.0.0.1:ws_port
        return {"id": sid, "ws_port": ws_port, "senha": senha,
                "url": f"/novnc/p{ws_port}/vnc.html?autoconnect=1&resize=remote&password={senha}",
                "expira_em_s": TIMEOUT_SEC}

    def stop(self, sid: str):
        s = self.sessoes.pop(sid, None)
        if not s: return
        for pid in s.pids:
            try: os.kill(pid, signal.SIGTERM)
            except Exception: pass
        try: os.unlink(f"/tmp/x11vnc-{sid}.pw")
        except Exception: pass

    def porta_da(self, sid: str):
        s = self.sessoes.get(sid)
        return s.ws_port if s else None
