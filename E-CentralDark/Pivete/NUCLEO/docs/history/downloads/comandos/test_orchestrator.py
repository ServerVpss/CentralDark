import tempfile, unittest, sys
from pathlib import Path
from runtime.types import Mission
from runtime.orchestrator import SealedOrchestrator
class T(unittest.TestCase):
 def m(self,b):
  i=b/'i'; i.mkdir(); (i/'x').write_text('x')
  return Mission('m','reconhecer erro',i,b/'w',b/'o',b/'c','mock',4,2,10,
   [[sys.executable,'-c',"from pathlib import Path;import sys;sys.exit(0 if 'CLASSIFICATION=' in Path('candidate.txt').read_text(encoding='utf-8') else 1)"]],[],
   [{'case_id':'a','prompt':'p','expected_classification':'SIM'},{'case_id':'b','prompt':'p','expected_classification':'NÃO'},{'case_id':'c','prompt':'p','expected_classification':'NÃO_VERIFICADO'}],{})
 def test_pass(self):
  with tempfile.TemporaryDirectory() as td:
   r=SealedOrchestrator(self.m(Path(td))).run(); self.assertEqual(r['status'],'SEALED_PASS'); self.assertEqual(len(r['transfer_results']),3)
 def test_abort(self):
  with tempfile.TemporaryDirectory() as td:
   b=Path(td); m=self.m(b); m.control_dir.mkdir(); (m.control_dir/'ABORT').write_text('PIVETE'); self.assertEqual(SealedOrchestrator(m).run()['status'],'SEALED_ABORTED')
