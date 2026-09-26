# COMANDO - test_false_green.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\centraldark-hardening-pack\CENTRALDARK-MANDATO-CELESTIAL\tests\test_false_green.py
**SHA:** 72bd64c7af5370c7
**Timestamp:** 2026-08-26T19:10:16.018677
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- self.assertFalse(next(x for x in g if x.gate=='G_ERROR_MECHANISM').passed)
- self.assertFalse(next(x for x in g if x.gate=='G_NON_REPETITION').passed)

### Ouro Bruto (primeiros 5000 chars)
```
import tempfile, unittest
from pathlib import Path
from runtime.types import Critique, TransferResult
from runtime.ledger import Ledger
from runtime.gates import evaluate_gates
from runtime.evidence import hash_tree
class T(unittest.TestCase):
 def test_correct_without_mechanism_blocks(self):
  with tempfile.TemporaryDirectory() as td:
   b=Path(td); i=b/'i'; i.mkdir(); l=Ledger(b/'l','m'); l.append('BEGIN',{})
   c=Critique('','','','',''); tr=[TransferResult('x','p','SIM','r','SIM',False,False)]
   g=evaluate_gates(input_hash_before=hash_tree(i),input_dir=i,positive=[],negative=[],ledger=l,critique=c,transfer_results=tr,thread_preserved=True,artifact_exists=True)
   self.assertFalse(next(x for x in g if x.gate=='G_ERROR_MECHANISM').passed)
 def test_repetition_blocks(self):
  with tempfile.TemporaryDirectory() as td:
   b=Path(td); i=b/'i'; i.mkdir(); l=Ledger(b/'l','m'); l.append('BEGIN',{})
   c=Critique('erro','mecanismo descrito com clareza suficiente','parecia','prova','corrigir'); tr=[TransferResult('x','p','NÃO_VERIFICADO','r','NÃO_VERIFICADO',True,True)]
   g=evaluate_gates(input_hash_before=hash_tree(i),input_dir=i,positive=[],negative=[],ledger=l,critique=c,transfer_results=tr,thread_preserved=True,artifact_exists=True)
   self.assertFalse(next(x for x in g if x.gate=='G_NON_REPETITION').passed)

```