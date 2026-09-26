# OUTRO - render_preview.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\report-templates\render_preview.py
**SHA:** b13efc4b120e09ef
**Timestamp:** 2026-08-26T18:42:42.118250
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- else_start: int | None = None
- else_start = match.start()

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
"""Render a USD Performance Tuning Report template.

The renderer intentionally supports only the small Jinja-compatible subset used
by the report templates: variable interpolation, for loops, if/else blocks, and
simple equality checks. It has no third-party runtime dependencies.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from collections.abc import Mapping
from pathlib import Path
from typing import Any


TEMPLATE_DIR = Path(__file__).resolve().parent
DEFAULT_FIXTURE = TEMPLATE_DIR / "optimization-report.design-fixture.json"
DEFAULT_TEMPLATE = TEMPLATE_DIR / "optimization-report.html.template"
DEFAULT_OUTPUT = TEMPLATE_DIR / "optimization-report.preview.html"
TAG_RE = re.compile(r"{%\s*(.*?)\s*%}", re.DOTALL)
VAR_RE = re.compile(r"{{\s*(.*?)\s*}}", re.DOTALL)


def _score_percent(score: object) -> int:
    if not isinstance(score, (int, float)):
        return 0
    return max(0, min(100, round(float(score) * 10)))


def _score_display(score: object) -> str:
    if not isinstance(score, (int, float)):
        return "N/A"
    return f"{float(score):.1f}/10"


def build_context(report: dict) -> dict:
    context = dict(report)
    score = report.get("optimization_score")
    context["score_degrees"] = round(float(score) * 36, 1) if isinstance(score, (int, float)) else 0
    context.setdefault("executive_summary", "")
    context.setdefault("score_scope_label", "Stage Optimization Score")
    context.setdefault("reasoning", "")
    context["reasoning_paragraphs"] = [
        paragraph.strip()
        for paragraph in str(context["reasoning"]).split("\n\n")
        if paragraph.strip()
    ]

    groups = []
    for group in report.get("metric_groups", []):
        item = dict(group)
        item["score_percent"] = _score_percent(item.get("score"))
        item["score_display"] = _score_display(item.get("score"))
        groups.append(item)
    context["metric_groups"] = groups

    metrics = []
    for metric in report.get("metrics", []):
        item = dict(metric)
        item.setdefault("display_name", item.get("name", ""))
        item.setdefault("unit", "")
        item.setdefault("evidence_type", "direct")
        metrics.append(item)
    context["metrics"] = metrics

    measurement_context = report.get("measurement_context", {})
    context["measurement_context_items"] = [
        {"name": key.replace("_", " ").title(), "value": "N/A" if value is None else value}
        for key, value in measurement_context.items()
    ]
    runtime_profiling = report.get("runtime_profiling", {})
    context["runtime_profiling_items"] = [
        {"name": key.replace("_", " ").title(), "value": "N/A" if value is None else value}
        for key, value in runtime_profiling.items()
    ]
    return context


def should_autoescape(template_name: str | None) -> bool:
    return bool(template_name and template_name.endswith(".html.template"))


def _resolve(name: str, context: Mapping[str, Any]) -> Any:
    name = name.strip()
    if not name:
        return ""
    if (name.startswith('"') and name.endswith('"')) or (name.startswith("'") and name.endswith("'")):
        return name[1:-1]
    value: Any = context
    for part in name.split("."):
        if isinstance(value, Mapping):
            value = value.get(part, "")
        else:
            value = getattr(value, part, "")
    return value


def _eval_condition(expression: str, context: Mapping[str, Any]) -> bool:
    expression = expression.strip()
    if expression.startswith("not "):
        return not _eval_condition(expression[4:], context)
    for operator in ("==", "!="):
        if operator in expression:
            left, right = expression.split(operator, 1)
            result = _resolve(left, context) == _resolve(right, context)
            return result if operator == "==" else not result
    return bool(_resolve(expression, context))


def _find_endfor(template: str, pos: int) -> tuple[int, int]:
    depth = 1
    for match in TAG_RE.finditer(template, pos):
        command = match.group(1).strip()
        if command.startswith("for "):
            depth += 1
        elif command == "endfor":
            depth -= 1
            if depth == 0:
                return match.start(), match.end()
    raise ValueError("missing {% endfor %} in report template")


def _find_if_parts(template: str, pos: int) -> tuple[int | None, int | None, int, int]:
    depth = 1
    else_start: int | None = None
    else_end: int | None = None
    for match in TAG_RE.finditer(template, pos):
        command = match.group(1).strip()
        if command.startswith("if "):
            depth += 1
        elif command == "else" and depth == 1:
            else_start = match.start()
            else_end = match.end()
        elif command == "endif":
            depth -= 1
      
```