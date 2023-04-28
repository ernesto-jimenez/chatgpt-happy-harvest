// Global state object
const gameState = {
    grid: [],
    inventory: {
        coins: 100,
        seeds: { wheat: 5, corn: 2, carrots: 1 },
    },
    market: {
        wheat: { minPrice: 4, maxPrice: 6, price: 5 },
        corn: { minPrice: 8, maxPrice: 12, price: 10 },
        carrots: { minPrice: 12, maxPrice: 18, price: 15 },
    },
    crops: {
        wheat: { growthRate: 10, baseValue: 5 },
        corn: { growthRate: 8, baseValue: 10 },
        carrots: { growthRate: 5, baseValue: 15 },
    },
    upgrades: {
        wheat: { level: 1, cost: 50 },
        corn: { level: 1, cost: 100 },
        carrots: { level: 1, cost: 150 },
    },
    gridSize: 9,
    timer: 300, // Time limit in seconds (e.g., 300 seconds = 5 minutes)
    initialTimer: 300,
    gameEnded: false,
    selectedSeed: 'wheat',
};

function selectSeed(seedType) {
    gameState.selectedSeed = seedType;
    const seedElements = document.querySelectorAll('.seed-button');
    seedElements.forEach((seedElement) => {
        seedElement.classList.toggle('selected', seedElement.dataset.seedType === seedType);
    });
}

// Initialize the game
function init() {
  document.getElementById('start-game').addEventListener('click', () => {
    const gameDuration = parseInt(document.getElementById('game-duration').value);
    gameState.timer = gameDuration;
    gameState.initialTimer = gameDuration;

    document.querySelector('.start-screen').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';

    setupGrid();
    setupEventListeners();
    loadGame();
    gameLoop();
    setInterval(updateGame, 1000);
    updateMarketDisplay();
    setInterval(updateMarketPrices, 10000);
    updateSelectedSeedDisplay();
  });
}

function gameLoop() {
    growCrops();
    updateGridDisplay();
    setTimeout(gameLoop, 1000); // Update every 1 second, adjust as needed
}

function updateGame() {
    if (gameState.timer > 0 && !gameState.gameEnded) {
        gameState.timer--;
        updateTimerDisplay();
    } else if (!gameState.gameEnded) {
        gameState.gameEnded = true;
        endGame();
    }
}

// Set up the grid
function setupGrid() {
    const gridElement = document.querySelector('.grid');
    for (let i = 0; i < gameState.gridSize; i++) {
        gameState.grid[i] = { crop: null, progress: 0 };
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.index = i;

        const cropElement = document.createElement('div');
        cropElement.classList.add('crop');
        cellElement.appendChild(cropElement);

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        cellElement.appendChild(progressBar);

        gridElement.appendChild(cellElement);
    }
}

// Set up event listeners
function setupEventListeners() {
    const cellElements = document.querySelectorAll('.cell');
    cellElements.forEach((cellElement) => {
        cellElement.addEventListener('click', handleCellClick);
    });

    const seedElements = document.querySelectorAll('.seed-button');
    seedElements.forEach((seedElement) => {
        seedElement.addEventListener('click', (event) => {
            const seedType = event.currentTarget.dataset.seedType;
            selectSeed(seedType);
            updateSelectedSeedDisplay(); // Add this line to update the selected seed display
        });
    });

    const buySeedButtons = document.querySelectorAll('.buy-seed');
    buySeedButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const seedType = event.target.dataset.seedType;
            buySeed(seedType);
        });
    });

    const upgradeButtons = document.querySelectorAll('.upgrade-button');
    upgradeButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const cropType = event.target.dataset.cropType;
            applyUpgrade(cropType);
        });
    });
}

function handleCellClick(event) {
    if (event.target.classList.contains('cell') || event.target.parentElement.classList.contains('cell')) {
        const cellIndex = parseInt(event.target.dataset.index || event.target.parentElement.dataset.index);
        if (!gameState.grid[cellIndex].crop) {
            plantSeed(cellIndex, gameState.selectedSeed);
        } else if (gameState.grid[cellIndex].progress === 100) {
            harvest(cellIndex);
        }
    }
}

// Plant a seed on the selected grid cell
function plantSeed(cellIndex, seedType) {
    if (gameState.inventory.seeds[seedType] > 0) {
        gameState.inventory.seeds[seedType]--;
        gameState.grid[cellIndex] = { crop: seedType, progress: 0 };
        updateGridDisplay();
    }
}

function buySeed(seedType) {
    const seedPrice = gameState.market[seedType].price;
    if (gameState.inventory.coins >= seedPrice) {
        gameState.inventory.coins -= seedPrice;
        gameState.inventory.seeds[seedType]++;
        updateInventoryDisplay();
    }
}

// Handle crop growth and update the display
function growCrops() {
    for (let i = 0; i < gameState.gridSize; i++) {
        const cell = gameState.grid[i];
        if (cell.crop && cell.progress < 100) {
            const growthRateMultiplier = gameState.upgrades[cell.crop].level;
            const growthRate = 10 * growthRateMultiplier;
            cell.progress += growthRate;
            if (cell.progress > 100) cell.progress = 100;
        }
    }
    updateGridDisplay();
}


// Harvest crops when they are fully grown
function harvest(cellIndex) {
    const cell = gameState.grid[cellIndex];
    gameState.inventory.coins = parseFloat((gameState.inventory.coins + parseFloat(gameState.crops[cell.crop].baseValue)).toFixed(2));
    gameState.grid[cellIndex] = { crop: null, progress: 0 };
    updateGridDisplay();
}

function updateMarketDisplay() {
    for (const crop in gameState.market) {
        const priceElement = document.querySelector(`.market-price.${crop}`);
        if (priceElement) {
            priceElement.textContent = gameState.market[crop].price.toFixed(2);
        }
    }
}

function updateMarketPrices() {
    for (const crop in gameState.market) {
        const cropMarket = gameState.market[crop];
        const priceRange = cropMarket.maxPrice - cropMarket.minPrice;
        cropMarket.price = parseFloat((cropMarket.minPrice + Math.random() * priceRange).toFixed(2));
    }
    updateMarketDisplay();
}

// Purchase items from the market using in-game currency
function buyItem(item) {
    // Check if the player has enough currency
    // Update the game state (inventory and currency)
    // Update the display
}

// Save game progress to localStorage
function saveGame() {
    localStorage.setItem('happyHarvestGameState', JSON.stringify(gameState));
}

// Load game progress from localStorage
function loadGame() {
    const savedState = localStorage.getItem('happyHarvestGameState');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
    }
    updateGridDisplay();
}

// Update the grid display based on the game state
function updateGridDisplay() {
    const cellElements = document.querySelectorAll('.cell');
    for (let i = 0; i < gameState.gridSize; i++) {
        const cell = gameState.grid[i];
        const progressBar = cellElements[i].querySelector('.progress-bar');
        if (cell.crop) {
            const progress = cell.progress;
            const cropEmoji = getCropEmoji(cell.crop, progress);
            cellElements[i].querySelector('.crop').textContent = cropEmoji;
            progressBar.style.width = `${progress}%`;
        } else {
            cellElements[i].querySelector('.crop').textContent = '';
            progressBar.style.width = '0';
        }
    }
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    document.querySelector('.coins').textContent = gameState.inventory.coins.toFixed(2);

    document.querySelector('.seeds-wheat').textContent = gameState.inventory.seeds.wheat;
    document.querySelector('.level-wheat').textContent = gameState.upgrades.wheat.level;
    document.querySelector('.upgrade-cost-wheat').textContent = gameState.upgrades.wheat.cost;

    document.querySelector('.seeds-corn').textContent = gameState.inventory.seeds.corn;
    document.querySelector('.level-corn').textContent = gameState.upgrades.corn.level;
    document.querySelector('.upgrade-cost-corn').textContent = gameState.upgrades.corn.cost;

    document.querySelector('.seeds-carrots').textContent = gameState.inventory.seeds.carrots;
    document.querySelector('.level-carrots').textContent = gameState.upgrades.carrots.level;
    document.querySelector('.upgrade-cost-carrots').textContent = gameState.upgrades.carrots.cost;
}

// Get the appropriate crop emoji based on crop type and progress
function getCropEmoji(crop, progress) {
    const growthStages = {
        wheat: ['🌱', '🌾', '🌾🌾', '🌾🌾🌾', '🌾🌾🌾🌾', '🌾🌾🌾🌾🌾'],
        corn: ['🌱', '🌽', '🌽🌽', '🌽🌽🌽', '🌽🌽🌽🌽', '🌽🌽🌽🌽🌽'],
        carrots: ['🌱', '🥕', '🥕🥕', '🥕🥕🥕', '🥕🥕🥕🥕', '🥕🥕🥕🥕🥕'],
    };
    const stage = Math.floor(progress / 20); // Adjust this value to change how quickly the emojis change
    return growthStages[crop][stage];
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    document.querySelector('.timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    const gameDurationInMinutes = gameState.initialTimer / 60;
    alert(`Game Over! You played for ${gameDurationInMinutes} minutes and earned ${gameState.inventory.coins} coins.`);
    document.querySelector('.grid').removeEventListener('click', handleCellClick);
    // Optionally, disable other interactions (e.g., buying seeds)
    window.location.href = 'start.html';
}

function updateSelectedSeedDisplay() {
  const seedButtons = document.querySelectorAll('.seed-button');
  seedButtons.forEach((button) => {
    button.classList.remove('selected');
  });

  const selectedSeedButton = document.querySelector(`.seed-button-${gameState.selectedSeed}`);
  selectedSeedButton.classList.add('selected');
}

function applyUpgrade(cropType) {
  if (gameState.inventory.coins >= gameState.upgrades[cropType].cost) {
    gameState.inventory.coins -= gameState.upgrades[cropType].cost;
    gameState.upgrades[cropType].level += 1;
    gameState.upgrades[cropType].cost = Math.ceil(gameState.upgrades[cropType].cost * 1.5);

    updateInventoryDisplay();
  }
}

// Start the game
init();

