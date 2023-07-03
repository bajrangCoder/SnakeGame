// Game Constants
const SIZE = 20;
const SPEED = 200;
// Game Variables
const foodEmojis = ["🍎", "🍇", "🍓", "🥃", "🍊", "🍉", "🍒", "🍍", "🍋", "🥭","🐤","🐁","🦀","🍄"];
const scoreBoosterFood = 13;
const randomScoreBoosterFood = 3;
let snake = [{ x: 0, y: 0 }];
let direction = "right";
let food = { x: 0, y: 0 };
let score = 0;
let intervalId;
let currentFoodEmoji;

// DOM Elements
const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const scoreElement = document.getElementById("score");

// Event Listeners
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);
pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", restartGame);

document.addEventListener("keydown", handleKeyDown);
gameBoard.addEventListener("touchstart", handleTouchStart,{passive:false});
gameBoard.addEventListener("touchmove", handleTouchMove,{passive:false});

let touchStartX = 0;
let touchStartY = 0;

const specialFoodSound = new Audio("sounds/mega_point.mp3");
const normalFoodSound = new Audio("sounds/normal_points.mp3");

if (!localStorage.getItem("playerNme")) {
  document.querySelector("#askNameDialog").showModal();
}
document.querySelector("#playerGreetMsg").innerText = `Hi 👋, ${localStorage.getItem("playerNme") || "User"}`;
document.querySelector("#playerHIScore").innerText = `HI Score: ${localStorage.getItem("playerScore") || 0}`;
// Functions
function startGame() {
  resetGame();
  startButton.disabled = true;
  stopButton.disabled = false;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  restartButton.disabled = false;
  intervalId = setInterval(moveSnake, SPEED);
  createSnake();
  generateFood();
}

// Function to stop the game
function stopGame() {
  resetGame();
  clearInterval(intervalId);
  stopButton.disabled = true;
  startButton.disabled = false;
  pauseButton.disabled = true;
  resumeButton.disabled = true;
  restartButton.disabled = true;
}

function pauseGame() {
  clearInterval(intervalId);
  pauseButton.disabled = true;
  resumeButton.disabled = false;
}

function resumeGame() {
  intervalId = setInterval(moveSnake, SPEED);
  pauseButton.disabled = false;
  resumeButton.disabled = true;
}

function restartGame() {
  clearInterval(intervalId);
  resetGame();
  startGame();
}

function resetGame() {
  snake = [{ x: 0, y: 0 }];
  direction = "right";
  score = 0;
  scoreElement.textContent = "Score: 0";
  gameBoard.innerHTML = "";
}

function generateFood() {
  const maxPos = gameBoard.clientWidth / SIZE - 1;
  let validPosition = false;

  while (!validPosition) {
    food.x = Math.floor(Math.random() * maxPos) + 1;
    food.y = Math.floor(Math.random() * maxPos) + 1;

    validPosition = snake.every(
      (part) => part.x !== food.x || part.y !== food.y
    );
  }
  let randomIndex;
  if (Math.random() < 0.1) {
    // Decrease probability of generating the 13th index
    randomIndex = Math.floor(Math.random() * (foodEmojis.length - 1));
  } else {
    // Generate any index between 0 and the array length
    randomIndex = Math.floor(Math.random() * foodEmojis.length);
  }
  currentFoodEmoji = foodEmojis[randomIndex];
  const foodElement = document.createElement("div");
  foodElement.classList.add("food");
  foodElement.innerHTML = currentFoodEmoji;
  foodElement.style.left = food.x * SIZE + "px";
  foodElement.style.top = food.y * SIZE + "px";
  gameBoard.appendChild(foodElement);
}
function createSnake() {
  for (let i = 0; i < 1; i++) {
    snake.push({ x: 0, y: 0 });
  }
}

function moveSnake() {
  const head = { x: snake[0].x, y: snake[0].y };

  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  if (head.x < 0) head.x = gameBoard.clientWidth / SIZE - 1;
  if (head.y < 0) head.y = gameBoard.clientHeight / SIZE - 1;
  if (head.x >= gameBoard.clientWidth / SIZE) head.x = 0;
  if (head.y >= gameBoard.clientHeight / SIZE) head.y = 0;

  snake.unshift(head);
  let currentSpeed;
  if (head.x === food.x && head.y === food.y) {
    const position = foodEmojis.findIndex(item => item === currentFoodEmoji);
    if (scoreBoosterFood === position) {
      score += 5;
      normalFoodSound.pause();
      specialFoodSound.play();
    } else if(randomScoreBoosterFood === position){
      score += Math.floor(Math.random() * 5) + 1;
      normalFoodSound.pause();
      specialFoodSound.play();
    } else {
      score += 1;
      specialFoodSound.pause();
      normalFoodSound.play();
    }
    scoreElement.textContent = "Score: " + score;
    
    generateFood();
    specialFoodSound.currentTime = 0;
    normalFoodSound.currentTime = 0;
  } else {
    snake.pop();
  }

  if (checkCollision(head)) {
    clearInterval(intervalId);
    if (score > 0) {
      if (!localStorage.getItem("playerScore")) {
        localStorage.setItem("playerScore",score);
      } else {
        if (score > localStorage.getItem("playerScore")) {
          localStorage.setItem("playerScore",score);
        }
      }
      const gameOverDialog = document.querySelector("#gameOverDialog");
      document.querySelector("#gameOverDialog p").innerHTML = `<strong>${localStorage.getItem("playerNme")}</strong>, Your final score is <strong>${score}</strong>`;
      gameOverDialog.showModal();
      document.querySelector("#playerHIScore").innerText = `HI Score: ${localStorage.getItem("playerScore") || 0}`;
    }
    resetGame();
    startButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    restartButton.disabled = true;
    return;
  }

  updateGameBoard();
  currentSpeed = SPEED - Math.floor(score / 5) * 10;
  clearInterval(intervalId);
  intervalId = setInterval(moveSnake, currentSpeed > 0 ? currentSpeed : 10);
}

function closeGameOverDialog() {
  gameOverDialog.close();
}
document.querySelector("#letsplayGame").addEventListener("click",(event) => {
  event.preventDefault();
  const playerNme = document.querySelector("#askNameDialog input").value;
  if(!playerNme) return;
  localStorage.setItem("playerNme",playerNme);
  document.querySelector("#askNameDialog").close();
  document.querySelector("#playerGreetMsg").innerText = `Hi 👋, ${localStorage.getItem("playerNme")}`;
});

function checkCollision(head) {
  const collision = snake.some(
    (part, index) => index !== 0 && part.x === head.x && part.y === head.y
  );

  return collision;
}

function updateGameBoard() {
  gameBoard.innerHTML = "";
  let snakeColor = Math.floor(Math.random() * 360);
  let snakeColorIncrement = 10;
  snake.forEach((part, index) => {
    const snakePart = document.createElement("div");
    snakePart.className = "snake";
    snakePart.textContent = index === 0 ? "👀" : "";
    snakePart.style.left = part.x * SIZE + "px";
    snakePart.style.top = part.y * SIZE + "px";
    snakeColor += snakeColorIncrement % 360;
    snakePart.style.background = `hsl(${snakeColor}, 100%, 50%)`;
    gameBoard.appendChild(snakePart);
  });

  const foodElement = document.createElement("div");
  foodElement.classList.add("food");
  foodElement.innerHTML = currentFoodEmoji;
  foodElement.style.left = food.x * SIZE + "px";
  foodElement.style.top = food.y * SIZE + "px";
  const position = foodEmojis.findIndex(item => item === currentFoodEmoji);
  if (scoreBoosterFood === position) {
    foodElement.style.border = "2px solid #ff0000;";
    foodElement.style.animation = "redish_glowing 1.5s infinite";
    foodElement.style.background = "transparent";
    foodElement.style.borderRadius = "12px";
  } else if(randomScoreBoosterFood === position){
    foodElement.style.border = "2px solid #00aaff;";
    foodElement.style.animation = "normal_glowing 1.5s infinite";
    foodElement.style.background = "transparent";
    foodElement.style.borderRadius = "12px";
  }
  gameBoard.appendChild(foodElement);
}

function handleKeyDown(event) {
  const keyPressed = event.key.toLowerCase();

  if (keyPressed === "arrowup" && direction !== "down") {
    direction = "up";
  } else if (keyPressed === "arrowdown" && direction !== "up") {
    direction = "down";
  } else if (keyPressed === "arrowleft" && direction !== "right") {
    direction = "left";
  } else if (keyPressed === "arrowright" && direction !== "left") {
    direction = "right";
  }
}
function handleTouchStart(event) {
  event.preventDefault();
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}
function handleTouchMove(event) {
  event.preventDefault();
  if (!touchStartX || !touchStartY) {
    return;
  }

  const touch = event.touches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 0 && direction !== "left") {
      direction = "right";
    } else if (dx < 0 && direction !== "right") {
      direction = "left";
    }
  } else {
    // Vertical swipe
    if (dy > 0 && direction !== "up") {
      direction = "down";
    } else if (dy < 0 && direction !== "down") {
      direction = "up";
    }
  }

  
}

// Event listener for mode toggle checkbox
const modeToggleCheckbox = document.getElementById("mode-toggle-checkbox");
modeToggleCheckbox.addEventListener("change", toggleDarkMode);

// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  const gameContainer = document.querySelector(".game-container");
  const gameBoard = document.getElementById("game-board");
  const buttons = document.querySelectorAll(".button");
  const score = document.getElementById("score");
  const modeToggleLabels = document.querySelectorAll(".mode-toggle-label");

  body.classList.toggle("dark-mode");
  gameContainer.classList.toggle("dark-mode");
  gameBoard.classList.toggle("dark-mode");
  buttons.forEach((button) => button.classList.toggle("dark-mode"));
  score.classList.toggle("dark-mode");
  document.querySelector("#gameOverDialog").classList.toggle("dark-mode");
  document.querySelector("#askNameDialog").classList.toggle("dark-mode");
  modeToggleLabels.forEach((label) =>
    label.classList.toggle("dark-mode-label")
  );
}
