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
backgroundImage.src = 'Flappybirds.png'; // Replace with the path to your background image

const birdImg = new Image();
birdImg.src = "nyancatrainbowbutt.png"; // Replace "bird.png" with the path to your bird image

// Game variables
let birdY = canvas.height / 2;
let birdVelocity = 0;
const gravity = 0.2;

const jump = -8;

let score = 0;
let highScore = 0;
let level = 1;
let isGameOver = false;
let gameStarted = false;
let pipeSpeed = 2;

// Pipe settings
const pipeWidth = 60;
const pipeGap = 250;  // Further increase gap between top and bottom pipes
const pipeSpacing = 300;  // Space between pipes
const pipes = [];

// Bird settings
const birdSize = 40;
let ceilingHitCooldown = 0;  // Counter for staying on the ceiling

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


  // Draw pipes with border and top part
function drawPipes() {
  pipes.forEach(pipe => {
    // Pipe colors
    const pipeBodyColor = "#228B22"; // Forest green
    const pipeTopColor = "#006400"; // Darker green for the top
    const borderColor = "#003300"; // Darker green for the border

    // Set pipe border thickness
    const borderThickness = 4;

    // Draw top part of the pipe
    ctx.fillStyle = pipeTopColor;
    ctx.fillRect(
      pipe.x - borderThickness,   // Extend slightly for border effect
      pipe.topPipe - 20,          // Give top pipe cap height
      pipeWidth + 2 * borderThickness,  // Add width for border
      20                          // Height of the top part
    );

    ctx.fillRect(
      pipe.x - borderThickness,
      pipe.bottomPipe,
      pipeWidth + 2 * borderThickness,
      20
    );

    // Draw pipe body with border
    ctx.fillStyle = borderColor; // Border color for pipe
    ctx.fillRect(pipe.x - borderThickness, 0, pipeWidth + 2 * borderThickness, pipe.topPipe);
    ctx.fillRect(pipe.x - borderThickness, pipe.bottomPipe, pipeWidth + 2 * borderThickness, canvas.height - pipe.bottomPipe);

    // Draw the inner pipe
    ctx.fillStyle = pipeBodyColor;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topPipe);
    ctx.fillRect(pipe.x, pipe.bottomPipe, pipeWidth, canvas.height - pipe.bottomPipe);
  });
}


// Update pipes
function updatePipes() {
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeSpacing) {
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
      pipe.scored = true;

      // Increase speed and level
      if (score % 10 === 0) {
        level++;
        pipeSpeed += 0.5;
      }

      // Update high score
      if (score > highScore) {
        highScore = score;
      }
    }
  });

  // Remove off-screen pipes
  if (pipes.length && pipes[0].x < -pipeWidth) {
    pipes.shift();
  }
}

// Game mechanics
function updateGame() {
  if (!gameStarted || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Apply gravity and update bird position if it's not glued to the ceiling
  if (ceilingHitCooldown > 0) {
    ceilingHitCooldown--;
  } else {
    birdVelocity += gravity;
    birdY += birdVelocity;
  }

  // Prevent bird from going off the canvas
  if (birdY > canvas.height - birdSize) {
    isGameOver = true;  // Game over if bird touches the bottom
  } else if (birdY < 0) {
    birdY = 0;               // Stop the bird at the top
    birdVelocity = 0;        // Reset upward velocity
    ceilingHitCooldown = 20; // Stay on the ceiling for a bit before falling
  }

  drawBird();
  drawPipes();
  updatePipes();

  // Draw the score on the canvas
  ctx.fillStyle = "#FF8C00"; // Color for the score text
  ctx.font = "24px Arial"; // Font style and size
  ctx.fillText("Score: " + score, 20, 30); // Positioning score text
  ctx.fillText("High Score: " + highScore, 20, 60); // Positioning high score text

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

  ceilingHitCooldown = 0;
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
