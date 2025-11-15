// ======================================================
// VEHICLE
// Classe mère commune : Player, Enemy, SnakeHead,
// SnakeSegment, Missiles, etc.
// Comporte les comportements de steering vus en cours.
// ======================================================

class Vehicle {

    constructor(x, y, maxSpeed = 3, maxForce = 0.15) {
        // Position, vitesse, accélération
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(2);
        this.acc = createVector(0, 0);

        // Paramètres physiques
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;

        this.r = 16;           // Rayon collision
        this.color = "#ffffff";
    }

    // --------------------------------------------------
    // APPLICATION DES FORCES
    // --------------------------------------------------
    applyForce(force) {
        this.acc.add(force);
    }

    // --------------------------------------------------
    // SEEK — Aller vers une cible
    // --------------------------------------------------
    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        desired.setMag(this.maxSpeed);

        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);

        return steer;
    }

    // --------------------------------------------------
    // FLEE — Fuire un point si trop proche
    // --------------------------------------------------
    flee(target) {
        let desired = p5.Vector.sub(this.pos, target);
        let d = desired.mag();

        if (d < 200) {
            desired.setMag(this.maxSpeed);
            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxForce * 1.2);
            return steer;
        }

        return createVector(0, 0);
    }

    // --------------------------------------------------
    // ARRIVE — approche progressive
    // --------------------------------------------------
    arrive(target, distanceBehind = 0) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();

        if (d < 0.0001) return createVector(0, 0);

        let speed = this.maxSpeed;
        let zone = this.rayonZoneDeFreinage || 120;

        if (d < zone) {
            speed = map(d, distanceBehind, zone, 0, this.maxSpeed);
            speed = constrain(speed, 0, this.maxSpeed);
        }

        desired.setMag(speed);

        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);

        return steer;
    }

    // --------------------------------------------------
    // AVOID OBSTACLES — évitement simple
    // --------------------------------------------------
    avoidObstacles(obstacles) {
        let ahead = this.getAhead(80);
        let mostThreatening = null;

        for (let o of obstacles) {
            let d = p5.Vector.dist(ahead, o.pos);

            if (d < o.r + this.r) {
                mostThreatening = o;
                o.highlight = true;
            } else {
                o.highlight = false;
            }
        }

        if (mostThreatening) {
            let avoidance = p5.Vector.sub(ahead, mostThreatening.pos);
            avoidance.setMag(this.maxForce * 2.2);
            return avoidance;
        }

        return createVector(0, 0);
    }

    // --------------------------------------------------
    // UPDATE — intègre les forces
    // --------------------------------------------------
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    // --------------------------------------------------
    // BORDS — rester dans l'écran
    // --------------------------------------------------
    edges() {
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
    }

    // --------------------------------------------------
    // getAhead — projection en avant
    // --------------------------------------------------
    getAhead(length = 60) {
        return p5.Vector.add(
            this.pos,
            this.vel.copy().setMag(length)
        );
    }

    // --------------------------------------------------
    // SHOW — affichage par défaut
    // --------------------------------------------------
    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        noStroke();
        fill(this.color);
        triangle(
            -this.r, -this.r / 2,
            -this.r,  this.r / 2,
             this.r,  0
        );

        pop();
    }

}
