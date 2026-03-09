#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
TMP_BACKUP_DIR="$(mktemp -d)"
FIREBASE_SRC="$IOS_DIR/firebase/GoogleService-Info.prod.plist"
FIREBASE_DST="$ROOT_DIR/GoogleService-Info.plist"
RELEASE_TEMPLATE_REL="config/Release.xcconfig.template"

cleanup() {
  rm -rf "$TMP_BACKUP_DIR"
}
trap cleanup EXIT

cd "$ROOT_DIR"

echo "[1/6] Vérification Firebase iOS..."
if [ ! -f "$FIREBASE_SRC" ]; then
  echo "❌ Fichier manquant: $FIREBASE_SRC"
  echo "Copiez votre GoogleService-Info.plist de production depuis Firebase."
  exit 1
fi

echo "[2/6] Sauvegarde des assets custom ios/..."
mkdir -p "$TMP_BACKUP_DIR/ios"
cp -R "$IOS_DIR/scripts" "$TMP_BACKUP_DIR/ios/"
cp -R "$IOS_DIR/config" "$TMP_BACKUP_DIR/ios/"
cp -R "$IOS_DIR/firebase" "$TMP_BACKUP_DIR/ios/"
if [ -f "$IOS_DIR/README.md" ]; then cp "$IOS_DIR/README.md" "$TMP_BACKUP_DIR/ios/"; fi
if [ -f "$IOS_DIR/PRODUCTION_SETUP.md" ]; then cp "$IOS_DIR/PRODUCTION_SETUP.md" "$TMP_BACKUP_DIR/ios/"; fi

echo "[3/6] Copie Firebase vers la racine (chemin attendu par Expo)..."
cp "$FIREBASE_SRC" "$FIREBASE_DST"
plutil -lint "$FIREBASE_DST" >/dev/null

echo "[4/6] Génération du projet natif iOS via Expo prebuild..."
npx expo prebuild --platform ios --clean

echo "[5/6] Restauration des assets custom ios/..."
cp -R "$TMP_BACKUP_DIR/ios/scripts" "$IOS_DIR/"
cp -R "$TMP_BACKUP_DIR/ios/config" "$IOS_DIR/"
cp -R "$TMP_BACKUP_DIR/ios/firebase" "$IOS_DIR/"
if [ -f "$TMP_BACKUP_DIR/ios/README.md" ]; then cp "$TMP_BACKUP_DIR/ios/README.md" "$IOS_DIR/"; fi
if [ -f "$TMP_BACKUP_DIR/ios/PRODUCTION_SETUP.md" ]; then cp "$TMP_BACKUP_DIR/ios/PRODUCTION_SETUP.md" "$IOS_DIR/"; fi

echo "[6/6] Application config release + Pods..."
TARGET_XCCONFIG="$IOS_DIR/FleetManagement/Release.xcconfig"
cp "$IOS_DIR/$RELEASE_TEMPLATE_REL" "$TARGET_XCCONFIG"
(
  cd "$IOS_DIR"
  pod install
)

echo "✅ iOS production prêt. Ouvrez: ios/FleetManagement.xcworkspace"
