"""Contrato read-only: agentes devem retornar payload conforme schema JSON.
Baseline VERMELHA: stubs levantam NotImplementedError -> FALHA ESPERADA.
"""
import json, pathlib, importlib
import pytest

try:
    import jsonschema
except ImportError:  # pragma: no cover
    jsonschema = None

ROOT = pathlib.Path(__file__).resolve().parents[1]
AGENTS = ["observador", "conversor", "orquestrador"]


@pytest.mark.parametrize("name", AGENTS)
def test_agent_output_matches_frozen_contract(name):
    schema_path = ROOT / "contracts" / f"{name}.schema.json"
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    assert schema.get("frozen") is True, "contrato deve ser marcado frozen"
    mod = importlib.import_module(f"agents.{name}")
    out = mod.run({"missao": "turno-A", "ref": "e14379ef"})
    if jsonschema is not None:
        jsonschema.validate(out, schema)
    else:
        for f in schema["required"]:
            assert f in out, f"faltando campo obrigatorio {f}"
