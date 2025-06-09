const gameState = {
  playerName: "",
  playerClass: "",
  hp: 5,       
  spirit: 3,   
  inventory: [],
  currentScene: "intro",
};

const scenes = {
  intro: {
    text: "Welcome, adventurer! What is your name?",
    choices: [],
  },
  start: {
  text: (name, playerClass) =>
    `You awake in a dark forest near the village of Kyangjin, ${name} the ${playerClass}. A faint glow flickers in the distance.`,
  choices: [
    { text: "Walk toward the glow", nextScene: "villageGate" },
    { text: "Stay and explore the forest", nextScene: "forestExplore" },
  ],
},
  
  classSelect: {
  text: "Choose your class, brave one:",
  choices: [
    {
      text: "Warrior 🛡️ - Strong and durable",
      nextScene: "afterClassSelect",
      effect: () => {
        gameState.playerClass = "Warrior";
        gameState.hp += 2; // Bonus health
      }
    },
    {
      text: "Shaman 🔮 - Spiritual and wise",
      nextScene: "afterClassSelect",
      effect: () => {
        gameState.playerClass = "Shaman";
        gameState.spirit += 2; // Bonus spirit
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
  text: () =>
    `You don your gear and prepare for the journey ahead. You take your first step into the mysterious forest...`,
  choices: [
    { text: "Continue", nextScene: "start" }
  ]
},

  forestExplore: {
  text:
    "The forest feels alive with whispers. You find some herbs and a rusty dagger.",
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
    { text: "Ignore and head to village", nextScene: "villageGate" },
  ],
  },
  forestDaggerTaken: {
  text: "You pick up the rusty dagger. It hums faintly, as if waiting to be used.",
  choices: [
    { text: "Return to the path", nextScene: "start" }
    ]
  },
  combat: {
  text: "An enemy approaches! What will you do?",
  choices: [
    { text: "Attack", nextScene: "start" },
    { text: "Use Item", nextScene: "start" },
    { text: "Flee", nextScene: "start" },
  ],
},
villageGate: {
  text: "You arrive at the gates of a ruined village. Shadows move within.",
  choices: [
    { text: "Enter the village", nextScene: "combat" },
    { text: "Turn back", nextScene: "start" },
  ],
},
death: {
  text: "You have fallen in battle. Darkness surrounds you as your journey ends in the shadows of Shambhala...",
  choices: [
    { text: "Restart", nextScene: "intro", effect: () => resetGame() }
  ]
},

  // Add more scenes later
};

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

    combatMenu.appendChild(attackBtn);
    combatMenu.appendChild(useItemBtn);
    combatMenu.appendChild(fleeBtn);

    combatMenu.style.display = "block";
  } else {
    combatMenu.style.display = "none";
  }
}


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

  const storyText =
  typeof scene.text === "function"
    ? scene.text(gameState.playerName, gameState.playerClass)
    : scene.text;

  storyBox.innerHTML = `<p>${storyText}</p>`;

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


renderScene(gameState.currentScene);

function updatePlayerStats() {
  document.getElementById("player-name").textContent =
    gameState.playerName || "[Name]";
  document.getElementById("player-class").textContent =
    gameState.playerClass || "[Class]";

  // Display health as hearts
  let hearts = "";
  for (let i = 0; i < gameState.hp; i++) hearts += "❤️";
  document.getElementById("player-health").textContent = hearts || "💀";

  // Display spirit as gems
  let gems = "";
  for (let i = 0; i < gameState.spirit; i++) gems += "💠";
  document.getElementById("player-spirit").textContent = gems || "✖";
}

updatePlayerStats();

function updateInventory() {
  const inventoryList = document.getElementById("inventory-list");
  inventoryList.innerHTML = "";
  gameState.inventory.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    inventoryList.appendChild(li);
  });
}

updateInventory();

function resetGame() {
  gameState.playerName = "";
  gameState.playerClass = "";
  gameState.hp = 5;
  gameState.spirit = 3;
  gameState.inventory = [];
  gameState.currentScene = "intro";
  updatePlayerStats();
  updateInventory();
}

function attackEnemy() {
  const damage = Math.random() < 0.5; // 50% chance enemy hits back

  if (damage) {
    gameState.hp -= 2;
    updatePlayerStats();

    if (gameState.hp <= 0) {
      alert("The enemy strikes you down!");
      renderScene("death");
    } else {
      alert("You attack but take damage!");
      renderScene("combat");
    }
  } else {
    alert("You strike down the enemy!");
    renderScene("villageGate");
  }
}

function useItem() {
  if (gameState.inventory.includes("Rusty Dagger")) {
    alert("You use your Rusty Dagger to defeat the enemy!");
    renderScene("villageGate");
  } else {
    alert("You have nothing useful. The enemy takes advantage!");
    gameState.hp -= 1;
    updatePlayerStats();
    if (gameState.hp <= 0) {
      renderScene("death");
    } else {
      renderScene("combat");
    }
  }
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
    alert("No save data found.");
  }
}


function attackEnemy() {
  alert("You swing your weapon!");
  renderScene("start");
}

function useItem() {
  alert("You use an item!");
  renderScene("start");
}

function fleeBattle() {
  alert("You flee from the enemy and return to the forest path.");
  renderScene("start");
}