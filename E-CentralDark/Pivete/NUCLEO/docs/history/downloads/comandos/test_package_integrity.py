import unittest
from pathlib import Path
class T(unittest.TestCase):
 def test_required(self):
  r=Path(__file__).resolve().parents[1]
  for x in ['README.md','docs/01-ARQUITETURA-COMPLETA.md','runtime/orchestrator.py','runtime/gates.py','runtime/adapters.py','manual/MANDATO-CELESTIAL.html']:
   self.assertTrue((r/x).exists(),x)
 def test_core(self):
  r=Path(__file__).resolve().parents[1]
  t=(r/'README.md').read_text(encoding='utf-8')+(r/'docs/01-ARQUITETURA-COMPLETA.md').read_text(encoding='utf-8')
  self.assertIn('MESMO AGENTE',t); self.assertIn('CASOS NOVOS',t); self.assertIn('NÃO_VERIFICADO',t)
