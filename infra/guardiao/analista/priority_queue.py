"""Fila de prioridade simples — critico > erro > aviso > info."""
import heapq
import itertools
from threading import Lock

_ORDEM = {"critico": 0, "erro": 1, "aviso": 2, "info": 3}


class FilaPrioridade:
    def __init__(self):
        self._heap: list = []
        self._counter = itertools.count()
        self._lock = Lock()

    def push(self, evento: dict) -> None:
        sev = evento.get("severity", "info")
        prio = _ORDEM.get(sev, 9)
        with self._lock:
            heapq.heappush(self._heap, (prio, next(self._counter), evento))

    def pop(self) -> dict | None:
        with self._lock:
            if not self._heap:
                return None
            return heapq.heappop(self._heap)[2]

    def __len__(self) -> int:
        with self._lock:
            return len(self._heap)
