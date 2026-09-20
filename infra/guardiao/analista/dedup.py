"""
Deduplicação com agrupamento por chave + janela.

- 1ª ocorrência: passa.
- Repetições dentro da janela: incrementam contador, não passam.
- Quando o evento finalmente sair (janela expira), o `flush_pendentes`
  emite um sumário tipo "× N nos últimos Xs" se houve agregação.
"""
import time
from dataclasses import dataclass, field


@dataclass
class _Estado:
    primeira_ts: float
    ultima_ts: float
    janela_s: int
    contador: int = 0
    template: dict = field(default_factory=dict)


class Dedup:
    def __init__(self):
        self._estado: dict[str, _Estado] = {}

    def deve_passar(self, evento: dict) -> bool:
        """True se o evento deve ir agora; False se foi absorvido na agregação."""
        chave = evento.get("key", "")
        janela = int(evento.get("dedup_window_s", 300))
        agora = time.time()
        st = self._estado.get(chave)

        if st is None or (agora - st.primeira_ts) > st.janela_s:
            # nova janela
            self._estado[chave] = _Estado(
                primeira_ts=agora,
                ultima_ts=agora,
                janela_s=janela,
                contador=1,
                template=evento,
            )
            return True

        st.ultima_ts = agora
        st.contador += 1
        st.template = evento  # mantém o mais recente como base
        return False

    def coletar_resumos(self) -> list[dict]:
        """Para janelas expiradas com contador>1, gera resumo agregado."""
        agora = time.time()
        resumos = []
        expiradas = []
        for chave, st in self._estado.items():
            if (agora - st.primeira_ts) > st.janela_s:
                if st.contador > 1:
                    base = dict(st.template)
                    base["title"] = f"{base.get('title','?')} × {st.contador}"
                    base["body"] = (
                        f"Agrupado: {st.contador} ocorrências em "
                        f"{int(agora - st.primeira_ts)}s.\n\n"
                        f"Último detalhe: {base.get('body','')}"
                    )
                    base["_agrupado"] = True
                    resumos.append(base)
                expiradas.append(chave)
        for c in expiradas:
            del self._estado[c]
        return resumos
