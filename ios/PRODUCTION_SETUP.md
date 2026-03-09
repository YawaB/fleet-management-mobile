# Setup iOS production

Guide de mise en production iOS pour ce projet React Native (Expo prebuild) avec Firebase Messaging.

## 1) Pré-requis

- macOS + Xcode 15+
- CocoaPods installé
- Compte Apple Developer (Team ID)
- `eas-cli`
- Fichier Firebase iOS de production : `GoogleService-Info.plist`

## 2) Fichier Firebase

Placer le fichier dans :

```bash
ios/firebase/GoogleService-Info.prod.plist
```

> Ce fichier est ignoré par git (secret), il faut donc le fournir dans chaque environnement de build (local/CI).

## 3) Générer la base iOS + patch production

Depuis la racine du repo :

```bash
./ios/scripts/bootstrap-ios-prod.sh
```

Ce script :

- lance `expo prebuild --platform ios --clean`
- copie `ios/firebase/GoogleService-Info.prod.plist` vers `GoogleService-Info.plist` (chemin attendu Expo)
- applique une config release stricte dans `ios/FleetManagement/Release.xcconfig`

## 4) Build cloud recommandé (EAS)

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## 5) Validation rapide locale

```bash
plutil -lint GoogleService-Info.plist
xcodebuild -workspace ios/FleetManagement.xcworkspace -scheme FleetManagement -showBuildSettings | head
```
