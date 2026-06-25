"""
Motor de janela deslizante — detecta picos/repetições dentro de uma janela.

Uso típico: contar quantos restarts de um processo aconteceram nos últimos 5min.
"""
import time
from collections import defaultdict, deque
from threading import Lock


class JanelaDeslizante:
    def __init__(self, janela_s: int = 300):
        self.janela_s = janela_s
        self._buckets: dict[str, deque] = defaultdict(deque)
        self._lock = Lock()

    def registrar(self, chave: str, valor: float | None = None) -> int:
        """Marca uma ocorrência. Retorna o total dentro da janela atual."""
        agora = time.time()
        with self._lock:
            d = self._buckets[chave]
            d.append((agora, valor))
            limite = agora - self.janela_s
            while d and d[0][0] < limite:
                d.popleft()
            return len(d)

    def contar(self, chave: str) -> int:
        agora = time.time()
        with self._lock:
            d = self._buckets[chave]
            limite = agora - self.janela_s
            while d and d[0][0] < limite:
                d.popleft()
            return len(d)

    def amostras(self, chave: str) -> list[float]:
        with self._lock:
            return [v for _, v in self._buckets[chave] if v is not None]
