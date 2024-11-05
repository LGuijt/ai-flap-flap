const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d");

// Set canvas to full screen size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'Flappybirds.png';

const birdImg = new Image();
birdImg.src = "birb.png"; // Replace "bird.png" with the path to your bird image

// Game variables
let birdY = canvas.height / 2;
let birdVelocity = 0;
const gravity = 0.2;
const jump = -5;
let score = 0;
let level = 1;
let isGameOver = false;
let gameStarted = false;
let pipeSpeed = 2;

// Pipe settings
const pipeWidth = 60;
const pipeGap = 150;
const pipes = [];

// Bird settings
const birdSize = 20;

// Draw bird with external image
function drawBird() {
  const birdX = 50; // Fixed X position of the bird
  ctx.drawImage(birdImg, birdX, birdY, birdSize, birdSize);
}

// Generate pipes
function createPipe() {
  const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
  pipes.push({
    x: canvas.width,
    topPipe: pipeHeight,
    bottomPipe: pipeHeight + pipeGap
  });
}

// Draw pipes
function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topPipe);
    ctx.fillRect(pipe.x, pipe.bottomPipe, pipeWidth, canvas.height - pipe.bottomPipe);
  });
}

// Update pipes
function updatePipes() {
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    createPipe();
  }

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    // Check for collision
    if (
      50 < pipe.x + pipeWidth &&
      50 + birdSize > pipe.x &&
      (birdY < pipe.topPipe || birdY + birdSize > pipe.bottomPipe)
    ) {
      isGameOver = true;
    }

    // Score update
    if (pipe.x + pipeWidth < 50 && !pipe.scored) {
      score++;
      document.getElementById("score").textContent = score;
      pipe.scored = true;

      // Increase speed and level
      if (score % 10 === 0) {
        level++;
        pipeSpeed += 0.5;  // Increase speed with each level
      }
    }
  });

  // Remove off-screen pipes
  if (pipes.length && pipes[0].x < -pipeWidth) {
    pipes.shift();
  }
}

// Draw Golden Marion at level 999
function drawGoldenMarion() {
  const marionX = canvas.width - 60;
  ctx.fillStyle = "gold";
  ctx.fillRect(marionX, birdY, birdSize + 10, birdSize + 10);
}

// Game mechanics
function updateGame() {
  if (!gameStarted || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Apply gravity and update bird position
  birdVelocity += gravity;
  birdY += birdVelocity;

  // Prevent bird from going off the canvas
  if (birdY > canvas.height - birdSize || birdY < 0) {
    isGameOver = true;
  }

  drawBird();
  drawPipes();
  updatePipes();

  // Check if level 999 reached
  if (level === 999) {
    drawGoldenMarion();

    // Golden Marion collision detection
    if (
      birdY < canvas.height / 2 + birdSize + 5 &&
      birdY + birdSize > canvas.height / 2 - birdSize - 5
    ) {
      isGameOver = true;
    }
  }

  if (!isGameOver) {
    requestAnimationFrame(updateGame);
  } else {
    alert("Game Over! Your score: " + score);
    resetGame();
  }
}

// Reset game
function resetGame() {
  birdY = canvas.height / 2;
  birdVelocity = 0;
  score = 0;
  level = 1;
  pipes.length = 0;
  isGameOver = false;
  gameStarted = false;
  pipeSpeed = 2;
  document.getElementById("score").textContent = score;
}

// Start game on space bar press
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      gameStarted = true;
      updateGame();
    }
    birdVelocity = jump;
  }
});
