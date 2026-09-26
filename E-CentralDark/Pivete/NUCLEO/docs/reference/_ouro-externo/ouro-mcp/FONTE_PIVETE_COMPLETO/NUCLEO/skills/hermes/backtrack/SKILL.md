---
name: backtrack
category: hermes
description: Restores the session to a previously saved checkpoint using the session capsule.
---

## Purpose

This skill allows Hermes to return to a previously saved operational state, specifically the directory and verified files of a created session capsule. This is useful for resuming work from a known good state or for debugging by reverting to a checkpoint.

## Usage

To use this skill, simply call it with `skill_use(name='backtrack')` or directly `backtrack()`. It will:
1. Read the `VALIDATION.md` file from the latest created session capsule.
2. Extract the `PACKAGE_DIR` (the root of the capsule) from it.
3. Change the current working directory of the session to this `PACKAGE_DIR`.
4. Optionally, compare the files in `PACKAGE_DIR` against `MANIFEST.sha256` to verify integrity.

## Steps

1.  **Locate the latest capsule:**
    -   The skill will look for the `VALIDATION.md` file within the last created capsule (e.g., `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\LABORATORIO\HERMES-SESSION-CAPSULE-YYYYMMDD\VALIDATION.md`).
    -   The capsule path is currently defined based on the `OUTPUT_ROOT` from `COMANDO-HERMES-EXTRAIR-MEMORIA-DA-SESSAO.md`.

2.  **Read `VALIDATION.md`:**
    -   Extract the `PACKAGE_DIR` and `MANIFEST_SHA256` from the file.

3.  **Change working directory:**
    -   Use the `terminal` tool to navigate to the `PACKAGE_DIR` (`cd <PACKAGE_DIR>`).

4.  **Verify integrity (optional, will be a sub-command):**
    -   Read `MANIFEST.sha256` from the `PACKAGE_DIR`.
    -   Calculate SHA-256 for all files in `PACKAGE_DIR` (excluding `MANIFEST.sha256`).
    -   Compare the calculated hashes with the manifest.
    -   Report PASS or FAIL.

## Example Call

```python
skill_use(name='backtrack')
```

## Pitfalls

-   **Capsule not found:** If `VALIDATION.md` or the capsule directory does not exist, the skill will report an error.
-   **Invalid `PACKAGE_DIR`:** If the extracted `PACKAGE_DIR` is not a valid path, the `cd` command will fail.
-   **Hash mismatch:** If integrity verification is run and hashes do not match, it indicates tampering or corruption.
-   **No explicit save:** This skill relies on a previously *created* capsule. It does not create new capsules itself.

## Verification

After executing, check the terminal output for:
-   Confirmation of the working directory change.
-   (If verification is added later) The integrity check result (PASS/FAIL).
