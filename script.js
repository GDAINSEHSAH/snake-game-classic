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
let gameSpeed = 150;

const gameSpeedSettings = {
    easy: 200,
    medium: 150,
    hard: 100
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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff41';
    ctx.fillStyle = '#00ff41';

    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
    }

    ctx.shadowColor = '#ff6b6b';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

    ctx.shadowBlur = 0;

    drawGrid();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
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
    if (gameSpeed > 80) {
        gameSpeed -= 10;
    }
}

function changeDirection(direction) {
    if (!gameRunning) return;

    switch (direction) {
        case 'up':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'down':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'left':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'right':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
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
    if (!gameRunning) return;

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