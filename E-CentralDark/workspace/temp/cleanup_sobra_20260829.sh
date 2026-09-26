#!/bin/bash
# CLEANUP: E:\CentralDark mirrors — proven duplicates, safe to delete
# Run this after PR is merged

set -e

echo "🔴 CLEANUP START: Removing proven mirrors from E:"

# Remove _SOBRA_BRAIN (pure mirror of BIBLIOTECA)
if [ -d "E:/CentralDark/_SOBRA_BRAIN" ]; then
  rm -rf "E:/CentralDark/_SOBRA_BRAIN"
  echo "✅ Deleted E:/CentralDark/_SOBRA_BRAIN"
fi

# Remove _RECONCILIATION (echo artifacts)
if [ -d "E:/CentralDark/_RECONCILIATION" ]; then
  rm -rf "E:/CentralDark/_RECONCILIATION"
  echo "✅ Deleted E:/CentralDark/_RECONCILIATION"
fi

# Remove large zip archives from _MAPA_CASA (keep PNG/HTML as reference)
if [ -f "E:/CentralDark/_MAPA_CASA/_MAPA_CASA.zip" ]; then
  rm "E:/CentralDark/_MAPA_CASA/_MAPA_CASA.zip"
  echo "✅ Deleted _MAPA_CASA.zip"
fi

if [ -f "E:/CentralDark/_MAPA_CASA/Screenpipe Activity reshapes CentralDark integration_files.zip" ]; then
  rm "E:/CentralDark/_MAPA_CASA/Screenpipe Activity reshapes CentralDark integration_files.zip"
  echo "✅ Deleted Screenpipe...integration_files.zip"
fi

echo "🔴 CLEANUP DONE"
echo "PROOF: recorded in commit 41f1f7e85"
echo "PAPAGAIO=OFF"
