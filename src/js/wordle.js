let library = [];
const lines = document.querySelectorAll(".line");
const keyMap = new Map();
let currentLineIndex = 0;
let currentWord;
let currentWordMetrics;
let genericPopupTimeout;
let isGameOver = false;
let areInstructionsShown = true;

const styleNames = {
  SHOW_POPUP: "show",
  POPULATED_LETTER: "populated",
  SHAKE_LETTER: "shake",
  SHAKE_LINE: "shake-line",
  NOTFOUND_LETTER: "not-found",
  INCORRECT_LOCATION_LETTER: "incorrect-location",
  CORRECT_LOCATION: "correct-location",
  KEY_PRESS: "press",
  DEFAULT_KEY_STYLES: ["key", "enter", "backspace"],
};

function addKeyEvents() {
  document.querySelectorAll(".key").forEach((element) => {
    const letter = element.getAttribute("value");
    if (!letter) return;
    keyMap.set(letter, element);

    element.addEventListener("mousedown", () => {
      keypress(letter);
      showPressedKey(letter);
    });

    element.addEventListener("mouseup", () => {
      removePressedKey(letter);
    });
  });

  window.addEventListener("keydown", (e) => {
    keypress(e.key);
    showPressedKey(e.key);
  });

  window.addEventListener("keyup", (e) => {
    removePressedKey(e.key);
  });
}

function addGiveUpEvents() {
  const giveUpButton = document.querySelector("#give-up");
  giveUpButton.addEventListener("click", () => {
    currentLineIndex = lines.length;
    checkIfEndGame();
  });
}

function addInstructionEvents() {
  const instructions = document.querySelector("#instructions");
  const hideInstructions = document.querySelector("#close-instructions");
  const instructionBg = document.querySelector("#instruction-bg");

  [hideInstructions, instructionBg].forEach((element) => {
    element.addEventListener("click", () => {
      instructions.classList.add("hide");
      areInstructionsShown = false;
    });
  });

  const showInstructions = document.querySelector("#show-instructions");
  showInstructions.addEventListener("click", () => {
    instructions.classList.remove("hide");
    areInstructionsShown = true;
  });

  //Make sure instructions are shown by default
  instructions.classList.remove("hide");
  areInstructionsShown = true;
}

function addPlayAgainEvents() {
  document.querySelector("#playAgainYes").addEventListener("click", (e) => {
    resetGame();
  });

  document.querySelector("#playAgainNo").addEventListener("click", (e) => {
    document
      .querySelector("#playAgain")
      .classList.remove(styleNames.SHOW_POPUP);
  });
}

function showPressedKey(letter) {
  const pressedKey = keyMap.get(letter.toUpperCase());
  if (pressedKey) pressedKey.classList.add(styleNames.KEY_PRESS);
}

function removePressedKey(letter) {
  const pressedKey = keyMap.get(letter.toUpperCase());
  if (pressedKey) pressedKey.classList.remove(styleNames.KEY_PRESS);
}

function getCurrentWord() {
  const index = Math.floor(Math.random() * library.length);
  return library[index].toUpperCase();
}

function setWordMetrics(word) {
  const metrics = new Map();
  if (!word) return metrics;

  word.split("").forEach((letter, index) => {
    const letterMetric = metrics.get(letter) || [];
    metrics.set(letter, [...letterMetric, index]);
  });
  return metrics;
}

function keypress(value) {
  if (
    areInstructionsShown ||
    isGameOver ||
    !value ||
    lines.length <= currentLineIndex
  )
    return;
  if (value.toUpperCase() === "ENTER") return validateValue();
  if (value.toUpperCase() === "BACKSPACE") return removeLetter();
  if (value.length !== 1) return;

  const upperValue = value.toUpperCase();

  const asciiA = "A".charCodeAt(0);
  const asciiZ = "Z".charCodeAt(0);
  const asciiUpperValue = upperValue.charCodeAt(0);
  if (asciiUpperValue < asciiA || asciiZ < asciiUpperValue) return;

  addLetter(upperValue);
}

function getCurrentLineLetters() {
  return Array.from(lines[currentLineIndex].querySelectorAll(".letter"));
}

function removeLetter() {
  const toRemove = getCurrentLineLetters()
    .reverse()
    .find((letter) => letter.innerHTML?.length !== 0);
  if (toRemove) {
    toRemove.innerHTML = "";
    toRemove.classList.remove(styleNames.POPULATED_LETTER);
    shakeLetter(toRemove);
  }
}

function addLetter(value) {
  const nextLetter = getCurrentLineLetters().find(
    (letter) => letter.innerHTML?.length === 0
  );
  if (nextLetter) {
    nextLetter.innerHTML = value;
    nextLetter.classList.add(styleNames.POPULATED_LETTER);
    shakeLetter(nextLetter);
  }
}

function shakeLetter(letter) {
  letter.classList.add(styleNames.SHAKE_LETTER);

  setTimeout(() => {
    letter.classList.remove(styleNames.SHAKE_LETTER);
  }, 250);
}

function shakeLine(line) {
  line.classList.add(styleNames.SHAKE_LINE);
  setTimeout(() => {
    line.classList.remove(styleNames.SHAKE_LINE);
  }, 500);
}

function validateValue() {
  const letters = getCurrentLineLetters();

  const emptyLetter = letters.find((letter) => letter.innerHTML?.length === 0);
  if (emptyLetter) {
    showGenericPopup("Not enough letters");
    shakeLine(lines[currentLineIndex]);
    return;
  }

  //Check if word is in library
  const wordAdded = letters
    .map((letter) => letter.innerHTML)
    .join("")
    .toLowerCase();
  if (!library.includes(wordAdded)) {
    showGenericPopup("Not in word list.");
    shakeLine(lines[currentLineIndex]);
    return;
  }

  //Check if word was already added
  const words = Array.from(lines)
    .filter((line, index) => index !== currentLineIndex)
    .map((line) =>
      Array.from(line.querySelectorAll(".letter"))
        .map((letter) => letter.innerHTML)
        .join("")
        .toLowerCase()
    )
    .filter((word) => 0 < word.length);
  if (words.includes(wordAdded)) {
    showGenericPopup("Word already added.");
    shakeLine(lines[currentLineIndex]);
    return;
  }

  letters.forEach((letter, index) => {
    const letterValue = letter.innerHTML;
    const letterMetric = currentWordMetrics.get(letterValue) || [];

    const key = keyMap.get(letterValue);

    if (letterMetric.length === 0) {
      letter.classList.add(styleNames.NOTFOUND_LETTER);
      setKeyStyle(key, styleNames.NOTFOUND_LETTER);
      return;
    }

    const matchedIndex = letterMetric.find((metric) => metric === index);
    const locationClass =
      matchedIndex === undefined
        ? styleNames.INCORRECT_LOCATION_LETTER
        : styleNames.CORRECT_LOCATION;
    letter.classList.add(locationClass);
    setKeyStyle(key, locationClass);
  });

  currentLineIndex++;
  checkIfEndGame();
}

function setKeyStyle(key, style) {
  if (key.classList.length !== 1) return;
  key.classList.add(style);
}

function showGenericPopup(message) {
  const genericPopup = document.querySelector("#genericPopup");
  if (genericPopup) {
    genericPopup.classList.add(styleNames.SHOW_POPUP);
    genericPopup.querySelector("#genericMessage").innerHTML = message;
  }

  if (!genericPopupTimeout) clearInterval(genericPopupTimeout);
  genericPopupTimeout = setTimeout(() => {
    genericPopup.classList.remove(styleNames.SHOW_POPUP);
  }, 1000);
}

function checkIfEndGame() {
  const lastLine = lines[currentLineIndex - 1];
  const lastWordAdded = Array.from(lastLine.querySelectorAll(".letter"))
    .map((letter) => letter.innerHTML)
    .join("");

  const didUserWin = lastWordAdded === currentWord.toUpperCase();
  if (didUserWin) {
    document.querySelector("#wonPopup").classList.add(styleNames.SHOW_POPUP);
    isGameOver = true;
  } else if (lines.length <= currentLineIndex) {
    const failurePopup = document.querySelector("#failurePopup");
    if (failurePopup) {
      showPuzzleWord(failurePopup.querySelector("#puzzleWord"));
      failurePopup.classList.add(styleNames.SHOW_POPUP);
    }
    isGameOver = true;
  }

  if (isGameOver) {
    document.querySelector("#playAgain").classList.add(styleNames.SHOW_POPUP);
  }
}

function showPuzzleWord(container) {
  if (!container || !currentWord) return;
  currentWord.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.innerHTML = letter;

    const letterKey = keyMap.get(letter);
    const letterStyles = Array.from(letterKey.classList);

    if (letterStyles.includes(styleNames.INCORRECT_LOCATION_LETTER)) {
      span.classList.add(styleNames.INCORRECT_LOCATION_LETTER);
    } else if (letterStyles.includes(styleNames.CORRECT_LOCATION)) {
      span.classList.add(styleNames.CORRECT_LOCATION);
    } else {
      span.classList.add(styleNames.NOTFOUND_LETTER);
    }

    container.appendChild(span);
  });
}

function resetGame() {
  Array.from(document.querySelectorAll(".popup")).forEach((popup) => {
    popup.classList.remove(styleNames.SHOW_POPUP);
  });

  Array.from(document.querySelectorAll(".letter")).forEach((letter) => {
    letter.innerHTML = "";
    letter.classList = ["letter"];
  });

  Array.from(keyMap.values()).forEach((key) => {
    const validStyles = Array.from(key.classList).filter((style) => {
      return styleNames.DEFAULT_KEY_STYLES.includes(style);
    });
    key.classList = validStyles.join(" ");
  });

  const genericPopup = document.querySelector("#genericPopup");
  if (genericPopup) {
    genericPopup.querySelector("#genericMessage").innerHTML = "";
  }

  document.querySelector("#puzzleWord").innerHTML = "";

  currentLineIndex = 0;
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
  isGameOver = false;

  if (genericPopupTimeout) {
    clearInterval(genericPopupTimeout);
    genericPopupTimeout = null;
  }
}

async function getLibrary() {
  const response = await fetch("data/library.json");
  const json = await response.json();
  return json.library;
}

async function startGame() {
  library = await getLibrary();
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
  addKeyEvents();
  addInstructionEvents();
  addGiveUpEvents();
  addPlayAgainEvents();
}
startGame();
