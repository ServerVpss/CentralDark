from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

@dataclass
class Mission:
    mission_id: str
    objective: str
    input_dir: Path
    work_dir: Path
    output_dir: Path
    control_dir: Path
    adapter: str = "mock"
    max_rounds: int = 12
    stagnation_limit: int = 3
    timeout_seconds: int = 120
    test_commands: list[list[str]] = field(default_factory=list)
    negative_test_commands: list[list[str]] = field(default_factory=list)
    transfer_cases: list[dict[str, Any]] = field(default_factory=list)
    adapter_config: dict[str, Any] = field(default_factory=dict)

@dataclass
class Evidence:
    evidence_id: str
    kind: str
    command: list[str]
    exit_code: int
    stdout_sha256: str
    stderr_sha256: str
    timestamp: str
    duration_ms: int
    stdout_excerpt: str = ""
    stderr_excerpt: str = ""

@dataclass
class GateResult:
    gate: str
    passed: bool
    reason: str
    evidence_refs: list[str] = field(default_factory=list)

@dataclass
class Candidate:
    round_id: int
    content: str
    artifact_path: str
    artifact_sha256: str
    operational_state: dict[str, Any]

@dataclass
class Critique:
    self_found_error: str
    error_mechanism: str
    why_it_looked_true: str
    missing_evidence: str
    correction: str

@dataclass
class TransferResult:
    case_id: str
    prompt: str
    expected_classification: str
    response: str
    classification: str
    mechanism_recognized: bool
    repeated_error: bool
