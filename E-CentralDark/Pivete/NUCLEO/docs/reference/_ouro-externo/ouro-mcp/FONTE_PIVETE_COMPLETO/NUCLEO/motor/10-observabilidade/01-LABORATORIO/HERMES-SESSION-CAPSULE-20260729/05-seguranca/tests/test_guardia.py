import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from guardia.model import TelemetryEvent
from guardia.engine import Guardia

g = Guardia()
a = g.process(TelemetryEvent(event_type="STATE_CHANGED", source="git", target="main", evidence=["fresh HEAD"]))
assert a["verdict"] == "PROVEN"
b = g.process(TelemetryEvent(event_type="HEARTBEAT_LOST", source="worker", target="hermes"))
assert b["verdict"] == "UNKNOWN"
c = g.process(TelemetryEvent(event_type="BOUNDARY_PRESSURE", source="task", target="outside"))
assert c["verdict"] == "FAILED"
assert b["receipt"]["previous_receipt_sha256"] == a["receipt"]["receipt_sha256"]
print("GUARDIA_TESTS=PASS")
print("TESTS=3")
print("RECEIPT_CHAIN=PASS")
