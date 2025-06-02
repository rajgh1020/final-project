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
  // Add more scenes later
};

function renderScene(sceneId) {
  const scene = scenes[sceneId];
  const storyBox = document.getElementById("story-box");
  const choiceButtons = document.getElementById("choice-buttons");

  choiceButtons.innerHTML = "";

  const storyText =
    typeof scene.text === "function"
      ? scene.text(gameState.playerName)
      : scene.text;

  storyBox.innerHTML = `<p>${storyText}</p>`;

  scene.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.addEventListener("click", () => {
      renderScene(choice.nextScene);
    });
    choiceButtons.appendChild(btn);
  });
}

renderScene(gameState.currentScene);
