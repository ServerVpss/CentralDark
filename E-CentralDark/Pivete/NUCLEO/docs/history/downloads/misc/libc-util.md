# OUTRO - libc-util.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\etc\libc-util.py
**SHA:** a99fdefe6354c28c
**Timestamp:** 2026-08-28T02:34:33.600515
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- rebase_todo = "break\n"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Helper utilities for common libc tasks."""

import argparse
import copy
import datetime as dt
from enum import StrEnum
import functools
import json
import os
import pprint
import re
import subprocess as sp
import sys
from dataclasses import dataclass
from inspect import cleandoc
from multiprocessing import Pool
from pathlib import Path

REPO_OWNER = "rust-lang"
REPO = "libc"


def main() -> None:
    p = argparse.ArgumentParser(
        description="Utilities for helping with libc development"
    )
    sub = p.add_subparsers(required=True)

    p_cat = sub.add_parser(
        "check-all-targets",
        aliases=["cat"],
        help="run `cargo check` on some or all targets (see subcommand help for more)",
        description=CheckAllTargets.__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p_cat.add_argument("package", help="specify the package to build")
    p_cat.add_argument("-o", "--only", help="filter tested targets by this regex")
    p_cat.add_argument("-s", "--skip", help="skip targets matching this regex")
    p_cat.add_argument(
        "cargo_args",
        nargs="*",
        metavar="cargo-args",
        help="extra arguments for `cargo check`",
    )
    p_cat.set_defaults(
        func=lambda args: CheckAllTargets.prepare().check_all_targets(
            package=args.package,
            only=args.only,
            skip=args.skip,
            cargo_args=args.cargo_args,
        )
    )

    p_rel = sub.add_parser(
        "relabel",
        help="replace the stable-nominated label with stable-applied",
        description=Relabel.__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p_rel.add_argument(
        "pr_number", metavar="pr-number", help="pull request for the backport"
    )
    p_rel.set_defaults(func=lambda args: Relabel(pr_number=args.pr_number).execute())

    p_log = sub.add_parser(
        "make-changelog",
        help="collect changelog entries",
        description=MakeChangelog.__doc__,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p_log.add_argument(
        "--old-tag",
        metavar="old-tag",
        help="tag of the previous revision to serve as the changelog base",
        required=True,
    )
    p_log.add_argument(
        "--new-ref",
        metavar="new-ref",
        help="ref to compare to the old tag",
        default="libc-0.2",
    )
    p_log.set_defaults(
        func=lambda args: MakeChangelog(
            old_tag=args.old_tag, new_ref=args.new_ref
        ).execute()
    )

    p_bkp = sub.add_parser(
        "backport",
        help="prepare to cherry pick to `libc-0.2` (see subcommand help for more)",
        description=Backporter.__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p_bkp.add_argument(
        "--branch", help="branch to backport to, must not be checked out", required=True
    )
    p_bkp.set_defaults(
        func=lambda args: Backporter(branch=args.branch).start_backports()
    )

    s = sub.add_parser(
        "backport-pr-description",
        help="create a PR description for a backport branch",
        description=Backporter.backport_pr_description.__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    s.add_argument("--branch", help="name of the backport branch", required=True)
    s.set_defaults(func=lambda args: Backporter.backport_pr_description(args.branch))

    p_amd = sub.add_parser(
        "add-backport-trailer",
        help='add "(backport ...)" to the previous commit',
        description=Backporter.add_backport_trailer.__doc__,
    )
    p_amd.add_argument("pick", help="commit that was cherry picked")
    p_amd.set_defaults(func=lambda args: Backporter.add_backport_trailer(args.pick))

    p_seq = sub.add_parser(
        "_sequence-editor",
        help="hook to update the rebase todo, meant for internal use",
    )
    p_seq.add_argument("path", help="path to the rebase todo")
    p_seq.set_defaults(func=lambda args: Backporter.sequence_editor(args.path))

    args = p.parse_args()
    args.func(args)


@dataclass(kw_only=True)
class Relabel:
    """
    Replace the stable-nominated label with stable-applied, given the number of
    a PR listing backported PRs.

    The backport PR should have a list of items like `* http://.../libc/pull/1234`.
    """

    pr_number: int

    def execute(self) -> None:
        num = self.pr_number
        j = check_output(
            [
                "gh",
                "pr",
                "view",
                f"https://github.com/{REPO_OWNER}/{REPO}/pull/{num}",
                "--json=baseRefName,body,state,title",
            ]
        )
        d = json.loads(j)
        base: str = d["baseRefName"]
        body: str = d["body"]
        state: str = d["state"]
        title: str = d["title"]

        if state != "MERGED":
            print(f'expected MERGED state; got {state} for "{title}" (#{num})'
```