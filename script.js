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

// Load images
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
let birdY;
let birdVelocity = 0;
const gravity = 0.2;

const jump = -4; // Adjust jump height for better control

let score = 0;
let highScore = 0;
let isGameOver = false;
let gameStarted = false;
let pipeSpeed = 2; // Initial pipe speed

// Pipe settings
const pipeWidth = 60;

const pipeGap = 250;  // Gap between top and bottom pipes
const pipeSpacing = 300;  // Space between pipes

const pipes = [];

// Bird settings
const birdSize = 40;


// Initialize bird position
function initBird() {
    birdY = canvas.height / 2; // Mid-air position
    birdVelocity = 0; // Reset velocity
}


// Draw bird with external image
function drawBird() {
    const birdX = 50; // Fixed X position of the bird
    ctx.drawImage(birdImg, birdX, birdY, birdSize, birdSize);

}

// Generate pipes
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100) + 50); // Added range
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

            // Increase speed every 10 points
            if (score % 10 === 0) {
                pipeSpeed += 0.1; // Increase speed slightly with every 10 points
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Apply gravity and update bird position
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Prevent bird from going off the canvas
    if (birdY > canvas.height - birdSize) {
        isGameOver = true;  // Game over if bird touches the bottom
    } else if (birdY < 0) {
        birdY = 0;               // Stop the bird at the top
        birdVelocity = 0;        // Reset upward velocity
    }

    drawBird();
    drawPipes();
    updatePipes();

    // Draw the score on the canvas
    ctx.fillStyle = "black"; // Color for the score text
    ctx.font = "24px Arial"; // Font style and size
    ctx.fillText("Score: " + score, 20, 30); // Positioning score text
    ctx.fillText("High Score: " + highScore, 20, 60); // Positioning high score text

    if (!isGameOver) {
        requestAnimationFrame(updateGame);
    } else {
        showDeathScreen();
    }
}

// Show death screen
function showDeathScreen() {
    document.getElementById("death-screen").style.display = "flex";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("final-score").innerText = score; // Display final score

}

// Reset game
function resetGame() {
    initBird(); // Initialize bird position
    score = 0;
    pipes.length = 0;
    isGameOver = false;
    gameStarted = false;
    pipeSpeed = 2; // Reset pipe speed to normal

    // Hide death screen and show game canvas
    document.getElementById("death-screen").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";


    // Hide start screen and show game canvas
    document.getElementById("start-screen").style.display = "none";

    updateGame(); // Start the game loop
}

// Start game on play button press
document.getElementById("play-button").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    gameStarted = true;
    initBird(); // Initialize bird position before starting the game
    updateGame();
});

// Restart game on button press
document.getElementById("restart-button").addEventListener("click", resetGame);

// Go back to homepage
document.getElementById("home-button").addEventListener("click", () => {
    location.reload(); // Reload the page to go back to the homepage
});

// Control the bird with spacebar
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (gameStarted) {
            birdVelocity = jump; // Jump only if game is started
        } else {
            // Start the game if it's not started yet
            document.getElementById("start-screen").style.display = "none";
            gameStarted = true;
            initBird(); // Initialize bird position
            updateGame();
        }
    }
});
