// ---------- CONFIG ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const INITIAL_GAME_SPEED = 5;
let gameSpeed = INITIAL_GAME_SPEED;
let gravity = 0.5;
let gameOver = false;
let score = 0;
let lastMilestone = 0; // evita disparos repetidos en el mismo múltiplo de 100
let highScore = Number(localStorage.getItem("highScore")) || 0;

// Sonidos (ajusta rutas)
let jumpSound = new Audio("sonido/jump.mp3");
let scoreSound = new Audio("sonido/score.mp3");
jumpSound.volume = 0.9;
scoreSound.volume = 0.9;

// ---------- ENTIDADES ----------
let dino = {
  x: 50,
  y: canvas.height - 47,
  width: 44,
  height: 47,
  vy: 0,
  isJumping: false
};

let obstacle = {
  x: canvas.width,
  y: canvas.height - 40,
  width: 25,
  height: 40
};

// Imágenes (si las tienes)
let dinoImg = new Image();
dinoImg.src = "images/dino.png";
let dinoJumpImg = new Image();
dinoJumpImg.src = "images/dino_jumping.png";
let cactusImg = new Image();
cactusImg.src = "images/cactus.png";

// ---------- LÓGICA DEL JUEGO ----------
function gameLoop() {

    update();
    draw();
    requestAnimationFrame(gameLoop);

}

function update() {

  if (gameOver) return;
  // Incrementa puntuación (1 por frame). Si quieres que vaya por tiempo, cambia por deltaTime.
  score++;

  // Actualiza high score si es necesario (aseguramos número en localStorage).
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", String(highScore));
  }

  // Aumenta velocidad cada 100 puntos (y evita actuar en 0).
  if (score > 0 && score % 100 === 0 && score !== lastMilestone) {
    gameSpeed += 1;
    // reproducir sonido de milestone (reiniciar posición para poder escuchar repetidas veces)
    scoreSound.currentTime = 0;
    // si el navegador bloquea el play hasta interacción, al menos intentamos.
    scoreSound.play().catch(()=>{ /* posible bloqueo por autoplay */ });
    lastMilestone = score;
  }

  // Física del salto
  if (dino.isJumping) {
    dino.vy += gravity;
    dino.y += dino.vy;
    if (dino.y >= canvas.height - dino.height) {
      dino.y = canvas.height - dino.height;
      dino.isJumping = false;
      dino.vy = 0;
    }
  }

  // Movimiento obstáculo
  obstacle.x -= gameSpeed;
  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = canvas.width + Math.random() * 200;
  }

  // Colisión
  if (collision(dino, obstacle)) {
    gameOver = true;
    document.getElementById("restartBtn").classList.remove("hidden");
  }
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ---------- DIBUJO ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Puntos en pantalla
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 650, 20);

  // DINO (imagen o rectángulo)
  if (dinoImg.complete && dinoJumpImg.complete) {
    const imageToDraw = dino.isJumping ? dinoJumpImg : dinoImg;
    ctx.drawImage(imageToDraw, dino.x, dino.y, dino.width, dino.height);

    // Si está saltando, añadimos un tinte (mejora visual para "color al saltar")
    if (dino.isJumping) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "orange";
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
      ctx.restore();
    }
  } else {
    // fallback sin imágenes: cambia color al saltar
    ctx.fillStyle = dino.isJumping ? "orange" : "green";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
  }

  // CACTUS
  if (cactusImg.complete) {
    ctx.drawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  } else {
    ctx.fillStyle = "brown";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

// ---------- CONTROLES ----------
document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && !dino.isJumping && !gameOver) {
    dino.isJumping = true;
    dino.vy = -10;
    // reproducir sonido de salto
    jumpSound.currentTime = 0;
    jumpSound.play().catch(()=>{ /* posible bloqueo por autoplay */ });
    e.preventDefault();
  }
});

// Botón reiniciar
document.getElementById("restartBtn").addEventListener("click", function() {
  // Reset limpio
  gameOver = false;
  score = 0;
  lastMilestone = 0;
  gameSpeed = INITIAL_GAME_SPEED;
  dino.y = canvas.height - dino.height;
  dino.isJumping = false;
  dino.vy = 0;
  obstacle.x = canvas.width;
  this.classList.add("hidden");
});

// Inicia juego al cargar (oculta botón si estaba visible)
window.onload = function() {
  document.getElementById("restartBtn").classList.add("hidden");
  gameLoop();
};
