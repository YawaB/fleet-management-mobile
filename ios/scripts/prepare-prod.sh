#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f "./GoogleService-Info.plist" ]]; then
  echo "[ERROR] GoogleService-Info.plist manquant à la racine du projet."
  exit 1
fi

npx expo prebuild --platform ios --clean --no-install

cd ios
pod install --repo-update

echo "✅ iOS prêt pour un build production (archive/TestFlight)."
