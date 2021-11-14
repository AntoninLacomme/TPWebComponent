# TPWebComponent

TP Web Component implémentant un lecteur audio personnalisé.

# Fonctionnalités :
La page web se coupe en deux grandes parties, le bandeau de lecture situé en bas de page et la partie haute.

# Bandeau de Lecture :
Le bandeau de lecture représente la barre de progression de la musique en cours, avec, en son centre, une barre d'action noire contenant les différents boutons d'interraction.
Le canvas derrière la barre d'action est cliquable et permet de set le currentTime de lecture.

# Les raccourcis claviers :
  - ```Space``` : play / pause
  - ```Flèhe de droite``` : avancer de 10 secondes
  - ```Flèches de gauche``` : reculer de 10 secondes
  - ```R``` : reset la musique à 0
  - ```L``` : active / désactive le loop
  - ```Ctrl + flèhe de droite``` : morceau suivant
  - ```Ctrl + flèche de gauche``` : morceau précedant
  - ```+``` : augmenter le son
  - ```-``` : diminuer le son

De gauche à droite, on trouve :
  - le temps courant / le temps total du morceau en cours
  - un bouton permettant de gérer la vitesse de lecture
  - un bouton permettant de réinitialisé le temps de lecture du morceau en cours à 0
  - un bouton permettant de reculer de 10 secondes dans le temps de lecture
  - un bouton play / pause
  - un bouton permettant d'avancer de 10 secondes dans le temps de lecture
  - un switch loop permettant de passer ou non le même morceau en boucle
  - un bouton permettant de gérer le volume du son
  - un bouton permettant d'afficher les paramètres de son avancés

Les paramètres de sons avancés :
  - un bouton permet de gérer la balance gauche droite du son
  - un bouton permet de modifier le gain du son
  - six boutons permettant de modifier les fréquences de différentes intensités
  - une liste permet de choisir parmis différents modes de lecture possibles

# Affichage graphique :

Une switch liste en haut à gauche de l'écran permet d'alterner entre trois modes d'affichages. Un mode où l'application affichera une étoile, un mode avec une ligne des fréquences, et un mode cumulant les deux effets.

# Playlist :

L'application permet de gérer une playliste de musiques. Celle ci doit-être passée en paramètre du webcomponent. La playliste sera alors affichée en haut à droite de l'écran. Chaque morceau est cliquable, permettant ainsi de naviguer dans la playlist de façon fluide.

