from .meta_lupa import inspect
from .reality_judge import judge
from .receipt import make_receipt

class Guardia:
    def __init__(self):
        self.previous_receipt_sha256 = None

    def process(self, event):
        cp = inspect(event)
        verdict = judge(event, cp)
        receipt = make_receipt(event, cp, verdict, self.previous_receipt_sha256)
        self.previous_receipt_sha256 = receipt["receipt_sha256"]
        return {"event": event.to_dict(), "verdict": verdict, "counterproof": cp, "receipt": receipt}
