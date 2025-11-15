// ======================================================
// VARIABLES GLOBALES
// ======================================================
let gameState = "menu";
let level = 0;

let player;
let enemies = [];
let bullets = [];
let snakes = [];
let obstacles = [];
let missiles = [];

let timer = 0;
let killCount = 0;
let bossHP = 5;
let lastSpawn = 0;

let score = 0;
let particles = [];

// Upgrades
let playerSpeed = 3;
let shield = 0;

let bulletSpeed = 4;
let bulletRange = 200;
let bulletCount = 6;
let bulletRotationSpeed = 0.03;

let enemiesBase = 10;
let snakesBase = 1;

let endStatus = null;
let hasOpenedUpgrade = false;

// Modes
let obstacleEditMode = false;

// Missiles
let missilesUnlocked = false;
let missileReady = false;
let killsSinceLastMissile = 0;

// Background
let starfield = [];
let nebulaOffset = 0;

// Shake FX
let shakeIntensity = 0;
let shakeDuration = 0;


// ======================================================
// SETUP
// ======================================================
function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("game-container");
    noCursor();

    for (let i = 0; i < 200; i++) {
        starfield.push({
            x: random(width),
            y: random(height),
            z: random(0.2, 1.2),
            alpha: random(120, 255)
        });
    }
}


// ======================================================
// CAMERA SHAKE
// ======================================================
function cameraShake() {
    if (shakeDuration > 0) {
        shakeDuration--;
        translate(
            random(-shakeIntensity, shakeIntensity),
            random(-shakeIntensity, shakeIntensity)
        );
    }
}

function triggerShake(intensity = 4, duration = 10) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}


// ======================================================
// BACKGROUND
// ======================================================
function drawCosmicBackground() {
    nebulaOffset += 0.002;

    noStroke();
    fill(0, 0, 0, 80);
    rect(0, 0, width, height);

    // Nebula
    for (let y = 0; y < height; y += 40) {
        for (let x = 0; x < width; x += 40) {
            let n = noise(x * 0.001, y * 0.001, nebulaOffset);
            let col = color(50 + n * 150, 80 + n * 120, 200 + n * 55, 60);
            fill(col);
            rect(x, y, 40, 40);
        }
    }

    // Stars
    for (let s of starfield) {
        fill(255, s.alpha);
        ellipse(s.x, s.y, 2 + s.z * 1.5);
        s.alpha += sin(frameCount * 0.02 + s.x) * 0.2;
    }
}


// ======================================================
// PARTICLE EXPLOSION
// ======================================================
function spawnCosmicExplosion(x, y, col) {
    for (let k = 0; k < 16; k++) particles.push(new Particle(x, y, col));
    triggerShake(4, 12);
}


// ======================================================
// START LEVEL
// ======================================================
function startLevel(lvl) {
    level = lvl;
    hasOpenedUpgrade = false;
    endStatus = null;

    resetGame();

    document.getElementById("menu-container").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("hint-bar").style.display = "block";

    gameState = "playing";
}


// ======================================================
// RESET
// ======================================================
function resetGame() {

    enemies = [];
    bullets = [];
    snakes = [];
    obstacles = [];
    missiles = [];

    timer = 0;
    killCount = 0;
    killsSinceLastMissile = 0;

    missileReady = false;
    missilesUnlocked = false;

    bossHP = 5;
    score = 0;
    lastSpawn = 0;

    player = new Player(width / 2, height / 2);

    for (let i = 0; i < bulletCount; i++) {
        bullets.push(new Bullet(player, (TWO_PI / bulletCount) * i));
    }

    obstacles.push(new Obstacle(width / 2, height / 2, 80, "green"));

    if (level === 1) {
        for (let i = 0; i < enemiesBase; i++)
            enemies.push(spawnEnemySafe());
    }

    if (level === 2) {
        for (let i = 0; i < snakesBase; i++)
            snakes.push(new Snake(random(width), random(height), 7, 20));
    }

    if (level === 3) {
        for (let i = 0; i < snakesBase; i++)
            snakes.push(new Snake(random(width), random(height), 7, 20));

        for (let i = 0; i < enemiesBase; i++)
            enemies.push(spawnEnemySafe());
    }
}


// ======================================================
// SAFE SPAWN
// ======================================================
function spawnEnemySafe() {
    let x, y;
    let safe = false;

    while (!safe) {
        x = random(width);
        y = random(height);
        if (dist(x, y, player.pos.x, player.pos.y) > 250) safe = true;
    }

    return new Enemy(x, y);
}


// ======================================================
// DRAW LOOP
// ======================================================
function draw() {

    drawCosmicBackground();
    cameraShake();

    if (gameState === "menu") return;

    if (gameState === "win" || gameState === "lose") {

        if (!hasOpenedUpgrade) {
            hasOpenedUpgrade = true;
            endStatus = (gameState === "win") ? "win" : "lose";
            openUpgradeMenu();
        }

        if (gameState === "win") showWin();
        else showLose();

        return;
    }

    if (gameState === "upgrade") return;

    playGame();
    renderHUD();

    if (obstacleEditMode && gameState === "playing") {
        push();
        noFill();
        stroke(255, 60, 60);
        strokeWeight(2);
        circle(mouseX, mouseY, 30);
        pop();
    }
}


// ======================================================
// INPUT
// ======================================================
function keyPressed() {

    if (key === 'o' || key === 'O')
        obstacleEditMode = !obstacleEditMode;

    // FIRE MISSILE
    if (key === 'm' || key === 'M') {
        if (missileReady && enemies.length > 0) launchMissile();
    }
}

function mousePressed() {
    if (obstacleEditMode && gameState === "playing")
        obstacles.push(new Obstacle(mouseX, mouseY, 60, "red"));
}


// ======================================================
// LAUNCH MISSILE
// ======================================================
function launchMissile() {

    let sorted = [...enemies].sort((a, b) =>
        dist(player.pos.x, player.pos.y, a.pos.x, a.pos.y) -
        dist(player.pos.x, player.pos.y, b.pos.x, b.pos.y)
    );

    let targets = sorted.slice(0, 2);
    missiles.push(new Missile(player.pos.x, player.pos.y, targets));

    missileReady = false;
    killsSinceLastMissile = 0;

    triggerShake(6, 12);

    document.getElementById("hint-bar").textContent =
        "O – Toggle Obstacle Mode | Click – Add Obstacle | M – Launch Missile";
}


// ======================================================
// GAME LOOP
// ======================================================
function playGame() {

    timer += deltaTime / 1000;

    // Unlock missiles (Level 1 & 3)
    if (!missilesUnlocked && killCount >= 5 && (level === 1 || level === 3)) {
        missilesUnlocked = true;
        missileReady = true;
    }

    player.updateBehavior();
    player.update();
    player.show();

    for (let b of bullets) {
        b.updateBehavior();
        b.update();
        b.show();
    }

    for (let e of enemies) {
        e.updateBehavior(player, enemies, obstacles);
        e.update();
        e.show();
    }

    if (level === 3 && millis() - lastSpawn > 2500) {
        enemies.push(spawnEnemySafe());
        lastSpawn = millis();
    }

    for (let s of snakes) {
        s.update(player, obstacles);
        s.show();
    }

    for (let o of obstacles) o.show();

    // MISSILES
    for (let i = missiles.length - 1; i >= 0; i--) {

        let m = missiles[i];
        m.updateBehavior();
        m.update();
        m.show();

        if (m.dead) {
            missiles.splice(i, 1);
            continue;
        }

        // missile → enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];

            if (dist(m.pos.x, m.pos.y, e.pos.x, e.pos.y) < m.r + e.r) {

                spawnCosmicExplosion(e.pos.x, e.pos.y, color(255, 80, 80));

                enemies.splice(j, 1);
                killCount++;
                score += 20;

                m.dead = true;
                break;
            }
        }
    }

    // COLLISIONS
    handleBulletEnemyCollisions();
    handleBulletBossCollisions();
    handlePlayerCollisions();

    // PARTICLES
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.show();
        if (p.finished()) particles.splice(i, 1);
    }

    checkVictory();
}


// ======================================================
// BULLET → ENEMY
// ======================================================
function handleBulletEnemyCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {

        let e = enemies[i];

        for (let b of bullets) {

            if (dist(e.pos.x, e.pos.y, b.pos.x, b.pos.y) < e.r + b.r) {

                spawnCosmicExplosion(e.pos.x, e.pos.y, color(255, 50, 50));

                enemies.splice(i, 1);
                killCount++;
                score += 10;

                killsSinceLastMissile++;

                if (killsSinceLastMissile >= 5 && missilesUnlocked) {
                    missileReady = true;
                    document.getElementById("hint-bar").textContent = "MISSILE READY — Press M";
                }

                break;
            }
        }
    }
}


// ======================================================
// BULLET → BOSS HEAD
// ======================================================
function handleBulletBossCollisions() {
    if (snakes.length === 0) return;

    let head = snakes[0].head;

    for (let b of bullets) {

        if (dist(head.pos.x, head.pos.y, b.pos.x, b.pos.y) < head.r + b.r) {

            bossHP--;
            score += 20;

            spawnCosmicExplosion(head.pos.x, head.pos.y, color(0, 255, 200));

            if (bossHP <= 0) snakes.splice(0, 1);

            break;
        }
    }
}


// ======================================================
// PLAYER COLLISIONS
// ======================================================
function handlePlayerCollisions() {

    for (let e of enemies)
        if (dist(player.pos.x, player.pos.y, e.pos.x, e.pos.y) < player.r + e.r)
            player.takeDamage(100);

    for (let s of snakes) {
        let head = s.head;
        if (dist(player.pos.x, player.pos.y, head.pos.x, head.pos.y) < player.r + head.r)
            player.takeDamage(100);
    }
}


// ======================================================
// VICTORY CONDITIONS
// ======================================================
function checkVictory() {

    if (level === 1 && enemies.length === 0) gameState = "win";
    if (level === 2 && snakes.length === 0) gameState = "win";

    if (level === 3 && snakes.length === 0 && killCount >= 20)
        gameState = "win";
}


// ======================================================
// HUD
// ======================================================
function renderHUD() {

    let msg = "";
    if (missilesUnlocked) {
        msg = missileReady ? " | MISSILES CHARGÉS — Appuyez sur M" : " | Missile rechargement...";
    }

    let shieldMsg = (shield > 0) ? ` | Boucliers : ${shield}` : "";

    document.getElementById("hud").innerHTML =
        `Niveau : ${level} | Temps : ${timer.toFixed(1)}s | Kills : ${killCount} | Score : ${score}` +
        (snakes.length > 0 ? ` | Boss HP : ${bossHP}` : "") +
        shieldMsg +
        msg;
}


// ======================================================
// END SCREENS
// ======================================================
function showWin() {
    fill(0, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("YOU WIN", width / 2, height / 2);
}

function showLose() {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("GAME OVER", width / 2, height / 2);
}


// ======================================================
// UPGRADE MENU
// ======================================================
function openUpgradeMenu() {

    gameState = "upgrade";

    const menu = document.getElementById("upgrade-menu");
    const title = document.getElementById("end-title");

    title.classList.remove("end-win", "end-lose");

    if (endStatus === "win") {
        title.textContent = "YOU WIN";
        title.classList.add("end-win");
    } else if (endStatus === "lose") {
        title.textContent = "GAME OVER";
        title.classList.add("end-lose");
    } else {
        title.textContent = "FIN DE PARTIE";
    }

    menu.style.display = "block";

    // sliders → valeurs
    document.getElementById("up-speed").value = playerSpeed;
    document.getElementById("val-speed").textContent = playerSpeed;

    document.getElementById("up-shield").value = shield;
    document.getElementById("val-shield").textContent = shield;

    document.getElementById("up-enemies").value = enemiesBase;
    document.getElementById("val-enemies").textContent = enemiesBase;

    document.getElementById("up-snakes").value = snakesBase;
    document.getElementById("val-snakes").textContent = snakesBase;

    // visibility
    const rowEnemies = document.getElementById("row-enemies");
    const rowSnakes = document.getElementById("row-snakes");

    if (level === 1) {
        rowEnemies.style.display = "flex";
        rowSnakes.style.display = "none";
    } else if (level === 2) {
        rowEnemies.style.display = "none";
        rowSnakes.style.display = "flex";
    } else {
        rowEnemies.style.display = "flex";
        rowSnakes.style.display = "flex";
    }

    bindUpgradeSliders();
}

function bindUpgradeSliders() {
    let s1 = document.getElementById("up-speed");
    let v1 = document.getElementById("val-speed");
    s1.oninput = () => (v1.textContent = s1.value);

    let s2 = document.getElementById("up-shield");
    let v2 = document.getElementById("val-shield");
    s2.oninput = () => (v2.textContent = s2.value);

    let s3 = document.getElementById("up-enemies");
    let v3 = document.getElementById("val-enemies");
    s3.oninput = () => (v3.textContent = s3.value);

    let s4 = document.getElementById("up-snakes");
    let v4 = document.getElementById("val-snakes");
    s4.oninput = () => (v4.textContent = s4.value);
}


// ======================================================
// APPLY UPGRADES
// ======================================================
function applyUpgrades() {

    playerSpeed = parseFloat(document.getElementById("up-speed").value);
    shield = parseInt(document.getElementById("up-shield").value);
    enemiesBase = parseInt(document.getElementById("up-enemies").value);
    snakesBase = parseInt(document.getElementById("up-snakes").value);

    document.getElementById("upgrade-menu").style.display = "none";

    startLevel(level);
}


// ======================================================
// BACK TO MENU
// ======================================================
function backToMenu() {
    document.location.reload();
}
