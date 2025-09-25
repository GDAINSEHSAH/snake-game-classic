const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

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

    ctx.fillStyle = '#000';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    drawGrid();
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

document.addEventListener('keydown', function(e) {
    if (!gameRunning) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!document.getElementById('startScreen').classList.contains('hidden')) {
                startGame();
            } else if (!document.getElementById('gameOver').classList.contains('hidden')) {
                startGame();
            }
        }
        return;
    }

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            changeDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            changeDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            changeDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            changeDirection('right');
            break;
    }
});

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
    updateHighScore();
    drawGame();
});