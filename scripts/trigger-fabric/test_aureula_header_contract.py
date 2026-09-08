#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IDENTITY = ROOT / "docs/BRAIN/01-CONCEITOS/04-IDENTIDADE/IDENTIDADE_VOZ_SOL.md"
CONTRACT = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREULA-AGENT-HEADER-CONTRACT.yml"


def require(text: str, token: str) -> None:
    assert token in text, token


def main() -> int:
    identity = IDENTITY.read_text(encoding="utf-8")
    contract = CONTRACT.read_text(encoding="utf-8")

    for token in (
        "!AUREULA — CABEÇALHO OPERACIONAL OBRIGATÓRIO",
        "AUREULA_HEADER_FIRST=true",
        "AUREULA_PERSISTS_FOR_MASTER_SESSION=true",
        "AUREULA_MISSING_WHILE_MASTER_ACTIVE=FORMAT_VIOLATION",
        "AUREULA != PROOF",
        "BIBLICAL_TRIGGER_STYLE_OFFICIAL=true",
        "AUREULA_PRECEDES_NARRATIVE=true",
        "!CALIBRAR\n→ !AUREULA\n→ !MULTIBUSSOLA",
    ):
        require(identity, token)

    for token in (
        "schema: centraldark.aureula-agent-header.v1",
        "required_first_nonempty_line: true",
        "AUREULA_IS_NOT_PROOF",
        "AUREULA_IS_NOT_AUTHORITY",
        "AUREULA_IS_NOT_PASS",
        "name: PADRONIZAR_GATILHOS_BIBLICOS",
        "target: main",
        "require_same_head_ci: true",
    ):
        require(contract, token)

    print("PASS aureula_header_contract")
    print("PASS biblical_trigger_style_contract")
    print("PASS master_chain_aureula_order")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
