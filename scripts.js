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
    text: (name) =>
      `You awake in a dark forest near the village of Kyangjin, ${name}. A faint glow flickers in the distance.`,
    choices: [
      { text: "Walk toward the glow", nextScene: "villageGate" },
      { text: "Stay and explore the forest", nextScene: "forestExplore" },
    ],
  },
  forestExplore: {
  text:
    "The forest feels alive with whispers. You find some herbs and a rusty dagger.",
  choices: [
    {
      text: "Pick up the dagger",
      nextScene: "start",
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
  // Add more scenes later
};

function toggleCombatMenu(show) {
  const combatMenu = document.getElementById("combat-menu");
  combatMenu.style.display = show ? "block" : "none";
} 

function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const storyBox = document.getElementById("story-box");
  const choiceButtons = document.getElementById("choice-buttons");

  choiceButtons.innerHTML = "";

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
        renderScene("start");
        updatePlayerStats();
      } else {
        alert("Please enter your name to begin.");
      }
    });

    return;
  }

  const storyText =
    typeof scene.text === "function"
      ? scene.text(gameState.playerName)
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

function attackEnemy() {
  alert("You swing your weapon!");
  renderScene("start");
}

function useItem() {
  alert("You use an item!");
  renderScene("start");
}

function fleeBattle() {
  alert("You flee from the enemy!");
  renderScene("start");
}