const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let colors = [];
let selectedPipeColor = "#228B22"; // Default pipe color

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
birdImg.src = "nyancatrainbowbutt.png";

fetch('colors.json')
  .then(response => response.json())
  .then(data => {
    colors = data.colors;
    console.log(colors); // Array of colors
    createColorButtons(); // Call to create color buttons
  })
  .catch(error => console.error('Error loading the colors:', error));

// Function to create color buttons
function createColorButtons() {
  const colorButtonsContainer = document.getElementById("colorButtons");
  colors.forEach(color => {
    const button = document.createElement("button");
    button.style.backgroundColor = color.hex; // Set button color
    button.textContent = color.name;
    button.onclick = () => {
      selectedPipeColor = color.hex; // Set selected color
    };
    colorButtonsContainer.appendChild(button);
  });
}

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
const pipeGap = 250;
const pipeSpacing = 300;
const pipes = [];

// Bird settings
const birdSize = 40;
let ceilingHitCooldown = 0;

// Draw bird with external image
function drawBird() {
  const birdX = 50;
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
    // Set pipe border thickness
    const borderThickness = 4;

    // Draw top part of the pipe
    ctx.fillStyle = selectedPipeColor; // Use selected color
    ctx.fillRect(
      pipe.x - borderThickness,
      pipe.topPipe - 20,
      pipeWidth + 2 * borderThickness,
      20
    );

    ctx.fillRect(
      pipe.x - borderThickness,
      pipe.bottomPipe,
      pipeWidth + 2 * borderThickness,
      20
    );

    // Draw pipe body with border
    ctx.fillStyle = "#003300"; // Border color for pipe
    ctx.fillRect(pipe.x - borderThickness, 0, pipeWidth + 2 * borderThickness, pipe.topPipe);
    ctx.fillRect(pipe.x - borderThickness, pipe.bottomPipe, pipeWidth + 2 * borderThickness, canvas.height - pipe.bottomPipe);

    // Draw the inner pipe
    ctx.fillStyle = selectedPipeColor; // Use selected color for inner pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topPipe);
    ctx.fillRect(pipe.x, pipe.bottomPipe, pipeWidth, canvas.height - pipe.bottomPipe);
}
  )
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
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  if (ceilingHitCooldown > 0) {
    ceilingHitCooldown--;
  } else {
    birdVelocity += gravity;
    birdY += birdVelocity;
  }

  // Prevent bird from going off the canvas
  if (birdY > canvas.height - birdSize) {
    isGameOver = true;
  } else if (birdY < 0) {
    birdY = 0;
    birdVelocity = 0;
    ceilingHitCooldown = 20;
  }

  drawBird();
  drawPipes();
  updatePipes();

  // Draw the score on the canvas
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("High Score: " + highScore, 20, 60);

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
