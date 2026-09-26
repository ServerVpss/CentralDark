#!/usr/bin/env python3
from dataclasses import dataclass
from typing import FrozenSet, Iterable, Optional

@dataclass(frozen=True)
class Rule:
    body: FrozenSet[str]
    head: Optional[str]  # None = FALSE constraint

def close(initial: Iterable[str], rules: Iterable[Rule]):
    facts=set(initial)
    changed=True
    contradiction=False
    fired=[]
    while changed and not contradiction:
        changed=False
        for r in rules:
            if r.body.issubset(facts):
                if r.head is None:
                    contradiction=True
                    fired.append((tuple(sorted(r.body)),"FALSE"))
                    break
                if r.head not in facts:
                    facts.add(r.head)
                    fired.append((tuple(sorted(r.body)),r.head))
                    changed=True
    return {"facts":facts,"contradiction":contradiction,"fired":fired}

def centraldark_rules():
    return [
        Rule(frozenset({"CURRENT_HEAD","TESTS_PASS","COUNTERPROOF_SURVIVES"}),"CANDIDATE_GREEN"),
        Rule(frozenset({"CANDIDATE_GREEN","T1_STABLE","HASH_CHAIN_VALID","REQUIRED_BEARINGS_COVERED","UNKNOWN_MATERIAL_ZERO","NO_CONTRADICTION"}),"FIXED_POINT_PASS"),
        Rule(frozenset({"WRITER_COLLISION"}),None),
        Rule(frozenset({"SECRET_EXPOSED"}),None),
        Rule(frozenset({"UNKNOWN_MATERIAL","PROMOTION_ATTEMPT"}),None),
        Rule(frozenset({"LOCAL_FIXED_POINT"}),"CONTINUE_GLOBAL_PROOF"),
    ]

if __name__=="__main__":
    base={"CURRENT_HEAD","TESTS_PASS","COUNTERPROOF_SURVIVES","T1_STABLE","HASH_CHAIN_VALID","REQUIRED_BEARINGS_COVERED","UNKNOWN_MATERIAL_ZERO","NO_CONTRADICTION"}
    r=close(base,centraldark_rules())
    print("CONTRADICTION=",r["contradiction"])
    print("FIXED_POINT_PASS=","FIXED_POINT_PASS" in r["facts"])
