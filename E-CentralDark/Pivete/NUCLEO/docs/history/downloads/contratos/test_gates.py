import tempfile, unittest
from pathlib import Path
from runtime.types import Evidence, Critique, TransferResult
from runtime.ledger import Ledger
from runtime.gates import evaluate_gates, gates_pass
from runtime.evidence import hash_tree

def ev(k,c=0): return Evidence('e'+k,k,['x'],c,'a'*64,'b'*64,'now',1)
class T(unittest.TestCase):
 def test_understanding(self):
  with tempfile.TemporaryDirectory() as td:
   b=Path(td); i=b/'i'; i.mkdir(); (i/'x').write_text('x'); l=Ledger(b/'l','m'); l.append('BEGIN',{})
   c=Critique('Afirmei sem prova.','Transformei ausência de evidência em certeza por plausibilidade.','Parecia coerente.','Faltava fonte.','Responder NÃO_VERIFICADO.')
   tr=[TransferResult('a','p','SIM','r','SIM',True,False),TransferResult('b','p','NÃO','r','NÃO',True,False),TransferResult('c','p','NÃO_VERIFICADO','r','NÃO_VERIFICADO',True,False)]
   g=evaluate_gates(input_hash_before=hash_tree(i),input_dir=i,positive=[ev('p')],negative=[ev('n')],ledger=l,critique=c,transfer_results=tr,thread_preserved=True,artifact_exists=True)
   self.assertTrue(gates_pass(g))
 def test_transfer_error_blocks(self):
  with tempfile.TemporaryDirectory() as td:
   b=Path(td); i=b/'i'; i.mkdir(); l=Ledger(b/'l','m'); l.append('BEGIN',{})
   c=Critique('erro','mecanismo descrito com palavras suficientes','parecia','prova','corrigir')
   tr=[TransferResult('x','p','NÃO','r','SIM',True,True)]
   g=evaluate_gates(input_hash_before=hash_tree(i),input_dir=i,positive=[],negative=[],ledger=l,critique=c,transfer_results=tr,thread_preserved=True,artifact_exists=True)
   self.assertFalse(gates_pass(g))
