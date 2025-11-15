// ========================================================
// COSMIC SNAKE — Pattern composite basé sur les behaviors
// Seek / Arrive / Avoid / Separation
// ========================================================



// ========================================================
// 1. SNAKE HEAD (Vehicle + IA + évitement)
// ========================================================
class SnakeHead extends Vehicle {

  constructor(x, y) {
    super(x, y);

    // Physique
    this.r = 14;
    this.maxSpeed = 5;
    this.maxForce = 0.35;
    this.longueurVue = 70;

    // Effets visuels
    this.pulseOffset = random(1000);
    this.auraPhase = random(500);

    // Particules orbitales
    this.sparkParticles = [];
    this.numSparks = 10;

    for (let i = 0; i < this.numSparks; i++) {
      this.sparkParticles.push({
        ang: random(TWO_PI),
        dist: random(6, 18),
        speed: random(0.015, 0.03)
      });
    }
  }

  // --------------------------------------------------------
  // AVOID obstacles
  // --------------------------------------------------------
  avoid(obstacles) {
    let ahead = p5.Vector.add(this.pos, this.vel.copy().setMag(this.longueurVue));
    let mostThreatening = null;

    for (let o of obstacles) {
      if (p5.Vector.dist(ahead, o.pos) < o.r + this.r) {
        mostThreatening = o;
        break;
      }
    }

    if (mostThreatening) {
      let avoidance = p5.Vector.sub(ahead, mostThreatening.pos);
      avoidance.setMag(this.maxForce * 2);
      return avoidance;
    }

    return createVector(0, 0);
  }

  // --------------------------------------------------------
  // SEPARATION — évite les autres segments
  // --------------------------------------------------------
  separation(others) {
    let desiredSeparation = this.r * 2;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of others) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);

        if (d < desiredSeparation) {
          if (d < 0.0001) d = 0.0001;

          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d);

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

  // --------------------------------------------------------
  // COMPOSITE BEHAVIOR : seek + avoid + separation
  // --------------------------------------------------------
  updateBehavior(player, obstacles, snakeParts) {

    let forceSeek = this.seek(player.pos);
    let forceAvoid = this.avoid(obstacles);
    let forceSep  = this.separation(snakeParts);

    forceSeek.mult(1.0);
    forceAvoid.mult(1.5);
    forceSep.mult(1.2);

    this.applyForce(forceSeek);
    this.applyForce(forceAvoid);
    this.applyForce(forceSep);

    this.auraPhase += 0.03;
  }

  // --------------------------------------------------------
  // SHOW : halo + particules + noyau
  // --------------------------------------------------------
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    const pulse = 1 + 0.15 * sin(frameCount * 0.2 + this.pulseOffset);

    // Halo cosmique
    noFill();
    stroke(80, 255, 200, 120);
    strokeWeight(5);
    ellipse(0, 0, this.r * 4 * pulse);

    stroke(120, 255, 240, 60);
    strokeWeight(10);
    ellipse(0, 0, this.r * 6 * pulse);

    // Particules orbitales
    noStroke();
    for (let p of this.sparkParticles) {
      p.ang += p.speed;
      ellipse(
        cos(p.ang) * p.dist,
        sin(p.ang) * p.dist,
        5, 5
      );
    }

    // Noyau
    fill(255, 255, 255, 240);
    ellipse(0, 0, this.r * 1.6);

    fill(0, 255, 200, 230);
    ellipse(0, 0, this.r * 1.1);

    pop();
  }
}



// ========================================================
// 2. SNAKE SEGMENT — suit le précédent via arrive()
// ========================================================
class SnakeSegment extends Vehicle {

  constructor(x, y, distance) {
    super(x, y);

    this.followDistance = distance;
    this.r = 10;

    this.maxSpeed = 6;
    this.maxForce = 0.4;

    this.pulseOffset = random(500);
    this.aura = random(TWO_PI);
  }

  updateBehavior(leader) {
    let force = this.arrive(leader.pos, this.followDistance);
    this.applyForce(force);
    this.aura += 0.1;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    const pulse = 1 + 0.15 * sin(frameCount * 0.2 + this.pulseOffset);

    // Halos
    noFill();
    stroke(80, 255, 180, 80);
    strokeWeight(3);
    ellipse(0, 0, this.r * 2.5 * pulse);

    stroke(120, 255, 220, 40);
    strokeWeight(6);
    ellipse(0, 0, this.r * 4 + sin(this.aura) * 6);

    // Cœur
    noStroke();
    fill(200, 255, 240, 240);
    ellipse(0, 0, this.r * 1.2);

    fill(0, 220, 160, 200);
    ellipse(0, 0, this.r * 2);

    pop();
  }
}



// ========================================================
// 3. SNAKE — gère head + segments + mini séparation interne
// ========================================================
class Snake {

  constructor(x, y, nbSegments = 6, dist = 20) {
    this.parts = [];

    this.head = new SnakeHead(x, y);
    this.parts.push(this.head);

    for (let i = 1; i < nbSegments; i++) {
      this.parts.push(new SnakeSegment(x, y, dist));
    }
  }

  update(player, obstacles) {

    // Head
    this.head.updateBehavior(player, obstacles, this.parts);
    this.head.update();
    this.head.edges();

    // Segments
    for (let i = 1; i < this.parts.length; i++) {
      let leader = this.parts[i - 1];
      let seg = this.parts[i];

      seg.updateBehavior(leader);
      seg.update();
      seg.edges();
    }

    // MINI SEPARATION interne
    for (let i = 1; i < this.parts.length; i++) {
      let a = this.parts[i];
      let b = this.parts[i - 1];

      let d = p5.Vector.dist(a.pos, b.pos);
      let minDist = a.r + b.r * 0.9;

      if (d < minDist) {
        let push = p5.Vector.sub(a.pos, b.pos);
        push.setMag((minDist - d) * 0.12);

        a.pos.add(push);
        b.pos.sub(push.mult(0.2));
      }
    }
  }

  show() {
    // Ligne énergétique du corps
    push();
    noFill();
    stroke(80, 255, 200, 80);
    strokeWeight(3);

    beginShape();
    for (let p of this.parts) vertex(p.pos.x, p.pos.y);
    endShape();
    pop();

    // Chaque partie
    for (let p of this.parts) p.show();
  }
}
