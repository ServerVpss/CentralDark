#!/usr/bin/env python3
"""Reconstrói e valida o pacote visual Agentic Loop usando apenas stdlib."""

from __future__ import annotations

import argparse
import base64
import hashlib
import gzip
import json
import struct
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any

DEFAULT_MANIFEST = Path('.agents/skills/agentic-ci-loop/references/school.manifest.json')
EXPECTED_MEMBERS = {
    'centraldark-agentic-loop-4k-completo.png': 'png_complete_sha256',
    'centraldark-agentic-loop-4k-clean.png': 'png_clean_sha256',
    'centraldark-agentic-loop-editavel.svg': 'svg_sha256',
    'LEIA-ME.txt': 'readme_sha256',
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def png_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 24 or data[:8] != b'\x89PNG\r\n\x1a\n' or data[12:16] != b'IHDR':
        raise ValueError('PNG_HEADER_INVALID')
    return struct.unpack('>II', data[16:24])


def load_manifest(path: Path) -> dict[str, Any]:
    manifest = json.loads(path.read_text(encoding='utf-8'))
    if manifest.get('schema_version') != 1:
        raise ValueError('SCHOOL_SCHEMA_INVALID')
    artifacts = manifest.get('source_artifacts')
    if not isinstance(artifacts, dict):
        raise ValueError('SOURCE_ARTIFACTS_INVALID')
    return manifest


def validate_package(repo_root: Path, manifest_path: Path = DEFAULT_MANIFEST) -> dict[str, Any]:
    manifest = load_manifest(repo_root / manifest_path)
    artifacts = manifest['source_artifacts']
    b64_parts = artifacts.get('visual_zip_base64_parts')
    source_relative = artifacts.get('course_txt_gzip_base64_path')
    if not isinstance(b64_parts, list) or not b64_parts or not all(isinstance(item, str) and item for item in b64_parts):
        raise ValueError('VISUAL_ZIP_BASE64_PARTS_MISSING')
    if not isinstance(source_relative, str) or not source_relative:
        raise ValueError('COURSE_TXT_PATH_MISSING')

    b64_paths = [repo_root / item for item in b64_parts]
    source_path = repo_root / source_relative
    for relative, b64_path in zip(b64_parts, b64_paths):
        if not b64_path.is_file():
            raise ValueError(f'VISUAL_ZIP_BASE64_MISSING:{relative}')
    if not source_path.is_file():
        raise ValueError(f'COURSE_SOURCE_MISSING:{source_relative}')

    expected_course_sha = artifacts.get('course_txt_sha256')
    try:
        course_bytes = gzip.decompress(base64.b64decode(source_path.read_bytes(), validate=False))
    except Exception as error:
        raise ValueError('COURSE_SOURCE_GZIP_INVALID') from error
    actual_course_sha = sha256_bytes(course_bytes)
    if actual_course_sha != expected_course_sha:
        raise ValueError(f'COURSE_SOURCE_SHA_MISMATCH:{actual_course_sha}')

    try:
        zip_bytes = base64.b64decode(b''.join(item.read_bytes() for item in b64_paths), validate=False)
    except Exception as error:  # pragma: no cover - implementation-specific exception
        raise ValueError('VISUAL_ZIP_BASE64_INVALID') from error

    actual_zip_sha = sha256_bytes(zip_bytes)
    if actual_zip_sha != artifacts.get('visual_zip_sha256'):
        raise ValueError(f'VISUAL_ZIP_SHA_MISMATCH:{actual_zip_sha}')
    if len(zip_bytes) != artifacts.get('visual_zip_bytes'):
        raise ValueError(f'VISUAL_ZIP_SIZE_MISMATCH:{len(zip_bytes)}')

    member_report: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory(prefix='centraldark-agentic-visual-') as temp_dir:
        zip_path = Path(temp_dir) / 'package.zip'
        zip_path.write_bytes(zip_bytes)
        with zipfile.ZipFile(zip_path) as archive:
            bad_member = archive.testzip()
            if bad_member is not None:
                raise ValueError(f'VISUAL_ZIP_CORRUPT:{bad_member}')
            names = archive.namelist()
            if sorted(names) != sorted(EXPECTED_MEMBERS):
                raise ValueError(f'VISUAL_ZIP_MEMBERS_INVALID:{names}')
            for name, hash_key in EXPECTED_MEMBERS.items():
                content = archive.read(name)
                actual_hash = sha256_bytes(content)
                if actual_hash != artifacts.get(hash_key):
                    raise ValueError(f'VISUAL_MEMBER_SHA_MISMATCH:{name}:{actual_hash}')
                item: dict[str, Any] = {'name': name, 'bytes': len(content), 'sha256': actual_hash}
                if name.endswith('.png'):
                    width, height = png_dimensions(content)
                    if (width, height) != (3840, 2160):
                        raise ValueError(f'VISUAL_PNG_DIMENSIONS_INVALID:{name}:{width}x{height}')
                    item['dimensions'] = f'{width}x{height}'
                member_report.append(item)

    return {
        'schema_version': 1,
        'status': 'PASS',
        'package_sha256': actual_zip_sha,
        'package_bytes': len(zip_bytes),
        'course_sha256': actual_course_sha,
        'members': member_report,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--repo-root', default='.')
    parser.add_argument('--manifest', default=str(DEFAULT_MANIFEST))
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    try:
        report = validate_package(Path(args.repo_root).resolve(), Path(args.manifest))
    except Exception as error:
        print(f'STATUS=BLOCKED_VISUAL_PACKAGE REASON={error}', file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"VISUAL_PACKAGE_STATUS={report['status']}")
        print(f"VISUAL_PACKAGE_SHA256={report['package_sha256']}")
        print(f"VISUAL_PACKAGE_BYTES={report['package_bytes']}")
        print(f"COURSE_SHA256={report['course_sha256']}")
        print(f"MEMBERS={len(report['members'])}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
