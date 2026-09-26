#!/bin/bash
# Local wrapper to emulate what the real run-once does.
# This will move the files inside our local sandbox and commit.
mkdir -p tools/legacy-fixes

find . -maxdepth 1 -type f \( -name "fix-*.cjs" -o -name "test-*.cjs" -o -name "test-*.sh" \) -print > /tmp/candidatos.txt

while IFS= read -r file; do
   git mv "$file" tools/legacy-fixes/ || mv "$file" tools/legacy-fixes/
done < /tmp/candidatos.txt

git add tools/legacy-fixes/
