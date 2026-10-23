import unittest

from scripts.verify_recibo_telegram_gabarito import validate

BASE = """📣 Recibo · auditoria
🟢 Conferência realizada
⚠️ Pendência: nenhuma
🎯 Próximo passo: revisar
📌 commit: abcdef1234567890
🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF
"""


class ReceiptAddressTests(unittest.TestCase):
    def test_rejects_absence_without_address(self):
        failures = validate(BASE + "\nNão achei o arquivo.")
        self.assertTrue(any("absence claim missing repository address" in item for item in failures))

    def test_accepts_addressed_absence_with_zero_result(self):
        receipt = BASE + """
Procurei: scripts/verify_recibo_telegram_gabarito.py
Repositório: ServerVpss/CentralDark
Branch: main
Resultado: zero resultados para a consulta.
"""
        self.assertEqual(validate(receipt), [])

    def test_rejects_presence_without_line_and_sha(self):
        failures = validate(BASE + "\nEncontrei o teste no repositório.")
        self.assertTrue(any("presence claim missing line number" in item for item in failures))
        self.assertTrue(any("presence claim missing commit/SHA" in item for item in failures))

    def test_accepts_addressed_presence_with_line_and_sha(self):
        receipt = BASE + """
Encontrei a validação em ServerVpss/CentralDark, branch main,
arquivo scripts/verify_recibo_telegram_gabarito.py, linha 42.
SHA: 927bc671a4f3c1db0b071c335d272dd3d1f59d1d.
"""
        self.assertEqual(validate(receipt), [])

    def test_absence_without_scope_is_rejected(self):
        receipt = BASE + """
Não encontrei resultados.
Repositório: ServerVpss/CentralDark
Branch: main
"""
        failures = validate(receipt)
        self.assertTrue(any("absence claim missing file path or explicit search scope" in item for item in failures))

    def test_existing_false_green_rule_still_rejects(self):
        failures = validate(BASE + "\nUNKNOWN = PASS")
        self.assertTrue(any("false-green invariant violated" in item for item in failures))


if __name__ == "__main__":
    unittest.main()
