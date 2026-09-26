import json,tempfile,unittest
from pathlib import Path
from runtime.ledger import Ledger
class T(unittest.TestCase):
 def test_valid(self):
  with tempfile.TemporaryDirectory() as td:
   l=Ledger(Path(td)/"l.jsonl","m");l.append("BEGIN",{});l.append("FINAL",{})
   self.assertTrue(l.validate()["valid"])
 def test_tamper(self):
  with tempfile.TemporaryDirectory() as td:
   p=Path(td)/"l.jsonl";l=Ledger(p,"m");l.append("BEGIN",{"x":1})
   r=json.loads(p.read_text());r["payload"]["x"]=2;p.write_text(json.dumps(r)+"\n")
   self.assertGreater(l.validate()["bad_hash"],0)
