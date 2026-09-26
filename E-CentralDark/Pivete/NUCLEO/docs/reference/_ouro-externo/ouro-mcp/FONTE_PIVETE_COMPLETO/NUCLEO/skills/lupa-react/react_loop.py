"""
react_loop.py — Implementação mínima e universal do loop ReAct
(Yao et al., 2022: Pensamento → Ação → Observação), com a Técnica da Lupa
como portão de aprovação da resposta final.

Universal: `llm` é qualquer callable(prompt)->str — Anthropic, OpenAI,
Ollama local, ou um roteiro determinístico para teste. Zero dependências.
"""
import re
from dataclasses import dataclass
from lupa_gate import acao_autorizada, veredito_final

RE_ACTION = re.compile(r"^Action:\s*(\w+)\[(.*)\]\s*$", re.M)
RE_FINAL = re.compile(r"^Final\[obs=(\d+)\]:\s*(.+)$", re.M)


@dataclass
class Tool:
    nome: str
    fn: object            # callable(str)->str
    descricao: str = ""
    risco: str = "R1"     # R0–R4 (Lupa)


class ReActAgent:
    def __init__(self, llm, tools, max_steps=8, autorizados=()):
        self.llm = llm
        self.tools = {t.nome: t for t in tools}
        self.max_steps = max_steps
        self.autorizados = tuple(autorizados)
        self.historico = []
        self.observacoes = []  # 1-indexado na citação

    def _prompt(self, tarefa):
        linhas = [f"Tarefa: {tarefa}", "Formato: Thought / Action: nome[entrada] / Final[obs=N]: resposta"]
        linhas += self.historico
        return "\n".join(linhas)

    def _observar(self, texto):
        self.observacoes.append(texto)
        self.historico.append(f"Observation {len(self.observacoes)}: {texto}")

    def run(self, tarefa):
        for _ in range(self.max_steps):
            saida = self.llm(self._prompt(tarefa))
            self.historico.append(saida.strip())

            m_final = RE_FINAL.search(saida)
            if m_final:
                idx, resposta = int(m_final.group(1)), m_final.group(2).strip()
                obs = self.observacoes[idx - 1] if 1 <= idx <= len(self.observacoes) else None
                ok, motivo = veredito_final(resposta, obs)
                if ok:
                    return {"status": "APROVADO", "resposta": resposta, "motivo": motivo,
                            "passos": len(self.historico), "observacoes": list(self.observacoes)}
                self._observar(motivo)  # devolve o bloqueio ao loop (chance de corrigir)
                continue

            m_act = RE_ACTION.search(saida)
            if m_act:
                nome, entrada = m_act.group(1), m_act.group(2)
                tool = self.tools.get(nome)
                if tool is None:
                    self._observar(f"ERRO: ferramenta desconhecida '{nome}'.")
                elif not acao_autorizada(tool.risco, self.autorizados):
                    self._observar(f"BLOQUEADO PELA LUPA: ação '{nome}' é {tool.risco} e não há autorização.")
                else:
                    try:
                        self._observar(str(tool.fn(entrada)))
                    except Exception as e:  # noqa: BLE001
                        self._observar(f"ERRO na ferramenta '{nome}': {e}")
                continue
            self._observar("ERRO: saída sem Action nem Final válidos.")
        return {"status": "NÃO APROVADO AINDA", "resposta": None,
                "motivo": f"max_steps={self.max_steps} atingido sem final aprovado.",
                "passos": len(self.historico), "observacoes": list(self.observacoes)}


def llm_roteirizado(respostas):
    """Substituto determinístico de LLM para TESTE (mock declarado como mock —
    a Lupa proíbe mock apresentado como produção)."""
    fila = list(respostas)
    def _f(_prompt):
        return fila.pop(0) if fila else "Final[obs=999]: sem mais roteiro"
    return _f
