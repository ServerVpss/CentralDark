#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

ENGINE = Path(__file__).resolve().parents[1] / "scripts" / "meta_lupa.py"
spec = importlib.util.spec_from_file_location("meta_lupa", ENGINE)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
args = parser.parse_args()
data = json.loads(Path(args.input).read_text(encoding="utf-8"))
errors = module.validate(data)
print(json.dumps({
    "guardrail": "PASS" if not errors else "BLOCK",
    "errors": errors,
    "mode": module.select_mode(data),
}, indent=2, ensure_ascii=False))
raise SystemExit(0 if not errors else 2)
