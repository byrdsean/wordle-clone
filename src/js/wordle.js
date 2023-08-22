const library = ["event"];
const lines = document.querySelectorAll(".line");
let currentLineIndex = 0;
let currentWord;
let currentWordMetrics;
let showNotEnoughTimeout;
let isGameOver = false;

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
  document.querySelector("#playAgain").classList.remove("show");
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
  if (toRemove) toRemove.innerHTML = "";
};

const addLetter = (value) => {
  const nextLetter = getCurrentLineLetters().find(
    (letter) => letter.innerHTML?.length === 0
  );
  if (nextLetter) {
    nextLetter.innerHTML = value;

    //TODO: add styling to embiggen the active letter
  }
};

const validateValue = () => {
  const letters = getCurrentLineLetters();

  const emptyLetter = letters.find((letter) => letter.innerHTML?.length === 0);
  if (emptyLetter) return showNotEnough();

  letters.forEach((letter, index) => {
    const letterValue = letter.innerHTML;
    const letterMetric = currentWordMetrics.get(letterValue) || [];

    const key = document.querySelector(`.key[value='${letterValue}']`);

    if (letterMetric.length === 0) {
      letter.classList.add("not-found");
      setKeyStyle(key, "not-found");
      return;
    }

    const matchedIndex = letterMetric.find((metric) => metric === index);
    const locationClass =
      matchedIndex === undefined ? "incorrect-location" : "correct-location";
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
  if (notEnoughLetters) notEnoughLetters.classList.add("show");

  if (!showNotEnoughTimeout) {
    clearInterval(showNotEnoughTimeout);
  }

  showNotEnoughTimeout = setTimeout(() => {
    notEnoughLetters.classList.remove("show");
  }, 1000);
};

const checkIfEndGame = () => {
  const lastLine = lines[currentLineIndex - 1];
  const lastWordAdded = Array.from(lastLine.querySelectorAll(".letter"))
    .map((letter) => letter.innerHTML)
    .join("");

  const didUserWin = lastWordAdded === currentWord.toUpperCase();
  if (didUserWin) {
    document.querySelector("#wonPopup").classList.add("show");
    isGameOver = true;
  } else if (lines.length <= currentLineIndex) {
    const failurePopup = document.querySelector("#failurePopup");
    if (failurePopup) {
      failurePopup.querySelector("#puzzleWord").innerHTML = currentWord;
      failurePopup.classList.add("show");
    }
    isGameOver = true;
  }

  if (isGameOver) {
    document.querySelector("#playAgain").classList.add("show");
  }
};

const resetGame = () => {
  Array.from(document.querySelectorAll(".popup")).forEach((popup) => {
    popup.classList.remove("show");
  });

  Array.from(document.querySelectorAll(".letter")).forEach((letter) => {
    letter.innerHTML = "";
    letter.classList = ["letter"];
  });

  Array.from(document.querySelectorAll(".key")).forEach((key) => {
    const validStyles = Array.from(key.classList).filter((style) => {
      return style === "key" || style === "enter" || style === "backspace";
    });
    key.classList = validStyles.join(" ");
  });

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
