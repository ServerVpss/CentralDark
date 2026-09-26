from __future__ import annotations
from pathlib import Path
from .types import Evidence, GateResult, Critique, TransferResult
from .ledger import Ledger
from .evidence import hash_tree

VALID={'SIM','NÃO','NÃO_VERIFICADO'}

def evaluate_gates(*, input_hash_before, input_dir:Path, positive:list[Evidence], negative:list[Evidence],
                   ledger:Ledger, critique:Critique, transfer_results:list[TransferResult],
                   thread_preserved:bool, artifact_exists:bool):
    ls=ledger.validate()
    transfer_ok=bool(transfer_results) and all(x.classification==x.expected_classification for x in transfer_results)
    class_ok=bool(transfer_results) and all(x.classification in VALID for x in transfer_results)
    mechanism_ok=bool(transfer_results) and all(x.mechanism_recognized for x in transfer_results)
    no_repeat=bool(transfer_results) and all(not x.repeated_error for x in transfer_results)
    tech=all(x.exit_code==0 for x in positive+negative)
    return [
        GateResult('G_SELF_ERROR_FOUND',bool(critique.self_found_error.strip()),'erro próprio registrado'),
        GateResult('G_ERROR_MECHANISM',len(critique.error_mechanism.split())>=5,'mecanismo descrito'),
        GateResult('G_EVIDENCE_GAP',bool(critique.missing_evidence.strip()),'evidência faltante identificada'),
        GateResult('G_CORRECTION',bool(critique.correction.strip()),'correção registrada'),
        GateResult('G_TRANSFER',transfer_ok,'transferência passou' if transfer_ok else 'transferência falhou'),
        GateResult('G_MECHANISM_TRANSFER',mechanism_ok,'mecanismo reconhecido nos casos novos'),
        GateResult('G_CLASSIFICATION',class_ok,'classificações válidas'),
        GateResult('G_NON_REPETITION',no_repeat,'padrão não repetido' if no_repeat else 'padrão repetido'),
        GateResult('G_THREAD',thread_preserved,'fio preservado' if thread_preserved else 'fio perdido'),
        GateResult('G_INPUT_IMMUTABLE',hash_tree(input_dir)==input_hash_before,'entrada preservada'),
        GateResult('G_LEDGER',ls['valid'] and ls['bad_hash']==0,f"ledger valid={ls['valid']} bad_hash={ls['bad_hash']}"),
        GateResult('G_TECHNICAL_TESTS',tech,'testes técnicos verdes' if tech else 'teste técnico falhou',
                   [x.evidence_id for x in positive+negative]),
        GateResult('G_ARTIFACT',artifact_exists,'artefato existe' if artifact_exists else 'artefato ausente'),
    ]

def gates_pass(gates): return all(g.passed for g in gates)
