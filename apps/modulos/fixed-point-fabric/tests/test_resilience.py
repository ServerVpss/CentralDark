from datetime import datetime, timedelta, timezone
import unittest

from centraldark_fixed_point.resilience import (
    DeterministicResumePolicy,
    PauseClass,
    ResilienceCapacitor,
    ResumeAction,
    Signal,
    format_log,
    redact,
)


def ts(delta_seconds: int = 0) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=delta_seconds)).isoformat()


class ResiliencePolicyTests(unittest.TestCase):
    def test_user_suspend_blocks_pong(self):
        cap = ResilienceCapacitor("m1", pause_class=PauseClass.USER_SUSPENDED, human_lock=True, next_cursor="c1")
        decision = DeterministicResumePolicy().decide(cap, Signal("PONG", "remote", ts()))
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.action, ResumeAction.HOLD)

    def test_user_resume_is_explicit(self):
        cap = ResilienceCapacitor("m1", next_cursor="c1")
        decision = DeterministicResumePolicy().decide(cap, Signal("USER_RESUME", "authority", ts()))
        self.assertTrue(decision.allowed)
        self.assertEqual(decision.action, ResumeAction.RESUME_FROM_CURSOR)

    def test_auth_401_selects_authorized_fallback(self):
        cap = ResilienceCapacitor(
            "m1",
            pause_cause="PROVIDER_AUTH_401",
            provider_active="moa",
            next_cursor="provider_recovery",
        )
        decision = DeterministicResumePolicy(authorized_fallbacks=("opencode_free",)).decide(
            cap, Signal("PROVIDER_FAILURE", "hermes", ts(), cause="PROVIDER_AUTH_401")
        )
        self.assertTrue(decision.allowed)
        self.assertEqual(decision.action, ResumeAction.SELECT_FALLBACK)
        self.assertEqual(decision.provider, "opencode_free")

    def test_auth_401_never_retries_same_provider(self):
        cap = ResilienceCapacitor("m1", pause_cause="PROVIDER_AUTH_401", provider_active="moa")
        decision = DeterministicResumePolicy(authorized_fallbacks=("moa",)).decide(
            cap, Signal("PROVIDER_FAILURE", "hermes", ts(), cause="PROVIDER_AUTH_401")
        )
        self.assertFalse(decision.allowed)

    def test_unknown_never_passes(self):
        cap = ResilienceCapacitor("m1", next_cursor="c")
        decision = DeterministicResumePolicy().decide(cap, Signal("PONG", "remote", ts(), state="UNKNOWN"))
        self.assertFalse(decision.allowed)

    def test_stale_signal_never_resumes(self):
        cap = ResilienceCapacitor("m1", next_cursor="c")
        decision = DeterministicResumePolicy(signal_ttl_seconds=30).decide(
            cap, Signal("PONG", "remote", ts(-120))
        )
        self.assertFalse(decision.allowed)
        self.assertEqual(decision.reason, "STALE_SIGNAL")

    def test_fresh_pong_can_resume_temporal_edge(self):
        cap = ResilienceCapacitor("m1", pause_class=PauseClass.REMOTE_OFFLINE, next_cursor="measure_app")
        decision = DeterministicResumePolicy().decide(cap, Signal("PONG", "remote_mcp", ts()))
        self.assertTrue(decision.allowed)
        self.assertEqual(decision.next_cursor, "measure_app")

    def test_redaction_and_log_shape(self):
        raw = "Authorization: Bearer abc token=xyz password=qwe"
        safe = redact(raw)
        self.assertNotIn("abc", safe)
        self.assertNotIn("xyz", safe)
        self.assertNotIn("qwe", safe)
        line = format_log("RECEIVER", "📡", "source", "remote_mcp", "PASS", raw)
        self.assertTrue(line.startswith("[📡 RECEIVER][source:remote_mcp][PASS]"))
        self.assertIn("[REDACTED]", line)


if __name__ == "__main__":
    unittest.main()
