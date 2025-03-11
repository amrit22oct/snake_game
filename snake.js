const gameBoard = document.getElementById('container');
const resetButton = document.getElementById('resetButton');
const scoreElement = document.querySelector('#score');
const maxScoreElement = document.querySelector('#max-score');

const boardSize = 25;
const cellSize = 20;

let snake = [];
let food = {};  // Normal food
let sFood = {}; // Special food
let direction = 'right';
let score = 0;
let isGameOver = false;
let maxScore = 0;
let sFoodAvailable = false; // Track if special food is available
let foodEatenCount = 0; // Counter for normal food eaten
const foodEatenThreshold = 3; // Number of normal food to be eaten before generating special food

// Generate random starting position for the snake
let startX = Math.floor(Math.random() * boardSize);
let startY = Math.floor(Math.random() * boardSize);
snake.push({ x: startX, y: startY });

// Function to check if food is on the snake
function isFoodOnSnake(x, y) {
  return snake.some(segment => segment.x === x && segment.y === y);
}

// Generate normal food ensuring it does not overlap with the snake
function generateFood() {
  do {
    food.x = Math.floor(Math.random() * boardSize);
    food.y = Math.floor(Math.random() * boardSize);
  } while (isFoodOnSnake(food.x, food.y)); // Ensure food is not on the snake
}

// Generate special food ensuring it does not overlap with the snake
function generateSfood() {
  do {
    sFood.x = Math.floor(Math.random() * boardSize);
    sFood.y = Math.floor(Math.random() * boardSize);
  } while (isFoodOnSnake(sFood.x, sFood.y)); // Ensure special food is not on the snake

  sFoodAvailable = true; // Mark special food as available
}

// Create the game board cells
for (let i = 0; i < boardSize; i++) {
  for (let j = 0; j < boardSize; j++) {
    const cell = document.createElement('div');
    cell.className = 'box';
    cell.style.gridColumn = j + 1;
    cell.style.gridRow = i + 1;
    gameBoard.appendChild(cell);
  }
}

// Function to update the game
function updateGame() {
  // Clear the board
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = gameBoard.children[i * boardSize + j];
      cell.style.backgroundColor = ''; // Reset the background color
      cell.classList.remove('blinking-food'); // Remove blinking class if present
    }
  }

  // Update the snake body
  for (let i = 0; i < snake.length; i++) {
    const cell = gameBoard.children[snake[i].y * boardSize + snake[i].x];
    cell.style.backgroundColor = i === 0 ? 'cyan' : 'rgb(7, 216, 105)'; // Head = cyan, body = green
  }

  // Show normal food
  const foodCell = gameBoard.children[food.y * boardSize + food.x];
  foodCell.style.backgroundColor = 'red';
  foodCell.classList.add('blinking-food'); // Add blinking effect

  // Show special food if available
  if (sFoodAvailable) {
    const sFoodCell = gameBoard.children[sFood.y * boardSize + sFood.x];
    sFoodCell.style.backgroundColor = 'gold';
  }
}

// Check for collision
function checkCollision(x, y) {
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return true;
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return true;
    }
  }
  return false;
}

// Move the snake
function moveSnake() {
  if (isGameOver) return;

  // Get the current head position
  const head = snake[0];
  let newX = head.x;
  let newY = head.y;

  // Update head position based on direction
  if (direction === 'right') newX++;
  if (direction === 'left') newX--;
  if (direction === 'up') newY--;
  if (direction === 'down') newY++;

  // Check for collisions
  if (checkCollision(newX, newY)) {
    alert('Game Over!');
    isGameOver = true;
    return;
  }

  // Check if the snake has eaten the normal food
  if (newX === food.x && newY === food.y) {
    score++;
    foodEatenCount++; // Increment the normal food eaten counter
    generateFood(); // Generate new normal food

    // Check if we need to generate special food
    if (foodEatenCount >= foodEatenThreshold) {
      generateSfood(); // Generate special food
      foodEatenCount = 0; // Reset the counter
    }
  } 
  // Check if the snake has eaten the special food
  else if (sFoodAvailable && newX === sFood.x && newY === sFood.y) {
    score += 3; // Increase the score by a fixed amount
    maxScore = Math.max(score, maxScore); // Update max score
    sFoodAvailable = false; // Special food has been consumed
  } 
  else {
    snake.pop(); // Remove the tail if no food is eaten
  }

  // Update the snake head position
  snake.unshift({ x: newX, y: newY });

  updateGame();
  updateScore();
}

// Add event listener for key presses
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right';
      break;
  }
});

// Reset the game
function resetGame() {
  snake = [];
  let startX = Math.floor(Math.random() * boardSize);
  let startY = Math.floor(Math.random() * boardSize);
  snake.push({ x: startX, y: startY });

  generateFood();           // Generate initial normal food
  sFoodAvailable = false;   // Special food is not available at the start
  foodEatenCount = 0;       // Reset the normal food eaten counter

  direction = 'right';
  score = 0;
  isGameOver = false;
  updateGame();
  scoreElement.textContent = `Score: ${score}`;
  maxScoreElement.textContent = `Max Score: ${maxScore}`;
}

// Add event listener for the reset button
resetButton.addEventListener('click', resetGame);

// Initialize maxScore from localStorage
maxScore = parseInt(localStorage.getItem('maxScore')) || 0;
maxScoreElement.textContent = `Max Score: ${maxScore}`;

// Function to update the score and max score
function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
  maxScore = Math.max(score, maxScore); // Update maxScore
  localStorage.setItem('maxScore', maxScore); // Save to localStorage
  maxScoreElement.textContent = `Max Score: ${maxScore}`;
}

// Generate the first food and start the game loop
generateFood();
updateGame();
setInterval(moveSnake, 200);
