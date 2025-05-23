let floor = 1;
let lastFloorUpdate = 0;
let floorInterval = 3000;

let gameStarted = false;
let textBoxActive = true;

let bossAnnoyance = 0;
let bossImpressed = 0;
let bossShame = 0;

let thresholds = {
  annoyed: 10,
  impressed: 10,
  shame: 10
};

let thresholdTriggered = false;
let thresholdText = "";
let thresholdPhase = false; // whether to render the special threshold box

let volume = parseFloat(localStorage.getItem("volume") || 0.5);

let elevatorMusic;
let typingSound;




let elevatorImg, bossImg, workerImg;

// --- Dialogue Tree System ---
let dialogueTree = [
  {
    prompt: "What do you say?",
    options: [
      { text: "Nice weather we're having.",
        response: "Boss: Yep.",
        next: 1,
        effects: { annoyance: 3, shame: 1, impressed: 0 } },
      { text: "I like your tie.",
        response: "Boss: My granddaughter got it for me.",
        next: 2,
        effects: { annoyance: 0, shame: 2, impressed: 1 } },
      { text: "*Stay Silent",
        response: "It remains silent.",
        next: 3,
        effects: { annoyance: 0, shame: 0, impressed: 0 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "Did you do anything fun over the weekend?",
        response: "Boss: Not really. Big deadline coming up.",
        next: 7,
        effects: { annoyance: 3, shame: 2, impressed: 0 } },
      { text: "Did you see the game last night?",
        response: "Boss: Which one.",
        next: 4,
        effects: { annoyance: 2, shame: 0, impressed: 2 } },
      { text: "*Stay silent*",
        response: "It remains quiet again.",
        next: 0,
        effects: { annoyance: 0, shame: 2, impressed: 0 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "She has good taste.",
        response: "Boss: Doesn't she? I wish I got to see her more.",
        next: 3,
        effects: { annoyance: 0, shame: 0, impressed: 4 } },
      { text: "Adding some color to the outfit, I like it.",
        response: "Boss: Thanks.",
        next: 3,
        effects: { annoyance: 0, shame: 2, impressed: 0 } },
      { text: "Where is it from?",
        response: "Boss: Couldn't tell you.",
        next: 3,
        effects: { annoyance: 5, shame: 5, impressed: 0 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "This elevator takes forever.",
        response: "Boss: It always does.",
        next: 0,
        effects: { annoyance: 1, shame: 1, impressed: 0 } },
      { text: "Did you catch the game last night?",
        response: "Boss: Which one?",
        next: 4,
        effects: { annoyance: 1, shame: 0, impressed: 2 } },
      { text: "*Continue in silence*",
        response: "Silence again.",
        next: 0,
        effects: { annoyance: 0, shame: 2, impressed: 0 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "The Knicks?.",
        response: "Boss: I can't stand the NBA anymore. Too many fouls. These new... thugs couldn't hold Jordan's jock-strap.",
        next: 5,
        effects: { annoyance: 2, shame: 0, impressed: 0 } },
      { text: "The Yankees?",
        response: "Boss: No.",
        next: null,
        effects: { annoyance: 2, shame: 3, impressed: 0 } },
      { text: "The 'cuse of course",
        response: "You're a lacrosse fan? My grandson actually plays for the Orange",
        next: 9,
        effects: { annoyance: 0, shame: 0, impressed: 5 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "Jordan was iconic for the time, but he played against plumbers. LeBron is the real GOAT.",
        response: "Boss: Kids these days *scoff*",
        next: null,
        effects: { annoyance: 8, shame: 0, impressed: 0 } },
      { text: "I toally agree. Feels like every 30 seconds I'm seeing someone shooting free throws. Kills the flow of the game. But hey, at least the city is rallying?",
        response: "Boss: *scoff* Yeah, now we have hoodlums climbing buildings and shooting fireworks. We'll end up like Minneapolis before long.",
        next: 6,
        effects: { annoyance: 4, shame: 0, impressed: 0 } },
      { text: "And all the political messages they're trying to preach? They're athletes, if I wanted to learn about radical politics, I'd watch CNN.",
        response: "Boss: *What a smart young man*",
        next: null,
        effects: { annoyance: 0, shame: 5, impressed: 10 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "What about Minneapolis?.",
        response: "Boss: Nevermind.",
        next: 0,
        effects: { annoyance: 10, shame: 5, impressed: 0 } },
      { text: "I couldn't agree more. The mayor needs to get this city under control, I don't want to see my home burn.",
        response: "Boss: *What a smart young man*.",
        next: null,
        effects: { annoyance: 0, shame: 5, impressed: 10 } },
      { text: "But it would be kind of cool to go to a championship parade. Have you ever been to one?",
        response: "Actually, I have. *smiles* I remember last time the Knicks won. My dad took me out of school early for that parade.",
        next: 0,
        effects: { annoyance: 0, shame: 0, impressed: 8 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "What deadline?",
        response: "Boss: Nevermind.",
        next: 0,
        effects: { annoyance: 10, shame: 0, impressed: 0 } },
      { text: "Yes of course, I'm actually heading to a meeting right now about the client reports.",
        response: "Boss: Good.",
        next: 3,
        effects: { annoyance: 2, shame: 6, impressed: 0 } },
      { text: "Yeah Jeremy was telling me about that. He said this is a big client and you were instrumental in landing them.",
        response: "Boss: Jeremy is a suck-up sometimes, but he's a hard worker. You'd do well to listen to him.",
        next: 8,
        effects: { annoyance: 0, shame: 5, impressed: 3 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "Yes sir. He really looks up to you, it seems like this company has a great bond.",
        response: "Boss: I see.",
        next: null,
        effects: { annoyance: 0, shame: 0, impressed: 10 } },
      { text: "*Laugh* He really is such a dork. I would've bullied him in high school for sure.",
        response: "Boss: What?",
        next: null,
        effects: { annoyance: 10, shame: 0, impressed: 0 } },
      { text: "Yeah, I want to be just like Jeremy when I grow up.",
        response: "Boss: That's... nice.",
        next: 3,
        effects: { annoyance: 2, shame: 10, impressed: 0 } }
    ]
  },
  {
    prompt: "What will you say?",
    options: [
      { text: "No way. I played middie in high school, it's such a fun sport.",
        response: "Boss: I see.",
        next: null,
        effects: { annoyance: 0, shame: 0, impressed: 10 } },
      { text: "Oof the Orange are awful this year. They need to fire that coach, I'm sure he's misusing your grandson.",
        response: "Boss: Yep",
        next: null,
        effects: { annoyance: 0, shame: 0, impressed: 10 } },
      { text: "Does he even start? I think I would've known if I saw him.",
        response: "Boss: Wow.",
        next: null,
        effects: { annoyance: 10, shame: 3, impressed: 0 } }
    ]
  }
];

let currentNodeIndex = 0;
let currentOptionIndex = null;
let dialoguePhase = "prompt"; // 'prompt', 'response'


function preload() {
  elevatorImg = loadImage('assets/elevator.jpg');
  bossImg = loadImage('assets/boss.png');
  workerImg = loadImage('assets/worker.png');
  elevatorMusic = loadSound('assets/elevatormusic.mp3');
  typingSound = loadSound('assets/typing.mp3');

}

function setup() {
  createCanvas(1520, 700);
  volume = parseFloat(localStorage.getItem("volume") || 0.5);
elevatorMusic.setVolume(volume);
elevatorMusic.loop();

  textFont('Arial');
  textSize(18);

  // Initialize first prompt
  currentPrompt = "What do you say?";

  setTimeout(() => {
    gameStarted = true;
  }, 3000);
}

function draw() {
  background(240);

  if (elevatorImg) {
    image(elevatorImg, 0, 0, width, height);
  }

  if (workerImg) {
    image(workerImg, width / 5 - 150, height - 700, 600, 700);
  }
  if (bossImg) {
    image(bossImg, width / 2 + 50, height - 700, 600, 700);
  }

  drawShameMeter();
  drawAnnoyanceMeter();
  drawElevatorScreen();

  if (gameStarted && textBoxActive) {
    drawTextBox();
  }

  checkBossMood();
}

function drawElevatorScreen() {
  if (millis() - lastFloorUpdate > floorInterval) {
    floor++;
    lastFloorUpdate = millis();

    // Trigger ending if we reach floor 65
    if (floor === 65 && !thresholdTriggered) {
      thresholdText = "The Boss frowns slightly. Boss: I think I'm arriving at my floor";
      thresholdTriggered = true;
      textBoxActive = true;
      dialoguePhase = "threshold";
      typedChars = 0;
    }
  }

  fill(0);
  rect(width / 2 - 50, 20, 100, 40);
  fill(255);
  textAlign(CENTER, CENTER);
  text(`Floor ${floor}`, width / 2, 40);
}


let typedChars = 0;
let typingSpeed = 2;

function drawTextBox() {
  fill(0);
  stroke(255);
  strokeWeight(1);
  rect(100, height - 160, width - 200, 150, 20);

  fill(255);
  noStroke();
  textAlign(LEFT, TOP);

  let node = dialogueTree[currentNodeIndex];

  if (dialoguePhase === "prompt") {
    let visibleText = node.prompt.substring(0, typedChars);
    text(visibleText, 120, height - 140);

    if (frameCount % typingSpeed === 0 && typedChars < node.prompt.length) {
      if (!typingSound.isPlaying()) typingSound.loop();
      typedChars++;
    } else if (typedChars >= node.prompt.length && typingSound.isPlaying()) {
      typingSound.stop();
    }

    if (typedChars >= node.prompt.length) {
      let baseY = height - 100;
      for (let i = 0; i < node.options.length; i++) {
        let y = baseY + i * 30;
        let isHover = mouseX > 120 && mouseX < width - 120 && mouseY > y && mouseY < y + 25;
        if (isHover) {
          fill(255);
          rect(115, y - 2, width - 230, 25, 5);
          fill(0);
        } else fill(255);
        text(`${i + 1}. ${node.options[i].text}`, 120, y);
      }
    }

  } else if (dialoguePhase === "response") {
    let response = node.options[currentOptionIndex].response;
    let visibleResponse = response.substring(0, typedChars);
    text(visibleResponse, 120, height - 140);

    if (frameCount % typingSpeed === 0 && typedChars < response.length) {
      if (!typingSound.isPlaying()) typingSound.loop();
      typedChars++;
    } else if (typedChars >= response.length && typingSound.isPlaying()) {
      typingSound.stop();
    }

    if (typedChars >= response.length) {
      let y = height - 60;
      let isHover = mouseX > 120 && mouseX < width - 120 && mouseY > y && mouseY < y + 25;
      if (isHover) {
        fill(255);
        rect(115, y - 2, width - 230, 25, 5);
        fill(0);
      } else fill(255);
      text("Click to continue", 120, y);
    }

  } else if (dialoguePhase === "threshold") {
    let visibleText = thresholdText.substring(0, typedChars);
    text(visibleText, 120, height - 140);

    if (frameCount % typingSpeed === 0 && typedChars < thresholdText.length) {
      if (!typingSound.isPlaying()) typingSound.loop();
      typedChars++;
    } else if (typedChars >= thresholdText.length && typingSound.isPlaying()) {
      typingSound.stop();
    }

    if (typedChars >= thresholdText.length) {
      let y = height - 60;
      let isHover = mouseX > 120 && mouseX < width - 120 && mouseY > y && mouseY < y + 25;
      if (isHover) {
        fill(255);
        rect(115, y - 2, width - 230, 25, 5);
        fill(0);
      } else {
        fill(255);
      }
      text("Play Again?", 120, y);
    }
  }
}






function restartGame() {
  bossAnnoyance = 0;
  bossImpressed = 0;
  bossShame = 0;
  floor = 1;
  currentNodeIndex = 0;
  currentOptionIndex = null;
  dialoguePhase = "prompt";
  thresholdTriggered = false;
  textBoxActive = true;
  typedChars = 0;
}


function mousePressed() {
  if (!textBoxActive) return;

  let node = dialogueTree[currentNodeIndex];

  if (dialoguePhase === "prompt") {
    let baseY = height - 100;
    for (let i = 0; i < node.options.length; i++) {
      let y = baseY + i * 30;
      if (mouseX > 120 && mouseX < width - 120 && mouseY > y && mouseY < y + 25) {
        currentOptionIndex = i;
        let effects = node.options[i].effects;
        bossAnnoyance += effects.annoyance;
        bossImpressed += effects.impressed;
        bossShame += effects.shame;
        dialoguePhase = "response";
        typedChars = 0;
        break;
      }
    }
  } else if (dialoguePhase === "response") {
    let response = node.options[currentOptionIndex].response;
    if (typedChars < response.length) {
      typedChars = response.length;
      return;
    }
    let next = node.options[currentOptionIndex].next;
    if (next === null) {
      textBoxActive = false;
    } else {
      currentNodeIndex = next;
      dialoguePhase = "prompt";
      typedChars = 0;
    }
  }
    else if (dialoguePhase === "threshold" && typedChars >= thresholdText.length) {
    let y = height - 60;
    if (mouseX > 120 && mouseX < width - 120 && mouseY > y && mouseY < y + 25) {
      restartGame();
    }
  }

}


function drawShameMeter() {
  let meterHeight = height - 100;
  let meterWidth = 30;
  let filledHeight = map(bossShame, 0, thresholds.shame, 0, meterHeight);

  fill(50);
  rect(40, 50, meterWidth, meterHeight, 10);

  fill(0, 255, 0);
  rect(40, 50 + (meterHeight - filledHeight), meterWidth, filledHeight, 10);
}

function drawAnnoyanceMeter() {
  let meterHeight = height - 100;
  let meterWidth = 30;
  let filledHeight = map(bossAnnoyance, 0, thresholds.annoyed, 0, meterHeight);

  fill(50);
  rect(width - 70, 50, meterWidth, meterHeight, 10);

  fill(255, 0, 0);
  rect(width - 70, 50 + (meterHeight - filledHeight), meterWidth, filledHeight, 10);
}

function checkBossMood() {
  if (thresholdTriggered) return;

  if (bossAnnoyance >= thresholds.annoyed) {
    thresholdText = "The Boss frowns slightly. Boss: I think I'm arriving at my floor";
    thresholdTriggered = true;
    textBoxActive = true;
    dialoguePhase = "threshold";
    typedChars = 0;
  } else if (bossImpressed >= thresholds.impressed) {
    thresholdText = "You notice the Boss has a slight grin. He seems to think I'm pretty smart! Maybe I can use him as a reference later, I better go connect with him on LinkedIn!";
    thresholdTriggered = true;
    textBoxActive = true;
    dialoguePhase = "threshold";
    typedChars = 0;
  }
}



