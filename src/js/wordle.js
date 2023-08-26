let library = [];
const lines = document.querySelectorAll(".line");
const keyMap = new Map();
let currentLineIndex = 0;
let currentWord;
let currentWordMetrics;
let showNotEnoughTimeout;
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

const addKeyEvents = () => {
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
};

const addInstructionEvents = () => {
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
};

const addPlayAgainEvents = () => {
  document.querySelector("#playAgainYes").addEventListener("click", (e) => {
    resetGame();
  });

  document.querySelector("#playAgainNo").addEventListener("click", (e) => {
    document
      .querySelector("#playAgain")
      .classList.remove(styleNames.SHOW_POPUP);
  });
};

const showPressedKey = (letter) => {
  const pressedKey = keyMap.get(letter.toUpperCase());
  if (pressedKey) pressedKey.classList.add(styleNames.KEY_PRESS);
};

const removePressedKey = (letter) => {
  const pressedKey = keyMap.get(letter.toUpperCase());
  if (pressedKey) pressedKey.classList.remove(styleNames.KEY_PRESS);
};

const getCurrentWord = () => {
  const index = Math.floor(Math.random() * library.length);
  return library[index].toUpperCase();
};

const setWordMetrics = (word) => {
  const metrics = new Map();
  if (!word) return metrics;

  word.split("").forEach((letter, index) => {
    const letterMetric = metrics.get(letter) || [];
    metrics.set(letter, [...letterMetric, index]);
  });
  return metrics;
};

const keypress = (value) => {
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
};

const getCurrentLineLetters = () =>
  Array.from(lines[currentLineIndex].querySelectorAll(".letter"));

const removeLetter = () => {
  const toRemove = getCurrentLineLetters()
    .reverse()
    .find((letter) => letter.innerHTML?.length !== 0);
  if (toRemove) {
    toRemove.innerHTML = "";
    toRemove.classList.remove(styleNames.POPULATED_LETTER);
    shakeLetter(toRemove);
  }
};

const addLetter = (value) => {
  const nextLetter = getCurrentLineLetters().find(
    (letter) => letter.innerHTML?.length === 0
  );
  if (nextLetter) {
    nextLetter.innerHTML = value;
    nextLetter.classList.add(styleNames.POPULATED_LETTER);
    shakeLetter(nextLetter);
  }
};

const shakeLetter = (letter) => {
  letter.classList.add(styleNames.SHAKE_LETTER);

  setTimeout(() => {
    letter.classList.remove(styleNames.SHAKE_LETTER);
  }, 250);
};

const validateValue = () => {
  const letters = getCurrentLineLetters();

  const emptyLetter = letters.find((letter) => letter.innerHTML?.length === 0);
  if (emptyLetter) {
    lines[currentLineIndex].classList.add(styleNames.SHAKE_LINE);
    showNotEnough();

    setTimeout(() => {
      lines[currentLineIndex].classList.remove(styleNames.SHAKE_LINE);
    }, 500);

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
};

const setKeyStyle = (key, style) => {
  if (key.classList.length !== 1) return;
  key.classList.add(style);
};

const showNotEnough = () => {
  const notEnoughLetters = document.querySelector("#notEnoughLetters");
  if (notEnoughLetters) notEnoughLetters.classList.add(styleNames.SHOW_POPUP);
  if (!showNotEnoughTimeout) clearInterval(showNotEnoughTimeout);

  showNotEnoughTimeout = setTimeout(() => {
    notEnoughLetters.classList.remove(styleNames.SHOW_POPUP);
  }, 1000);
};

const checkIfEndGame = () => {
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
};

const showPuzzleWord = (container) => {
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
};

const resetGame = () => {
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

  document.querySelector("#puzzleWord").innerHTML = "";

  currentLineIndex = 0;
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
  isGameOver = false;

  if (showNotEnoughTimeout) {
    clearInterval(showNotEnoughTimeout);
    showNotEnoughTimeout = null;
  }
};

const getLibrary = () => {
  return [
    "about",
    "above",
    "abuse",
    "adult",
    "after",
    "again",
    "agree",
    "alarm",
    "allow",
    "alone",
    "along",
    "among",
    "angry",
    "apart",
    "apple",
    "apply",
    "argue",
    "asked",
    "avoid",
    "basis",
    "beach",
    "beads",
    "begin",
    "being",
    "black",
    "block",
    "blood",
    "board",
    "books",
    "boots",
    "brand",
    "brave",
    "bread",
    "break",
    "bring",
    "broke",
    "brown",
    "build",
    "bulls",
    "cabin",
    "cares",
    "carry",
    "catch",
    "cause",
    "cells",
    "chair",
    "check",
    "chest",
    "chief",
    "child",
    "chips",
    "claim",
    "class",
    "clean",
    "clear",
    "cliff",
    "close",
    "color",
    "comes",
    "couch",
    "could",
    "court",
    "cover",
    "cream",
    "crime",
    "crops",
    "cross",
    "crush",
    "dance",
    "death",
    "doesn",
    "doing",
    "dozen",
    "dream",
    "dress",
    "drink",
    "drive",
    "dryer",
    "early",
    "earns",
    "eases",
    "eaten",
    "egges",
    "eight",
    "empty",
    "ended",
    "enjoy",
    "enter",
    "event",
    "every",
    "faith",
    "favor",
    "fears",
    "field",
    "fight",
    "final",
    "first",
    "fixed",
    "flies",
    "floor",
    "flour",
    "focus",
    "force",
    "fresh",
    "front",
    "fruit",
    "funny",
    "glass",
    "going",
    "grass",
    "great",
    "green",
    "group",
    "guess",
    "happy",
    "haven",
    "heard",
    "heart",
    "heavy",
    "helps",
    "hired",
    "hotel",
    "house",
    "human",
    "hurts",
    "image",
    "issue",
    "items",
    "japan",
    "keeps",
    "knows",
    "large",
    "later",
    "latin",
    "laugh",
    "leads",
    "learn",
    "least",
    "leave",
    "legal",
    "level",
    "light",
    "liked",
    "likes",
    "liter",
    "lived",
    "lives",
    "local",
    "looks",
    "loved",
    "lower",
    "lunch",
    "lying",
    "magic",
    "major",
    "makes",
    "maria",
    "masks",
    "match",
    "maybe",
    "media",
    "might",
    "miles",
    "mitch",
    "model",
    "money",
    "month",
    "moved",
    "movie",
    "music",
    "named",
    "needs",
    "never",
    "nicer",
    "niece",
    "night",
    "noisy",
    "north",
    "notes",
    "occur",
    "offer",
    "often",
    "older",
    "order",
    "other",
    "paper",
    "party",
    "peace",
    "phone",
    "photo",
    "piece",
    "place",
    "plane",
    "plant",
    "point",
    "porch",
    "pound",
    "power",
    "price",
    "prove",
    "puppy",
    "quiet",
    "quite",
    "radio",
    "raise",
    "range",
    "reach",
    "ready",
    "relax",
    "reply",
    "reuse",
    "right",
    "rocks",
    "ropes",
    "rough",
    "ruins",
    "rules",
    "salad",
    "sales",
    "santa",
    "scene",
    "score",
    "seats",
    "sense",
    "serve",
    "seven",
    "shake",
    "share",
    "shelf",
    "shirt",
    "shock",
    "shoes",
    "shoot",
    "short",
    "shows",
    "since",
    "skill",
    "sleep",
    "slice",
    "small",
    "smith",
    "smoke",
    "solid",
    "solve",
    "sorry",
    "sound",
    "south",
    "space",
    "speak",
    "spend",
    "sport",
    "spray",
    "spree",
    "staff",
    "stage",
    "stand",
    "start",
    "state",
    "stays",
    "still",
    "stock",
    "stole",
    "store",
    "storm",
    "story",
    "stove",
    "study",
    "stuff",
    "style",
    "sugar",
    "sunny",
    "swift",
    "table",
    "taken",
    "takes",
    "talks",
    "teach",
    "teens",
    "thank",
    "their",
    "theme",
    "there",
    "these",
    "thing",
    "think",
    "third",
    "those",
    "three",
    "threw",
    "throw",
    "tight",
    "times",
    "tired",
    "today",
    "toned",
    "topic",
    "touch",
    "tough",
    "track",
    "trade",
    "trail",
    "train",
    "trash",
    "treat",
    "trial",
    "trick",
    "tried",
    "truck",
    "trust",
    "truth",
    "twice",
    "under",
    "until",
    "upset",
    "value",
    "video",
    "virus",
    "visit",
    "voice",
    "wants",
    "watch",
    "water",
    "weeks",
    "where",
    "which",
    "while",
    "white",
    "whole",
    "whose",
    "woman",
    "woods",
    "works",
    "world",
    "worry",
    "worth",
    "would",
    "write",
    "wrong",
    "years",
    "young",
    "yours",
  ];
};

const startGame = () => {
  library = getLibrary();
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
  addKeyEvents();
  addInstructionEvents();
  addPlayAgainEvents();
};
startGame();
