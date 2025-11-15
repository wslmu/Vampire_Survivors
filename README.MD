# Vampire_Survivors
Projet académique – Agents autonomes, Behaviors, Forces &amp; Comportements Composés
1. Présentation générale du projet

Ce projet est une réinterprétation pédagogique d’un mini Vampire Survivors, entièrement construite sur les Steering Behaviors vus en cours.

Tous les objets autonomes utilisent STRICTEMENT :

accélération / vélocité / forces 

seek()

arrive()

separation()

évitement d’obstacles (Obstacle Avoidance)

comportements composites pondérés

collisions circulaires simples

architecture orientée “Vehicle + classes dérivées”

Le jeu comprend :

un joueur contrôlé par arrive(mouse)

des ennemis intelligents (seek + avoid + separation)

un serpent complet (tête autonome + segments via arrive(distance))

des tirs orbitaux (bullets utilisant seek vers leur position orbitale)

un missile intelligent multi-cibles (seek + lock-on vector)

des obstacles interactifs ajoutés manuellement

trois niveaux de difficulté croissante

un système d’upgrade via sliders en fin de partie

un HUD dynamique et un système de score

Ce projet illustre comment un gameplay complet peut émerger uniquement grâce à des forces.

2. Architecture générale du code
index.html            → structure HTML + chargement des scripts
style.css             → style du menu, HUD, upgrade menu
sketch.js             → boucle principale, game loop, collisions, niveaux
vehicle.js            → classe mère Vehicle (forces, behaviors de base)
player.js             → joueur → arrive() + avoidance
enemy.js              → ennemis → seek + avoid + separation
bullet.js             → bullets orbitaux utilisant seek()
missile.js            → missile intelligent avec priorisation multi-cibles
snake.js              → tête + segments (arrive(distance))
obstacle.js           → obstacles cosmiques, avoidance dynamique
particle.js           → particules pour explosions/effets


L’ordre de chargement des scripts respecte la hiérarchie :
Vehicle → dérivés → sketch.

3. La classe Vehicle 
pos, vel, acc
maxSpeed, maxForce
applyForce(), seek(), arrive(), avoidObstacles(), avoidOthers()
update(), edges(), show()


Tous les agents (player, enemy, snake head, segments, bullets, missiles) héritent de Vehicle.

Cela garantit que :

aucun mouvement n’est “manuel”

tout est produit par forces cumulées + intégration physique

tous les agents sont cohérents entre eux

4. Comportements utilisés (Steering Behaviors)
✔ 1. Seek

Utilisé par :

ennemis → poursuivent le joueur

tête du serpent → chasse le joueur

missile → verrouille une cible

bullets orbitaux → cherchent leur position orbitale

✔ 2. Arrive

Utilisé par :

le joueur → arrive vers la souris

les segments du serpent → arrive(distance) vers le précédent

effets d’approche naturelle sans oscillations

✔ 3. Separation

Utilisé par :

ennemis → évitent les amas

tête du serpent → évite ses propres segments

mini-séparation interne du serpent → évite les collisions entre segments

✔ 4. Obstacle Avoidance

Utilisé par :

ennemis

tête du serpent

joueur (via avoidObstacles)

missile indirectement (via edges + dérive)

Technique utilisée :

construction d’un ahead vector

détection anticipée sur la trajectoire

vecteur d’évitement proportionnel

aucune téléportation

comportement 100% interprétable physiquement

5. Le système du Snake (MiniBoss)

SnakeHead

seek(player)

avoid(obstacles)

separation(segments)

maxSpeed / maxForce spécifiques

aura cosmique + orbites visuelles

SnakeSegment

arrive(leader.pos, followDistance)

léger offset de distance → corps fluide

Mini séparation interne

Ajoutée pour empêcher les segments de se coller.
Elle agit comme une micro-correction physique.

L’ensemble forme un vrai agent composite autonome.

6. Bullets orbitaux – tirs utilisant un vrai behavior

Chaque bullet :

possède un angle d’orbite

calcule sa position idéale autour du joueur

applique seek() pour rejoindre cette position

laisse une traînée cosmique

inflige des dégâts par collision circulaire

Ce sont des projectiles dynamiques, cohérents avec Vehicle.

7. Ennemis (Enemy)

Chaque ennemi combine 3 behaviors pondérés :

seek(player.pos)

avoid(obstacles)

separation(enemies)

Résultat :

poursuite cohérente

contournement naturel

évitement de groupe


8. Obstacle System (interactive)

Le joueur peut créer des obstacles en temps réel :

O → toggle mode

clic → ajoute un obstacle

radius constant

immédiatement pris en compte par avoidance

Cela permet de :

tester différents scénarios

observer l’émergence des comportements

vérifier le fonctionnement de l’avoidance

9. Missile cosmique intelligent

Fonctionnalités :

système smart-lock : sélectionne les 2 ennemis les plus proches

seek() dynamique vers la cible active

changement automatique de cible si la première meurt

traînée et laser de verrouillage

auto-destruction hors écran

équilibré par un système de cooldown (killCount ≥ 5)

Le missile reste cohérent avec tous les comportements du cours.

10. Collisions

Toutes les collisions utilisent le test unique demandé :

distance < r1 + r2

Implémenté pour :

bullets → ennemis

bullets → tête du serpent

missile → ennemis

player → ennemis

player → serpent (instant death)


11. Système de niveaux
Niveau 1

Ennemis uniquement
Victoire = 20 kills ou temps écoulé

Niveau 2

Snake uniquement
Victoire = tête détruite

Niveau 3

Snake + ennemis
Victoire = serpent détruit + 20 kills

Tout est configuré via startLevel(level).

12. Upgrade Menu (fin de partie)

Menu affiché en cas de :

victoire

défaite

Réglages disponibles via sliders :

vitesse du joueur

boucliers

nombre d’ennemis

nombre de serpents

Les valeurs s’appliquent réellement dans le prochain run.

13. HUD & interface

Le HUD affiche :

Niveau | Temps | Kills | Score | Boss HP | Shield | Missile Ready


Le hint bar affiche les contrôles :

O : mode obstacles | Click : add obstacle | M : missile

14. Effets visuels (Particles + Cosmic FX)

Chaque classe possède :

halos

waves énergétiques

orbites

traînées

explosions cosmiques

shockwaves


15. Comment jouer
Déplacement

➡ Le joueur suit la souris via arrive(mouse).

Tirs

➡ Automatiques (orbitaux).
➡ Missiles : M.

Obstacles

➡ O pour activer
➡ Clic pour placer

Objectifs

➡ Survivre / éliminer les ennemis
➡ Battre le serpent (niveau 2 et 3)
➡ Gagner selon les conditions du niveau

16. Resumé des points   

Ce projet démontre explicitement :

compréhension avancée de Vehicle

usage correct des forces 

behaviors propres et pondérés

composite behaviors

pattern du Snake basé sur arrive(distance)

évitement d’obstacles 

bullets orbitaux = behaviour créatif

missile = extension intelligente et cohérente

gestion des collisions circulaires

structure du code claire, compatible avec un rendu scolaire

commentaires abondants dans le code original

gameplay complet construit uniquement via forces

17. Conclusion

Ce mini-jeu montre qu’un gameplay riche, dynamique et varié peut être entièrement construit avec les Steering Behaviors.

Il met en avant :

la puissance du modèle de Reynolds

le caractère émergent des comportements

l’importance de Vehicle comme base

la combinaison de seek/arrive/avoid/separation

des agents vraiment autonomes

une architecture robuste, propre et évolutive
