# To-do list

To-do list est une application mobile pour la manipulation des notes personnalisées, ainsi que le partage de quelques-unes.

En se servant du Framework _**Ionic 4**_, de la plateforme _**Firebase**_ et de l'architecture d'_**Angular 2+**_, ce projet a été une bonne approche pour 
se familiariser avec la programmation mobile intégrant plusieurs fonctionnalités intéressantes.

## 1. Fonctionnalités réalisées

Après avoir fini les fonctionnalités de bases exigées comme: 

* le stockage des données dans _**Cloud Firestore**_;
* l'authentification _**Google**_ et native;
* la mobilité, en déployant l'application sur Android;
* le Splash personnalisé avec une animation CSS.

Nous avons entamé et terminé les extensions à ajouter.

### - Partage des listes

Pour ce point, nous avons choisi de procéder avec une conception de groupes. Ce qui est illustré par le fait qu'un utilisateur connecté peut avoir, 
concernant un groupe, plusieurs status :

* propriétaire | *owner*;
* membre | *member*;
* un membre en attente | *pending member*.

Au niveau de _**Cloud Firestore**_, ceci a été mis en place à l'aide d'une collection de documents intermédiaires **Membership** contenant:

* les deux ID, de l'utilisateur connecté ainsi que du groupe concerné;
* le status de l'utilisateur dans le groupe.

### - Push notification

Au début, nous avions rencontré des problèmes liés au choix du plugin à intégrer et aux dépendances non correctes. Mais après plusieurs tentatives, nous avons décidé d'utiliser le plugin _**Firebase Native**_ pour répondre à notre besoin.

Une notification est envoyée automatiquement dans deux scénarios :

* au propriétaire d'un groupe, lorsqu'un utilisateur souhaite joindre son
* à l'utilisateur en attente dans un groupe, lorsqu'un propriétaire du groupe l'accepte ou le refuse.

_**Firebase**_ nous facilite tout ça à l'aide des _**Cloud Functions**_ *membershipCreate* et *membershipUpdate* (stocké dans le backend).

### - Géolocalisation dans les notes

Après avoir rencontré des difficultés avec le plugin _**Geolocation**_ d'_**Ionic Native**_, on a décidé d'utiliser la géolocalisation grâce au module _**AGM**_ (Angular Google Maps).

Elle est introduite dans le projet de manière à donner le choix à l'utilisateur, de préciser sur une map intéractive des positions géographiques pour ses notes.

À partir de la page profil, l'utilisateur connecté pourra consulter les différents marqueurs de l'ensemble de ses notes dans une map.

### - Upload des images

Nous nous sommes servis du service _**Firebase Storage**_ afin de permettre à un utilisateur connecté d'insérer des photos dans ses notes.

### - Reconnaissance vocale

Lorsqu'un utilisateur souhaite accéder rapidement une page à partir de la page principale ou de créer une liste de notes, il pourra utiliser la reconnaissance vocale.

### - Monétisation

À l'aide du plugin _**Admob Pro Native**_, nous avions pu intégrer les publicités dans notre application mobile.

### - Mode déconnecté

En cas de problème internet, un utilisateur pourra continuer la manipulation de ses notes (à condition qu'il soit connecté). Dès que l'accès internet est rétabli, toutes les modifications seront sauvegardées dans _**Cloud Firestore**_.

### - Recherche dans les listes

Une petite barre de recherche a été ajouté dans la page des listes to-do, pour faciliter la navigation.


## 2. Prérequis et déploiement

Afin de faire marcher l'application, nous commençons d'abord par l'installation et ensuite le déploiement.

### 2.1. Installation

Cette partie requièrt d'installer un ensemble de dépendances avec _**npm**_ et plugins d'_**Ionic Native**_.


#### - Authentification Google:

En plus des ID générés à partir de la console Google, Android Client ID and Web Client ID, l'installation des dépendances Google est essentiel.

_**Google SignIn**_ 7.0.0:

```
ionic cordova plugin add cordova-plugin-googleplus
```

```
npm install @ionic-native/google-plus
```

#### - Push notification:

_**Firebase**_ 2.0.5:

```
ionic cordova plugin add cordova-plugin-firebase
```

```
npm install @ionic-native/firebase
```

Pour les _**Cloud Functions**_ stockées dans la backend.

```
npm install firebase-functions@latest firebase-admin@latest --save
```

```
npm install -g firebase-tools
```

Les commandes à exécuter pour l'initialisation et le déploiement de ces derniers afin de déclencher l'envoi automatique des notifications.

```
firebase login
```

```
firebase init functions
```

```
firebase deploy --only functions
```

#### - Géolocalisation dans les notes:

_**Angular Google Maps**_:

```
npm install @agm/core
```
***Native Geocoder*** 3.2.1:
```
ionic cordova plugin add cordova-plugin-nativegeocoder
```

```
npm install @ionic-native/native-geocoder
```

#### - Upload des images:

_**File**_ 6.0.1:

```
ionic cordova plugin add cordova-plugin-file
```
```
npm install @ionic-native/file
```

***File Path*** 1.5.1:

```
ionic cordova plugin add cordova-plugin-filepath
```
```
npm install @ionic-native/file-path
```

***File Chooser*** 1.2.0:

```
ionic cordova plugin add cordova-plugin-filechooser
```
```
npm install @ionic-native/file-chooser
```

***Native Storage*** 2.3.2:

```
ionic cordova plugin add cordova-plugin-nativestorage
```
```
npm install @ionic-native/native-storage
```

#### - Reconnaissance vocale:

***Speech Recognition*** 1.1.2:

```
ionic cordova plugin add cordova-plugin-speechrecognition
```
```
npm install @ionic-native/speech-recognition
```

#### - Monétisation:

```
ionic cordova plugin add cordova-plugin-admobpro
```
```
npm install @ionic-native/admob-pro
```

### 2.2 Déploiement 

En suivant les étapes précédentes de l'installation, nous avons pu préparer l'environnement de développement.

Et donc afin de déployer l'application en version Release (APK), il suffit de générer Android Client ID pour la version finale et de lancer les commandes suivantes:


```
keytool -genkey -v -keystore final_version.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

 - Récupérer le SHA1 pour le mettre dans l'Android Client ID de la Release:

```
keytool -exportcert -keystore PATH_TO_PROJECT\final_version.keystore -list -v
```

 - Générer l'APK non signé et le signer avec *jarsigner*:

```
ionic cordova build --release android
```

```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore final_version.keystore app-release-unsigned.apk alias_name
```
