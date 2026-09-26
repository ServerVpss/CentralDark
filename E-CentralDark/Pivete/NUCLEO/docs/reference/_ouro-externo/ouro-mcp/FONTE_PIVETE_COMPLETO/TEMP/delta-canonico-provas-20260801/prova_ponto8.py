"""Prova INDEPENDENTE do Ponto 8 — vazamento de segredo em campo schema-legitimo.

NAO usa a suite do repositorio (que poderia ser complacente). Exercita o runner
do HEAD diretamente e inspeciona os recibos brutos, em memoria E em disco,
procurando o valor original do segredo.
"""
import json
import sys
import tempfile
from pathlib import Path

BASE = Path(r"E:\CentralDark\Pivete\CentralDark\.agents\contratos\delta-canonico")
sys.path.insert(0, str(BASE))

from runner import Runner  # noqa: E402

SEGREDO = "[REDIGIDO-PRESERVACAO]"
BEARER = "Bearer FAKEabcdefghijklmnop1234567890"

falhas = []


def checar(nome, receipt_obj, segredos):
    blob = json.dumps(receipt_obj, ensure_ascii=False)
    for s in segredos:
        if s in blob:
            falhas.append(f"{nome}: VAZOU o valor original")
            print(f"  [FALHA] {nome}: valor original presente no recibo")
            return
    if "<REDACTED>" not in blob:
        falhas.append(f"{nome}: sem marcador <REDACTED>")
        print(f"  [FALHA] {nome}: nao contem <REDACTED>")
        return
    print(f"  [OK] {nome}: sem valor original + contem <REDACTED>")


with tempfile.TemporaryDirectory() as tmp:
    runner = Runner(BASE / "schema.json")
    if hasattr(runner, "receipts_dir"):
        runner.receipts_dir = Path(tmp)
        runner.receipts_dir.mkdir(parents=True, exist_ok=True)

    print("== CASO A: segredo em governance.writer.workspace (campo legitimo) ==")
    inst = runner.boot("prova-ponto8", "PIVETE", "SOL", "EXECUTOR")
    inst["status"] = "ACTIVE"
    inst["governance"]["writer"]["workspace"] = SEGREDO
    r_cal = runner.calibrar(inst)
    checar("calibrar()", r_cal["receipt"], [SEGREDO])

    print("== CASO B: segredo estilo Bearer no verdict de close() ==")
    inst2 = runner.boot("prova-ponto8-b", "PIVETE", "SOL", "EXECUTOR")
    inst2["status"] = "READY_FOR_REVIEW"
    inst2["last_proof"] = {"type": "test", "reference": "prova_ponto8"}
    inst2["governance"]["writer"]["workspace"] = SEGREDO
    r_close = runner.close(inst2, f"APPROVED {BEARER}", judge_approval=True)
    checar("close() memoria", r_close["receipt"], [SEGREDO, BEARER])

    print("== CASO C: recibo de close() PERSISTIDO EM DISCO ==")
    disco = Path(r_close["receipt_file"]).read_text(encoding="utf-8")
    vazou = [s for s in (SEGREDO, BEARER) if s in disco]
    if vazou:
        falhas.append("close() disco: VAZOU valor original")
        print("  [FALHA] arquivo em disco contem valor original")
    else:
        print("  [OK] arquivo em disco sem valor original")

    print("== CASO D: instancia viva deve permanecer INTEGRA ==")
    if inst["governance"]["writer"]["workspace"] == SEGREDO:
        print("  [OK] instancia viva preservada (reload/continuacao intactos)")
    else:
        falhas.append("instancia viva foi mutilada pela redacao")
        print("  [FALHA] instancia viva foi alterada")

    print("== CASO E: close() SEM aprovacao do Judge deve ser REJEITADO ==")
    inst3 = runner.boot("prova-ponto8-c", "PIVETE", "SOL", "EXECUTOR")
    inst3["status"] = "READY_FOR_REVIEW"
    inst3["last_proof"] = {"type": "test", "reference": "x"}
    try:
        runner.close(inst3, "APPROVED", judge_approval=False)
        falhas.append("close() aceitou autoaprovacao")
        print("  [FALHA] close() permitiu autoaprovacao")
    except Exception as e:
        if "APROVACAO_AUSENTE" in str(e):
            print("  [OK] close() bloqueou autoaprovacao (APROVACAO_AUSENTE)")
        else:
            print(f"  [OK-parcial] close() rejeitou, motivo: {type(e).__name__}")

print()
if falhas:
    print("PONTO_8_VERDICT = FALHA")
    for f in falhas:
        print(" -", f)
    sys.exit(1)
print("PONTO_8_VERDICT = CORRIGIDO (prova independente, 5 casos)")
