# Setup iOS production

Ce dossier fournit une base de configuration iOS orientée production pour le projet Expo/React Native.

## 1) Pré-requis

- Xcode 15+
- CocoaPods installé
- Compte Apple Developer + Team ID
- `GoogleService-Info.plist` placé à la racine du projet

## 2) Configuration Expo/EAS

- `app.json`
  - `expo.ios.bundleIdentifier`
  - `expo.ios.buildNumber`
  - `expo.ios.googleServicesFile`
  - permissions iOS dans `expo.ios.infoPlist`
- `eas.json`
  - profil `build.production.ios` configuré pour incrémenter `buildNumber`
  - section `submit.production.ios.appleTeamId` à remplacer

## 3) Génération du projet natif iOS

Depuis la racine du repo :

```bash
./ios/scripts/prepare-prod.sh
```

Ensuite, ouvrir le workspace généré :

```bash
open ios/FleetManagement.xcworkspace
```

## 4) Build release local (optionnel)

```bash
cd ios
xcodebuild \
  -workspace FleetManagement.xcworkspace \
  -scheme FleetManagement \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  clean archive
```

## 5) Build cloud recommandé (EAS)

```bash
eas build --platform ios --profile production
```

Puis soumission :

```bash
eas submit --platform ios --profile production
```
