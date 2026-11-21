"""Facade importável para o owner único `central-horario/python.py`.

Este arquivo não define política de horário; apenas torna o owner com hífen
importável por scripts Python da CentralDark.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

_OWNER = Path(__file__).resolve().parent / "central-horario" / "python.py"
_SPEC = importlib.util.spec_from_file_location("centraldark_canonical_time", _OWNER)
if _SPEC is None or _SPEC.loader is None:
    raise ImportError(f"canonical_time_owner_unavailable:{_OWNER}")
_MODULE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)

TIME_ZONE = _MODULE.TIME_ZONE
DISPLAY_LABEL = _MODULE.DISPLAY_LABEL
format_brasilia = _MODULE.format_brasilia
brasilia_now = _MODULE.brasilia_now
utc_now = _MODULE.utc_now
utc_iso = _MODULE.utc_iso

__all__ = [
    "TIME_ZONE",
    "DISPLAY_LABEL",
    "format_brasilia",
    "brasilia_now",
    "utc_now",
    "utc_iso",
]
