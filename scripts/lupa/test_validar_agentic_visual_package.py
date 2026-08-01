import base64
import hashlib
import gzip
import json
import struct
import tempfile
import unittest
import zipfile
from pathlib import Path

from validar_agentic_visual_package import validate_package


def fake_png(width=3840, height=2160):
    # Suficiente para o parser de cabeçalho usado pelo guardrail.
    return b'\x89PNG\r\n\x1a\n' + b'\x00\x00\x00\rIHDR' + struct.pack('>II', width, height) + b'fixture'


class VisualPackageTests(unittest.TestCase):
    def fixture(self):
        tmp = tempfile.TemporaryDirectory()
        root = Path(tmp.name)
        members = {
            'centraldark-agentic-loop-4k-completo.png': fake_png(),
            'centraldark-agentic-loop-4k-clean.png': fake_png(),
            'centraldark-agentic-loop-editavel.svg': b'<svg/>',
            'LEIA-ME.txt': b'curso visual',
        }
        zip_path = root / 'source.zip'
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as archive:
            for name, content in members.items():
                archive.writestr(name, content)
        zip_bytes = zip_path.read_bytes()
        b64_rel = 'docs/package.zip.base64'
        course_rel = 'refs/course.txt'
        (root / 'docs').mkdir()
        (root / 'refs').mkdir()
        (root / b64_rel).write_bytes(base64.encodebytes(zip_bytes))
        (root / course_rel).write_bytes(base64.encodebytes(gzip.compress(b'curso fonte', mtime=0)))
        artifacts = {
            'course_txt_gzip_base64_path': course_rel,
            'course_txt_sha256': hashlib.sha256(b'curso fonte').hexdigest(),
            'visual_zip_base64_parts': [b64_rel],
            'visual_zip_sha256': hashlib.sha256(zip_bytes).hexdigest(),
            'visual_zip_bytes': len(zip_bytes),
            'png_complete_sha256': hashlib.sha256(members['centraldark-agentic-loop-4k-completo.png']).hexdigest(),
            'png_clean_sha256': hashlib.sha256(members['centraldark-agentic-loop-4k-clean.png']).hexdigest(),
            'svg_sha256': hashlib.sha256(members['centraldark-agentic-loop-editavel.svg']).hexdigest(),
            'readme_sha256': hashlib.sha256(members['LEIA-ME.txt']).hexdigest(),
        }
        manifest_rel = Path('manifest.json')
        (root / manifest_rel).write_text(json.dumps({'schema_version': 1, 'source_artifacts': artifacts}), encoding='utf-8')
        return tmp, root, manifest_rel

    def test_valid_package(self):
        tmp, root, manifest = self.fixture()
        try:
            report = validate_package(root, manifest)
            self.assertEqual(report['status'], 'PASS')
            self.assertEqual(len(report['members']), 4)
        finally:
            tmp.cleanup()

    def test_rejects_changed_course(self):
        tmp, root, manifest = self.fixture()
        try:
            (root / 'refs/course.txt').write_bytes(base64.encodebytes(gzip.compress(b'mudou', mtime=0)))
            with self.assertRaisesRegex(ValueError, 'COURSE_SOURCE_SHA_MISMATCH'):
                validate_package(root, manifest)
        finally:
            tmp.cleanup()

    def test_rejects_changed_zip(self):
        tmp, root, manifest = self.fixture()
        try:
            target = root / 'docs/package.zip.base64'
            raw = bytearray(base64.b64decode(target.read_bytes()))
            raw[-1] ^= 1
            target.write_bytes(base64.encodebytes(bytes(raw)))
            with self.assertRaisesRegex(ValueError, 'VISUAL_ZIP_SHA_MISMATCH'):
                validate_package(root, manifest)
        finally:
            tmp.cleanup()

    def test_rejects_wrong_dimensions(self):
        tmp, root, manifest = self.fixture()
        try:
            data = json.loads((root / manifest).read_text())
            # Rebuild a valid-hash package whose PNG dimensions are wrong.
            members = {
                'centraldark-agentic-loop-4k-completo.png': fake_png(100, 100),
                'centraldark-agentic-loop-4k-clean.png': fake_png(),
                'centraldark-agentic-loop-editavel.svg': b'<svg/>',
                'LEIA-ME.txt': b'curso visual',
            }
            z = root / 'bad.zip'
            with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as archive:
                for name, content in members.items(): archive.writestr(name, content)
            raw = z.read_bytes()
            (root / 'docs/package.zip.base64').write_bytes(base64.encodebytes(raw))
            a = data['source_artifacts']
            a['visual_zip_sha256'] = hashlib.sha256(raw).hexdigest()
            a['visual_zip_bytes'] = len(raw)
            a['png_complete_sha256'] = hashlib.sha256(members['centraldark-agentic-loop-4k-completo.png']).hexdigest()
            (root / manifest).write_text(json.dumps(data), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'VISUAL_PNG_DIMENSIONS_INVALID'):
                validate_package(root, manifest)
        finally:
            tmp.cleanup()


if __name__ == '__main__':
    unittest.main()
