"""Testes executáveis — a EVIDÊNCIA (observada e reproduzível) desta entrega."""
import unittest
from lupa_gate import resposta_ancorada, acao_autorizada, veredito_final, RelatorioLupa
from react_loop import ReActAgent, Tool, llm_roteirizado

KB = {
    "ReAct": "ReAct intercala raciocinio e acao: pensamento, acao, observacao em loop",
    "ALFWorld": "No paper, ReAct supera imitacao e RL em 34 pontos absolutos no ALFWorld",
}

def busca(chave):
    return KB.get(chave.strip(), "nada encontrado")

FERRAMENTAS = [
    Tool("search", busca, "busca na base local", risco="R1"),
    Tool("delete", lambda x: f"apagou {x}", "acao destrutiva", risco="R4"),
]

class TestGate(unittest.TestCase):
    def test_ancoragem_positiva(self):
        self.assertTrue(resposta_ancorada(
            "ReAct intercala raciocinio e acao em loop", KB["ReAct"]))

    def test_ancoragem_negativa_bloqueia_suposicao(self):
        self.assertFalse(resposta_ancorada(
            "ReAct garante lucro imediato infalivel bilionario", KB["ReAct"]))

    def test_final_sem_observacao_e_suposicao(self):
        ok, motivo = veredito_final("qualquer coisa", None)
        self.assertFalse(ok); self.assertIn("suposição", motivo)

    def test_riscos(self):
        self.assertTrue(acao_autorizada("R1", ()))
        self.assertFalse(acao_autorizada("R4", ()))
        self.assertTrue(acao_autorizada("R4", ("R4",)))
        self.assertFalse(acao_autorizada("R9", ("R9",)))

    def test_relatorio_tem_4_campos(self):
        r = RelatorioLupa(evidencia=["x"]).formatar()
        for campo in ("EVIDÊNCIA", "INFERÊNCIA", "SUPOSIÇÃO", "COMO CONFIRMAR"):
            self.assertIn(campo, r)

class TestLoop(unittest.TestCase):
    def test_fluxo_completo_ancorado_aprova(self):
        llm = llm_roteirizado([
            "Thought: preciso buscar\nAction: search[ReAct]",
            "Thought: achei\nFinal[obs=1]: ReAct intercala raciocinio e acao em loop",
        ])
        r = ReActAgent(llm, FERRAMENTAS).run("o que e ReAct?")
        self.assertEqual(r["status"], "APROVADO")
        self.assertEqual(len(r["observacoes"]), 1)

    def test_final_nao_ancorado_e_bloqueado(self):
        llm = llm_roteirizado([
            "Thought: buscar\nAction: search[ReAct]",
            "Final[obs=1]: ReAct garante lucro imediato infalivel bilionario",
        ])
        r = ReActAgent(llm, FERRAMENTAS, max_steps=3).run("o que e ReAct?")
        self.assertEqual(r["status"], "NÃO APROVADO AINDA")
        self.assertTrue(any("não ancorada" in o for o in r["observacoes"]))

    def test_destrutiva_sem_autorizacao_bloqueia(self):
        llm = llm_roteirizado(["Action: delete[banco]"])
        r = ReActAgent(llm, FERRAMENTAS, max_steps=1).run("apaga tudo")
        self.assertTrue(any("BLOQUEADO PELA LUPA" in o for o in r["observacoes"]))

    def test_destrutiva_com_autorizacao_roda(self):
        llm = llm_roteirizado(["Action: delete[banco]",
                               "Final[obs=1]: apagou banco"])
        r = ReActAgent(llm, FERRAMENTAS, max_steps=2, autorizados=("R4",)).run("apaga")
        self.assertEqual(r["status"], "APROVADO")

    def test_ferramenta_desconhecida_nao_derruba_loop(self):
        llm = llm_roteirizado(["Action: voar[alto]",
                               "Action: search[ALFWorld]",
                               "Final[obs=2]: ReAct supera imitacao e RL em 34 pontos absolutos no ALFWorld"])
        r = ReActAgent(llm, FERRAMENTAS).run("dado do paper")
        self.assertEqual(r["status"], "APROVADO")
        self.assertIn("desconhecida", r["observacoes"][0])

    def test_max_steps(self):
        llm = llm_roteirizado(["blablabla"] * 5)
        r = ReActAgent(llm, FERRAMENTAS, max_steps=2).run("x")
        self.assertEqual(r["status"], "NÃO APROVADO AINDA")

if __name__ == "__main__":
    unittest.main(verbosity=2)
