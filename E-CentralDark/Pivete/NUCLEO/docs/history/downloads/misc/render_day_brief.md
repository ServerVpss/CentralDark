# OUTRO - render_day_brief.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\google-calendar\skills\google-calendar-daily-brief\scripts\render_day_brief.py
**SHA:** 9cdb33827e7f72e4
**Timestamp:** 2026-08-26T18:32:01.815523
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: datetime
- def is_all_day_event(start_raw: str, end_raw: str, start: datetime, end: datetime) -> bool:
- start = parse_iso(start_raw, tz)
- start=start,
- def format_range(start: datetime, end: datetime) -> str:
- def format_range_compact(start: datetime, end: datetime) -> str:
- def format_range_agenda(start: datetime, end: datetime) -> str:
- def free_windows(day_start: datetime, day_end: datetime, busy: list[tuple[datetime, datetime]]) -> list[tuple[datetime, datetime]]:
- if cursor < start:
- day_start: datetime,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Render a one-day Google Calendar brief as polished Markdown."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from datetime import datetime, time, timedelta
from typing import Iterable
from zoneinfo import ZoneInfo


@dataclass
class Event:
    index: int
    summary: str
    start_raw: str
    end_raw: str
    start: datetime
    end: datetime
    transparency: str | None
    location: str | None
    all_day: bool


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render a day brief from Google Calendar JSON.")
    parser.add_argument("--time-min", required=True, help="Inclusive day start in ISO 8601 format.")
    parser.add_argument("--time-max", required=True, help="Exclusive day end in ISO 8601 format.")
    parser.add_argument("--timezone", required=True, help="IANA timezone such as America/Los_Angeles.")
    parser.add_argument("--now", help="Current time in ISO 8601 format for Remaining Today.")
    parser.add_argument("--input", help="Optional path to JSON input. Defaults to stdin.")
    return parser.parse_args()


def load_payload(path: str | None) -> object:
    if path:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    return json.load(sys.stdin)


def parse_iso(raw: str, tz: ZoneInfo) -> datetime:
    normalized = raw.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=tz)
    return parsed.astimezone(tz)


def is_all_day_event(start_raw: str, end_raw: str, start: datetime, end: datetime) -> bool:
    if any(marker in start_raw for marker in ("+", "Z")) or any(marker in end_raw for marker in ("+", "Z")):
        return False
    duration = end - start
    return (
        start.time() == time(0, 0)
        and end.time() == time(0, 0)
        and duration >= timedelta(days=1)
        and duration % timedelta(days=1) == timedelta(0)
    )


def normalize_events(payload: object, tz: ZoneInfo) -> list[Event]:
    if isinstance(payload, dict):
        raw_events = payload.get("events", [])
    elif isinstance(payload, list):
        raw_events = payload
    else:
        raise ValueError("Expected a JSON object with an events field or a JSON array.")

    events: list[Event] = []
    for index, item in enumerate(raw_events):
        start_raw = item["start"]
        end_raw = item["end"]
        start = parse_iso(start_raw, tz)
        end = parse_iso(end_raw, tz)
        all_day = is_all_day_event(start_raw, end_raw, start, end)
        events.append(
            Event(
                index=index,
                summary=item.get("summary") or "(Untitled event)",
                start_raw=start_raw,
                end_raw=end_raw,
                start=start,
                end=end,
                transparency=item.get("transparency"),
                location=item.get("location"),
                all_day=all_day,
            )
        )
    events.sort(key=lambda event: (event.start, -(event.end - event.start).total_seconds(), event.index))
    return events


def format_clock(value: datetime) -> str:
    hour = value.hour % 12 or 12
    suffix = "AM" if value.hour < 12 else "PM"
    return f"{hour}:{value.minute:02d} {suffix}"


def format_clock_short(value: datetime) -> str:
    hour = value.hour % 12 or 12
    suffix = "AM" if value.hour < 12 else "PM"
    if value.minute == 0:
        return f"{hour}:00 {suffix}"
    return f"{hour}:{value.minute:02d} {suffix}"


def format_range(start: datetime, end: datetime) -> str:
    return f"{format_clock_short(start)}-{format_clock_short(end)}"


def format_clock_compact(value: datetime) -> tuple[str, str]:
    hour = value.hour % 12 or 12
    suffix = "AM" if value.hour < 12 else "PM"
    if value.minute == 0:
        return f"{hour}:00", suffix
    return f"{hour}:{value.minute:02d}", suffix


def format_range_compact(start: datetime, end: datetime) -> str:
    start_text, start_suffix = format_clock_compact(start)
    end_text, end_suffix = format_clock_compact(end)
    if start_suffix == end_suffix:
        return f"{start_text}-{end_text} {end_suffix}"
    return f"{start_text} {start_suffix}-{end_text} {end_suffix}"


def format_range_agenda(start: datetime, end: datetime) -> str:
    start_text, _ = format_clock_compact(start)
    end_text, _ = format_clock_compact(end)
    return f"{start_text}-{end_text}"


def format_duration(delta: timedelta) -> str:
    minutes = int(delta.total_seconds() // 60)
    hours, remainder = divmod(minutes, 60)
    if hours and remainder:
        return f"{hours}h {remainder}m"
    if hours:
        return f"{hours}h"
    return f"{remainder}m"


def opaque_timed_events(events: Iterable[Event]) -> list[Event]:
    return [event for event in events if not event.all_day and event.transparency != "transparent"]


def timed_events(events: Iterable[Ev
```