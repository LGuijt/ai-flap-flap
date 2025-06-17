const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let colors = [];
let selectedPipeColor = "#228B22"; // Default pipe color
let selectedBirdSprite;

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

let birdSprites = [];

// Load bird sprite data
fetch('bird_sprites.json')
    .then(response => response.json())
    .then(data => {
        birdSprites = data.birdSprites;
        console.log(birdSprites); // Array of bird sprites
        loadBirdSpriteImages(); // Function to load images after fetching the data
    })
    .catch(error => console.error('Error loading the bird sprites:', error));

// Function to load bird images into memory
function loadBirdSpriteImages() {
    birdSprites.forEach(bird => {
        const img = new Image();
        img.src = bird.path; // Set the source to the path from JSON
        bird.image = img; // Add the image object to the bird sprite
    });
}

fetch('colors.json')
    .then(response => response.json())
    .then(data => {
        colors = data.colors;
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
const birdSize = 60;

// Initialize bird position and other game settings
function initGame() {
    birdY = canvas.height / 2; // Reset bird's Y position
    birdVelocity = 0; // Reset bird's velocity
    score = 0; // Reset score
    pipeSpeed = 2; // Reset pipe speed
    isGameOver = false; // Reset game over state
    pipes.length = 0; // Clear pipes
}

// Background music
const backgroundMusic = new Audio('background.mp3'); // Update with the path to your downloaded audio file
backgroundMusic.loop = true; // Loop the music continuously
backgroundMusic.volume = 0.5; // Adjust volume (0.0 to 1.0)

// Initialize bird position and sprite
function initBird() {
    birdY = canvas.height / 2; // Mid-air position
    birdVelocity = 0; // Reset velocity
    const randomIndex = Math.floor(Math.random() * birdSprites.length); // Get random sprite
    selectedBirdSprite = birdSprites[randomIndex]; // Select a random bird sprite
}

// Play the audio when the game starts
function startBackgroundMusic() {
    backgroundMusic.play();
}

// Draw bird with external image
function drawBird() {
    const birdX = 50; // Fixed X position of the bird
    ctx.drawImage(selectedBirdSprite.image, birdX, birdY, birdSize, birdSize);
}

// Generate pipes
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100) + 50); // Random height
    pipes.push({
        x: canvas.width,
        topPipe: pipeHeight,
        bottomPipe: pipeHeight + pipeGap,
        scored: false // Track if the pipe has been scored
    });
}

// Draw pipes with border and top part
function drawPipes() {
    pipes.forEach(pipe => {
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
            isGameOver = true; // Game over if there is a collision
        }

        // Score update
        if (pipe.x + pipeWidth < 50 && !pipe.scored) {
            score++;
            pipe.scored = true;

            // Increase speed every 10 points
            if (score % 10 === 0) {
                pipeSpeed += 0.1; // Slightly increase speed
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
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Draw background

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
    initGame(); // Reset all game variables
    // Hide death screen and show game canvas
    document.getElementById("death-screen").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";

    // Hide start screen if it's visible
    document.getElementById("start-screen").style.display = "none";

    updateGame(); // Start the game loop
}

// Start game on play button press
document.getElementById("play-button").addEventListener("click", () => {
    initGame(); // Initialize game variables before starting
    document.getElementById("start-screen").style.display = "none";
    gameStarted = true;
    initBird(); // Initialize bird position and sprite
    startBackgroundMusic(); // Start background music
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
            initBird(); // Initialize bird position and sprite
            startBackgroundMusic(); // Start background music
            updateGame();
        }
    }
});
