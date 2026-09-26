# Official path gate — CAMINHO_OFICIAL_FORNECIDO > URL_INFERIDA
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional

class AffordanceIgnored(Exception):
    pass

@dataclass
class OfficialAction:
    kind: str  # button|link|command|file|endpoint|visible_action
    label: str
    target: Optional[str] = None

@dataclass
class Resolution:
    used_official: bool
    url: Optional[str]
    guessed: bool
    failure_logged: bool = False
    skill_path: Optional[str] = None
    errors: List[str] = field(default_factory=list)

def resolve_github_from_affordance(
    official_actions: List[OfficialAction],
    *,
    allow_guess: bool = False,
    guessed_url: Optional[str] = None,
    official_open_result: Optional[dict] = None,
) -> Resolution:
    """Gate: use official affordance before any guessed URL.

    official_open_result example when button was used:
      {ok: True, url: 'https://github.com/obra/superpowers', default_branch: 'main', skill_path: 'skills/brainstorming/SKILL.md'}
    """
    official = [a for a in official_actions if a.kind in {"button","link","endpoint","visible_action","command","file"} and (
        (a.label and "view on github" in a.label.lower()) or (a.target and "github.com" in (a.target or "").lower()) or a.kind in {"command","file","endpoint"}
    )]

    # Prefer explicit View on GitHub
    vog = [a for a in official_actions if a.label and "view on github" in a.label.lower()]
    if vog:
        if official_open_result and official_open_result.get("ok"):
            return Resolution(
                used_official=True,
                url=official_open_result.get("url") or vog[0].target,
                guessed=False,
                skill_path=official_open_result.get("skill_path"),
            )
        # official path selected but open failed — must log before guess
        if official_open_result and not official_open_result.get("ok"):
            if allow_guess and guessed_url:
                return Resolution(used_official=False, url=guessed_url, guessed=True, failure_logged=True, errors=["official_failed_then_guess"])
            return Resolution(used_official=True, url=vog[0].target, guessed=False, failure_logged=True, errors=["official_failed"])
        # button exists, must use it — no guess
        if guessed_url and not allow_guess:
            raise AffordanceIgnored("AFFORDANCE_IGNORED: botão/link oficial existe; proibido URL adivinhada antes de testar o oficial")
        return Resolution(used_official=True, url=vog[0].target, guessed=False)

    # no official github affordance
    if guessed_url:
        if not allow_guess:
            raise AffordanceIgnored("UNVERIFIED_URL_GUESS: sem affordance oficial e guess bloqueado")
        return Resolution(used_official=False, url=guessed_url, guessed=True, failure_logged=True, errors=["no_official_affordance"])
    return Resolution(used_official=False, url=None, guessed=False, errors=["no_path"])
