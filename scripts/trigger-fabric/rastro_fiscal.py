#!/usr/bin/env python3
"""CentralDark 🔏 !RASTRO fiscal.

TRACE_PRESENT != TRACE_VALID
RESPONSE_WITHOUT_TRACE=INVALID

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
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
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
MEASURABLE_CURRENT_UNKNOWN_RE = re.compile(
    r"(?:CURRENT_MAIN(?:_SHA)?|MAIN_HEAD|HEAD_CURRENT).{0,120}"
    r"(?:UNKNOWN|NOT[_ -]?YET[_ -]?MEASURED|NAO\s+MEDID|NÃO\s+MEDID|A\s+REMEDIR|POR\s+MEDIR)",
    re.I | re.S,
)
LEDGER_CURRENT_CONTEXT_RE = re.compile(
    r"(?:#1757|#1562|PR[- _]?M[ÃA]E).{0,500}"
    r"(?:CURRENT_MAIN(?:_SHA)?|HEAD\s+ATUAL|MAIN\s+(?:AGORA|ATUAL|CORRENTE)|CORRENTE)",
    re.I | re.S,
)
NOT_LOCATED_COMMENT_RE = re.compile(
    r"(?:NOT[_ -]?YET[_ -]?LOCATED|N[AÃ]O\s+LOCALIZAD[OA]).{0,180}(?P<after>\d{6,})"
    r"|(?P<before>\d{6,}).{0,180}(?:NOT[_ -]?YET[_ -]?LOCATED|N[AÃ]O\s+LOCALIZAD[OA])",
    re.I | re.S,
)

LOCAL_CAPABILITY_TERMINAL_RE = re.compile(
    r"(?:sem\s+shell|shell\s+(?:nao|não)\s+esta|no\s+shell|capability\s+gap).{0,500}"
    r"(?:fronteira|terminal|blocker|bloqueio|medicao\s+(?:nao|não)\s+existe)",
    re.I | re.S,
)
CAPABILITY_HANDOFF_EVIDENCE_RE = re.compile(
    r"(?:CAPABILITY_HANDOFF|HANDOFF_RECEIPT|HANDOFF_EXHAUSTED|"
    r"LOCAL_BLOCKED_IS_NOT_GLOBAL_BLOCKER|CASA\s*->\s*SSH\s*->\s*VPS|"
    r"MCP_CASA|ROTAS_TENTADAS)",
    re.I,
)

# Canonical executable output-guard contract.
RESPONSE_WITHOUT_TRACE = "INVALID"

# Nota tocada: o mesmo fiscal do !RASTRO valida metadados sem reescrever a nota.
# O hash interno é SHA256 do conteúdo UTF-8 salvo, com APENAS o valor da linha
# hash_conteudo vazio. Hash do arquivo completo incluindo seu próprio hash seria
# autorreferente e não teria valor estável.
NOTE_REQUIRED_FIELDS = (
    "data_criacao", "ultima_atualizacao", "ultima_modificacao",
    "ultima_verificacao", "fuso_horario", "hash_conteudo",
    "rastro", "grupo_notas", "relacionado_a", "estado_evidencia",
)
NOTE_VALID_GROUPS = {"GRUPO_01", "GRUPO_02", "GRUPO_03", "GRUPO_04", "GRUPO_05"}
NOTE_VALID_STATES = {"PASS", "FAIL", "UNKNOWN", "BLOCKED"}
NOTE_HASH_RE = re.compile(r"^(?:sha256:)?[0-9a-f]{64}$", re.I)
NOTE_HASH_FIELD_RE = re.compile(r"(?m)^([ \t]*hash_conteudo[ \t]*:[ \t]*)[^\r\n]*", re.I)


def _note_metadata(text: str) -> dict[str, str]:
    # Frontmatter YAML escalar; não busca campos no corpo para impedir falso PASS.
    match = re.match(r"\A(?:\ufeff)?---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", text, re.S)
    if not match:
        return {}
    result: dict[str, str] = {}
    for line in match.group(1).splitlines():
        item = re.fullmatch(r"([a-z_]+):[ \t]*(.*)", line)
        if item:
            result[item.group(1)] = item.group(2).strip().strip('"').strip("'")
    return result


def _timezone_timestamp(value: str) -> bool:
    try:
        moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return moment.tzinfo is not None and moment.utcoffset() is not None
    except (ValueError, TypeError):
        return False


def verify_note_metadata(text: str, note_path: str = "") -> dict[str, Any]:
    """Verificação somente leitura, acionada para notas .md realmente tocadas.

    NÃO infere a data original, NÃO altera ultima_modificacao durante conferência
    e NÃO transforma metadado formatado em prova histórica independente.
    """
    props = _note_metadata(text)
    checks: list[Check] = []
    missing = [field for field in NOTE_REQUIRED_FIELDS if not props.get(field)]
    if missing:
        checks.append(Check("note_required_fields", "FAIL", "missing: " + ",".join(missing)))
    else:
        checks.append(Check("note_required_fields", "PASS", "ten required fields present"))
    if props:
        for name in ("ultima_atualizacao", "ultima_modificacao", "ultima_verificacao"):
            if props.get(name) and not _timezone_timestamp(props[name]):
                checks.append(Check("note_datetime_" + name, "FAIL", "RFC3339 with UTC offset required"))
        creation = props.get("data_criacao", "")
        if creation.upper() in {"UNKNOWN", "DESCONHECIDA", "DESCONHECIDO"}:
            checks.append(Check("note_creation_provenance", "UNKNOWN", "original creation not proven"))
        elif creation and not _timezone_timestamp(creation):
            checks.append(Check("note_datetime_data_criacao", "FAIL", "creation must be offset-aware or UNKNOWN"))
        if props.get("fuso_horario") and not (
            props["fuso_horario"] == "UTC"
            or bool(re.fullmatch(r"(?:[A-Za-z_]+/[A-Za-z_]+(?:/[A-Za-z_]+)?)|[+-]\d{2}:\d{2}", props["fuso_horario"]))
        ):
            checks.append(Check("note_timezone", "FAIL", "IANA timezone, UTC or UTC offset required"))
        if props.get("grupo_notas") and props["grupo_notas"] not in NOTE_VALID_GROUPS:
            checks.append(Check("note_group", "FAIL", "group must be GRUPO_01..GRUPO_05"))
        evidence_state = props.get("estado_evidencia", "")
        if evidence_state and evidence_state not in NOTE_VALID_STATES:
            checks.append(Check("note_evidence_state", "FAIL", "expected PASS|FAIL|UNKNOWN|BLOCKED"))
        elif evidence_state == "UNKNOWN":
            checks.append(Check("note_evidence_state", "UNKNOWN", "note evidence awaits external proof"))
        elif evidence_state == "BLOCKED":
            checks.append(Check("note_evidence_state", "UNKNOWN", "note evidence blocked; cannot promote to PASS"))
        elif evidence_state == "FAIL":
            checks.append(Check("note_evidence_state", "FAIL", "note itself records failed evidence"))
        stated_hash = props.get("hash_conteudo", "")
        if stated_hash:
            if not NOTE_HASH_RE.fullmatch(stated_hash):
                checks.append(Check("note_hash", "FAIL", "sha256:<64 hex> required"))
            else:
                normalized = NOTE_HASH_FIELD_RE.sub(r"\1", text, count=1)
                computed = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
                claimed = stated_hash.split(":")[-1].lower()
                checks.append(Check(
                    "note_hash", "PASS" if claimed == computed else "FAIL",
                    "SHA256 normalized content matches" if claimed == computed else "stored note content hash mismatch",
                    computed,
                ))
    verdict = _aggregate(checks)
    return {
        "schema": "centraldark.rastro-note-metadata.v1",
        "owner": "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md",
        "note_path": note_path,
        "verdict": verdict,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "checks": [asdict(c) for c in checks],
        "missing_fields": missing,
        "grupo_notas": props.get("grupo_notas") or None,
        "estado_evidencia": props.get("estado_evidencia") or "UNKNOWN",
        "proof_scope": "metadata_format_and_normalized_sha256_only; historic dates need external evidence",
        "modified_note": False,
    }


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

    def issue_comment(self, comment_id: int) -> Optional[dict[str, Any]]:
        return self._gh(f"repos/{self.repo}/issues/comments/{comment_id}")

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

    def resolve_active_funnel_issue(self) -> Optional[int]:
        matches: list[int] = []
        page = 1
        while True:
            obj = self._gh(
                f"repos/{self.repo}/pulls?state=open&per_page=100&page={page}"
            )
            if obj is None:
                return None
            if not isinstance(obj, list):
                raise BackendUnavailable("invalid open PR payload from GitHub")
            if not obj:
                break
            for item in obj:
                if ACTIVE_FUNNEL_MARKER in str(item.get("body") or ""):
                    try:
                        matches.append(int(item["number"]))
                    except (KeyError, TypeError, ValueError) as exc:
                        raise BackendUnavailable("invalid active funnel PR number") from exc
            if len(obj) < 100:
                break
            page += 1

        unique = sorted(set(matches))
        if len(unique) == 1:
            return unique[0]
        if len(unique) == 0:
            return None
        raise BackendUnavailable(
            "multiple open PRs carry CENTRALDARK_HUD_FUNNEL_CONTINUITY"
        )

    def _issue_has_sha(self, issue: int, needle: str) -> Optional[bool]:
        issue_obj = self._gh(f"repos/{self.repo}/issues/{issue}")
        if issue_obj is None:
            return None
        if needle in str(issue_obj.get("body") or "").lower():
            return True
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

    def ledger_has_sha(
        self,
        sha: str,
        issue: Optional[int] = None,
        ledger_ref: Optional[str] = None,
    ) -> Optional[bool]:
        needle = sha.lower()

        # Preferred CURRENT route: receipts live in the repository.
        # LEDGER_REF may name an exact repository receipt path; verify it at live main.
        if ledger_ref and _ledger_comment_id(ledger_ref) is None:
            raw_ref = ledger_ref.strip().strip("`'\"")
            if raw_ref.startswith("https://github.com/"):
                blob = BLOB_URL_RE.search(raw_ref)
                if blob and f"{blob.group('owner')}/{blob.group('repo')}".lower() == self.repo.lower():
                    raw_ref = urllib.parse.unquote(blob.group("path"))
            if "/" in raw_ref and not raw_ref.startswith("#"):
                live_main = self.current_main()
                if not live_main:
                    return None
                content = self.file_at(raw_ref, live_main)
                if content is None:
                    return False
                return needle in content.lower()

        # Historical compatibility: exact legacy ledger comments remain valid provenance.
        comment_id = _ledger_comment_id(ledger_ref)
        if comment_id is not None:
            obj = self._gh(f"repos/{self.repo}/issues/comments/{comment_id}")
            if obj is None:
                return False
            return needle in str(obj.get("body") or "").lower()

        explicit_issue = _ledger_issue_number(ledger_ref)
        if explicit_issue is not None:
            return self._issue_has_sha(explicit_issue, needle)

        # CURRENT fallback: resolve the active funnel dynamically by marker.
        # Historical PR numbers are not canonical identity.
        target_issue = issue if issue is not None else self.resolve_active_funnel_issue()
        if target_issue is None:
            return None
        return self._issue_has_sha(target_issue, needle)


class FakeBackend:
    """Small deterministic backend used by unit tests."""

    def __init__(
        self,
        commits: Optional[dict[str, dict[str, str]]] = None,
        main: Optional[str] = None,
        ledger: Optional[set[str]] = None,
        comments: Optional[dict[int, dict[str, Any]]] = None,
        unavailable: bool = False,
    ):
        self.commits = commits or {}
        self.main = main
        self.ledger = {x.lower() for x in (ledger or set())}
        self.comments = comments or {}
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

    def issue_comment(self, comment_id: int) -> Optional[dict[str, Any]]:
        self._guard()
        return self.comments.get(comment_id)

    def file_at(self, path: str, ref: str) -> Optional[str]:
        self._guard()
        full = self._resolve(ref)
        if not full:
            return None
        return self.commits.get(full, {}).get(path)

    def ledger_has_sha(
        self,
        sha: str,
        issue: Optional[int] = None,
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
        checks.append(Check("write_claim_has_trace", "FAIL", f"RESPONSE_WITHOUT_TRACE={RESPONSE_WITHOUT_TRACE}: write claim without SHA/path/link/readback"))
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


    if MEASURABLE_CURRENT_UNKNOWN_RE.search(text):
        try:
            remote_main = backend.current_main()
        except BackendUnavailable as exc:
            checks.append(Check("measurable_current_declared_unknown", "UNKNOWN", str(exc)))
        else:
            if remote_main:
                checks.append(Check(
                    "measurable_current_declared_unknown",
                    "FAIL",
                    "CURRENT was declared unmeasured/UNKNOWN although live GitHub main was measurable",
                    remote_main,
                ))
            else:
                checks.append(Check("measurable_current_declared_unknown", "UNKNOWN", "GitHub returned no live main SHA"))

    if LEDGER_CURRENT_CONTEXT_RE.search(text) and not data["current_main_claim"]:
        try:
            remote_main = backend.current_main()
        except BackendUnavailable as exc:
            checks.append(Check("ledger_current_requires_live_main", "UNKNOWN", str(exc)))
        else:
            if remote_main:
                checks.append(Check(
                    "ledger_current_requires_live_main",
                    "FAIL",
                    "ledger/PR body was interpreted as CURRENT without explicit live CURRENT_MAIN measurement",
                    remote_main,
                ))
            else:
                checks.append(Check("ledger_current_requires_live_main", "UNKNOWN", "cannot bind ledger CURRENT interpretation without live main"))

    comment_match = NOT_LOCATED_COMMENT_RE.search(text)
    if comment_match:
        comment_id = int(comment_match.group("after") or comment_match.group("before"))
        try:
            comment_obj = backend.issue_comment(comment_id)
        except BackendUnavailable as exc:
            checks.append(Check("exact_comment_lookup", "UNKNOWN", str(exc), str(comment_id)))
        else:
            if comment_obj is not None:
                checks.append(Check(
                    "exact_comment_lookup",
                    "FAIL",
                    "exact comment was declared NOT_YET_LOCATED although direct GitHub lookup resolves it",
                    str(comment_id),
                ))
            else:
                checks.append(Check("exact_comment_lookup", "PASS", "direct GitHub lookup confirms exact comment is absent", str(comment_id)))

    if LOCAL_CAPABILITY_TERMINAL_RE.search(text):
        if CAPABILITY_HANDOFF_EVIDENCE_RE.search(text):
            checks.append(Check(
                "local_blocker_requires_cross_surface_handoff",
                "PASS",
                "local capability blocker carries alternate-route/handoff evidence",
            ))
        else:
            checks.append(Check(
                "local_blocker_requires_cross_surface_handoff",
                "FAIL",
                "local capability gap was treated as terminal/human frontier without cross-surface handoff evidence",
            ))

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
            checks.append(Check("ledger_active", "FAIL", "direct-main write claim without COMMIT_SHA"))
        else:
            try:
                found = backend.ledger_has_sha(sha, None, data.get("ledger_ref"))
            except BackendUnavailable as exc:
                checks.append(Check("ledger_active", "UNKNOWN", str(exc)))
            else:
                if found is True:
                    checks.append(Check("ledger_active", "PASS", "commit cited in active ledger/receipt"))
                elif found is False:
                    checks.append(Check("ledger_active", "FAIL", "direct-main commit absent from active ledger/receipt"))
                else:
                    checks.append(Check("ledger_active", "UNKNOWN", "ledger could not be verified"))

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



# Reproduz fatos históricos de escrita e exclusão sem executar novas mutações.
ACTIVE_FUNNEL_MARKER = "CENTRALDARK_HUD_FUNNEL_CONTINUITY"\n\nREPLAY_SCHEMA = "centraldark.rastro-session-replay.v1"


def verify_session_replay(receipt: dict[str, Any], repo: str, backend: Any) -> dict[str, Any]:
    checks: list[Check] = []

    def check(name: str, state: str, detail: str) -> None:
        checks.append(Check(name, state, detail))

    required = ("repo", "path", "main_sha", "create_sha", "update_sha",
                "delete_sha", "created_content", "updated_content")
    missing = [key for key in required if not isinstance(receipt.get(key), str) or not receipt[key]]
    check("schema", "PASS" if receipt.get("schema") == REPLAY_SCHEMA and not missing else "FAIL",
          "schema e campos exigidos" if not missing else "campos ausentes: " + ",".join(missing))
    path = receipt.get("path")
    safe = (isinstance(path, str) and path.startswith("docs/receipts/")
            and "\\" not in path and ".." not in path.split("/"))
    check("recognized_path", "PASS" if safe else "FAIL", "caminho relativo permitido" if safe else "caminho fora da pasta de recibos")
    check("repo", "PASS" if receipt.get("repo") == repo else "FAIL", "escopo do repositório")
    names = ("main", "create", "update", "delete")
    shas = [receipt.get(name + "_sha", "") for name in names]
    valid_sha = all(isinstance(x, str) and re.fullmatch(r"[a-f0-9]{40}", x, re.I) for x in shas)
    distinct = len(set(shas)) == len(names) if valid_sha else False
    check("commit_ids", "PASS" if valid_sha and distinct else "FAIL", "quatro SHA completos e distintos")

    commits: dict[str, dict[str, Any]] = {}
    if not any(c.verdict == "FAIL" for c in checks):
        for name, sha in zip(names, shas):
            try:
                obj = backend.commit(sha)
            except BackendUnavailable:
                check(name + "_commit", "UNKNOWN", "GitHub indisponível")
                continue
            if obj is not None and str(obj.get("sha", "")).lower() == sha.lower():
                commits[name] = obj
                check(name + "_commit", "PASS", "commit encontrado")
            else:
                check(name + "_commit", "FAIL", "commit não encontrado")

        for name, prev in (("create", "main"), ("update", "create"), ("delete", "update")):
            obj = commits.get(name)
            if not obj:
                continue
            parents = obj.get("parents", [])
            if not parents:
                check(name + "_parent", "UNKNOWN", "pais do commit não disponíveis")
            else:
                same = str(parents[0].get("sha", "")).lower() == receipt[prev + "_sha"].lower()
                check(name + "_parent", "PASS" if same else "FAIL", "cadeia de commits")

        for name, expected in (("main", None), ("create", receipt["created_content"]),
                               ("update", receipt["updated_content"]), ("delete", None)):
            if name not in commits:
                continue
            try:
                actual = backend.file_at(path, receipt[name + "_sha"])
            except BackendUnavailable:
                check(name + "_readback", "UNKNOWN", "GitHub indisponível")
                continue
            same = actual == expected
            check(name + "_readback", "PASS" if same else "FAIL",
                  "conteúdo exato" if expected is not None else "ausência comprovada")

        first = commits.get("main", {}).get("commit", {}).get("tree", {}).get("sha")
        last = commits.get("delete", {}).get("commit", {}).get("tree", {}).get("sha")
        if first and last:
            check("tree_restored", "PASS" if first == last else "FAIL", "árvore original recuperada")
        elif "main" in commits and "delete" in commits:
            check("tree_restored", "UNKNOWN", "árvores indisponíveis")

    verdict = _aggregate(checks)
    proof_scope = "HISTORICAL_GITHUB_REPLAY_ONLY"
    untested_frontiers = [
        "CURRENT_WRITE_PERMISSION", "CURRENT_DELETE_BY_CENTRALDARK_MCP",
        "CURRENT_OAUTH_DISCOVERY", "LOCAL_RUNTIME_SYNC",
    ]
    stable_checks = [asdict(c) for c in checks]
    # Hash only deterministic, evidence-derived data. Never hash clock or host.
    canonical = {
        "schema": REPLAY_SCHEMA,
        "repo": repo,
        "path": path,
        "verdict": verdict,
        "checks": stable_checks,
        "proof_scope": proof_scope,
        "untested_frontiers": untested_frontiers,
    }
    canonical_bytes = json.dumps(
        canonical, sort_keys=True, ensure_ascii=True, separators=(",", ":")
    ).encode("utf-8")
    proof_digest = hashlib.sha256(canonical_bytes).hexdigest()
    return {
        "schema": REPLAY_SCHEMA,
        "owner": "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md",
        "repo": repo,
        "path": path,
        "scope": proof_scope,
        "verdict": verdict,
        "checks": stable_checks,
        "current_write": "NOT_TESTED",
        "current_delete_by_centraldark_mcp": "NOT_TESTED",
        "oauth_discovery_current": "NOT_TESTED",
        "local_runtime_sync": "NOT_TESTED",
        "modified_repository": False,
        "mensagem": "Rastro histórico reconstruído." if verdict == "PASS" else "Rastro ainda não comprovado.",
        "REPLAY_RESULT": {"verdict": verdict, "sha256": proof_digest, "checks_total": len(checks)},
        "EXECUTION_METADATA": None,
        "PROOF_SCOPE": proof_scope,
        "UNTESTED_FRONTIERS": untested_frontiers,
    }


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
    parser.add_argument("--note-file", help="Read-only metadata verification for touched Markdown notes")
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--replay-receipt", help="Reexecuta recibo histórico sem modificar arquivos")
    parser.add_argument("--replay-digest", action="store_true", help="Exibe veredito e hash canônico para comparar ambientes")
    parser.add_argument("--replay-execution-metadata", action="store_true", help="Inclui horário e sistema fora de REPLAY_RESULT")
    args = parser.parse_args(argv)


    if args.replay_receipt:
        if args.file or args.text or args.note_file:
            parser.error("--replay-receipt não combina com --file, --text ou --note-file")
        root = Path(__file__).resolve().parents[2]
        target = (root / args.replay_receipt).resolve()
        if (not target.is_relative_to(root) or not (root / "AGENTS.md").is_file()
                or not (root / "scripts/centraldark-inventory-reconcile.sh").is_file()):
            print(json.dumps({"verdict": "UNKNOWN", "reason": "ROOT_NOT_RECOGNIZED"}))
            return 2
        try:
            payload = json.loads(target.read_text(encoding="utf-8"))
            if not isinstance(payload, dict):
                raise ValueError("recibo não é objeto JSON")
        except (OSError, ValueError) as exc:
            print(json.dumps({"verdict": "UNKNOWN", "reason": "RECEIPT_NOT_READABLE"}))
            return 2
        import platform
        import time
        started = time.monotonic()
        result = verify_session_replay(payload, args.repo, GitHubBackend(args.repo))
        if args.replay_execution_metadata:
            result["EXECUTION_METADATA"] = {
                "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                "elapsed_ms": round((time.monotonic() - started) * 1000, 2),
                "platform": platform.system(),
            }
        if args.replay_digest:
            print(f"REPLAY_VERDICT={result['verdict']} REPLAY_SHA256={result['REPLAY_RESULT']['sha256']}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None))
        return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[result["verdict"]]

    if args.note_file:
        if args.file or args.text:
            parser.error("--note-file does not combine with --file or --text")
        file_path = Path(args.note_file)
        if file_path.suffix.lower() != ".md":
            parser.error("--note-file expects .md")
        try:
            note_text = file_path.read_bytes().decode("utf-8")  # preserve CRLF for stable normalized hash
        except (OSError, UnicodeError) as exc:
            print(json.dumps({"verdict": "BLOCKED", "reason": str(exc), "modified_note": False}))
            return 2
        result = verify_note_metadata(note_text, str(file_path))
        print(json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None))
        return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[result["verdict"]]

    text = _load_text(args)
    backend = GitHubBackend(args.repo)
    result = verify_text(text, args.repo, backend)
    print(json.dumps(result.as_json(), ensure_ascii=False, indent=2 if args.pretty else None))

    return {"PASS": 0, "FAIL": 1, "UNKNOWN": 2}[result.verdict]


if __name__ == "__main__":
    raise SystemExit(main())
