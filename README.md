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

### Partage des listes

Pour ce point, nous avons choisi de procéder avec une conception de groupes. Ce qui est illustré par le fait qu'un utilisateur connecté peut avoir, 
concernant un groupe, plusieurs status :

* propriétaire | *owner*;
* membre | *member*;
* un membre en attente | *pending member*.

Au niveau de _**Cloud Firestore**_, ceci a été mis en place à l'aide d'une collection de documents intermédiaires **Membership** contenant:

* les deux ID, de l'utilisateur connecté ainsi que du groupe concerné;
* le status de l'utilisateur dans le groupe.

### Push notification

Au début, nous avions rencontré des problèmes liés au choix du plugin à intégrer et aux dépendances non correctes. Mais après plusieurs tentatives, nous avons décidé d'utiliser le plugin _**Firebase Native**_ pour répondre à notre besoin.

Une notification est envoyée automatiquement dans deux scénarios :

* au propriétaire d'un groupe, lorsqu'un utilisateur souhaite joindre son
* à l'utilisateur en attente dans un groupe, lorsqu'un propriétaire du groupe l'accepte ou le refuse.

_**Firebase**_ nous facilite tout ça à l'aide des _**Cloud Functions**_ *membershipCreate* et *membershipUpdate* (stocké dans le backend).

### Geolocalisation dans les notes

La géolocalisation a été faite grâce au module _**AGM**_ (Angular Google Maps).

Elle est introduite dans le projet de manière à donner le choix à l'utilisateur, de préciser sur une map intéractive des positions géographiques pour ses notes.

À partir de la page profil, l'utilisateur connecté pourra consulter les différents marqueurs de l'ensemble de ses notes dans une map.

### Upload des images

Nous nous sommes servis du service _**Firebase Storage**_ afin de permettre à un utilisateur connecté d'insérer des photos dans ses notes.

### Reconnaissance vocale

Lorsqu'un utilisateur souhaite accéder rapidement une page à partir de la page principale ou de créer une liste de notes, il pourra utiliser la reconnaissance vocale.

### Monétisation

À l'aide du plugin _**Admob Pro Native**_, nous avions pu intégrer les publicités dans notre application mobile.

### Mode déconnecté

En cas de problème internet, un utilisateur pourra continuer la manipulation de ses notes (à condition qu'il soit connecté). Dès que l'accès internet est rétabli, toutes les modifications seront sauvegardées dans _**Cloud Firestore**_.

### Recherche dans les listes

Une petite barre de recherche a été ajouté dans la page des listes to-do, pour faciliter la navigation.


## Prérequis
