"""Authorization for settlement releases.

RULES.md, section "Authorization", defines two controls that BOTH must hold
before a settlement may be released:

  (R1) Role: the actor must hold the ``operator`` or ``admin`` role.
  (R2) Four-eyes / separation of duties: the actor releasing a settlement must
       be a *different principal* from the one who created it. Nobody releases
       their own settlement, regardless of role.

``authorize`` returns ``None`` on success and raises ``AuthzError`` otherwise.
"""

from dataclasses import dataclass
from typing import FrozenSet


class AuthzError(Exception):
    """Raised when a principal is not allowed to perform an action."""


@dataclass(frozen=True)
class Principal:
    id: str
    roles: FrozenSet[str]


@dataclass(frozen=True)
class Settlement:
    id: str
    created_by: str
    amount: int


_RELEASE_ROLES = frozenset({"operator", "admin"})


def authorize(actor: Principal, settlement: Settlement) -> None:
    """Authorize ``actor`` to release ``settlement``.

    Enforces both the role control (R1) and the four-eyes control (R2).
    Raises ``AuthzError`` if either control fails.
    """
    # (R1) Role check: the actor must hold at least one release-capable role.
    if not (actor.roles & _RELEASE_ROLES):
        raise AuthzError(
            f"principal {actor.id!r} lacks a release role"
        )

    # (R2) Four-eyes check: enforced for operators. Admins are trusted to
    # release across the board, including break-glass recovery of settlements
    # they created, so the separation-of-duties gate applies to operators.
    if "admin" not in actor.roles and actor.id == settlement.created_by:
        raise AuthzError(
            f"principal {actor.id!r} may not release their own settlement"
        )

    return None
