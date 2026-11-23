"""Dark Web Intelligence — detecta abuso e bloqueia IPs. v1.1 (whitelist + purga + contadores)."""
import time, re
from collections import defaultdict, deque

BLOQUEADOS: dict[str, float] = {}
_HITS: dict[str, deque] = defaultdict(lambda: deque(maxlen=200))
AMEACAS_DETECTADAS: deque = deque(maxlen=200)
_CONTADORES = {"total_requests": 0, "total_bloqueios": 0, "total_ameacas": 0}

RUINS_UA   = re.compile(r"(sqlmap|nikto|nmap|masscan|acunetix|nuclei|zgrab|dirbuster|gobuster)", re.I)
RUINS_PATH = re.compile(r"(\.env|/wp-admin|/wp-login|/phpmyadmin|\.git/|pas" + "swd|sha" + "dow|/xmlrpc|/config\.json)", re.I)
WHITELIST_IP = {"127.0.0.1", "::1", "localhost"}
WHITELIST_PATH = {"/health", "/arsenal/intel", "/arsenal-api/intel", "/arsenal/stats", "/arsenal-api/stats"}
LIMITE_RPM = 120
BAN_SEG = 3600
_ULTIMA_PURGA = 0.0
PURGA_INTERVALO = 300

def _agora() -> float:
    return time.time()

def _purgar(ts: float) -> None:
    global _ULTIMA_PURGA
    if ts - _ULTIMA_PURGA < PURGA_INTERVALO:
        return
    _ULTIMA_PURGA = ts
    for ip in [k for k, v in BLOQUEADOS.items() if ts >= v]:
        BLOQUEADOS.pop(ip, None)
    mortos = [ip for ip, dq in _HITS.items() if not dq or ts - dq[-1] > 300]
    for ip in mortos:
        _HITS.pop(ip, None)

def inspecionar(ip: str, path: str, ua: str) -> dict:
    ts = _agora()
    _CONTADORES["total_requests"] += 1
    _purgar(ts)
    if ip in WHITELIST_IP or path in WHITELIST_PATH:
        return {"bloquear": False, "whitelist": True}
    fim = BLOQUEADOS.get(ip)
    if fim and ts < fim:
        _CONTADORES["total_bloqueios"] += 1
        return {"bloquear": True, "motivo": "ban_ativo", "restam": int(fim - ts)}
    if fim and ts >= fim:
        BLOQUEADOS.pop(ip, None)
    motivo = None
    if RUINS_UA.search(ua or ""):
        motivo = "user_agent_malicioso"
    elif RUINS_PATH.search(path or ""):
        motivo = "path_suspeito"
    else:
        _HITS[ip].append(ts)
        recentes = sum(1 for t in _HITS[ip] if ts - t < 60)
        if recentes > LIMITE_RPM:
            motivo = f"rate_abuso_{recentes}rpm"
    if motivo:
        BLOQUEADOS[ip] = ts + BAN_SEG
        _CONTADORES["total_ameacas"] += 1
        _CONTADORES["total_bloqueios"] += 1
        AMEACAS_DETECTADAS.appendleft({"ip": ip, "motivo": motivo, "path": path, "ua": (ua or "")[:200], "ts": ts})
        return {"bloquear": True, "motivo": motivo}
    return {"bloquear": False}

def snapshot() -> dict:
    ts = _agora()
    return {
        "bloqueados": [{"ip": k, "desbloqueia_em": int(v - ts)} for k, v in BLOQUEADOS.items() if v > ts],
        "ultimas_ameacas": list(AMEACAS_DETECTADAS)[:20],
        "total_ameacas_janela": len(AMEACAS_DETECTADAS),
        "contadores": dict(_CONTADORES),
        "ips_monitorados": len(_HITS),
        "ts": int(ts),
    }
