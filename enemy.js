// ======================================================
// ENEMY — dérive de Vehicle
// Comportements utilisés : seek(), avoidance obstacles,
// séparation, et FX cosmiques.
// ======================================================

class Enemy extends Vehicle {

  constructor(x, y) {
    super(x, y);

    // Paramètres de déplacement
    this.r = 12;
    this.maxSpeed = 3.5;
    this.maxForce = 0.25;
    this.longueurVue = 60; 

    // Effets visuels
    this.pulseOffset = random(1000);

    this.orbitParticles = [];
    this.numOrbitParticles = 6;

    this.flashTimer = 0;
    this.shadowTrail = [];
    this.shadowLength = 10;

    // Particules orbitantes
    for (let i = 0; i < this.numOrbitParticles; i++) {
      this.orbitParticles.push({
        angle: random(TWO_PI),
        dist: random(10, 18),
        speed: random(0.01, 0.03)
      });
    }
  }

  // ------------------------------------------------------
  // SEPARATION — éviter les autres ennemis
  // ------------------------------------------------------
  separation(enemies) {
    let desiredSeparation = this.r * 3;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of enemies) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);

        if (d < desiredSeparation) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d + 0.0001); 
          steering.add(diff);
          total++;
        }
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  // ------------------------------------------------------
  // AVOID — éviter obstacles (simplifié)
  // ------------------------------------------------------
  avoid(obstacles) {
    let ahead = p5.Vector.add(
      this.pos,
      this.vel.copy().setMag(this.longueurVue)
    );

    for (let o of obstacles) {
      let d = p5.Vector.dist(ahead, o.pos);
      if (d < o.r + this.r) {
        let avoidance = p5.Vector.sub(ahead, o.pos);
        avoidance.setMag(this.maxForce * 2);
        return avoidance;
      }
    }

    return createVector(0, 0);
  }

  // ------------------------------------------------------
  // UPDATE BEHAVIOR — combinaison des forces
  // ------------------------------------------------------
  updateBehavior(player, enemies, obstacles) {

    let forceSeek  = this.seek(player.pos);
    let forceAvoid = this.avoid(obstacles);
    let forceSep   = this.separation(enemies);

    // Avoidance parent (plus fort)
    let avoidStrong = this.avoidObstacles(obstacles);
    this.applyForce(avoidStrong);

    // Pondérations
    forceSeek.mult(1.0);
    forceAvoid.mult(1.5);
    forceSep.mult(1.2);

    this.applyForce(forceSeek);
    this.applyForce(forceAvoid);
    this.applyForce(forceSep);

    // Trail d’ombre
    this.shadowTrail.push(this.pos.copy());
    if (this.shadowTrail.length > this.shadowLength) {
      this.shadowTrail.shift();
    }

    if (this.flashTimer > 0) this.flashTimer--;
  }

  // ------------------------------------------------------
  // HIT — flash blanc lorsqu’il est touché
  // ------------------------------------------------------
  hit() {
    this.flashTimer = 5;
  }

  // ======================================================
  //                    COSMIC SHOW()
  // ======================================================
  show() {
    push();
    translate(this.pos.x, this.pos.y);

    const speedGlow = map(this.vel.mag(), 0, this.maxSpeed, 120, 255);
    const pulse = 1 + 0.15 * sin(frameCount * 0.15 + this.pulseOffset);

    // ------------------------------------------------------
    // 0 — SHADOW TRAIL
    // ------------------------------------------------------
    noStroke();
    for (let i = 0; i < this.shadowTrail.length; i++) {
      let p = this.shadowTrail[i];
      let alpha = map(i, 0, this.shadowTrail.length - 1, 10, 80);

      fill(255, 40, 60, alpha);
      ellipse(p.x - this.pos.x, p.y - this.pos.y, this.r * 1.2);
    }

    rotate(this.vel.heading());

    // ------------------------------------------------------
    // 1 — LIGHT CONE
    // ------------------------------------------------------
    push();
    fill(255, 60, 60, 40);
    noStroke();
    beginShape();
    vertex(0, 0);
    vertex(this.r * 1.2, -this.r * 3);
    vertex(-this.r * 1.2, -this.r * 3);
    endShape(CLOSE);
    pop();

    // ------------------------------------------------------
    // 2 — HALOS
    // ------------------------------------------------------
    noFill();
    stroke(255, 80, 80, 100);
    strokeWeight(4);
    ellipse(0, 0, this.r * 3 * pulse);

    stroke(255, 100, 150, 40);
    strokeWeight(8);
    ellipse(0, 0, this.r * 4 * pulse);

    // ------------------------------------------------------
    // 3 — OVERHEAT RING
    // ------------------------------------------------------
    if (this.vel.mag() > this.maxSpeed * 0.6) {
      noFill();
      stroke(255, 80, 80, 120);
      strokeWeight(2);
      ellipse(0, 0, this.r * 2.6 + sin(frameCount * 0.3) * 4);
    }

    // ------------------------------------------------------
    // 4 — ANNEAUX ORBITAUX
    // ------------------------------------------------------
    push();
    rotate(frameCount * 0.03);
    noFill();
    stroke(255, 70, 90, 120);
    strokeWeight(1.5);
    ellipse(0, 0, this.r * 2.7 * pulse, this.r * 1.1 * pulse);
    pop();

    push();
    rotate(-frameCount * 0.02);
    noFill();
    stroke(255, 40, 120, 80);
    strokeWeight(1);
    ellipse(0, 0, this.r * 2.2 * pulse);
    pop();

    // ------------------------------------------------------
    // 5 — PARTICULES ORBITALES
    // ------------------------------------------------------
    noStroke();
    for (let p of this.orbitParticles) {
      p.angle += p.speed;
      let px = cos(p.angle) * p.dist;
      let py = sin(p.angle) * p.dist;

      fill(255, 80, 100, 180);
      ellipse(px, py, 5, 5);
    }

    // ------------------------------------------------------
    // 6 — FLASH DE HIT
    // ------------------------------------------------------
    if (this.flashTimer > 0) {
      fill(255, 255, 255, 240);
      noStroke();
      ellipse(0, 0, this.r * 1.8);
    }

    // ------------------------------------------------------
    // 7 — COEUR ÉNERGÉTIQUE
    // ------------------------------------------------------
    fill(255, 40, 40, speedGlow);
    noStroke();
    ellipse(0, 0, this.r * 1.6 * pulse);

    fill(255, 255, 255, 240);
    ellipse(0, 0, this.r * 0.9);

    pop();
  }
}
