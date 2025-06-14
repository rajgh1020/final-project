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
      {
        text: "Enter the village",
        nextScene: "combat"
      },
      {
        text: "Turn back",
        nextScene: "start"
      }
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

function advanceToNextEnemyScene() {
  const enemy = enemyList[gameState.currentEnemyIndex];
  if (enemy && enemy.nextScene) {
    gameState.currentEnemyIndex++;
    const nextEnemy = enemyList[gameState.currentEnemyIndex];
    if (nextEnemy) {
      gameState.currentEnemyHP = nextEnemy.hp;
    }
    renderScene(enemy.nextScene);
  } else {
    renderScene("finalVictory");
  }
}

// ===== Combat Menu Logic =====
function toggleCombatMenu(show) {
  const combatMenu = document.getElementById("combat-menu");
  if (!combatMenu) return;
  combatMenu.innerHTML = "";

  if (show) {
    const attackBtn = document.createElement("button");
    attackBtn.textContent = "Attack";
    attackBtn.addEventListener("click", attackEnemy);

    const useItemBtn = document.createElement("button");
    useItemBtn.textContent = "Use Item";
    useItemBtn.addEventListener("click", useItem);

    const fleeBtn = document.createElement("button");
    fleeBtn.textContent = "Flee";
    fleeBtn.addEventListener("click", fleeBattle);

    const powerBtn = document.createElement("button");
    powerBtn.textContent = "Use Power";
    powerBtn.addEventListener("click", usePower);

    combatMenu.appendChild(attackBtn);
    combatMenu.appendChild(useItemBtn);
    combatMenu.appendChild(fleeBtn);
    if (!gameState.usedPower) combatMenu.appendChild(powerBtn);

    combatMenu.style.display = "block";
  } else {
    combatMenu.style.display = "none";
  }
}

// ===== Combat Actions =====
function attackEnemy() {
  const enemy = enemyList[gameState.currentEnemyIndex];
  const hitSuccess = Math.random() < 0.7;

  if (hitSuccess) {
    gameState.currentEnemyHP -= 2;
    alert(`You hit the ${enemy.name} for 2 damage!`);

    if (gameState.currentEnemyHP <= 0) {
      alert(`You defeated the ${enemy.name}!`);
      advanceToNextEnemyScene();
      return;
    }
  } else {
    alert("Your attack missed!");
  }

  gameState.hp -= enemy.damage;
  alert(`${enemy.name} attacks you for ${enemy.damage} damage!`);
  updatePlayerStats();

  if (gameState.hp <= 0) {
    renderScene("death");
  } else {
    renderScene("combat");
  }
}

function useItem() {
  const enemy = enemyList[gameState.currentEnemyIndex];
  if (gameState.inventory.includes("Rusty Dagger")) {
    gameState.currentEnemyHP -= 3;
    alert("You slash with your Rusty Dagger!");

    if (gameState.currentEnemyHP <= 0) {
      alert("You defeated the enemy with the dagger!");
      advanceToNextEnemyScene();
    } else {
      gameState.hp -= enemy.damage;
      alert(`${enemy.name} counters for ${enemy.damage} damage!`);
      updatePlayerStats();
      if (gameState.hp <= 0) renderScene("death");
      else renderScene("combat");
    }
  } else {
    alert("You have no usable item.");
    renderScene("combat");
  }
}

function usePower() {
  if (gameState.usedPower) {
    alert("You've already used your special power!");
    return;
  }
  gameState.usedPower = true;
  const cls = gameState.playerClass;
  if (cls === "Warrior") {
    alert("You bash the enemy with your shield and win the fight!");
    advanceToNextEnemyScene();
  } else if (cls === "Shaman") {
    if (gameState.spirit > 0) {
      gameState.spirit--;
      gameState.hp = Math.min(gameState.hp + 2, 5);
      updatePlayerStats();
      alert("You heal and blast the enemy with spirit!");
      advanceToNextEnemyScene();
    } else {
      alert("Not enough spirit!");
      gameState.usedPower = false;
    }
  } else if (cls === "Hunter") {
    if (gameState.inventory.includes("Hunter’s Instinct")) {
      alert("You use Piercing Shot to instantly kill the enemy!");
      advanceToNextEnemyScene();
    } else {
      alert("You try to use your power, but fail!");
      renderScene("combat");
    }
  }
}

function fleeBattle() {
  alert("You flee from the enemy and return to the forest path.");
  renderScene("start");
}

// ===== Render Logic =====
function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const storyBox = document.getElementById("story-box");
  const choiceButtons = document.getElementById("choice-buttons");

  choiceButtons.innerHTML = "";
  gameState.currentScene = sceneId;
  if (sceneId === "intro") {
    storyBox.innerHTML = `<p>${scene.text}</p><input type="text" id="name-input" placeholder="Enter your name" /><button id="start-btn">Start Adventure</button>`;
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
    if (gameState.currentEnemyHP === 0) gameState.currentEnemyHP = enemy.hp;
  }

  const storyText = typeof scene.text === "function" ? scene.text(gameState.playerName, gameState.playerClass) : scene.text;
  storyBox.innerHTML = `<p>${storyText}</p>`;
  if (sceneId === "combat") {
    storyBox.innerHTML += `<p>Enemy HP: ❤️ ${gameState.currentEnemyHP}</p>`;
  }

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

  if (sceneId !== "combat") toggleCombatMenu(false);
  else toggleCombatMenu(true);
}

// ===== UI Updates =====
function updatePlayerStats() {
  document.getElementById("player-name").textContent = gameState.playerName || "[Name]";
  document.getElementById("player-class").textContent = gameState.playerClass || "[Class]";
  document.getElementById("player-health").textContent = "❤️".repeat(gameState.hp) || "💀";
  document.getElementById("player-spirit").textContent = "💠".repeat(gameState.spirit) || "✖";
}

function updateInventory() {
  const inventoryList = document.getElementById("inventory-list");
  inventoryList.innerHTML = "";
  gameState.inventory.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    inventoryList.appendChild(li);
  });
}

function resetGame() {
  gameState.playerName = "";
  gameState.playerClass = "";
  gameState.hp = 5;
  gameState.spirit = 3;
  gameState.inventory = [];
  gameState.currentScene = "intro";
  gameState.usedPower = false;
  gameState.currentEnemyIndex = 0;
  gameState.currentEnemyHP = 0;
  updatePlayerStats();
  updateInventory();
  renderScene("intro");
}

// ===== Save/Load (Optional) =====
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
    alert("No save data found.");
  }
}

// ===== Init =====
renderScene(gameState.currentScene);
updatePlayerStats();
updateInventory();
