// ======================================================
// BULLET — orbite autour du joueur
// Utilise : steering → seek() pour rester sur l’orbite,
// trail cosmique, halo pulsant, spark rotatif.
// ======================================================

class Bullet extends Vehicle {

    constructor(player, angleOffset) {
        // La bullet naît à la position du joueur
        super(player.pos.x, player.pos.y);

        this.player = player;
        this.angle = angleOffset;       // angle initial d’orbite

        // Paramètres liés aux sliders du jeu
        this.orbitRadius = bulletRange;
        this.rotationSpeed = bulletRotationSpeed;
        this.maxSpeed = bulletSpeed;

        this.r = 8;
        this.maxForce = 0.4;

        // Effets visuels
        this.trail = [];
        this.trailLength = 15;

        // petite scintillation tournante
        this.sparkAngle = random(TWO_PI);
    }

    // ------------------------------------------------------
    // COMPORTEMENT : la bullet orbite grâce à seek()
    // ------------------------------------------------------
    updateBehavior() {

        // 1) mise à jour progressive de l’angle
        this.angle += this.rotationSpeed;

        // 2) position théorique d’orbite
        let orbitX = this.player.pos.x + cos(this.angle) * this.orbitRadius;
        let orbitY = this.player.pos.y + sin(this.angle) * this.orbitRadius;
        let orbitPos = createVector(orbitX, orbitY);

        // 3) steering vers la position d’orbite
        let diff = p5.Vector.sub(orbitPos, this.pos);
        if (diff.mag() > 0.0001) {
            this.applyForce(this.seek(orbitPos));
        }

        // 4) trail visuel derrière la bullet
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 5) spark rotatif → décoratif
        this.sparkAngle += 0.15;
    }

    // ======================================================
    //                    COSMIC SHOW()
    // ======================================================
    show() {
        push();
        translate(this.pos.x, this.pos.y);

        const pulse = 1 + 0.15 * sin(frameCount * 0.25);

        // ------------------------------------------------------
        // 1. TRAIL COSMIQUE DERRIÈRE LE BULLET
        // ------------------------------------------------------
        noStroke();
        for (let i = 0; i < this.trail.length; i++) {
            let p = this.trail[i];
            let alpha = map(i, 0, this.trail.length - 1, 30, 120);

            fill(255, 230, 80, alpha);
            ellipse(p.x - this.pos.x, p.y - this.pos.y, 6, 6);
        }

        // ------------------------------------------------------
        // 2. HALO PULSANT JAUNE
        // ------------------------------------------------------
        noFill();
        stroke(255, 210, 80, 100);
        strokeWeight(4);
        ellipse(0, 0, this.r * 3.5 * pulse);

        stroke(255, 240, 120, 40);
        strokeWeight(7);
        ellipse(0, 0, this.r * 5 * pulse);

        // ------------------------------------------------------
        // 3. SPARK ROTATIF AUTOUR DU BULLET
        // ------------------------------------------------------
        push();
        rotate(this.sparkAngle);
        stroke(255, 240, 150, 160);
        strokeWeight(2);
        line(this.r * 1.3, 0, this.r * 2, 0);
        pop();

        // ------------------------------------------------------
        // 4. COEUR ÉNERGÉTIQUE
        // ------------------------------------------------------
        noStroke();
        fill(255, 255, 255, 230);
        ellipse(0, 0, this.r * 1.2 * pulse);

        fill(255, 220, 50, 230);
        ellipse(0, 0, this.r * 2);

        pop();
    }
}
