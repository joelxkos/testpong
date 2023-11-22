const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameStarted = false;
let firstHit = true;  // This flag will be true until the ball hits a paddle for the first time
let ballSpeedMultiplier = 1;  // Base multiplier

// Set canvas dimensions
canvas.width = 1000; // Increase width
canvas.height = 700; // Increase height

// Game objects
const playerPaddle = {
    width: 10,
    height: 100,
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    color: 'white',
    score: 0
};

const botPaddle = {
    width: 10,
    height: 100,
    x: 10,
    y: canvas.height / 2 - 50,
    color: 'white',
    score: 0
};

const ball = {
    radius: 7,
    x: canvas.width / 2,
    y: canvas.height / 2,
    speedX: 5,
    speedY: 5,
    color: 'white'
};

document.getElementById('slowSpeed').addEventListener('click', () => setBallSpeed(1));
document.getElementById('mediumSpeed').addEventListener('click', () => setBallSpeed(1.5));
document.getElementById('fastSpeed').addEventListener('click', () => setBallSpeed(2));


function setBallSpeed(multiplier) {
    ballSpeedMultiplier = multiplier;
    resetBall();  // Reset the ball to apply the new speed
}

// Bot AI with Simplified Randomness
const baseBotSpeed = 3; // Bot's base speed
const reactionDelay = 200; // 200 milliseconds reaction delay
const positionOffset = 30; // Maximum 30 pixels offset in position

let botTimeout; // For reaction delay

function botAI() {
    clearTimeout(botTimeout); // Clear any previous timeout

    botTimeout = setTimeout(() => {
        // Predict where the ball will be
        let predictedY = ball.y + ball.speedY / ball.speedX * (botPaddle.x - ball.x);
        
        // Random offset to simulate error
        predictedY += Math.random() * 2 * positionOffset - positionOffset;

        // Move bot towards the predicted position
        if (botPaddle.y + botPaddle.height / 2 < predictedY) {
            botPaddle.y += baseBotSpeed;
        } else if (botPaddle.y + botPaddle.height / 2 > predictedY) {
            botPaddle.y -= baseBotSpeed;
        }

        // Keep within canvas
        botPaddle.y = Math.max(Math.min(botPaddle.y, canvas.height - botPaddle.height), 0);
    }, reactionDelay);
}

// Include botAI() in your update function



// Track mouse movement over the entire window
window.addEventListener('mousemove', (event) => {
    const bounds = canvas.getBoundingClientRect();
    // Calculate the mouse position relative to the canvas
    let mouseY = event.clientY - bounds.top;

    // Constrain mouseY to the canvas height
    if (mouseY < 0) {
        mouseY = 0;
    } else if (mouseY > canvas.height) {
        mouseY = canvas.height;
    }

    // Update the player's paddle position
    playerPaddle.y = mouseY - playerPaddle.height / 2;
    // Constrain the player paddle to stay within the canvas
    playerPaddle.y = Math.max(Math.min(playerPaddle.y, canvas.height - playerPaddle.height), 0);
});

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        resetBall();
    }
});

function gameLoop() {
    // Update game objects
    update();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render the game objects
    render();

    // Call gameLoop again after a set time
    requestAnimationFrame(gameLoop);
}

function update() {
    // If the game has started, move the ball
    if (gameStarted) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;
    }

    // Bounce the ball off the top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

  // Ball and paddle collision detection and handling
  function checkCollision(paddle) {
    if (ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y) {

        // Adjust ball position to be outside the paddle
        if (paddle === playerPaddle) {
            ball.x = paddle.x - ball.radius;
        } else {
            ball.x = paddle.x + paddle.width + ball.radius;
        }

        // Reverse ball speed and increase slightly for game challenge
        ball.speedX = -ball.speedX;
        ball.speedY += 0.1 * (Math.random() - 0.5);

        return true;
    }
    return false;
}

// Check collision with paddles
if (checkCollision(playerPaddle) || checkCollision(botPaddle)) {
    if (firstHit) {
        // Adjust ball speed after first hit
        ball.speedX *= 1.5; // Increase speed after the first hit
        ball.speedY *= 1.5;
        firstHit = false;
    }
}
// Update the score if the ball goes past a paddle
if (ball.x - ball.radius < 0) {
    // Player scores
    playerPaddle.score++;
    document.getElementById('scorePlayer').textContent = `Player: ${playerPaddle.score}`;
    resetBall();
} else if (ball.x + ball.radius > canvas.width) {
    // Bot scores
    botPaddle.score++;
    document.getElementById('scoreBot').textContent = `Bot: ${botPaddle.score}`;
    resetBall();
}


    // Call the enhanced bot AI
    botAI();

}

    
function resetBall() {
    firstHit = true;
    gameStarted = true;

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const initialSpeedX = 2; // Adjust this base speed if needed
    const initialSpeedY = 2; // Adjust this base speed if needed

    ball.speedX = initialSpeedX * (Math.random() > 0.5 ? 1 : -1) * ballSpeedMultiplier;
    ball.speedY = initialSpeedY * (Math.random() > 0.5 ? 1 : -1) * ballSpeedMultiplier;
}

    
    

function render() {
    // Draw player paddle
    ctx.fillStyle = playerPaddle.color;
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

    // Draw bot paddle
    ctx.fillStyle = botPaddle.color;
    ctx.fillRect(botPaddle.x, botPaddle.y, botPaddle.width, botPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Start the game loop
gameLoop();
