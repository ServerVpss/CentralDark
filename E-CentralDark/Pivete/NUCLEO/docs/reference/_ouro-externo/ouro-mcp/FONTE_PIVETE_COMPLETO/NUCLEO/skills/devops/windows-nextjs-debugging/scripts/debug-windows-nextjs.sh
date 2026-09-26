#!/usr/bin/env bash
# Quick validation script for Windows Next.js/TurboPack debugging
# Usage: ./scripts/debug-windows-nextjs.sh [check|clear|rebuild]

set -euo pipefail

ACTION="${1:-check}"
OMNI_DIR="${OMNI_DIR:-/e/CentralDark/MOTOR-TESTE/OmniRoute}"

case "$ACTION" in
    check)
        echo "=== Windows Next.js Debug Checks ==="
        echo ""
        echo "1. FTS5 validation:"
        node -e "const db = require('better-sqlite3')(':memory:'); db.exec('CREATE VIRTUAL TABLE t USING fts5(x)'); console.log('FTS5: OK')" 2>&1 || echo "FTS5: FAIL"
        
        echo ""
        echo "2. TurboPack cache exists:"
        if [ -d "$OMNI_DIR/.build/next" ]; then
            echo "Cache found at $OMNI_DIR/.build/next"
            du -sh "$OMNI_DIR/.build/next" 2>/dev/null
        else
            echo "No TurboPack cache found"
        fi
        
        echo ""
        echo "3. NODE_ENV:"
        echo "NODE_ENV=${NODE_ENV:-not set}"
        
        echo ""
        echo "4. SQLite lock files:"
        find ~/.config/omniroute -name "*.sqlite*" -o -name "*.sqlite-*" 2>/dev/null || echo "No lock files found"
        ;;
    clear)
        echo "=== Clearing TurboPack cache ==="
        rm -rf "$OMNI_DIR/.build/next"
        echo "Cache cleared"
        ;;
    rebuild)
        echo "=== Rebuilding better-sqlite3 ==="
        cd "$OMNI_DIR"
        npm rebuild better-sqlite3
        # Validate
        node -e "const db = require('better-sqlite3')(':memory:'); db.exec('CREATE VIRTUAL TABLE t USING fts5(x)'); console.log('FTS5: OK')"
        ;;
    *)
        echo "Usage: $0 [check|clear|rebuild]"
        echo "  check   - Run all diagnostic checks"
        echo "  clear   - Clear TurboPack cache"
        echo "  rebuild - Rebuild better-sqlite3 native module"
        exit 1
        ;;
esac