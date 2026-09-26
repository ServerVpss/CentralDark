#!/usr/bin/env python3
"""CentralDark 🔏 !RASTRO fiscal.

TRACE_PRESENT != TRACE_VALID

Reads a response/receipt/report, extracts trace claims and verifies them against
GitHub. The verifier is fail-closed:

PASS    = the cited evidence was reconstructed and matched.
FAIL    = contrary evidence was observed.
UNKNOWN = GitHub/network/tool evidence was unavailable or insufficient.

This is a verifier, not a second judge/owner. Canonical owner:
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import subprocess
import sys
import urllib.parse
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Iterable, Optional


SHA_RE = re.compile(r"(?<![0-9a-f])([0-9a-f]{7,40})(?![0-9a-f])", re.I)
COMMIT_URL_RE = re.compile(
    r"https://github\.com/(?P<owner>[^/\s]+)/(?P<repo>[^/\s]+)/commit/(?P<sha>[0-9a-f]{7,40})",
    re.I,
)
BLOB_URL_RE = re.compile(
    r"https://github\.com/(?P<owner>[^/\s]+)/(?P<repo>[^/\s]+)/blob/(?P<ref>[^/\s]+)/(?P<path>[^\s)#]+)",
    re.I,
)
PATH_FIELD_RE = re.compile(r"(?im)^\s*(?:PATH|CAMINHO)\s*[:=]\s*[`\"']?(?P<value>[^\n`\"']+)")
SHA_FIELD_RE = re.compile(r"(?im)^\s*(?:COMMIT_SHA|SHA|COMMIT)\s*[:=]\s*[`\"']?(?P<value>[0-9a-f]{7,40})")
LINK_FIELD_RE = re.compile(r"(?im)^\s*(?:LINK|URL)\s*[:=]\s*(?P<value>https://github\.com/\S+)")
READBACK_FIELD_RE = re.compile(r"(?im)^\s*(?:READBACK|READBACK_NEEDLE|PROVA_DE_LEITURA)\s*[:=]\s*[`\"']?(?P<value>[^\n]+)")
MEMORY_LOCATION_RE = re.compile(r"(?im)^\s*(?:MEMORY_LOCATION|MEMORIA_LOCAL|MEMÓRIA_LOCAL|MEMORY_PATH)\s*[:=]\s*(?P<value>\S.+)$")
LEDGER_REF_RE = re.compile(r"(?im)^\s*(?:LEDGER_REF|LIVRO_RAZAO|LIVRO-RAZÃO)\s*[:=]\s*(?P<value>\S.+)$")
CURRENT_MAIN_RE = re.compile(r"(?im)^\s*(?:CURRENT_MAIN|MAIN_HEAD|HEAD_CURRENT)\s*[:=]\s*[`\"']?(?P<value>[0-9a-f]{7,40})")

WRITE_CLAIM_RE = re.compile(
    r"\b(gravei|gravado|salvei|salvo|publiquei|publicado|commitei|commitado|"
    r"escrevi|escrito|atualizei|atualizado|criei|criado|wrote|saved|published|committed|updated|created)\b",
    re.I,
)
MEMORY_CLAIM_RE = re.compile(
    r"\b(mem[oó]ria|memory)\b.*\b(salvei|salvo|gravei|gravado|guardei|guardado|saved|stored|wrote)\b|"
    r"\b(salvei|salvo|gravei|gravado|guardei|guardado|saved|stored|wrote)\b.*\b(mem[oó]ria|memory)\b",
    re.I,
)
DIRECT_MAIN_RE = re.compile(r"\b(main)\b", re.I)


@dataclass
class Check:
    name: str
    verdict: str
    detail: str
    evidence: Optional[str] = None


@dataclass
class FiscalResult:
    schema: str
    repo: str
    verdict: str
    trace_present: bool
    checks: list[Check]
    extracted: dict[str, Any]

    def as_json(self) -> dict[str, Any]:
        out = asdict(self)
        out["checks"] = [asdict(c) for c in self.checks]
        return out


class BackendUnavailable(RuntimeError):
    pass


class GitHubBackend:
    """Read-only GitHub backend using the authenticated gh CLI."""

    def __init__(self, repo: str, timeout: int = 20):
        self.repo = repo
        self.timeout = timeout

    def _gh(self, endpoint: str) -> Any:
        cmd = ["gh", "api", endpoint]
        try:
            proc = subprocess.run(
                cmd,
                text=True,
                capture_output=True,
                timeout=self.timeout,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise BackendUnavailable(str(exc)) from exc

        if proc.returncode != 0:
            msg = (proc.stderr or proc.stdout or "").strip()
            # 404 is evidence that an object is absent. Auth/network/rate-limit
            # problems are UNKNOWN rather than FAIL.
            if "HTTP 404" in msg or '"status":"404"' in msg or "Not Found" in msg:
                return None
            raise BackendUnavailable(msg or f"gh api failed rc={proc.returncode}")

        raw = proc.stdout.strip()
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise BackendUnavailable(f"invalid GitHub JSON: {exc}") from exc

    def commit(self, sha: str) -> Optional[dict[str, Any]]:
        return self._gh(f"repos/{self.repo}/commits/{sha}")

    def current_main(self) -> Optional[str]:
        obj = self._gh(f"repos/{self.repo}/commits/main")
        if not obj:
            return None
        return str(obj.get("sha") or "")

    def file_at(self, path: str, ref: str) -> Optional[str]:
        encoded_path = urllib.parse.quote(path.strip().lstrip("/"), safe="/")
        encoded_ref = urllib.parse.quote(ref, safe="")
        obj = self._gh(f"repos/{self.repo}/contents/{encoded_path}?ref={encoded_ref}")
        if not obj:
            return None
        content = obj.get("content")
        if content is None:
            return None
        try:
            return base64.b64decode(content).decode("utf-8", errors="replace")
        except Exception as exc:
            raise BackendUnavailable(f"cannot decode content {path}@{ref}: {exc}") from exc

    def ledger_has_sha(
        self,
        sha: str,
        issue: int = 1562,
        ledger_ref: Optional[str] = None,
    ) -> Optional[bool]:
        needle = sha.lower()

        # Preferred route: if the response cites an exact ledger comment,
        # verify that comment directly instead of searching the thread.
        comment_id = _ledger_comment_id(ledger_ref)
        if comment_id is not None:
            obj = self._gh(f"repos/{self.repo}/issues/comments/{comment_id}")
            if obj is None:
                return False
            return needle in str(obj.get("body") or "").lower()

        # Fallback route: GitHub issue comments are oldest-first by default.
        # Read the issue comment count, start at the newest page, then walk
        # backwards until the cited SHA is found. This prevents false FAILs
        # once #1562 grows beyond 100 comments.
        issue_obj = self._gh(f"repos/{self.repo}/issues/{issue}")
        if issue_obj is None:
            return None
        try:
            total = int(issue_obj.get("comments") or 0)
        except (TypeError, ValueError):
            raise BackendUnavailable("invalid ledger comment count from GitHub")
        if total == 0:
            return False

        page = max(1, (total + 99) // 100)
        while page >= 1:
            obj = self._gh(
                f"repos/{self.repo}/issues/{issue}/comments?per_page=100&page={page}"
            )
            if obj is None:
                return None
            if any(needle in str(item.get("body") or "").lower() for item in obj):
                return True
            page -= 1
        return False


class FakeBackend:
    """Small deterministic backend used by unit tests."""

    def __init__(
        self,
        commits: Optional[dict[str, dict[str, str]]] = None,
        main: Optional[str] = None,
        ledger: Optional[set[str]] = None,
        unavailable: bool = False,
    ):
        self.commits = commits or {}
        self.main = main
        self.ledger = {x.lower() for x in (ledger or set())}
        self.unavailable = unavailable

    def _guard(self) -> None:
        if self.unavailable:
            raise BackendUnavailable("simulated GitHub outage")

    def _resolve(self, sha: str) -> Optional[str]:
        sha = sha.lower()
        matches = [full for full in self.commits if full.lower().startswith(sha)]
        return matches[0] if len(matches) == 1 else None

    def commit(self, sha: str) -> Optional[dict[str, Any]]:
        self._guard()
        full = self._resolve(sha)
        return {"sha": full} if full else None

    def current_main(self) -> Optional[str]:
        self._guard()
        return self.main

    def file_at(self, path: str, ref: str) -> Optional[str]:
        self._guard()
        full = self._resolve(ref)
        if not full:
            return None
        return self.commits.get(full, {}).get(path)

    def ledger_has_sha(
        self,
        sha: str,
        issue: int = 1562,
        ledger_ref: Optional[str] = None,
    ) -> Optional[bool]:
        self._guard()
        full = self._resolve(sha) or sha
        return any(full.lower().startswith(x) or x.startswith(full.lower()) for x in self.ledger)


def _ledger_comment_id(ref: Optional[str]) -> Optional[int]:
    if not ref:
        return None
    raw = ref.strip()
    for pattern in (
        r"issuecomment-(\d+)",
        r"/issues/comments/(\d+)",
        r"\bcomment(?:_id)?\s*[:=#-]?\s*(\d{6,})\b",
    ):
        match = re.search(pattern, raw, re.I)
        if match:
            return int(match.group(1))
    if re.fullmatch(r"\d{6,}", raw):
        return int(raw)
    return None


def _first(pattern: re.Pattern[str], text: str) -> Optional[str]:
    match = pattern.search(text)
    if not match:
        return None
    if "value" in match.groupdict():
        return match.group("value").strip().strip("`'\"")
    return match.group(0)


def _repo_from_link(text: str) -> Optional[str]:
    for pattern in (COMMIT_URL_RE, BLOB_URL_RE):
        m = pattern.search(text)
        if m:
            return f"{m.group('owner')}/{m.group('repo')}"
    return None


def extract(text: str, default_repo: str) -> dict[str, Any]:
    sha = _first(SHA_FIELD_RE, text)
    link = _first(LINK_FIELD_RE, text)
    path = _first(PATH_FIELD_RE, text)
    readback = _first(READBACK_FIELD_RE, text)
    memory_location = _first(MEMORY_LOCATION_RE, text)
    ledger_ref = _first(LEDGER_REF_RE, text)
    current_main_claim = _first(CURRENT_MAIN_RE, text)

    commit_url = COMMIT_URL_RE.search(link or text)
    blob_url = BLOB_URL_RE.search(link or text)

    if not sha and commit_url:
        sha = commit_url.group("sha")

    if not path and blob_url:
        path = urllib.parse.unquote(blob_url.group("path"))

    repo = _repo_from_link(link or text) or default_repo

    # A raw SHA without an explicit field is accepted only if it is the sole
    # SHA candidate; multiple unlabeled hashes are ambiguous => insufficient.
    if not sha:
        shas = list(dict.fromkeys(m.group(1) for m in SHA_RE.finditer(text)))
        if len(shas) == 1:
            sha = shas[0]

    return {
        "repo": repo,
        "sha": sha,
        "path": path,
        "link": link,
        "readback": readback,
        "memory_location": memory_location,
        "ledger_ref": ledger_ref,
        "current_main_claim": current_main_claim,
        "write_claim": bool(WRITE_CLAIM_RE.search(text)),
        "memory_claim": bool(MEMORY_CLAIM_RE.search(text)),
        "direct_main_claim": bool(DIRECT_MAIN_RE.search(text) and WRITE_CLAIM_RE.search(text)),
    }


def _aggregate(checks: Iterable[Check]) -> str:
    verdicts = [c.verdict for c in checks]
    if "FAIL" in verdicts:
        return "FAIL"
    if "UNKNOWN" in verdicts:
        return "UNKNOWN"
    return "PASS"


def verify_text(text: str, repo: str, backend: Any) -> FiscalResult:
    data = extract(text, repo)
    checks: list[Check] = []

    trace_present = bool(data["sha"] or data["path"] or data["link"] or data["readback"])

    if data["write_claim"] and not trace_present:
        checks.append(Check("write_claim_has_trace", "FAIL", "write claim without SHA/path/link/readback"))
    elif data["write_claim"]:
        checks.append(Check("write_claim_has_trace", "PASS", "write claim contains trace material"))

    if data["memory_claim"]:
        if data["memory_location"]:
            checks.append(Check("memory_location", "PASS", "memory storage location named", data["memory_location"]))
        else:
            checks.append(Check("memory_location", "FAIL", "memory claim without MEMORY_LOCATION"))

    # CURRENT_MAIN is independently verifiable even when no write claim exists.
    if data["current_main_claim"]:
        try:
            remote_main = backend.current_main()
        except BackendUnavailable as exc:
            checks.append(Check("current_main", "UNKNOWN", str(exc)))
        else:
            if not remote_main:
                checks.append(Check("current_main", "UNKNOWN", "GitHub did not return main HEAD"))
            elif remote_main.lower().startswith(data["current_main_claim"].lower()):
                checks.append(Check("current_main", "PASS", "CURRENT_MAIN matches GitHub", remote_main))
            else:
                checks.append(Check("current_main", "FAIL", "CURRENT_MAIN is stale or false", remote_main))

    sha = data["sha"]
    commit_obj: Optional[dict[str, Any]] = None
    if sha:
        try:
            commit_obj = backend.commit(sha)
        except BackendUnavailable as exc:
            checks.append(Check("commit_exists", "UNKNOWN", str(exc)))
        else:
            if commit_obj:
                full_sha = str(commit_obj.get("sha") or sha)
                checks.append(Check("commit_exists", "PASS", "commit exists on GitHub", full_sha))
            else:
                checks.append(Check("commit_exists", "FAIL", "commit does not exist on GitHub", sha))

    if data["link"]:
        m = COMMIT_URL_RE.search(data["link"])
        b = BLOB_URL_RE.search(data["link"])
        if m:
            link_repo = f"{m.group('owner')}/{m.group('repo')}"
            same_repo = link_repo.lower() == repo.lower()
            same_sha = bool(sha and (m.group("sha").lower().startswith(sha.lower()) or sha.lower().startswith(m.group("sha").lower())))
            if same_repo and same_sha:
                checks.append(Check("link_matches", "PASS", "commit link matches repo and SHA"))
            else:
                checks.append(Check("link_matches", "FAIL", f"link mismatch repo={link_repo} sha={m.group('sha')}"))
        elif b:
            link_repo = f"{b.group('owner')}/{b.group('repo')}"
            same_repo = link_repo.lower() == repo.lower()
            same_path = bool(data["path"] and urllib.parse.unquote(b.group("path")).rstrip("/") == data["path"].rstrip("/"))
            if same_repo and same_path:
                checks.append(Check("link_matches", "PASS", "blob link matches repo and path"))
            else:
                checks.append(Check("link_matches", "FAIL", "blob link does not match repo/path"))
        else:
            checks.append(Check("link_matches", "FAIL", "LINK is not a supported GitHub commit/blob URL"))

    if data["path"]:
        content: Optional[str] = None
        if not sha:
            checks.append(Check("path_at_commit", "UNKNOWN", "PATH supplied without COMMIT_SHA"))
        elif commit_obj is None and any(c.name == "commit_exists" and c.verdict != "PASS" for c in checks):
            checks.append(Check("path_at_commit", "UNKNOWN", "cannot verify path until commit is proven"))
        else:
            try:
                content = backend.file_at(data["path"], sha)
            except BackendUnavailable as exc:
                checks.append(Check("path_at_commit", "UNKNOWN", str(exc)))
                content = None
            else:
                if content is None:
                    checks.append(Check("path_at_commit", "FAIL", "path does not exist at cited commit", data["path"]))
                else:
                    checks.append(Check("path_at_commit", "PASS", "path exists at cited commit", data["path"]))

            if data["readback"]:
                if content is None:
                    # Path failure/UNKNOWN already carries the causal state.
                    pass
                elif data["readback"] in content:
                    checks.append(Check("readback_supports_claim", "PASS", "READBACK needle found in remote content"))
                else:
                    checks.append(Check("readback_supports_claim", "FAIL", "READBACK needle absent from remote content"))
            elif data["write_claim"]:
                checks.append(Check("readback_supports_claim", "UNKNOWN", "write claim has no explicit READBACK needle"))

    if data["direct_main_claim"]:
        if not sha:
            checks.append(Check("ledger_1562", "FAIL", "direct-main write claim without COMMIT_SHA"))
        else:
            try:
                found = backend.ledger_has_sha(sha, 1562, data.get("ledger_ref"))
            except BackendUnavailable as exc:
                checks.append(Check("ledger_1562", "UNKNOWN", str(exc)))
            else:
                if found is True:
                    checks.append(Check("ledger_1562", "PASS", "commit cited in #1562"))
                elif found is False:
                    checks.append(Check("ledger_1562", "FAIL", "direct-main commit absent from #1562"))
                else:
                    checks.append(Check("ledger_1562", "UNKNOWN", "ledger could not be verified"))

    # A material trace with no checkable claim is not green.
    if not checks:
        checks.append(Check("trace_contract", "UNKNOWN", "no material write/memory/current-main claim detected"))

    # A write claim cannot PASS without the complete reconstructible quartet.
    if data["write_claim"]:
        missing = [key for key in ("sha", "path", "link", "readback") if not data.get(key)]
        if missing:
            checks.append(Check("complete_trace", "UNKNOWN" if trace_present else "FAIL", "missing: " + ",".join(missing)))
        else:
            checks.append(Check("complete_trace", "PASS", "SHA+PATH+LINK+READBACK present"))

    verdict = _aggregate(checks)
    return FiscalResult(
        schema="centraldark.rastro-fiscal.v1",
        repo=data["repo"],
        verdict=verdict,
        trace_present=trace_present,
        checks=checks,
        extracted=data,
    )


def _load_text(args: argparse.Namespace) -> str:
    if args.text is not None:
        return args.text
    if args.file is not None:
        return Path(args.file).read_text(encoding="utf-8")
    return sys.stdin.read()


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="CentralDark 🔏 !RASTRO fiscal")
    parser.add_argument("--repo", default="ServerVpss/CentralDark")
    src = parser.add_mutually_exclusive_group()
    src.add_argument("--text")
    src.add_argument("--file")
    parser.add_argument("--pretty", action="store_true")
    args = parser.parse_args(argv)

    text = _load_text(args)
    backend = GitHubBackend(args.repo)
    result = verify_text(text, args.repo, backend)
    print(json.dumps(result.as_json(), ensure_ascii=False, indent=2 if args.pretty else None))

    return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[result.verdict]


if __name__ == "__main__":
    raise SystemExit(main())
