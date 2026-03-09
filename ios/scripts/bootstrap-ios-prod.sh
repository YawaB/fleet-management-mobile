#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

npx expo prebuild --platform ios --no-install
cd ios
pod install

echo "iOS production workspace prepared."
