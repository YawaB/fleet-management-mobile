/**
 * Version bump script — run automatically before each APK build.
 * Increments the patch version in both app.json and package.json.
 * e.g.  1.0.0 → 1.0.1 → 1.0.2 …
 *
 * Usage:  node scripts/bump-version.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function bumpPatch(version) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: "${version}"`);
  }
  parts[2] += 1;
  return parts.join(".");
}

// ── app.json ──────────────────────────────────────────────────────────────────
const appJsonPath = path.join(ROOT, "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const oldVersion = appJson.expo.version;
const newVersion = bumpPatch(oldVersion);
appJson.expo.version = newVersion;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n");

// ── package.json ──────────────────────────────────────────────────────────────
const pkgJsonPath = path.join(ROOT, "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
pkgJson.version = newVersion;
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");

console.log(`✅  Version bumped: ${oldVersion} → ${newVersion}`);
