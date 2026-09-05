#!/usr/bin/env bash
# Test suite for health_check.sh — structural validation on Windows (Git Bash / MSYS)
# Validates functions and thresholds without sourcing the script.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HEALTH="$SCRIPT_DIR/health_check.sh"

PASS=0
FAIL=0
TOTAL=0

function assert_eq {
    local label="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL+1))
    if [ "$expected" = "$actual" ]; then
        echo "  OK $label"
        PASS=$((PASS+1))
    else
        echo "  FAIL $label"
        echo "     expected: [$expected]"
        echo "     actual:   [$actual]"
        FAIL=$((FAIL+1))
    fi
}

echo "=== health_check.sh structural test suite ==="
echo "Script: $HEALTH"
echo ""

# ── Test 1: shebang ──
TOTAL=$((TOTAL+1))
if head -1 "$HEALTH" | grep -q '^#!/'; then
    echo "  OK shebang present"
    PASS=$((PASS+1))
else
    echo "  FAIL shebang missing"
    FAIL=$((FAIL+1))
fi

# ── Test 2: functions defined ──
for func in get_proc_mem get_proc_count get_not_responding get_cpu_load get_mem_info; do
    TOTAL=$((TOTAL+1))
    if grep -q "^[[:space:]]*${func}()" "$HEALTH"; then
        echo "  OK function $func defined"
        PASS=$((PASS+1))
    else
        echo "  FAIL function $func missing"
        FAIL=$((FAIL+1))
    fi
done

# ── Test 3: thresholds ──
for var in CPU_THRESHOLD RAM_USED_THRESHOLD NOT_RESPONDING_THRESHOLD PROC_HIGH_MEM_THRESHOLD; do
    TOTAL=$((TOTAL+1))
    if grep -q "^${var}=" "$HEALTH"; then
        echo "  OK $var defined"
        PASS=$((PASS+1))
    else
        echo "  FAIL $var missing"
        FAIL=$((FAIL+1))
    fi
done

# ── Test 4: KB→MB integer division in get_proc_mem ──
TOTAL=$((TOTAL+1))
if grep -A15 'get_proc_mem()' "$HEALTH" | grep -q '/ 1024'; then
    echo "  OK get_proc_mem uses integer KB→MB"
    PASS=$((PASS+1))
else
    echo "  FAIL get_proc_mem missing integer division"
    FAIL=$((FAIL+1))
fi

# ── Test 5: bc fallback ──
TOTAL=$((TOTAL+1))
if grep -q "bc -l" "$HEALTH"; then
    echo "  OK bc fallback present"
    PASS=$((PASS+1))
else
    echo "  FAIL bc fallback missing"
    FAIL=$((FAIL+1))
fi

# ── Test 6: ram_percent variable ──
TOTAL=$((TOTAL+1))
if grep -q '^ram_percent=' "$HEALTH"; then
    echo "  OK ram_percent defined"
    PASS=$((PASS+1))
else
    echo "  FAIL ram_percent missing"
    FAIL=$((FAIL+1))
fi

# ── Test 7: old tasklist|awk sum+= pattern removed from get_proc_mem ──
TOTAL=$((TOTAL+1))
if ! grep -A15 'get_proc_mem()' "$HEALTH" | grep -qF 'sum+=\$5'; then
    echo "  OK old tasklist|awk sum+=\$5 pattern removed from get_proc_mem"
    PASS=$((PASS+1))
else
    echo "  FAIL old tasklist|awk sum+=\$5 pattern still present"
    FAIL=$((FAIL+1))
fi

# ── Test 8: trailing newline ──
TOTAL=$((TOTAL+1))
if [ "$(tail -c 1 "$HEALTH" | wc -l)" -gt 0 ]; then
    echo "  OK file ends with newline"
    PASS=$((PASS+1))
else
    echo "  FAIL missing trailing newline"
    FAIL=$((FAIL+1))
fi

# ── Test 9: CRLF check ──
TOTAL=$((TOTAL+1))
crlf_count=$(cat -A "$HEALTH" | grep -c '\\$' || true)
if [ "$crlf_count" -eq 0 ]; then
    echo "  OK no CRLF line endings"
    PASS=$((PASS+1))
else
    echo "  FAIL $crlf_count CRLF line endings found"
    FAIL=$((FAIL+1))
fi

# ── Test 10: SUSPECTS uses ram_percent ──
TOTAL=$((TOTAL+1))
if grep -q 'ram_percent' "$HEALTH" && grep -q '\$ram_percent' "$HEALTH"; then
    echo "  OK ram_percent used in status check"
    PASS=$((PASS+1))
else
    echo "  FAIL ram_percent not used in status check"
    FAIL=$((FAIL+1))
fi

# ── Summary ──
echo ""
echo "=== RESULTS ==="
echo "  Pass: $PASS"
echo "  Fail: $FAIL"
echo "  Total: $TOTAL"

if [ "$FAIL" -eq 0 ]; then
    echo ""
    echo "ALL TESTS PASS"
    exit 0
else
    echo ""
    echo "$FAIL TEST(S) FAILED"
    exit 1
fi
