"""Contract tests for kimetsu-brainstorm REMIX selector (no network/tools)."""
import unittest
from remix_selector import plan, CATALOG, METHODS


class TestRemix(unittest.TestCase):
    def test_catalog(self):
        self.assertEqual(len(CATALOG), 17)
        self.assertEqual(len({a for a, _, _ in CATALOG}), 17)
        self.assertEqual(len(METHODS), 8)

    def test_unknown_does_not_mutate(self):
        r = plan({"intent": "investigar", "observed": {"unknown_state": True}})
        self.assertEqual(r["breathing"], "ÁGUA")
        self.assertEqual(r["fable_loop"], "CALIBRATE_READ_ONLY")
        self.assertEqual(r["delegation"]["max_subagents"], 0)
        self.assertEqual(r["decision"], "PLAN_ONLY")

    def test_bounded_with_approval_tools(self):
        r = plan({"intent": "consertar", "category": "BOUNDED", "authorized": True,
                  "design_approved": True, "tools_available": True, "steps": 4,
                  "independent_tasks": 3, "observed": {"cause_isolated": True}})
        self.assertEqual(r["breathing"], "INSETO")
        self.assertEqual(r["cot_react_loop"], "ELIGIBLE_REAL_TOOLS")
        self.assertEqual(r["delegation"]["max_subagents"], 3)
        self.assertFalse(r["delegation"]["execution_proven"])
        self.assertEqual(r["xp_gained"], 0)

    def test_no_tools_no_agents(self):
        r = plan({"intent": "comparar", "authorized": True, "steps": 7,
                  "independent_tasks": 12,
                  "observed": {"multi_system": True, "needs_alternatives": True}})
        self.assertEqual(r["delegation"]["mode"], "NONE")
        self.assertEqual(r["cot_react_loop"], "SKIP_NO_AUTHORIZED_MULTI_STEP_TOOLS")
        self.assertEqual(r["methods"], ["ToT", "GoT"])

    def test_scoring_no_false_verde(self):
        r = plan({"intent": "calcular", "authorized": True, "tools_available": True,
                  "steps": 3,
                  "observed": {"needs_calculation": True, "contradiction": True}})
        self.assertEqual(r["methods"], ["PoT", "ReAct"])
        self.assertEqual(r["evidence"], "NOT_PROVEN_BY_PLANNER")
        self.assertEqual(r["xp_gained"], 0)

    def test_design_gate(self):
        r = plan({"intent": "arquitetar", "category": "ARCHITECTURAL",
                  "authorized": True, "tools_available": True, "steps": 5})
        self.assertEqual(r["decision"], "PLAN_ONLY")

    def test_bad_state(self):
        with self.assertRaises(ValueError):
            plan({"intent": ""})
        with self.assertRaises(ValueError):
            plan({"intent": "x", "independent_tasks": -1})
        with self.assertRaises(ValueError):
            plan({"intent": "x", "steps": True})


if __name__ == "__main__":
    unittest.main()
