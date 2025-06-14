// ===== Game State =====
const gameState = {
  playerName: "",
  playerClass: "",
  hp: 5,
  spirit: 3,
  inventory: [],
  currentScene: "intro",
  usedPower: false,
  currentEnemyIndex: 0,
  currentEnemyHP: 0
};

// ===== Enemy List =====
const enemyList = [
  { name: "Wild Beast", attack: "Claw Swipe", nextScene: "villageAfterBeast", hp: 3, damage: 1 },
  { name: "Cursed Monk", attack: "Spirit Drain", nextScene: "villageAfterMonk", hp: 5, damage: 2 },
  { name: "Ancient Wraith", attack: "Soul Shatter", nextScene: "finalVictory", hp: 7, damage: 3 }
];

// ===== Scenes =====
const scenes = {
  intro: {
    text: "Welcome, adventurer! What is your name?",
    choices: []
  },
  classSelect: {
    text: "Choose your class, brave one:",
    choices: [
      {
        text: "Warrior 🛡️ - Strong and durable",
        nextScene: "afterClassSelect",
        effect: () => {
          gameState.playerClass = "Warrior";
          gameState.hp += 2;
        }
      },
      {
        text: "Shaman 🔮 - Spiritual and wise",
        nextScene: "afterClassSelect",
        effect: () => {
          gameState.playerClass = "Shaman";
          gameState.spirit += 2;
        }
      },
      {
        text: "Hunter 🏹 - Agile and alert",
        nextScene: "afterClassSelect",
        effect: () => {
          gameState.playerClass = "Hunter";
          if (!gameState.inventory.includes("Hunter’s Instinct")) {
            gameState.inventory.push("Hunter’s Instinct");
            updateInventory();
          }
        }
      }
    ]
  },
  afterClassSelect: {
    text: () => `You don your gear and prepare for the journey ahead. You take your first step into the mysterious forest...`,
    choices: [{ text: "Continue", nextScene: "start" }]
  },
  start: {
    text: (name, playerClass) => `You awake in a dark forest near the village of Kyangjin, ${name} the ${playerClass}. A faint glow flickers in the distance.`,
    choices: [
      { text: "Walk toward the glow", nextScene: "villageGate" },
      { text: "Stay and explore the forest", nextScene: "forestExplore" }
    ]
  },
  forestExplore: {
    text: "The forest feels alive with whispers. You find some herbs and a rusty dagger.",
    choices: [
      {
        text: "Pick up the dagger",
        nextScene: "forestDaggerTaken",
        effect: () => {
          if (!gameState.inventory.includes("Rusty Dagger")) {
            gameState.inventory.push("Rusty Dagger");
            updateInventory();
          }
        }
      },
      { text: "Ignore and head to village", nextScene: "villageGate" }
    ]
  },
  forestDaggerTaken: {
    text: "You pick up the rusty dagger. It hums faintly, as if waiting to be used.",
    choices: [{ text: "Return to the path", nextScene: "start" }]
  },
  villageGate: {
    text: "You arrive at the ruined village gate. Shadows stir.",
    choices: [
      { text: "Enter the village", nextScene: "combat" },
      { text: "Turn back", nextScene: "start" }
    ]
  },
  villageAfterBeast: {
    text: "The beast is defeated. The path ahead leads deeper into the cursed village.",
    choices: [{ text: "Keep going", nextScene: "combat" }]
  },
  villageAfterMonk: {
    text: "You vanquished the cursed monk. The air grows colder... something worse awaits.",
    choices: [{ text: "Press forward", nextScene: "combat" }]
  },
  finalVictory: {
    text: "The wraith fades with a final howl. Peace returns to Kyangjin. You've survived the Shadows of Shambhala.",
    choices: [{ text: "Play Again", nextScene: "intro", effect: () => resetGame() }]
  },
  combat: {
    text: () => {
      const enemy = enemyList[gameState.currentEnemyIndex];
      return `A ${enemy.name} appears! It uses ${enemy.attack}!`;
    },
    choices: []
  },
  death: {
    text: "You have fallen in battle. Darkness surrounds you as your journey ends...",
    choices: [{ text: "Restart", nextScene: "intro", effect: () => resetGame() }]
  }
};

function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const storyBox = document.getElementById("story-box");
  const choiceButtons = document.getElementById("choice-buttons");

  storyBox.classList.remove("fade-in");
  void storyBox.offsetWidth; // Reflow trigger
  storyBox.classList.add("fade-in");

  choiceButtons.innerHTML = "";
  gameState.currentScene = sceneId;

  if (sceneId === "intro") {
    storyBox.innerHTML = `<p>${scene.text}</p><input type="text" id="name-input" placeholder="Enter your name" /><button id="start-btn" class="glow-button">Start Adventure</button>`;
    document.getElementById("start-btn").addEventListener("click", () => {
      const nameInput = document.getElementById("name-input").value.trim();
      if (nameInput.length > 0) {
        gameState.playerName = nameInput;
        renderScene("classSelect");
        updatePlayerStats();
      } else {
        alert("Please enter your name to begin.");
      }
    });
    return;
  }

  if (sceneId === "combat") {
    const enemy = enemyList[gameState.currentEnemyIndex];
    if (gameState.currentEnemyHP <= 0) gameState.currentEnemyHP = enemy.hp;
  }

  const storyText = typeof scene.text === "function" ? scene.text(gameState.playerName, gameState.playerClass) : scene.text;
  storyBox.innerHTML = `<p class="typewriter">${storyText}</p>`;
  if (sceneId === "combat") {
    storyBox.innerHTML += `<p>Enemy HP: ❤️ ${gameState.currentEnemyHP}</p>`;
  }

  scene.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.className = "glow-button";
    btn.addEventListener("click", () => {
      if (choice.effect) choice.effect();
      updatePlayerStats();
      renderScene(choice.nextScene);
    });
    choiceButtons.appendChild(btn);
  });

  toggleCombatMenu(sceneId === "combat");
}

function toggleCombatMenu(show) {
  const menu = document.getElementById("combat-controls");
  menu.style.display = show ? "block" : "none";
}

function updatePlayerStats() {
  document.getElementById("hp").textContent = gameState.hp;
  document.getElementById("spirit").textContent = gameState.spirit;
  document.getElementById("player-class").textContent = gameState.playerClass;
}

function updateInventory() {
  const inventoryList = document.getElementById("inventory-list");
  inventoryList.innerHTML = "";
  gameState.inventory.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="assets/icons/${item.replace(/ /g, "_").toLowerCase()}.png" alt="${item}" class="inventory-icon" /> ${item}`;
    inventoryList.appendChild(li);
  });
}

function resetGame() {
  gameState.hp = 5;
  gameState.spirit = 3;
  gameState.inventory = [];
  gameState.playerClass = "";
  gameState.playerName = "";
  gameState.usedPower = false;
  gameState.currentEnemyIndex = 0;
  gameState.currentEnemyHP = 0;
  updateInventory();
  updatePlayerStats();
}

// Combat logic
function handleAttack() {
  const enemy = enemyList[gameState.currentEnemyIndex];
  gameState.currentEnemyHP -= 1;
  if (gameState.currentEnemyHP <= 0) {
    gameState.currentEnemyIndex++;
    if (gameState.currentEnemyIndex >= enemyList.length) {
      renderScene("finalVictory");
    } else {
      renderScene(enemy.nextScene);
    }
  } else {
    gameState.hp -= enemy.damage;
    if (gameState.hp <= 0) {
      renderScene("death");
    } else {
      renderScene("combat");
    }
  }
}

function handleSpecial() {
  if (gameState.usedPower || gameState.spirit <= 0) return;
  const enemy = enemyList[gameState.currentEnemyIndex];
  gameState.currentEnemyHP -= 2;
  gameState.spirit -= 1;
  gameState.usedPower = true;
  if (gameState.currentEnemyHP <= 0) {
    gameState.currentEnemyIndex++;
    if (gameState.currentEnemyIndex >= enemyList.length) {
      renderScene("finalVictory");
    } else {
      renderScene(enemy.nextScene);
    }
  } else {
    gameState.hp -= enemy.damage;
    if (gameState.hp <= 0) {
      renderScene("death");
    } else {
      renderScene("combat");
    }
  }
}

function handleFlee() {
  renderScene("start");
}

// Add event listeners
window.onload = () => {
  renderScene("intro");
  document.getElementById("attack-btn").addEventListener("click", handleAttack);
  document.getElementById("special-btn").addEventListener("click", handleSpecial);
  document.getElementById("flee-btn").addEventListener("click", handleFlee);

  // Background music
  const bgMusic = new Audio("assets/audio/ambient-loop.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.4;
  bgMusic.play().catch(() => console.warn("Autoplay blocked"));
};
