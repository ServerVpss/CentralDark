"""Central de horário da CentralDark.

Hora humana: America/Sao_Paulo / BRT.
Timestamp técnico: UTC/RFC3339.
"""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

TIME_ZONE = "America/Sao_Paulo"
DISPLAY_LABEL = "BRT"
BRASILIA = ZoneInfo(TIME_ZONE)


def _as_datetime(value: datetime | None = None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    if value.tzinfo is None:
        raise ValueError("naive_datetime_forbidden")
    return value


def format_brasilia(value: datetime | None = None) -> str:
    return _as_datetime(value).astimezone(BRASILIA).strftime("%d/%m/%Y %H:%M:%S BRT")


def brasilia_now() -> datetime:
    return datetime.now(BRASILIA)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_iso(value: datetime | None = None) -> str:
    return _as_datetime(value).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
