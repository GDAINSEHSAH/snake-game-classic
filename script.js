const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snake and food images
let snakeHeadImg, snakeBodyImg, foodImg;

// Create snake head image with curved edges
function createSnakeHeadImage() {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');

    // Snake head - rounded rectangle with gradient
    const radius = 8;
    const centerX = gridSize / 2;
    const centerY = gridSize / 2;

    // Create gradient for depth
    const gradient = ctx.createRadialGradient(centerX - 3, centerY - 3, 0, centerX, centerY, gridSize/2);
    gradient.addColorStop(0, '#66BB6A');
    gradient.addColorStop(1, '#2E7D32');

    // Draw rounded head
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(1, 1, gridSize - 2, gridSize - 2, radius);
    ctx.fill();

    // Add darker border
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes - larger and more realistic
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 2, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 2, 2.5, 0, 2 * Math.PI);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 2.5, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 5, centerY - 2.5, 1, 0, 2 * Math.PI);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY + 2, 0.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY + 2, 0.5, 0, 2 * Math.PI);
    ctx.fill();

    return canvas;
}

// Create snake body image with curved edges
function createSnakeBodyImage() {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');

    const radius = 6;
    const centerX = gridSize / 2;
    const centerY = gridSize / 2;

    // Create gradient for body depth
    const gradient = ctx.createRadialGradient(centerX - 2, centerY - 2, 0, centerX, centerY, gridSize/2);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#2E7D32');

    // Draw rounded body segment
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(2, 2, gridSize - 4, gridSize - 4, radius);
    ctx.fill();

    // Add subtle border
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Scale pattern with circles for more organic look
    ctx.fillStyle = '#1B5E20';
    ctx.globalAlpha = 0.3;

    // Create scale pattern
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY - 3, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY + 3, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY + 3, 1.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.globalAlpha = 1;
    return canvas;
}

// Create food image (apple)
function createFoodImage() {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');

    // Apple body - red
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(gridSize/2, gridSize/2 + 2, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Apple highlight
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.arc(gridSize/2 - 2, gridSize/2, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Apple stem
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(gridSize/2 - 1, 3, 2, 4);

    // Apple leaf
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(gridSize/2 + 3, 5, 3, 2, Math.PI/4, 0, 2 * Math.PI);
    ctx.fill();

    return canvas;
}

// Initialize images
function initializeImages() {
    snakeHeadImg = createSnakeHeadImage();
    snakeBodyImg = createSnakeBodyImage();
    foodImg = createFoodImage();
}

let snake = [
    {x: 10, y: 10}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let level = 1;
let gameRunning = false;
let gameSpeed = 300;
let nextDirection = null;

const gameSpeedSettings = {
    easy: 400,
    medium: 300,
    hard: 200
};

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function drawGame() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake with images
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        if (i === 0) {
            // Draw head with direction-based rotation
            drawSnakeHead(segment.x * gridSize, segment.y * gridSize);
        } else {
            // Draw body
            ctx.drawImage(snakeBodyImg, segment.x * gridSize, segment.y * gridSize);
        }
    }

    // Draw food with image
    ctx.drawImage(foodImg, food.x * gridSize, food.y * gridSize);

    drawGrid();
}

function drawSnakeHead(x, y) {
    ctx.save();

    // Calculate rotation based on direction
    let rotation = 0;
    if (dx === 1) rotation = Math.PI / 2;      // Right
    else if (dx === -1) rotation = -Math.PI / 2; // Left
    else if (dy === 1) rotation = Math.PI;       // Down
    else if (dy === -1) rotation = 0;            // Up

    // Apply rotation
    ctx.translate(x + gridSize/2, y + gridSize/2);
    ctx.rotate(rotation);
    ctx.drawImage(snakeHeadImg, -gridSize/2, -gridSize/2);

    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function moveSnake() {
    if (nextDirection !== null) {
        const canTurn = true;
        if (snake.length > 1) {
            const neck = snake[1];
            const newHead = {
                x: snake[0].x + (nextDirection === 'left' ? -1 : nextDirection === 'right' ? 1 : 0),
                y: snake[0].y + (nextDirection === 'up' ? -1 : nextDirection === 'down' ? 1 : 0)
            };
            if (newHead.x === neck.x && newHead.y === neck.y) {
                nextDirection = null;
            } else {
                switch (nextDirection) {
                    case 'up': dx = 0; dy = -1; break;
                    case 'down': dx = 0; dy = 1; break;
                    case 'left': dx = -1; dy = 0; break;
                    case 'right': dx = 1; dy = 0; break;
                }
                nextDirection = null;
            }
        } else {
            switch (nextDirection) {
                case 'up': dx = 0; dy = -1; break;
                case 'down': dx = 0; dy = 1; break;
                case 'left': dx = -1; dy = 0; break;
                case 'right': dx = 1; dy = 0; break;
            }
            nextDirection = null;
        }
    }

    if (dx === 0 && dy === 0) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();

        if (score > 0 && score % 100 === 0) {
            level++;
            updateLevel();
            increaseSpeed();
        }
    } else {
        snake.pop();
    }
}

function increaseSpeed() {
    if (gameSpeed > 150) {
        gameSpeed -= 20;
    }
}

function changeDirection(direction) {
    if (!gameRunning) return;
    nextDirection = direction;
}

function gameOver() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;

    const highScore = localStorage.getItem('snakeHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('snakeHighScore', score);
        updateHighScore();
    }

    document.getElementById('gameOver').classList.remove('hidden');

    addPulseEffect();
}

function addPulseEffect() {
    const gameOverDiv = document.getElementById('gameOver');
    gameOverDiv.classList.add('pulsing');
    setTimeout(() => {
        gameOverDiv.classList.remove('pulsing');
    }, 2000);
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

function updateHighScore() {
    const highScore = localStorage.getItem('snakeHighScore') || 0;
    document.getElementById('highScore').textContent = highScore;
}

function startGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    nextDirection = null;
    score = 0;
    level = 1;

    const difficulty = document.getElementById('difficulty').value;
    gameSpeed = gameSpeedSettings[difficulty];

    updateScore();
    updateLevel();
    updateHighScore();

    generateFood();

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');

    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    moveSnake();
    drawGame();

    setTimeout(gameLoop, gameSpeed);
}

// FIXED: Simple and working keyboard controls
document.addEventListener('keydown', function(e) {
    console.log('🎮 Key pressed:', e.key, '| Game running:', gameRunning);

    // Start game with movement keys
    if (!gameRunning) {
        const startKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' ', 'Enter'];
        if (startKeys.includes(e.key)) {
            e.preventDefault();
            startGame();
            // Don't return here - let it process the movement too
        } else {
            return;
        }
    }

    // Handle movement
    e.preventDefault();
    let moved = false;

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            highlightButton('up');
            moved = true;
            console.log('🐍 Moving UP');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            highlightButton('down');
            moved = true;
            console.log('🐍 Moving DOWN');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            highlightButton('left');
            moved = true;
            console.log('🐍 Moving LEFT');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            highlightButton('right');
            moved = true;
            console.log('🐍 Moving RIGHT');
            break;
    }

    if (moved) {
        console.log('✅ Direction command sent!');
    }
});

// Visual feedback for button presses
function highlightButton(direction) {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(btn => {
        const btnText = btn.textContent.trim();
        let btnDirection = '';

        if (btnText.includes('↑')) btnDirection = 'up';
        else if (btnText.includes('↓')) btnDirection = 'down';
        else if (btnText.includes('←')) btnDirection = 'left';
        else if (btnText.includes('→')) btnDirection = 'right';

        if (btnDirection === direction) {
            btn.style.backgroundColor = '#4CAF50';
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.backgroundColor = '';
                btn.style.transform = '';
            }, 150);
        }
    });
}

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (!gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                changeDirection('right');
            } else {
                changeDirection('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                changeDirection('down');
            } else {
                changeDirection('up');
            }
        }
    }
});

window.addEventListener('load', function() {
    initializeImages();
    updateHighScore();
    drawGame();
    console.log('🎮 Game loaded! Press arrow keys or WASD to play!');
});