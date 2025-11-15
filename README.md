Moujanni Wissal - Vampire Survivors – Steering Behaviors Edition (p5.js)
Ce projet propose une adaptation minimaliste d’un gameplay inspiré de Vampire Survivors, entièrement fondé sur des agents autonomes et des forces physiques.
Tous les déplacements sont générés par un modèle basé sur position → vitesse → accélération.
Il utilise exclusivement :
•	accélération / vélocité / forces
•	seek()
•	arrive()
•	separation()
•	évitement d’obstacles
•	comportements composites pondérés
•	collisions circulaires
L’ensemble forme un système cohérent où chaque entité du jeu agit comme un véritable agent autonome.

1.  Fonctionnalités principales
Le projet inclut :
•	un joueur contrôlé par l’approche arrive(mouse)
•	des ennemis poursuivant le joueur (seek + separation + avoidance)
•	un serpent complet (tête autonome + segments suivant en arrive(distance))
•	des tirs orbitaux basés sur un comportement seek vers une position calculée
•	un missile intelligent multi-cibles
•	des obstacles interactifs placés à la souris
•	trois niveaux aux objectifs différents
•	une interface complète : menu → HUD → écran de fin → upgrade menu
•	particules, halos cosmiques, shockwaves, effets visuels avancés

2.  Architecture du projet
index.html          → structure générale, chargement des scripts
style.css           → style, HUD, menus, transitions
sketch.js           → boucle principale, collisions, logique de jeu
vehicle.js          → classe mère (forces + behaviors de base)
player.js           → joueur (arrive + avoidance + FX)
enemy.js            → ennemis (seek + sep + avoid + FX)
bullet.js           → projectiles orbitaux (seek vers point d’orbite)
missile.js          → missile intelligent multi-cibles
snake.js            → serpent (tête + segments)
obstacle.js         → obstacles visualisés, avoidance dynamique
particle.js         → particules, explosions, effets cosmiques
L’ordre des scripts respecte la hiérarchie :
Vehicle → dérivés → logique de jeu.

3.  La classe Vehicle (fondation)
La classe Vehicle constitue la base de tous les agents :
•	pos, vel, acc
•	applyForce()
•	seek()
•	arrive()
•	avoidObstacles()
•	update(), edges(), show()
Les entités suivantes héritent de Vehicle :
•	Player
•	Enemy
•	SnakeHead
•	SnakeSegment
•	Bullet
•	Missile
Cette approche garantit des mouvements cohérents, lisibles et fondés sur des forces cumulées.

4.  Behaviors utilisés
 Seek
Utilisé par :
•	les ennemis
•	la tête du serpent
•	les bullets (vers leur position orbitale)
•	les missiles
 Arrive
Utilisé par :
•	le joueur (vers la souris)
•	les segments du serpent
 Separation
Utilisé par :
•	les ennemis pour éviter les regroupements
•	la tête du serpent pour éviter ses segments
•	petite séparation interne du corps du serpent
 Évitement d’obstacles
Utilisé par :
•	ennemis
•	joueur
•	tête du serpent
Méthode utilisée :
•	vecteur ahead projeté
•	détection d'intersection
•	force d’évitement proportionnelle

5.  Le Cosmic Snake (serpent)
Le serpent est composé de :
● SnakeHead (IA autonome)
•	seek(player)
•	avoid(obstacles)
•	separation(segments)
•	halos + particules orbitales
● SnakeSegment
•	arrive() vers le segment précédent
•	distance constante → corps fluide
● Mini séparation interne
Empêche les segments de se superposer.
Le résultat est un mouvement organique, entièrement basé sur des forces.

6.  Bullets orbitaux
Les bullets fonctionnent comme de petits agents :
•	chaque bullet possède un angle d’orbite
•	calcule une position idéale autour du joueur
•	utilise seek(orbitalPos) pour la rejoindre
•	collision circulaire avec ennemis et serpent
•	trail cosmique
Aucune trajectoire n’est imposée manuellement.

7. Ennemis
Chaque ennemi combine :
•	seek(player)
•	avoid(obstacles)
•	separation(enemies)
Effets :
•	poursuite réaliste
•	contournement fluide
•	évitement du groupe
•	mouvements variés

8.  Obstacles interactifs
Le joueur peut ajouter des obstacles en temps réel :
•	O → mode obstacle ON/OFF
•	clic → place un obstacle
Chaque obstacle est immédiatement détecté par l’avoidance.

9. Missile intelligent
Caractéristiques :
•	sélectionne les 2 ennemis les plus proches
•	utilise seek() vers sa cible active
•	change automatiquement de cible si la première disparaît
•	traînée cosmique + explosion à l’impact
•	se recharge après un certain nombre de kills

10.  Collisions
Le moteur de collision utilise une seule règle :
distance < r1 + r2
Employée pour :
•	bullet vs ennemi
•	bullet vs serpent
•	missile vs ennemi
•	joueur vs ennemi/serpent

11.  Niveaux
Niveau 1
•	Ennemis uniquement
•	Objectif : survivre ou atteindre les 20 kills
Niveau 2
•	Serpent uniquement
•	Objectif : détruire la tête
Niveau 3
•	Serpent + ennemis
•	Objectif : serpent éliminé + 20 kills

12.  Upgrade Menu
En fin de partie, un menu propose :
•	vitesse du joueur
•	quantité de boucliers
•	nombre d’ennemis
•	nombre de serpents
Chaque paramètre influence réellement le run suivant.

13.  HUD & Interface
Le HUD affiche :
Niveau | Temps | Kills | Score | Boss HP | Shield | Missile Ready
Le hint bar affiche les contrôles utiles.

14.  Effets visuels
Présents dans toutes les classes :
•	particules dynamiques
•	halos
•	shockwaves
•	trails
•	auras pulsantes
•	effets cosmiques
Ces effets sont purement visuels et n’altèrent pas la logique physique.

15.  Comment jouer
•	Le joueur se déplace automatiquement vers la souris.
•	Les tirs orbitaux sont automatiques.
•	M pour lancer un missile (si prêt).
•	O pour activer le mode obstacle.
•	Clic pour ajouter un obstacle.
Objectif : survivre, éliminer les ennemis et compléter les conditions du niveau.

16.  Points forts 
Le projet démontre :
•	un modèle entièrement piloté par forces et accélérations
•	une architecture claire orientée objets
•	des agents autonomes variés
•	une combinaison naturelle des behaviors classiques
•	un système complet et extensible
•	un gameplay émergent basé sur des règles simples

17.  Conclusion
Ce projet met en avant la capacité à créer un gameplay complet, dynamique et cohérent en s’appuyant uniquement sur des behaviors, des forces et des interactions simples entre agents autonomes.
L’ensemble propose une base solide, extensible et facilement lisible pour explorer ou développer des mécaniques fondées sur le modèle de Reynolds.

