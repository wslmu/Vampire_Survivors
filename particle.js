// ======================================================
//  PARTICULE COSMIQUE
//  Utilisée pour explosions, impacts, traînées, effets.
//  Mouvement simple + fade-out + rotation.
// ======================================================
class Particle {

  constructor(x, y, col) {

    // ------------------------------------------------------
    // Position initiale
    // ------------------------------------------------------
    this.pos = createVector(x, y);

    // ------------------------------------------------------
    // Vitesse aléatoire (direction + intensité)
    // ------------------------------------------------------
    this.vel = p5.Vector.random2D().mult(random(1, 4));

    // ------------------------------------------------------
    // Couleur et transparence
    // ------------------------------------------------------
    this.color = col;
    this.alpha = 255;

    // ------------------------------------------------------
    // Taille et effets visuels
    // ------------------------------------------------------
    this.r = random(2, 6);          // rayon variable
    this.fadeSpeed = random(4, 7);  // vitesse disparition
    this.expand = random(0.05, 0.25); // expansion douce

    // ------------------------------------------------------
    // Rotation cosmique 
    // ------------------------------------------------------
    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.05, 0.05);
  }

  // ======================================================
  //  UPDATE : Physique simplifiée
  // ======================================================
  update() {
    // Déplacement
    this.pos.add(this.vel);

    // Expansion progressive
    this.r += this.expand;

    // Rotation des "débris"
    this.rotation += this.rotSpeed;

    // Disparition progressive
    this.alpha -= this.fadeSpeed;
  }

  // ======================================================
  //  FINISHED : Particule morte ?
  // ======================================================
  finished() {
    return this.alpha <= 0;
  }

  // ======================================================
  //  SHOW : Affichage cosmique
  // ======================================================
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    noStroke();
    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.alpha  // fade-out
    );

    // ellipse allongée → effet "fragment incandescent"
    ellipse(0, 0, this.r * 1.6, this.r);

    pop();
  }
}
