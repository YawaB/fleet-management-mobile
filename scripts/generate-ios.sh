#!/usr/bin/env bash
set -euo pipefail

if [ -d ios ]; then
  echo "iOS directory already exists."
  exit 0
fi

echo "Generating iOS native project with Expo prebuild..."
if npx expo prebuild --platform ios --no-install; then
  echo "iOS directory generated successfully."
else
  echo "Expo could not download the bare template from the current network."
  echo "Please ensure access to the npm package expo-template-bare-minimum then retry:"
  echo "  npx expo prebuild --platform ios --no-install"
  exit 1
fi
