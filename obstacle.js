// ======================================================
//  CLASS OBSTACLE
//  Un obstacle statique avec un rendu cosmique animé.
//  Sert pour : évitement des ennemis / serpents / missiles.
//  Compatible avec obstacleEditMode et highlight.
// ======================================================
class Obstacle {

  constructor(x, y, r, couleur) {
    // Position et rayon
    this.pos = createVector(x, y);
    this.r = r;

    // Couleur principale (noyau)
    this.color = couleur;

    // Décalage aléatoire pour les pulsations cosmiques
    this.phase = random(TWO_PI);
    this.highlight = false;
  }

  // ======================================================
  //  RENDER : Affichage complet de l’obstacle
  // ======================================================
  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // ------------------------------------------------------
    // PULSATION COSMIQUE (varie avec le temps)
    // ------------------------------------------------------
    const pulse = 1 + 0.12 * sin(frameCount * 0.1 + this.phase);

    // ======================================================
    // 1. HALO COSMIQUE AUTOUR DE LA ROCHE
    //    Deux modes : normal (vert) / highlight (rouge)
    // ======================================================
    noFill();

    if (this.highlight) {
      // Mode danger → teinte rouge
      stroke(255, 80, 80, 140);
      strokeWeight(6);
      ellipse(0, 0, this.r * 3.2 * pulse);

      stroke(255, 40, 40, 70);
      strokeWeight(10);
      ellipse(0, 0, this.r * 4.2 * pulse);

    } else {
      // Mode normal → énergie verte
      stroke(80, 255, 170, 120);
      strokeWeight(5);
      ellipse(0, 0, this.r * 3 * pulse);

      stroke(60, 220, 150, 60);
      strokeWeight(9);
      ellipse(0, 0, this.r * 4 * pulse);
    }

    // ======================================================
    // 2. COEUR MINÉRAL — le vrai corps de l’obstacle
    // ======================================================
    noStroke();

    if (this.highlight) fill(255, 80, 80);
    else fill(this.color);

    ellipse(0, 0, this.r * 2.1);

    // petit noyau lumineux
    if (this.highlight) fill(255, 255, 255, 230);
    else fill(200, 255, 230, 220);

    ellipse(0, 0, this.r * 1.0);

    // ======================================================
    // 3. VEINES D'ÉNERGIE — polygone rotatif dynamique
    // ======================================================
    push();
    rotate(frameCount * 0.02 + this.phase);

    strokeWeight(2);
    if (this.highlight) stroke(255, 180, 180, 200);
    else stroke(120, 255, 210, 200);

    noFill();
    beginShape();

    // Hexagone énergétique animé
    for (let i = 0; i < 6; i++) {
      let ang = (TWO_PI / 6) * i;
      let rad = this.r * 0.9 + sin(frameCount * 0.1 + i) * 3;

      let vx = cos(ang) * rad;
      let vy = sin(ang) * rad;

      vertex(vx, vy);
    }

    endShape(CLOSE);
    pop(); // rotation
    pop(); // translation
  }
}
