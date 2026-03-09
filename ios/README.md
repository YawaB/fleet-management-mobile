# iOS production bootstrap (Expo + React Native Firebase)

Ce dossier contient l'automatisation et les templates pour générer un projet `ios/` prêt pour la production.

## Fichiers clés

- `scripts/bootstrap-ios-prod.sh` : génération du projet natif iOS + sécurisation de la config release.
- `scripts/prepare-prod.sh` : alias vers le script principal.
- `config/Release.xcconfig.template` : template de variables release.
- `firebase/GoogleService-Info.prod.plist.example` : exemple de structure Firebase iOS (à remplacer par le vrai fichier).

## Utilisation rapide

1. Copier le fichier Firebase production reçu depuis la console Firebase dans :
   `ios/firebase/GoogleService-Info.prod.plist`
2. Exécuter :
   ```bash
   ./ios/scripts/bootstrap-ios-prod.sh
   ```
3. Ouvrir ensuite le workspace généré :
   ```bash
   open ios/FleetManagement.xcworkspace
   ```

## Notes

- Le script vérifie la présence du fichier Firebase iOS avant de générer/patcher.
- Le script applique des options optimisées release (Flipper désactivé, frameworks statiques, config release dédiée).
