import hashlib,json,struct,tempfile,unittest,zipfile
from pathlib import Path
from validar_agentic_visual_package import validate_package

def fake_png(width=3840,height=2160): return b'\x89PNG\r\n\x1a\n'+b'\x00\x00\x00\rIHDR'+struct.pack('>II',width,height)+b'fixture'
class VisualPackageTests(unittest.TestCase):
 def fixture(self):
  t=tempfile.TemporaryDirectory(); r=Path(t.name); (r/'src').mkdir()
  members={'centraldark-agentic-loop-4k-completo.png':fake_png(),'centraldark-agentic-loop-4k-clean.png':fake_png(),'centraldark-agentic-loop-editavel.svg':b'<svg/>','LEIA-ME.txt':b'visual'}
  for n in ['centraldark-agentic-loop-editavel.svg','LEIA-ME.txt']:(r/'src'/n).write_bytes(members[n])
  z=r/'package.zip'
  with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as a:
   for n,c in members.items():a.writestr(n,c)
  raw=z.read_bytes(); art={'visual_source_svg_path':'src/centraldark-agentic-loop-editavel.svg','visual_source_svg_sha256':hashlib.sha256(members['centraldark-agentic-loop-editavel.svg']).hexdigest(),'visual_readme_path':'src/LEIA-ME.txt','visual_readme_source_sha256':hashlib.sha256(members['LEIA-ME.txt']).hexdigest(),'visual_binary_storage':'ATTACHMENT_VALIDATED_NOT_VERSIONED_BY_TEXT_CONNECTOR','visual_zip_sha256':hashlib.sha256(raw).hexdigest(),'visual_zip_bytes':len(raw),'png_complete_sha256':hashlib.sha256(members['centraldark-agentic-loop-4k-completo.png']).hexdigest(),'png_clean_sha256':hashlib.sha256(members['centraldark-agentic-loop-4k-clean.png']).hexdigest(),'svg_sha256':hashlib.sha256(members['centraldark-agentic-loop-editavel.svg']).hexdigest(),'readme_sha256':hashlib.sha256(members['LEIA-ME.txt']).hexdigest()}
  (r/'manifest.json').write_text(json.dumps({'schema_version':1,'source_artifacts':art}))
  return t,r,z
 def test_sources_are_valid_but_binary_is_partial(self):
  t,r,z=self.fixture()
  try:self.assertEqual(validate_package(r,Path('manifest.json'))['status'],'PARTIAL_SOURCE_ONLY')
  finally:t.cleanup()
 def test_full_zip_passes(self):
  t,r,z=self.fixture()
  try:self.assertEqual(validate_package(r,Path('manifest.json'),z)['status'],'PASS')
  finally:t.cleanup()
 def test_changed_source_is_blocked(self):
  t,r,z=self.fixture()
  try:
   (r/'src/LEIA-ME.txt').write_text('mudou')
   with self.assertRaisesRegex(ValueError,'VISUAL_README_SHA_MISMATCH'):validate_package(r,Path('manifest.json'))
  finally:t.cleanup()
 def test_source_and_zip_member_must_match(self):
  t,r,z=self.fixture()
  try:
   data=json.loads((r/'manifest.json').read_text()); data['source_artifacts']['svg_sha256']='0'*64; (r/'manifest.json').write_text(json.dumps(data))
   with self.assertRaisesRegex(ValueError,'VISUAL_SVG_SOURCE_MEMBER_MISMATCH'):validate_package(r,Path('manifest.json'))
  finally:t.cleanup()
 def test_wrong_dimensions_are_blocked(self):
  t,r,z=self.fixture()
  try:
   data=json.loads((r/'manifest.json').read_text()); members={'centraldark-agentic-loop-4k-completo.png':fake_png(100,100),'centraldark-agentic-loop-4k-clean.png':fake_png(),'centraldark-agentic-loop-editavel.svg':b'<svg/>','LEIA-ME.txt':b'visual'}
   bad=r/'bad.zip'
   with zipfile.ZipFile(bad,'w',zipfile.ZIP_DEFLATED) as a:
    for n,c in members.items():a.writestr(n,c)
   raw=bad.read_bytes(); x=data['source_artifacts']; x['visual_zip_sha256']=hashlib.sha256(raw).hexdigest(); x['visual_zip_bytes']=len(raw); x['png_complete_sha256']=hashlib.sha256(members['centraldark-agentic-loop-4k-completo.png']).hexdigest(); (r/'manifest.json').write_text(json.dumps(data))
   with self.assertRaisesRegex(ValueError,'VISUAL_PNG_DIMENSIONS_INVALID'):validate_package(r,Path('manifest.json'),bad)
  finally:t.cleanup()
if __name__=='__main__':unittest.main()
