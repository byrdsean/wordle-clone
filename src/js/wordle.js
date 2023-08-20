const library = ["event"];
const lines = document.querySelectorAll(".line");
let currentLineIndex = 0;
let currentWord;
let currentWordMetrics;

document.querySelectorAll(".key").forEach((element) => {
  element.addEventListener("click", (e) => {
    keypress(e.target.value);
  });
});

window.addEventListener("keydown", (e) => {
  keypress(e.key);
});

const getCurrentWord = () => {
  const index = Math.floor(Math.random() * library.length);
  return library[index].toUpperCase();
};

const setWordMetrics = (word) => {
  const metrics = new Map();
  if (!word) return metrics;

  for (let i = 0; i < word.length; i++) {
    const letter = word.charAt(i);
    const letterMetric = metrics.get(letter);
    if (letterMetric) {
      metrics.set(letter, [...letterMetric, i]);
    } else {
      metrics.set(letter, [i]);
    }
  }
  return metrics;
};

const keypress = (value) => {
  if (!value) return;

  if (value.toUpperCase() === "ENTER") {
    validateValue();
    return;
  }

  if (value.toUpperCase() === "BACKSPACE") {
    removeLetter();
    return;
  }

  if (value.length !== 1) return;
  const upperValue = value.toUpperCase();

  const asciiA = "A".charCodeAt(0);
  const asciiZ = "Z".charCodeAt(0);
  const asciiUpperValue = upperValue.charCodeAt(0);
  if (asciiUpperValue < asciiA || asciiZ < asciiUpperValue) return;

  addLetter(upperValue);
};

const getCurrentLineLetters = () => {
  const currentLine = lines[currentLineIndex];
  return Array.from(currentLine.querySelectorAll(".letter"));
};

const removeLetter = () => {
  const toRemove = getCurrentLineLetters()
    .reverse()
    .find((letter) => letter.innerHTML?.length !== 0);
  if (!toRemove) return;
  toRemove.innerHTML = "";
};

const addLetter = (value) => {
  const nextLetter = getCurrentLineLetters().find(
    (letter) => letter.innerHTML?.length === 0
  );
  if (!nextLetter) return;
  nextLetter.innerHTML = value;
};

const validateValue = () => {
  const letters = getCurrentLineLetters();

  const emptyLetter = letters.find((letter) => letter.innerHTML?.length === 0);
  if (emptyLetter) {
    //Show not enough letter message
    console.log("Not enough letters!");
    return;
  }

  letters.forEach((letter, index) => {
    const letterValue = letter.innerHTML;
    const letterMetric = currentWordMetrics.get(letterValue) || [];

    if (letterMetric.length === 0) {
      letter.classList.add("not-found");
      return;
    }

    const matchedIndex = letterMetric.find((metric) => metric === index);
    if (matchedIndex !== undefined) {
      letter.classList.add("correct-location");
    } else {
      letter.classList.add("incorrect-location");
    }
  });
};

const startGame = () => {
  currentWord = getCurrentWord();
  currentWordMetrics = setWordMetrics(currentWord);
};
startGame();
