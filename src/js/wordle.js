const library = ["event"];
const lines = document.querySelectorAll(".line");
let currentLineIndex = 0;
let currentWord;
let currentWordMetrics;
let showNotEnoughTimeout;
let isGameOver = false;

const styleNames = {
  SHOW_POPUP: "show",
  POPULATED_LETTER: "populated",
  SHAKE_LETTER: "shake",
  SHAKE_LINE: "shake-line",
  NOTFOUND_LETTER: "not-found",
  INCORRECT_LOCATION_LETTER: "incorrect-location",
  CORRECT_LOCATION: "correct-location",
  DEFAULT_KEY_STYLES: ["key", "enter", "backspace"],
};

document.querySelectorAll(".key").forEach((element) => {
  element.addEventListener("click", (e) => {
    keypress(e.target.value);
  });
});

window.addEventListener("keydown", (e) => {
  keypress(e.key);
});

document.querySelector("#playAgainYes").addEventListener("click", (e) => {
  resetGame();
});

document.querySelector("#playAgainNo").addEventListener("click", (e) => {
  document.querySelector("#playAgain").classList.remove(styleNames.SHOW_POPUP);
});

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
  if (isGameOver || !value || lines.length <= currentLineIndex) return;
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

    const key = document.querySelector(`.key[value='${letterValue}']`);

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
  const keys = Array.from(document.querySelectorAll(".key"));
  currentWord.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.innerHTML = letter;

    const letterKey = keys.find((key) => key.getAttribute("value") === letter);
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

  Array.from(document.querySelectorAll(".key")).forEach((key) => {
    const validStyles = Array.from(key.classList).filter((style) => {
      return styleNames.DEFAULT_KEY_STYLES.includes(style);
    });
    key.classList = validStyles.join(" ");
  });

  document.querySelector("#puzzleWord").innerHTML = "";

  currentLineIndex = 0;
  currentWord = getCurrentWord();
  setWordMetrics(currentWord);
  isGameOver = false;

  if (showNotEnoughTimeout) {
    clearInterval(showNotEnoughTimeout);
    showNotEnoughTimeout = null;
  }
};

const startGame = () => {
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
};
startGame();
