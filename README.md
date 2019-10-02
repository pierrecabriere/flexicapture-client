# Flexicapture-client 🌀

Flexicapture-client permet de surveiller un serveur plugandwork et d'envoyer un dossier (constitué de documents) à un serveur flexicapture lorsqu'il est pret.

## Configuration

Toute la configuration nécessaire au bon fonctionnement du script se trouve dans le fichier **.env** à la racine du dossier du script.<br/>
Les champs suivants sont configurables :<br/>

`FLEXICAPTURE_HOST` l'adresse du serveur flexicapture sur lequel l'API est accessible.<br/>
`FLEXICAPTURE_USERNAME` l'identifiant de connexion à L'API flexicapture.<br/>
`FLEXICAPTURE_PASSWORD` le mot de passe de connexion à L'API flexicapture.<br/>
`FLEXICAPTURE_PROJECT_GUID` le GUID du projet flexicapture dans lequel les documents seront envoyés.<br/>
`PAW_HOST` l'adresse du serveur plugandwork sur lequel l'API est accessible.<br/>
`PAW_USERNAME` l'identifiant de connexion à L'API plugandwork.<br/>
`PAW_PASSWORD` le mot de passe de connexion à L'API plugandwork.<br/>

## Installation

Flexicapture-client peut être installé sur n'importe quelle machine qui peut se connecter aux APIs de plugandwork et flexicapture.<br/>

### Prérequis

Le seul prérequis pour exécuter ce script est d'avoir nodejs installé sur la machine.<br/>
Pour vérifier si nodejs est installé, exécutez la commande `node -v`.<br/>
Pour l'installer, rendez-vous sur [https://nodejs.org](https://nodejs.org).<br/>
Les dépendances du script doivent être installées, avant de l'exécuter vérifiez que le dossier **node_modules** est bien présent dans le dossier du script.
Si ce n'est pas le cas, vous devez les installer avec la commande `npm install` à lancer depuis le dossier du script.

### Exécution

Pour lancer le script, il suffit d'exécuter le script node **dist/index.js** avec la commande `node dist/index.js`.<br/>
Si le script ne se lance pas, vérifiez que le dossier **build** est bien présent dans le dossier du script.
Si ce n'est pas le cas, vous devez recompiler le script avec la commande `npm run build` à lancer depuis le dossier du script.<br/>
Vous pouvez également lancer la commande en tache de fond en rajoutant le signe **&** à la fin de la commande : `node dist/index.js &`.

### Spécifications

Les dossiers plugandwork sont envoyés au serveur flexicapture via des Batchs.<br/>
Chaque document du dossier envoyé est représenté par un Batch avec les propriétés suivantes :<br/>

`kyc_id` l'identifiant du document plugandwork. La modification des métas effectuée par flexicapture devra être appliquée à cet identifiant.<br/>
`kyc_type` le type de document à traiter côté flexicapture. Ce type représente une famille plugandwor.<br/>