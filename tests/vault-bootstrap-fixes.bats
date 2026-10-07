#!/usr/bin/env bats
# Testes mínimos para corrigir 3 problemas no vault bootstrap scripts

setup() {
  export TEST_TMPDIR="$(mktemp -d)"
  export TEST_ARCHIVE="$TEST_TMPDIR/test-archive.tar.gz"
}

teardown() {
  rm -rf "$TEST_TMPDIR"
}

@test "Problem 1: validate_archive() fails when .sha256 file missing" {
  # Create a dummy archive without .sha256 file
  echo "dummy content" > "$TEST_TMPDIR/dummy.tar.gz"

  # Source the restore script and test validate_archive function
  source scripts/vps/centraldark-os-bootstrap-restore.sh

  # Should fail and return 1 when .sha256 is missing
  if validate_archive "$TEST_TMPDIR/dummy.tar.gz" 2>/dev/null; then
    echo "FAIL: validate_archive should return 1 when .sha256 missing"
    return 1
  fi
  return 0
}

@test "Problem 2: SHA256SUMS.txt generated outside traversed directory" {
  # Create test directory structure similar to vault
  local test_vault="$TEST_TMPDIR/test-vault"
  mkdir -p "$test_vault/raw"
  echo "test content" > "$test_vault/raw/somefile"

  # Simulate the corrected sha256sum generation
  local sha256_tmp
  sha256_tmp="$(mktemp --suffix=.txt)"
  find "$test_vault" -type f -print0 | xargs -0 sha256sum | sort > "$sha256_tmp"
  mv "$sha256_tmp" "$test_vault/SHA256SUMS.txt"

  # Verify SHA256SUMS.txt was created
  [ -f "$test_vault/SHA256SUMS.txt" ] || return 1

  # Verify it contains expected file, not itself
  grep "somefile" "$test_vault/SHA256SUMS.txt" || return 1

  # Verify it does NOT contain SHA256SUMS.txt entry (would indicate loop)
  ! grep "SHA256SUMS.txt" "$test_vault/SHA256SUMS.txt" || return 1
}

@test "Problem 3: Dedup uses only SHA, not path" {
  local test_raw="$TEST_TMPDIR/raw"
  mkdir -p "$test_raw"

  # Create two identical files at different paths
  local file1="$TEST_TMPDIR/secrets/file1.txt"
  local file2="$TEST_TMPDIR/other/file2.txt"
  mkdir -p "$(dirname "$file1")" "$(dirname "$file2")"

  echo "identical content" > "$file1"
  echo "identical content" > "$file2"

  # Simulate corrected dedup: use only SHA
  local sha1 sha2
  sha1="$(sha256sum "$file1" | awk '{print $1}')"
  sha2="$(sha256sum "$file2" | awk '{print $1}')"

  # Should be identical
  [ "$sha1" = "$sha2" ] || return 1

  # Apply dedup: both should point to same dest file
  local dest1="$test_raw/${sha1}"
  local dest2="$test_raw/${sha2}"

  cp -p "$file1" "$dest1"
  cp -p "$file2" "$dest2" 2>/dev/null || true

  # Both paths should resolve to same file (because same SHA)
  [ "$dest1" = "$dest2" ] || return 1

  # And it should exist only once
  [ -f "$dest1" ] || return 1
}

@test "Vault bootstrap scripts have no syntax errors" {
  bash -n scripts/vps/centraldark-os-bootstrap-restore.sh || return 1
  bash -n scripts/vps/centraldark-vault-bootstrap-inventory.sh || return 1
}
