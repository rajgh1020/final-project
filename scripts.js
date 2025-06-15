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

// ===== Scenes Definition =====
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
      const e = enemyList[gameState.currentEnemyIndex];
      return `A ${e.name} appears! It uses ${e.attack}!`;
    },
    choices: []
  },
  death: {
    text: "You have fallen in battle. Darkness surrounds you as your journey ends...",
    choices: [{ text: "Restart", nextScene: "intro", effect: () => resetGame() }]
  }
};

// ===== Render Logic =====
function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const box = document.getElementById("story-box");
  const choices = document.getElementById("choice-buttons");

  // fade animation
  box.classList.remove("fade-in");
  void box.offsetWidth;
  box.classList.add("fade-in");

  choices.innerHTML = "";
  gameState.currentScene = sceneId;

  // intro special
  if (sceneId === "intro") {
    box.innerHTML = `
      <p>${scene.text}</p>
      <input id="name-input" type="text" placeholder="Enter your name" />
      <button id="start-btn" class="glow-button">Start Adventure</button>
    `;
    document.getElementById("start-btn")
      .addEventListener("click", () => {
        const name = document.getElementById("name-input").value.trim();
        if (!name) return alert("Please enter your name.");
        gameState.playerName = name;
        renderScene("classSelect");
        updatePlayerStats();
      });
    return;
  }

  // combat init
  if (sceneId === "combat") {
    const e = enemyList[gameState.currentEnemyIndex];
    if (gameState.currentEnemyHP <= 0) gameState.currentEnemyHP = e.hp;
  }

  // normal text
  const text = typeof scene.text === "function"
    ? scene.text(gameState.playerName, gameState.playerClass)
    : scene.text;
  box.innerHTML = `<p>${text}</p>`;
  if (sceneId === "combat") {
    box.innerHTML += `<p>Enemy HP: ❤️ ${gameState.currentEnemyHP}</p>`;
  }

  // choices
  for (const c of scene.choices) {
    const btn = document.createElement("button");
    btn.className = "glow-button";
    btn.textContent = c.text;
    btn.addEventListener("click", () => {
      if (c.effect) c.effect();
      updatePlayerStats();
      renderScene(c.nextScene);
    });
    choices.appendChild(btn);
  }

  toggleCombatMenu(sceneId === "combat");
}

// ===== Toggle Combat UI =====
function toggleCombatMenu(show) {
  document.getElementById("combat-controls")
    .style.display = show ? "block" : "none";
}

// ===== Update Stats & Inventory =====
function updatePlayerStats() {
  document.getElementById("hp").textContent = gameState.hp;
  document.getElementById("spirit").textContent = gameState.spirit;
  document.getElementById("player-class").textContent = gameState.playerClass;
}

function updateInventory() {
  const ul = document.getElementById("inventory-list");
  ul.innerHTML = "";

  for (const item of gameState.inventory) {
    const filename = item.replace(/ /g, "_").toLowerCase() + ".png";
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = `assets/icons/${filename}`;
    img.alt = item;
    img.className = "inventory-icon";
    img.onerror = () => img.remove(); // hide broken

    li.appendChild(img);
    li.append(item);
    ul.appendChild(li);
  }
}

// ===== Reset Game =====
function resetGame() {
  Object.assign(gameState, {
    playerName: "",
    playerClass: "",
    hp: 5,
    spirit: 3,
    inventory: [],
    currentScene: "intro",
    usedPower: false,
    currentEnemyIndex: 0,
    currentEnemyHP: 0
  });
  updateInventory();
  updatePlayerStats();
}

// ===== Combat Handlers =====
function handleAttack() {
  const e = enemyList[gameState.currentEnemyIndex];
  gameState.currentEnemyHP -= 1;
  if (gameState.currentEnemyHP <= 0) {
    gameState.currentEnemyIndex++;
    return renderScene(
      gameState.currentEnemyIndex >= enemyList.length
        ? "finalVictory"
        : e.nextScene
    );
  }
  gameState.hp -= e.damage;
  return gameState.hp <= 0 ? renderScene("death") : renderScene("combat");
}

function handleSpecial() {
  if (gameState.usedPower || gameState.spirit <= 0) return;
  const e = enemyList[gameState.currentEnemyIndex];
  gameState.currentEnemyHP -= 2;
  gameState.spirit--;
  gameState.usedPower = true;
  if (gameState.currentEnemyHP <= 0) {
    gameState.currentEnemyIndex++;
    return renderScene(
      gameState.currentEnemyIndex >= enemyList.length
        ? "finalVictory"
        : e.nextScene
    );
  }
  gameState.hp -= e.damage;
  return gameState.hp <= 0 ? renderScene("death") : renderScene("combat");
}

function handleFlee() {
  renderScene("start");
}

// ===== Save / Load =====
const SAVE_KEY = "shambhala-save";

function saveGame() {
  console.log("🔒 saveGame()", gameState);
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    console.log("✅ Saved:", localStorage.getItem(SAVE_KEY));
    alert("Game saved!");
  } catch (err) {
    console.error("💥 Save failed", err);
    alert("Failed to save.");
  }
}

function loadGame() {
  console.log("📂 loadGame()");
  const data = localStorage.getItem(SAVE_KEY);
  console.log("⤷ raw data:", data);
  if (!data) return alert("No save found.");
  try {
    Object.assign(gameState, JSON.parse(data));
    console.log("✅ Loaded:", gameState);
    updatePlayerStats();
    updateInventory();
    renderScene(gameState.currentScene);
    alert("Game loaded!");
  } catch (err) {
    console.error("💥 Load failed", err);
    alert("Failed to load.");
  }
}

// ===== Initialization =====
window.onload = () => {
  renderScene("intro");
  document.getElementById("attack-btn")
    .addEventListener("click", handleAttack);
  document.getElementById("special-btn")
    .addEventListener("click", handleSpecial);
  document.getElementById("flee-btn")
    .addEventListener("click", handleFlee);

  document.getElementById("save-btn")
    .addEventListener("click", saveGame);
  document.getElementById("load-btn")
    .addEventListener("click", loadGame);

  const bg = new Audio("assets/audio/ambient-loop.mp3");
  bg.loop = true; bg.volume = 0.4;
  bg.play().catch(() => {});
};
