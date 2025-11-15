// ======================================================
// PLAYER — Contrôleur du joueur, dérive de Vehicle
// Comporte les comportements vus en cours : arrive(), 
// avoidance obstacles, steering, trail cosmique, et FX.
// ======================================================

class Player extends Vehicle {

    constructor(x, y) {
        // Vitesse dynamique en fonction du slider (playerSpeed)
        super(x, y, playerSpeed, 0.2 + playerSpeed * 0.03);

        this.r = 20;
        this.color = "#4af1ff";

        this.hp = 100;
        this.maxHP = 100;

        this.angleSmooth = 0;   // rotation lissée

        // Effets visuels
        this.trail = [];
        this.trailLength = 22;
        this.shockwaveTimer = 0;
    }

    // ------------------------------------------------------
    // BEHAVIOR — le joueur suit la souris (arrive)
    // et évite les obstacles
    // ------------------------------------------------------
    updateBehavior() {
        let target = createVector(mouseX, mouseY);

        // Mouvement principal
        let steer = this.arrive(target);
        this.applyForce(steer);

        // Avoidance simple (obstacles)
        let avoidForce = this.avoidObstacles(obstacles);
        this.applyForce(avoidForce);
    }

    // ------------------------------------------------------
    // UPDATE — applique la physique + FX
    // ------------------------------------------------------
    update() {
        // Mise à jour continue de la vitesse via slider
        this.maxSpeed = playerSpeed;
        this.maxForce = 0.2 + playerSpeed * 0.03;

        super.update();

        // Rotation lissée
        let desiredAngle = this.vel.heading();
        this.angleSmooth = lerp(this.angleSmooth, desiredAngle, 0.25);

        // Mémorisation du trail
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.shockwaveTimer++;
    }

    // ------------------------------------------------------
    // SHOW — rendu cosmique (FX organisés par sections)
    // ------------------------------------------------------
    show() {
        push();
        translate(this.pos.x, this.pos.y);

        const speed = this.vel.mag();

        // ======================================================
        // 0. MICRO PARTICULES
        // ======================================================
        if (frameCount % 3 === 0) {
            particles.push(new Particle(
                this.pos.x + random(-5, 5),
                this.pos.y + random(-5, 5),
                color(120, 200, 255)
            ));
        }

        // ======================================================
        // 1. TRAIL COSMIQUE DOUBLE
        // ======================================================
        noStroke();
        for (let i = 0; i < this.trail.length; i++) {
            let p = this.trail[i];

            let a1 = map(i, 0, this.trail.length - 1, 10, 130);
            let a2 = map(i, 0, this.trail.length - 1, 5, 60);

            // Bleu clair
            fill(100,150,255, a1);
            ellipse(p.x - this.pos.x, p.y - this.pos.y, 10);

            // Violet spectral
            fill(180,120,255, a2);
            ellipse((p.x - this.pos.x) + 4, (p.y - this.pos.y) + 4, 6);
        }

        rotate(this.angleSmooth + HALF_PI);

        // ======================================================
        // 1.5. LIGHT CONE
        // ======================================================
        push();
        fill(100,180,255, 40);
        noStroke();
        beginShape();
        vertex(0, 0);
        vertex(0, -this.r * 2.5);
        vertex(this.r * 0.9, -this.r * 4.2);
        vertex(-this.r * 0.9, -this.r * 4.2);
        vertex(0, -this.r * 2.5);
        endShape(CLOSE);
        pop();

        // ======================================================
        // 2. ENERGY RINGS
        // ======================================================
        push();
        rotate(frameCount * 0.03);
        noFill();
        stroke(120,200,255, 80);
        strokeWeight(2);
        ellipse(0, 0, this.r*3.3, this.r*1.6);
        pop();

        push();
        rotate(-frameCount * 0.02);
        noFill();
        stroke(180,140,255, 60);
        strokeWeight(1.5);
        ellipse(0, 0, this.r*4.1, this.r*1.2);
        pop();

        // ======================================================
        // 3. DOUBLE HALO
        // ======================================================
        push();
        noFill();
        stroke(80,180,255, 90);
        strokeWeight(8);
        ellipse(0, 0, this.r * 2.8 + sin(frameCount * 0.1) * 5);
        pop();

        push();
        noFill();
        stroke(160,200,255, 150);
        strokeWeight(3);
        ellipse(0, 0, this.r * 2 + sin(frameCount * 0.2) * 15);
        pop();

        // ======================================================
        // 4. SHOCKWAVE périodique
        // ======================================================
        if (this.shockwaveTimer % 40 === 0) {
            push();
            noFill();
            stroke(120,200,255,80);
            strokeWeight(2);

            for (let s = 0; s < 15; s++) {
                setTimeout(() => {
                    ellipse(0, 0, this.r*2 + s*4);
                }, s * 8);
            }
            pop();
        }

        // ======================================================
        // 5. SHIELD FX
        // ======================================================
        if (shield > 0) {
            push();
            noFill();
            stroke(80,255,200,180);
            strokeWeight(4);
            ellipse(0, 0, this.r * 3.8 + sin(frameCount * 0.1) * 4);
            pop();

            push();
            noFill();
            stroke(40,200,255,120);
            strokeWeight(2);
            ellipse(0, 0, this.r * 4.5 + sin(frameCount * 0.15) * 6);
            pop();

            push();
            noFill();
            stroke(80,220,255,200);
            strokeWeight(3 + sin(frameCount * 0.2) * 1.5);
            ellipse(0, 0, this.r * 3.6);
            pop();
        }

        // ======================================================
        // 6. CŒUR COSMIQUE
        // ======================================================
        push();
        let t = map(speed, 0, this.maxSpeed, 0, 1);
        let col = lerpColor(color(120,200,255), color(80,255,200), t);

        noStroke();
        fill(red(col), green(col), blue(col), 230);
        ellipse(0, 0, this.r * 1.4);
        pop();

        // ======================================================
        // 7. NOYAU BLANC
        // ======================================================
        push();
        noStroke();
        fill(255, 255, 255, 245);
        ellipse(0, 0, this.r * 0.8);
        pop();

        pop(); // fin transform
    }

    // ------------------------------------------------------
    // GESTION DES DÉGÂTS + SHIELD
    // ------------------------------------------------------
    takeDamage(amount) {

        // Shield = absorbe 1 projectile
        if (shield > 0) {
            shield -= 1;

            // FX
            triggerShake(5, 10);
            spawnCosmicExplosion(this.pos.x, this.pos.y, color(80,180,255));
            return;
        }

        // Dégâts directs
        this.hp -= amount;
        if (this.hp <= 0) {
            gameState = "lose";
        }
    }
}
