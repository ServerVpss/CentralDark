"""Testes do rate-limiter — burst + cooldown + jitter."""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from analista.rate_limiter import RateLimiter


def test_burst_permite_n_envios_rapidos(monkeypatch):
    dormidos = []
    monkeypatch.setattr(time, "sleep", lambda s: dormidos.append(s))
    # jitter zero pra teste determinístico
    rl = RateLimiter(burst_max=3, janela_s=60, cooldown_s=90, jitter=(0, 0))
    for _ in range(3):
        rl.aguardar(critico=False)
        rl.registrar_envio()
    # os 3 primeiros não devem ter ativado cooldown (90s)
    assert all(d < 90 for d in dormidos), f"dormiu mais que o esperado: {dormidos}"


def test_apos_burst_aciona_cooldown(monkeypatch):
    dormidos = []
    monkeypatch.setattr(time, "sleep", lambda s: dormidos.append(s))
    rl = RateLimiter(burst_max=2, janela_s=60, cooldown_s=90, jitter=(0, 0))
    for _ in range(2):
        rl.aguardar(critico=False)
        rl.registrar_envio()
    rl.aguardar(critico=False)  # esse deve disparar cooldown
    assert 90 in dormidos, f"cooldown não acionado: {dormidos}"


def test_critico_ignora_rate_limit():
    rl = RateLimiter(burst_max=1, janela_s=60, cooldown_s=90, jitter=(0, 0))
    rl.aguardar(critico=False)
    rl.registrar_envio()
    t0 = time.time()
    rl.aguardar(critico=True)  # não pode dormir
    assert time.time() - t0 < 0.1
