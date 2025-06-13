// Game State
const gameState = {
  playerName: "",
  playerClass: "",
  hp: 5,
  spirit: 3,
  inventory: [],
  currentScene: "intro",
  usedPower: false,
  currentEnemy: null,
};

const enemyList = [
  {
    name: "Wild Beast",
    attack: "Claw Swipe",
    damage: 2,
    nextScene: "villageCenter",
  },
  {
    name: "Cultist",
    attack: "Dark Ritual",
    damage: 3,
    nextScene: "templeEntrance",
  },
  {
    name: "Temple Guardian",
    attack: "Stone Slam",
    damage: 4,
    nextScene: "finalVictory",
  }
];

gameState.currentEnemyIndex = 0;

// Scenes
const scenes = {
  intro: {
    text: "Welcome, adventurer! What is your name?",
    choices: [],
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
        },
      },
      {
        text: "Shaman 🔮 - Spiritual and wise",
        nextScene: "afterClassSelect",
        effect: () => {
          gameState.playerClass = "Shaman";
          gameState.spirit += 2;
        },
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
        },
      },
    ],
  },
  afterClassSelect: {
    text: () => `You don your gear and prepare for the journey ahead. You take your first step into the mysterious forest...`,
    choices: [{ text: "Continue", nextScene: "start" }],
  },
  start: {
    text: (name, playerClass) =>
      `You awake in a dark forest near Kyangjin, ${name} the ${playerClass}. A glow flickers nearby.`,
    choices: [
      { text: "Walk toward the glow", nextScene: "villageGate" },
      { text: "Explore the forest", nextScene: "forestExplore" },
    ],
  },
  forestExplore: {
    text: "The forest feels alive. You find herbs and a rusty dagger.",
    choices: [
      {
        text: "Pick up the dagger",
        nextScene: "forestDaggerTaken",
        effect: () => {
          if (!gameState.inventory.includes("Rusty Dagger")) {
            gameState.inventory.push("Rusty Dagger");
            updateInventory();
          }
        },
      },
      { text: "Ignore and head to village", nextScene: "villageGate" },
    ],
  },
  forestDaggerTaken: {
    text: "You pick up the rusty dagger. It hums faintly.",
    choices: [{ text: "Return to path", nextScene: "start" }],
  },
  villageGate: {
    text: "You arrive at the ruined village gate. Shadows stir.",
    choices: [
      { text: "Enter the village", nextScene: "combat" },
      { text: "Turn back", nextScene: "start" },
    ],
  },
  villageCenter: {
    text: "The village is silent. A temple lies beyond.",
    choices: [
      { text: "Approach the temple", nextScene: "combat" },
      {
        text: "Rest before continuing",
        nextScene: "rest",
        effect: () => {
          gameState.hp = Math.min(gameState.hp + 2, 5);
          updatePlayerStats();
        },
      },
    ],
  },
  rest: {
    text: "You rest and feel rejuvenated.",
    choices: [{ text: "Continue to the temple", nextScene: "combat" }],
  },
  finalVictory: {
    text: "You have defeated the guardian. Peace returns to Shambhala.",
    choices: [
      { text: "Restart", nextScene: "intro", effect: () => resetGame() },
    ],
  },
  combat: {
    text: () => {
      const enemy = gameState.currentEnemy;
      return enemy
        ? `A ${enemy.name} appears! It uses ${enemy.power}!`
        : "An enemy approaches!";
    },
    choices: [],
  },
  death: {
    text: "You fall in battle. The shadows consume you...",
    choices: [
      { text: "Restart", nextScene: "intro", effect: () => resetGame() },
    ],
  },
};

// Rendering logic
function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const storyBox = document.getElementById("story-box");
  const choiceButtons = document.getElementById("choice-buttons");

  choiceButtons.innerHTML = "";
  gameState.currentScene = sceneId;

  if (sceneId === "intro") {
    storyBox.innerHTML = `
      <p>${scene.text}</p>
      <input type="text" id="name-input" placeholder="Enter your name" />
      <button id="start-btn">Start Adventure</button>
    `;
    document.getElementById("start-btn").addEventListener("click", () => {
      const name = document.getElementById("name-input").value.trim();
      if (name) {
        gameState.playerName = name;
        renderScene("classSelect");
        updatePlayerStats();
      }
    });
    return;
  }

  // Set combat enemy
  if (sceneId === "combat") {
    if (gameState.currentScene === "villageGate") {
      gameState.currentEnemy = { name: "Cultist", hp: 3, power: "Dark Slash" };
    } else if (gameState.currentScene === "villageCenter") {
      gameState.currentEnemy = { name: "Temple Guardian", hp: 5, power: "Stone Slam" };
    } else {
      gameState.currentEnemy = { name: "Wild Beast", hp: 2, power: "Claw Swipe" };
    }
    gameState.usedPower = false;
  }

  const text = typeof scene.text === "function" ? scene.text() : scene.text;
  storyBox.innerHTML = `<p>${text}</p>`;

  scene.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
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
  const combatMenu = document.getElementById("combat-menu");
  if (!combatMenu) return;
  combatMenu.innerHTML = "";
  combatMenu.style.display = show ? "block" : "none";

  if (show) {
    [
      { text: "Attack", handler: attackEnemy },
      { text: "Use Item", handler: useItem },
      { text: "Flee", handler: fleeBattle },
      { text: "Use Power", handler: usePower },
    ].forEach(({ text, handler }) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.addEventListener("click", handler);
      combatMenu.appendChild(btn);
    });
  }
}

function attackEnemy() {
  const enemy = gameState.currentEnemy;
  if (!enemy) return;
  enemy.hp -= 2;

  if (enemy.hp <= 0) {
    alert(`You defeated the ${enemy.name}!`);
    if (enemy.name === "Wild Beast") renderScene("villageGate");
    else if (enemy.name === "Cultist") renderScene("villageCenter");
    else if (enemy.name === "Temple Guardian") renderScene("finalVictory");
    return;
  }

  gameState.hp -= 1;
  updatePlayerStats();
  if (gameState.hp <= 0) renderScene("death");
  else renderScene("combat");
}

function useItem() {
  if (gameState.inventory.includes("Rusty Dagger")) {
    alert("You stab the enemy with your Rusty Dagger!");
    gameState.currentEnemy.hp = 0;
    attackEnemy();
  } else {
    alert("You have nothing useful.");
    gameState.hp -= 1;
    updatePlayerStats();
    if (gameState.hp <= 0) renderScene("death");
    else renderScene("combat");
  }
}

function usePower() {
  if (gameState.usedPower) {
    alert("Power already used!");
    return;
  }
  const cls = gameState.playerClass;
  gameState.usedPower = true;

  if (cls === "Warrior") {
    alert("You bash the enemy with your shield!");
    gameState.currentEnemy.hp = 0;
  } else if (cls === "Shaman") {
    if (gameState.spirit > 0) {
      gameState.spirit--;
      gameState.hp = Math.min(gameState.hp + 2, 5);
      alert("You heal and smite your foe!");
      gameState.currentEnemy.hp = 0;
    } else {
      alert("Not enough spirit.");
      gameState.usedPower = false;
    }
  } else if (cls === "Hunter") {
    if (gameState.inventory.includes("Hunter’s Instinct")) {
      alert("Perfect shot! The enemy drops.");
      gameState.currentEnemy.hp = 0;
    } else {
      alert("Your senses aren't sharp enough.");
    }
  }
  attackEnemy();
}

function fleeBattle() {
  alert("You escape!");
  renderScene("start");
}

function updatePlayerStats() {
  document.getElementById("player-name").textContent = gameState.playerName || "[Name]";
  document.getElementById("player-class").textContent = gameState.playerClass || "[Class]";

  document.getElementById("player-health").textContent = gameState.hp > 0 ? "❤️".repeat(gameState.hp) : "💀";
  document.getElementById("player-spirit").textContent = gameState.spirit > 0 ? "💠".repeat(gameState.spirit) : "✖";
}

function updateInventory() {
  const list = document.getElementById("inventory-list");
  list.innerHTML = "";
  gameState.inventory.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function resetGame() {
  Object.assign(gameState, {
    playerName: "",
    playerClass: "",
    hp: 5,
    spirit: 3,
    inventory: [],
    currentScene: "intro",
    usedPower: false,
    currentEnemy: null,
  });
  updatePlayerStats();
  updateInventory();
}

function saveGame() {
  localStorage.setItem("shambhala-save", JSON.stringify(gameState));
  alert("Game saved!");
}

function loadGame() {
  const saved = localStorage.getItem("shambhala-save");
  if (saved) {
    Object.assign(gameState, JSON.parse(saved));
    updatePlayerStats();
    updateInventory();
    renderScene(gameState.currentScene);
    alert("Game loaded!");
  } else {
    alert("No save found.");
  }
}

renderScene(gameState.currentScene);
