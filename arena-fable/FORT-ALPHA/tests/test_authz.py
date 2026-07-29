"""Tests for release authorization (role + four-eyes)."""

import unittest

from settlement.authz import authorize, Principal, Settlement, AuthzError


def _p(pid, *roles):
    return Principal(id=pid, roles=frozenset(roles))


class TestAuthz(unittest.TestCase):
    def test_operator_can_release_others_settlement(self):
        s = Settlement(id="s1", created_by="alice", amount=1000)
        # returns None (no exception) => allowed
        self.assertIsNone(authorize(_p("bob", "operator"), s))

    def test_admin_can_release_others_settlement(self):
        s = Settlement(id="s2", created_by="alice", amount=1000)
        self.assertIsNone(authorize(_p("carol", "admin"), s))

    def test_no_role_is_denied(self):
        s = Settlement(id="s3", created_by="alice", amount=1000)
        with self.assertRaises(AuthzError):
            authorize(_p("dave", "viewer"), s)

    def test_four_eyes_operator_cannot_release_own(self):
        # Separation of duties: an operator may not release a settlement they
        # created themselves.
        s = Settlement(id="s4", created_by="erin", amount=1000)
        with self.assertRaises(AuthzError):
            authorize(_p("erin", "operator"), s)

    def test_empty_roles_denied(self):
        s = Settlement(id="s5", created_by="alice", amount=1000)
        with self.assertRaises(AuthzError):
            authorize(_p("frank"), s)


if __name__ == "__main__":
    unittest.main()
