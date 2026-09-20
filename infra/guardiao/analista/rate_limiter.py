"""
Rate-limiter token bucket + cooldown + jitter.

- Burst: até BURST_MAX mensagens em JANELA_S segundos.
- Esgotado o burst → COOLDOWN_S segundos parado.
- Entre envios consecutivos: jitter aleatório JITTER_MIN_S..JITTER_MAX_S.
- Severidade 'critico' ignora as travas (mas dedup ainda se aplica).
"""
import random
import time
from collections import deque

BURST_MAX = 5
JANELA_S = 60
COOLDOWN_S = 90
JITTER_MIN_S = 5
JITTER_MAX_S = 15


class RateLimiter:
    def __init__(
        self,
        burst_max: int = BURST_MAX,
        janela_s: int = JANELA_S,
        cooldown_s: int = COOLDOWN_S,
        jitter: tuple[int, int] = (JITTER_MIN_S, JITTER_MAX_S),
    ):
        self.burst_max = burst_max
        self.janela_s = janela_s
        self.cooldown_s = cooldown_s
        self.jitter = jitter
        self._envios: deque[float] = deque()
        self._cooldown_ate: float = 0.0
        self._ultimo_envio: float = 0.0

    def _purge(self, agora: float) -> None:
        limite = agora - self.janela_s
        while self._envios and self._envios[0] < limite:
            self._envios.popleft()

    def aguardar(self, critico: bool = False) -> float:
        """Bloqueia o tempo necessário antes do envio. Retorna segundos dormidos."""
        if critico:
            return 0.0
        agora = time.time()
        dormiu = 0.0

        # cooldown ativo?
        if agora < self._cooldown_ate:
            dt = self._cooldown_ate - agora
            time.sleep(dt)
            dormiu += dt
            agora = time.time()

        # jitter entre envios
        if self._ultimo_envio > 0:
            min_proximo = self._ultimo_envio + random.uniform(*self.jitter)
            if agora < min_proximo:
                dt = min_proximo - agora
                time.sleep(dt)
                dormiu += dt
                agora = time.time()

        # burst cheio?
        self._purge(agora)
        if len(self._envios) >= self.burst_max:
            self._cooldown_ate = agora + self.cooldown_s
            dt = self.cooldown_s
            time.sleep(dt)
            dormiu += dt
            agora = time.time()
            self._envios.clear()

        return dormiu

    def registrar_envio(self) -> None:
        agora = time.time()
        self._envios.append(agora)
        self._ultimo_envio = agora
