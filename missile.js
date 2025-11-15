// ======================================================
// MISSILE COSMIQUE MULTI-CIBLES AVEC LOCK-ON
// Steering utilisé : seek() + drift aléatoire
// Le missile poursuit plusieurs ennemis dans un ordre donné
// et se détruit automatiquement si plus de cibles.
// ======================================================

class Missile extends Vehicle {

    constructor(x, y, targets = []) {
        super(x, y);

        // Taille et forces du missile
        this.r = 12;
        this.maxSpeed = 7;
        this.maxForce = 0.6;

        // Traînée visuelle
        this.trail = [];
        this.trailLength = 20;

        // Liste des cibles (triée dans sketch.js)
        this.targets = targets;
        this.currentTarget = targets[0] || null;

        // Auto-destruction
        this.dead = false;
        this.life = 700;   // durée de vie maximale
    }

    // ------------------------------------------------------
    // COMPORTEMENT : cherche la cible actuelle
    // Si elle n’existe plus → passe à la suivante
    // ------------------------------------------------------
    updateBehavior() {

        // Cas où la cible actuelle n’existe plus
        if (!this.currentTarget || enemies.indexOf(this.currentTarget) === -1) {

            // On retire la cible morte
            this.targets.shift();
            this.currentTarget = this.targets[0] || null;

            // Si plus de cibles → missile détruit
            if (!this.currentTarget) {
                this.dead = true;
                return;
            }
        }

        // --------------------------------------------
        // Steering principal : SEEK vers la cible
        // --------------------------------------------
        let forceSeek = this.seek(this.currentTarget.pos);
        forceSeek.mult(1.4);   // intensité du lock-on

        // Petit drift aléatoire → effet organique
        let drift = p5.Vector.random2D().mult(0.03);

        this.applyForce(forceSeek.add(drift));
    }

    // ------------------------------------------------------
    // MISE À JOUR PHYSIQUE + LIMITES + TRAÎNÉE
    // ------------------------------------------------------
    update() {
        super.update();

        // Mise à jour de la traînée visuelle
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // Durée de vie limitée
        this.life--;
        if (this.life <= 0) {
            this.dead = true;
        }

        // Hors cadre → destruction
        if (this.pos.x < -50 || this.pos.x > width + 50 ||
            this.pos.y < -50 || this.pos.y > height + 50) {
            this.dead = true;
        }
    }

    // ======================================================
    //                  AFFICHAGE + LOCK-ON LASER
    // ======================================================
    show() {

        // --------------------------------------------
        // Vecteur rouge du missile vers sa cible
        // --------------------------------------------
        if (this.currentTarget) {
            push();
            stroke(255, 60, 60, 180);
            strokeWeight(2 + sin(frameCount * 0.3) * 1.2);
            line(
                this.pos.x, this.pos.y,
                this.currentTarget.pos.x,
                this.currentTarget.pos.y
            );
            pop();
        }

        // --------------------------------------------
        // TRAÎNÉE COSMIQUE BLEUTÉE
        // --------------------------------------------
        noStroke();
        for (let i = 0; i < this.trail.length; i++) {
            let p = this.trail[i];
            let alpha = map(i, 0, this.trail.length, 20, 200);

            fill(120, 200, 255, alpha);
            ellipse(p.x, p.y, 7);
        }

        // --------------------------------------------
        // CORPS DU MISSILE
        // --------------------------------------------
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Halo cosmique bleu
        noFill();
        stroke(80, 200, 255, 150);
        strokeWeight(3);
        ellipse(0, 0, this.r * 2.2);

        // Corps rouge/blanc
        noStroke();
        fill(255, 80, 80);
        rectMode(CENTER);
        rect(0, 0, 26, 9, 4);

        // Propulsion animée
        fill(255, 200, 80, random(120, 255));
        triangle(-12, 0, -20, -5, -20, 5);

        pop();
    }
}
