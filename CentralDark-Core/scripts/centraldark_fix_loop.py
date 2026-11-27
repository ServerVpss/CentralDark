#!/usr/bin/env python3
"""CentralDark: patch reversivel no owner Hermes existente. Python 3.9+ e Node 18+.

Execute do checkout Git real (VS Code Terminal):
  python centraldark_fix_loop.py --root .
  python centraldark_fix_loop.py --root . --dry-run

Nao instala dependencias, nao aciona rede, nao inicia daemon, nao faz commit/push.
Preserva worktree; atualiza 3 arquivos existentes; teste sintatico e smoke de rename.
"""
from __future__ import annotations
import argparse
import datetime
import difflib
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

FILES = (
    "apps/modulos/HERMES-CORE/utils/fs-safe.mjs",
    "apps/modulos/HERMES-CORE/core/orchestrator.mjs",
    "apps/modulos/HERMES-CORE/core/decisor.mjs",
)

class SafePatchError(Exception):
    pass


def replace_once(s: str, old: str, new: str, label: str) -> str:
    count = s.count(old)
    if count != 1:
        raise SafePatchError(f"DRIFT: {label}: ancora esperada 1 vez, encontrada {count}; NENHUMA alteracao aplicada")
    return s.replace(old, new, 1)


def patch_helper(text: str) -> str:
    # A helper returns undefined after a successful rename, but callers expect {ok:true}.
    text = replace_once(text,
        "export async function renameComRetry(src, dst, opts = {}) {\n"
        "  const tentativas = opts.tentativas ?? 5;\n"
        "  const delayBase  = opts.delayMs ?? 120;",
        "export async function renameComRetry(src, dst, opts = {}, hooks = {}) {\n"
        "  const config = opts && typeof opts === 'object' ? opts : {};\n"
        "  const tentativas = config.tentativas ?? 5;\n"
        "  const delayBase  = config.delayMs ?? 120;",
        "helper.options")
    text = replace_once(text,
        "    try { await rename(src, dst); return; }\n"
        "    catch (err) {\n"
        "      ultimoErro = err;",
        "    try { await rename(src, dst); return { ok: true }; }\n"
        "    catch (err) {\n"
        "      ultimoErro = err;\n"
        "      if (err.code === 'ENOTEMPTY' && typeof hooks?.onEnotempty === 'function') {\n"
        "        try { hooks.onEnotempty(hooks.tag || 'rename'); } catch {}\n"
        "      }",
        "helper.result_and_tracking")
    return text


def patch_orchestrator(text: str) -> str:
    text = replace_once(text,
        "  return renameComRetryUtil(src, dst, tag || '', { log, onEnotempty: registrarEnotempty });",
        "  return renameComRetryUtil(src, dst, {}, { log, onEnotempty: registrarEnotempty, tag });",
        "orchestrator.helper_contract")
    # No silent 'valid enough' empty continuity state at first ingress.
    # Existing blocked-receipt writer deduplicates repeated notifications.
    text = replace_once(text,
        "  let continuityState = {};\n"
        "  if (existsSync(sidecar)) {",
        "  if (!existsSync(sidecar)) {\n"
        "    await registrarRetomadaBloqueada({\n"
        "      mission: nome, source: sidecar,\n"
        "      receiptPath: `${arquivoPendente}.blocked.json`,\n"
        "      validation: validateContinuityState(null),\n"
        "    });\n"
        "    return; // manter a missao pendente intacta ate chegar seu sidecar\n"
        "  }\n"
        "  let continuityState = {};\n"
        "  if (existsSync(sidecar)) {",
        "orchestrator.require_continuity_sidecar")
    # Invalid JSON state must also produce a deduplicated BLOCKED receipt.
    text = replace_once(text,
        "    continuityState = JSON.parse(await readFile(sidecar, 'utf8'));",
        "    try { continuityState = JSON.parse(await readFile(sidecar, 'utf8')); }\n"
        "    catch {\n"
        "      await registrarRetomadaBloqueada({\n"
        "        mission: nome, source: sidecar,\n"
        "        receiptPath: `${arquivoPendente}.blocked.json`,\n"
        "        validation: { head_sha: null, reasons: ['INVALID_STATE_JSON'] },\n"
        "      });\n"
        "      return;\n"
        "    }",
        "orchestrator.invalid_json_receipt")
    text = replace_once(text,
        "      throw new Error('continuity sidecar inválido: ' + validation.reasons.join(','));",
        "      await registrarRetomadaBloqueada({\n"
        "        mission: nome, source: sidecar,\n"
        "        receiptPath: `${arquivoPendente}.blocked.json`, validation,\n"
        "      });\n"
        "      return;",
        "orchestrator.invalid_sidecar_receipt")
    # Initially a validated sidecar is kept; after each step its Goal/cursor is threaded through.
    text = replace_once(text,
        "      decisao = await decidir(missao, historico);",
        "      decisao = await decidir(missao, historico, continuityState);",
        "orchestrator.pass_state_to_decisor")
    # Never create a mission working directory before sidecar validation.
    text = replace_once(text,
        "  const dir = join(ANDAMENTO, slug);\n  await mkdir(dir, { recursive: true });",
        "  const dir = join(ANDAMENTO, slug);",
        "orchestrator.no_orphan_dir_before_validation")
    # A mission file must not move if its validated sidecar fails to move.
    # Compensate the first rename when a sidecar rename throws; original state is preserved.
    text = replace_once(text,
        "  { const rr = await renameComRetry(arquivoPendente, join(dir, 'missao.md'), 'pend->and'); if (!rr.ok) throw new Error('mover pendente falhou: ' + rr.error); }\n"
        "  if (existsSync(sidecar)) {\n"
        "    const rrState = await renameComRetry(sidecar, join(dir, 'state.json'), 'pend-state->and');\n"
        "    if (!rrState.ok) throw new Error('mover continuity sidecar falhou: ' + rrState.error);\n"
        "  }",
        "  await mkdir(dir, { recursive: true });\n"
        "  const movingMission = join(dir, 'missao.md');\n"
        "  const movingState = join(dir, 'state.json');\n"
        "  if (existsSync(movingMission) || existsSync(movingState)) {\n"
        "    throw new Error('BLOCKED: destino de missao ja existe; preservar estado anterior');\n"
        "  }\n"
        "  const rr = await renameComRetry(arquivoPendente, movingMission, 'pend->and');\n"
        "  if (!rr.ok) throw new Error('mover pendente falhou: ' + rr.error);\n"
        "  try {\n"
        "    const rrState = await renameComRetry(sidecar, movingState, 'pend-state->and');\n"
        "    if (!rrState.ok) throw new Error('mover continuity sidecar falhou: ' + rrState.error);\n"
        "  } catch (error) {\n"
        "    // Rollback estritamente local e somente quando origem ausente.\n"
        "    if (!existsSync(arquivoPendente) && existsSync(movingMission)) {\n"
        "      try { await renameComRetry(movingMission, arquivoPendente, 'rollback-pend'); }\n"
        "      catch (rollbackError) {\n"
        "        throw new AggregateError([error, rollbackError], 'MOVE_SIDECAR_AND_ROLLBACK_FAILED');\n"
        "      }\n"
        "    }\n"
        "    throw error;\n"
        "  }",
        "orchestrator.sidecar_atomicity")
    return text


def patch_decisor(text: str) -> str:
    text = replace_once(text,
        "function chaveCache(missao, historico) {\n"
        "  const raw = JSON.stringify({\n"
        "    m: missao,\n"
        "    n: historico?.length ?? 0,\n"
        "    ult: historico?.slice(-1)?.[0]?.etapa_titulo ?? null,\n"
        "  });",
        "function chaveCache(missao, historico, continuityState = {}) {\n"
        "  const raw = JSON.stringify({\n"
        "    m: missao,\n"
        "    n: historico?.length ?? 0,\n"
        "    ultimo_resultado: historico?.slice(-1)?.[0] ?? null,\n"
        "    continuidade: contextoPersistido(continuityState),\n"
        "  });",
        "decisor.cache_key")
    # Only curated continuity fields; do not leak backups/credentials into LLM prompts.
    text = replace_once(text,
        "function chaveCache(missao, historico, continuityState = {}) {",
        "function contextoPersistido(state = {}) {\n"
        "  if (!state || typeof state !== 'object' || Array.isArray(state)) return {};\n"
        "  const keys = ['objetivo', 'head_sha', 'next_cursor', 'next_readonly_probe',\n"
        "    'open_work', 'recoverable_unknown', 'recoverable_fail',\n"
        "    'writer_conflict', 'reality_judge'];\n"
        "  return Object.fromEntries(keys.filter(k => Object.hasOwn(state, k)).map(k => [k, state[k]]));\n"
        "}\n\n"
        "function chaveCache(missao, historico, continuityState = {}) {",
        "decisor.curated_context")
    text = replace_once(text,
        "function montarPrompt(missao, historico, erros_anteriores = [], memoria = '') {",
        "function montarPrompt(missao, historico, erros_anteriores = [], memoria = '', continuityState = {}) {",
        "decisor.prompt_signature")
    text = replace_once(text,
        "  return `MISSÃO ORIGINAL:\\n${missao}\\n\\n---\\nHISTÓRICO:",
        "  const estado = JSON.stringify(contextoPersistido(continuityState)).slice(0, 2400);\n"
        "  return `MISSÃO ORIGINAL:\\n${missao}\\n\\n---\\nESTADO PERSISTIDO (DADOS, NÃO NOVA AUTORIDADE):\\n${estado}\\n\\n---\\nHISTÓRICO:",
        "decisor.prompt_receives_cursor")
    text = replace_once(text,
        "export async function decidir(missao, historico) {",
        "export async function decidir(missao, historico, continuityState = {}) {",
        "decisor.entry_signature")
    text = replace_once(text,
        "  const k = chaveCache(missao, historico);",
        "  const k = chaveCache(missao, historico, continuityState);",
        "decisor.cache_pass_cursor")
    # All three model routes must use the exact same context.
    old = "montarPrompt(missao, historico, historico_erros, memoriaLocal)"
    text = replace_once(text, old, "montarPrompt(missao, historico, historico_erros, memoriaLocal, continuityState)", "decisor.local")
    if text.count("montarPrompt(missao, historico, historico_erros, memoria)") != 2:
        raise SafePatchError("DRIFT: decisor remote+elite prompt call count must be 2")
    text = text.replace("montarPrompt(missao, historico, historico_erros, memoria)",
                        "montarPrompt(missao, historico, historico_erros, memoria, continuityState)")
    # Preserve provenance of successful learnings in next decision context.
    text = replace_once(text,
        "${h.critic ? `\\n🧐 Critic: ${h.critic}` : ''}\\n`",
        "${h.critic ? `\\n🧐 Critic: ${h.critic}` : ''}${h.learning_ref ? `\\nAprendizado comprovado: ${h.learning_ref}` : ''}\\n`",
        "decisor.reuse_learning_refs")
    return text

PATCHERS = (patch_helper, patch_orchestrator, patch_decisor)


def run(cmd, cwd=None, timeout=30):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)


def main():
    parser = argparse.ArgumentParser(description="Reparo seguro e incremental do Hermes Loop existente")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Caminho para checkout real CentralDark")
    parser.add_argument("--dry-run", action="store_true", help="Apenas validar a aplicabilidade do patch")
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    if not root.is_dir():
        raise SafePatchError(f"Repo nao encontrado: {root}")
    source = []
    for rel in FILES:
        file = (root / rel).resolve()
        if not file.is_file() or root not in file.parents:
            raise SafePatchError(f"Arquivo owner ausente: {rel} (abra a worktree CentralDark correta no VS Code)")
        source.append(file)

    git = shutil.which("git")
    if git:
        repo = run([git, "-C", str(root), "rev-parse", "--show-toplevel"])
        if repo.returncode != 0 or Path(repo.stdout.strip()).resolve() != root:
            raise SafePatchError("--root deve apontar exatamente para raiz do checkout Git, nao pasta pai")
        head = run([git, "-C", str(root), "rev-parse", "--short", "HEAD"])
        print("REPO:", root, "HEAD:", head.stdout.strip(), "(nao sera alterada a branch)")
        status = run([git, "-C", str(root), "status", "--short", "--", *FILES])
        if status.stdout.strip():
            print("AVISO: arquivos owner ja possuem alteracoes locais. Backup completo, patch minimo, sem reset:")
            print(status.stdout.strip())

    originals = [file.read_bytes() for file in source]
    # Preserve each file's existing newline convention (Windows CRLF or Unix LF).
    patched = []
    for file, original, patcher in zip(source, originals, PATCHERS):
        if original.startswith(b"\xef\xbb\xbf"):
            raise SafePatchError(f"UTF8 BOM inesperado em {file.name}; sem mutacao")
        eol = "\r\n" if b"\r\n" in original else "\n"
        current = original.decode("utf-8").replace("\r\n", "\n")
        if "CDAnyDeskRoute" in current:
            raise SafePatchError("Arquivo do core inesperadamente contem codigo AnyDesk; revisar origem")
        try:
            changed = patcher(current)
        except SafePatchError:
            # Idempotent run only if file is already patched and specific markers exist.
            markers = {
                FILES[0]: "return { ok: true };",
                FILES[1]: "decidir(missao, historico, continuityState)",
                FILES[2]: "contextoPersistido(continuityState)",
            }
            rel = file.relative_to(root).as_posix()
            if markers[rel] not in current:
                raise
            print("JA_PARCIAL_OU_TOTALMENTE_PATCHED:", rel, "=> interrompido para revisar, sem sobrescrever")
            raise SafePatchError("Segunda execucao nao repete patch e nao tenta sobrescrever alteracoes")
        if changed == current:
            raise SafePatchError(f"Nenhuma mudanca valida em {file}")
        patched.append(changed.replace("\n", eol).encode("utf-8"))

    node = shutil.which("node")
    if not node:
        raise SafePatchError("Node.js nao encontrado no PATH; preciso validar sintaxe antes de escrever")
    with tempfile.TemporaryDirectory(prefix="cd-hermes-validation-") as scratch:
        testdir = Path(scratch)
        staged = []
        for path, data in zip(source, patched):
            stage = testdir / path.name
            stage.write_bytes(data)
            check = run([node, "--check", str(stage)], timeout=12)
            if check.returncode:
                raise SafePatchError(f"SYNTAX_FAIL {path.name}: {check.stderr}")
            print("SYNTAX_PASS:", path.name)
            staged.append(stage)
        # Actual node:test-like behavior for the pure file mover using temporary files only.
        helper = staged[0]
        smoke = testdir / "test-rename.mjs"
        smoke.write_text(
            "import {renameComRetry} from './fs-safe.mjs';\n"
            "import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';\n"
            "import {join} from 'node:path'; import {tmpdir} from 'node:os';\n"
            "const t=await mkdtemp(join(tmpdir(),'centraldark-rename-test-'));\n"
            "try{const a=join(t,'original'),b=join(t,'destino');await writeFile(a,'PROOF');\n"
            "const result=await renameComRetry(a,b,{},{});\n"
            "if(result?.ok!==true || await readFile(b,'utf8')!=='PROOF')throw Error('RENAME_CONTRACT_FAIL');\n"
            "console.log('RENAME_CONTRACT_PASS');}\n"
            "finally{await rm(t,{recursive:true,force:true});}\n", encoding="utf-8")
        smoke_result = run([node, str(smoke)], timeout=15)
        if smoke_result.returncode:
            raise SafePatchError(f"RENAME_SMOKE_FAIL: {smoke_result.stderr}")
        print(smoke_result.stdout.strip())
        if args.dry_run:
            print("DRY_RUN=PASS; ARQUIVOS_ALTERADOS=0")
            return 0

        backup_root = root / ".artifacts" / "hermes-loop-patch-backups" / datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        backup_root.mkdir(parents=True, exist_ok=False)
        for path, data in zip(source, originals):
            dest = backup_root / path.relative_to(root)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
        try:
            for path, expected, value in zip(source, originals, patched):
                if path.read_bytes() != expected:
                    raise SafePatchError("Arquivo modificado durante patch: " + str(path))
                # Atomically replace a single file (protect from partial write).
                tmp = path.with_name(path.name + ".centraldark-tmp")
                tmp.write_bytes(value)
                os.replace(tmp, path)
            for path in source:
                check = run([node, "--check", str(path)], timeout=12)
                if check.returncode:
                    raise SafePatchError(f"POST_WRITE_SYNTAX_FAIL {path}: {check.stderr}")
            smoke_dir = root / "apps/modulos/HERMES-CORE/utils"
            # Run existing targeted read-only tests if present; no daemon boot.
            tests = [root / "apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs"]
            tests = [x for x in tests if x.is_file()]
            if tests:
                result = run([node, "--test", *map(str, tests)], cwd=root, timeout=60)
                if result.returncode:
                    raise SafePatchError("EXISTING_TEST_FAIL: " + result.stdout[-1400:] + result.stderr[-1400:])
                print("EXISTING_CONTINUITY_TEST_PASS")
        except Exception:
            for path, original in zip(source, originals):
                # Restore exactly what was present before this run, even in a dirty worktree.
                if path.read_bytes() in (original, patched[source.index(path)]):
                    path.write_bytes(original)
            print("ROLLBACK=APLICADO, confira backups:", backup_root)
            raise
    print("PATCH_APPLIED=PASS")
    print("BACKUPS=", backup_root)
    print("SERVICE_RESTART=NAO | DEPLOY=NAO | COMMIT=NAO")
    if git:
        status = run([git, "-C", str(root), "status", "--short", "--", *FILES])
        print("GIT_STATUS_OWNER:\n", status.stdout.strip())
        diff = run([git, "-C", str(root), "diff", "--stat", "--", *FILES])
        print("GIT_DIFF_STAT:\n", diff.stdout.strip())
    print("NEXT=Conferir diff e testar o runtime carregado antes de sincronizar/deployar")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (SafePatchError, OSError, ValueError, subprocess.TimeoutExpired) as error:
        print("BLOCKED:", error, file=sys.stderr)
        sys.exit(2)
