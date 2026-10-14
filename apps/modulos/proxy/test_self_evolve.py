"""Regressões do Self-Evolution existente: XP honesto, confiança e continuidade.

Sem rede, sem credenciais e sem escrita no ledger verdadeiro.
Executar: python3 -m unittest test_self_evolve.py
"""
import json
import tempfile
import unittest
from pathlib import Path

import self_evolve


class SelfEvolutionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.paths = (
            self_evolve.METRICAS,
            self_evolve.SNAPSHOT,
            self_evolve.APRENDIZADOS,
        )
        self_evolve.METRICAS = root / "metricas.jsonl"
        self_evolve.SNAPSHOT = root / "ranking.json"
        self_evolve.APRENDIZADOS = root / "APRENDIZADOS.md"

    def tearDown(self):
        (
            self_evolve.METRICAS,
            self_evolve.SNAPSHOT,
            self_evolve.APRENDIZADOS,
        ) = self.paths
        self.tmp.cleanup()

    def escrever(self, *registros):
        self_evolve.METRICAS.write_text(
            "\n".join(
                item if isinstance(item, str) else json.dumps(item)
                for item in registros
            ) + "\n",
            encoding="utf-8",
        )

    def test_amostra_unica_nao_supera_historico_evidenciado(self):
        linhas = [{"modelo": "rapido", "ok": True, "ms": 1}]
        linhas += [
            {"modelo": "constante", "ok": i < 95, "ms": 200}
            for i in range(100)
        ]
        self.escrever(*linhas)
        dados = self_evolve.avaliar()
        self.assertEqual(dados["ranking"][0]["modelo"], "constante")
        self.assertTrue(dados["ranking"][0]["apto"])
        self.assertEqual(dados["ranking"][0]["motivo"], "TRANSPORTE_AMOSTRADO")
        self.assertFalse(dados["ranking"][1]["apto"])
        self.assertLess(dados["ranking"][0]["limite_inferior_ok"], 0.95)

    def test_sem_latencia_sem_pontos_e_nome_invalido_descartado(self):
        linhas = [{"modelo": "sem-ms", "ok": True} for _ in range(20)]
        linhas += [{"modelo": "invalido\n# markdown", "ok": True, "ms": 1}]
        linhas += ["garbage", [], 42]
        self.escrever(*linhas)
        dados = self_evolve.avaliar()
        self.assertEqual(dados["ranking"][0]["score"], 0)
        self.assertEqual(dados["ranking"][0]["motivo"], "LATENCIA_SEM_PROVA")
        self.assertGreaterEqual(dados["linhas_invalidas"], 4)
        self_evolve.salvar_aprendizado(dados)
        self.assertFalse(self_evolve.APRENDIZADOS.exists())

    def test_aprendizado_so_quando_lider_muda(self):
        linhas = [{"modelo": "original", "ok": True, "ms": 170} for _ in range(30)]
        self.escrever(*linhas)
        dados = self_evolve.avaliar()
        self_evolve.salvar_aprendizado(dados)
        primeiro = self_evolve.APRENDIZADOS.read_text()
        self_evolve.salvar_aprendizado(self_evolve.avaliar())
        self.assertEqual(primeiro, self_evolve.APRENDIZADOS.read_text())
        self.assertEqual(json.loads(self_evolve.SNAPSHOT.read_text())[
            "ultimo_lider_registrado"
        ], "original")
        self.escrever(*[
            {"modelo": "melhorado", "ok": True, "ms": 145} for _ in range(50)
        ])
        novo = self_evolve.avaliar()
        self_evolve.salvar_aprendizado(novo)
        final = self_evolve.APRENDIZADOS.read_text()
        self.assertEqual(final.count("troca de liderança comprovada"), 2)
        self.assertIn("melhorado", final)

    def test_tail_limitado_e_snapshot_json_integro(self):
        self.escrever(*[
            {"modelo": "longo", "ok": True, "ms": 200}
            for _ in range(12000)
        ])
        dados = self_evolve.avaliar()
        self.assertEqual(dados["amostras"], 10000)
        self.assertEqual(dados["ranking"][0]["total"], 10000)
        self.assertEqual(json.loads(self_evolve.SNAPSHOT.read_text())["amostras"], 10000)

    def test_xp_pertence_somente_ao_ledger_meta_lupa(self):
        self.escrever(*[
            {"modelo": "teste", "ok": True, "ms": 100}
            for _ in range(12)
        ])
        dados = self_evolve.avaliar()
        self.assertEqual(dados["xp_status"], "META_LUPA_LEDGER_EXCLUSIVO")
        self.assertNotIn("xp_gained", dados)
        self_evolve.salvar_aprendizado(dados)
        self.assertIn("nenhuma concessão automática", self_evolve.APRENDIZADOS.read_text())


if __name__ == "__main__":
    unittest.main()
