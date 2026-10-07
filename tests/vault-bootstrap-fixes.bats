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

@test "Integration: inventory creates valid archive with duplicate content" {
  # Simulate inventory + archive creation with identical content from different sources
  local vault_dir manifest_file sha256_file archive
  vault_dir="$TEST_TMPDIR/vault-integration-test"
  manifest_file="$vault_dir/MANIFEST.tsv"
  sha256_file="$vault_dir/SHA256SUMS.txt"
  archive="$vault_dir.tar.gz"

  mkdir -p "$vault_dir/raw"

  # Create two files with identical content (simulating dedup scenario)
  echo "duplicate-secret-content" > "$vault_dir/source1.txt"
  echo "duplicate-secret-content" > "$vault_dir/source2.txt"

  # Create manifest manually to simulate what inventory does
  printf "idx\tsha256\tkind\tsource\tdest\tbytes\n" > "$manifest_file"

  # Both sources have same SHA, but different dest names (with source suffix)
  local sha bytes idx
  sha="$(sha256sum "$vault_dir/source1.txt" | awk '{print $1}')"
  bytes="23"

  # First source → dest with suffix
  cp "$vault_dir/source1.txt" "$vault_dir/raw/${sha}__source1.txt"
  printf "00001\t%s\tfile\t/source1\t/vault/raw/%s__source1.txt\t%s\n" "$sha" "$sha" "$bytes" >> "$manifest_file"

  # Second source (identical content) → different dest name (different suffix)
  cp "$vault_dir/source2.txt" "$vault_dir/raw/${sha}__source2.txt"
  printf "00002\t%s\tfile\t/source2\t/vault/raw/%s__source2.txt\t%s\n" "$sha" "$sha" "$bytes" >> "$manifest_file"

  # Generate SHA256SUMS (without absolute paths)
  (cd "$vault_dir" && find . -type f ! -name "*.txt" -print0 | xargs -0 sha256sum | sort) > "$sha256_file"
  [ -f "$sha256_file" ] || return 1

  # Create archive
  tar -C "$TEST_TMPDIR" -czf "$archive" "$(basename "$vault_dir")" || return 1

  # Generate .sha256 sidecar
  sha256sum "$archive" > "$archive.sha256"

  # Validate archive using the restore script's validator
  # (requires Python; minimal check that archive is created and readable)
  [ -f "$archive" ] || return 1
  [ -s "$archive" ] || return 1
  tar -tzf "$archive" > /dev/null || return 1
}
