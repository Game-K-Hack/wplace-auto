# Extension JSON Stringify Modifier

Cette extension Firefox/Chrome modifie la fonction `JSON.stringify` pour intercepter les objets contenant les clés `colors`, `coords` et `t`, et remplace les valeurs `colors` et `coords` par des données récupérées depuis des APIs externes.

## Fonctionnement

1. **Détection** : L'extension détecte quand `JSON.stringify` est appelé sur un objet contenant les clés `colors`, `coords` et `t`
2. **Récupération des données** : 
   - Fait une requête GET vers `https://backend.wplace.live/me` pour récupérer `me.charges.count`
   - Utilise cette valeur pour faire une requête GET vers `http://127.0.0.1:5000/pixels/<count>`
3. **Remplacement** : Remplace les valeurs `colors` et `coords` dans l'objet original par les nouvelles valeurs
4. **Retour** : Retourne le JSON stringifié avec les nouvelles valeurs

## Installation

### 1. Préparer les fichiers

Créez un nouveau dossier pour l'extension et placez-y tous les fichiers :

```
json-stringify-modifier/
├── manifest.json
├── content.js
├── background.js
├── popup.html
├── popup.js
└── README.md
```

### 2. Charger l'extension dans Firefox

1. Ouvrez Firefox et allez dans `about:debugging`
2. Cliquez sur "Ce Firefox" (This Firefox)
3. Cliquez sur "Charger un module complémentaire temporaire" (Load Temporary Add-on)
4. Sélectionnez le fichier `manifest.json` dans votre dossier
5. L'extension devrait maintenant apparaître dans la liste

### 3. Alternative pour Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le "Mode développeur" (Developer mode) en haut à droite
3. Cliquez sur "Charger l'extension non empaquetée" (Load unpacked)
4. Sélectionnez le dossier contenant les fichiers de l'extension

### 4. Vérifier l'installation

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Une popup s'ouvre avec le statut "Extension Active"
3. Vous pouvez cliquer sur "Tester la modification" pour vérifier le fonctionnement

1. Cliquez sur l'icône de l'extension dans la barre d'outils de Chrome
2. Une popup s'ouvre avec le statut "Extension Active"
3. Vous pouvez cliquer sur "Tester la modification" pour vérifier le fonctionnement

## Configuration requise

### Serveur local
Assurez-vous qu'un serveur est en cours d'exécution sur `http://127.0.0.1:5000` avec l'endpoint `/pixels/<count>` qui retourne un JSON avec les propriétés `colors` et `coords`.

Exemple de réponse attendue :
```json
{
  "colors": ["#FF0000", "#00FF00", "#0000FF"],
  "coords": [[10, 20], [30, 40], [50, 60]]
}
```

### API externe
L'extension doit pouvoir accéder à `https://backend.wplace.live/me` qui doit retourner un JSON avec la structure :
```json
{
  "charges": {
    "count": 123
  }
}
```

## Utilisation

Une fois l'extension installée et active, elle interceptera automatiquement tous les appels à `JSON.stringify` sur la page web courante. Quand un objet contient les clés `colors`, `coords` et `t`, l'extension :

1. Fait les requêtes nécessaires
2. Remplace les données
3. Retourne le JSON modifié

## Débogage

### Console du navigateur
Ouvrez les outils de développement (F12) et consultez la console pour voir les logs de l'extension :
- "JSON.stringify modifié avec succès" confirme que l'override est actif
- "Détection des clés colors, coords et t - Modification en cours..." indique qu'une modification est en cours

### Logs de l'extension
1. Allez dans `chrome://extensions/`
2. Cliquez sur "Détails" de l'extension
3. Cliquez sur "Inspecter les vues" > "Service Worker" pour voir les logs du background script

### Test manuel
Vous pouvez tester la modification directement dans la console du navigateur :
```javascript
var testObj = {
  colors: ['#OLD1', '#OLD2'],
  coords: [[1, 2, 3, 4]],
  t: "token"
};

console.log(JSON.stringify(testObj));
// Les valeurs colors et coords devraient être remplacées
```

## Sécurité

L'extension demande les permissions suivantes :
- `activeTab` : Pour injecter le script dans l'onglet actuel
- `host_permissions` : Pour faire des requêtes vers les APIs spécifiées

## Résolution des problèmes

### L'extension ne fonctionne pas
1. Vérifiez que l'extension est activée dans `chrome://extensions/`
2. Rechargez la page web où vous voulez utiliser la modification
3. Vérifiez les logs dans la console du navigateur

### Erreurs de requête
1. Assurez-vous que votre serveur local est démarré sur le port 5000
2. Vérifiez votre connexion internet pour l'API externe
3. Consultez les logs du Service Worker pour plus de détails

### JSON.stringify ne semble pas modifié
1. Ouvrez la console et cherchez le message "JSON.stringify modifié avec succès"
2. Assurez-vous que votre objet contient bien les trois clés : `colors`, `coords` et `t`
3. Testez avec l'exemple fourni dans la section "Test manuel"