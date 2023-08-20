const library = ["exact"];

document.querySelectorAll(".key").forEach((element) => {
  element.addEventListener("click", (e) => {
    keypress(e.target.value);
  });
});

window.addEventListener("keydown", (e) => {
  keypress(e.key);
});

const keypress = (value) => {
  if (!value) return;

  if (value.toUpperCase() === "ENTER") {
    pressedEnter();
    return;
  }

  if (value.toUpperCase() === "BACKSPACE") {
    pressedBackspace();
    return;
  }

  if (value.length !== 1) return;
  const upperValue = value.toUpperCase();

  const asciiA = "A".charCodeAt(0);
  const asciiZ = "Z".charCodeAt(0);
  const asciiUpperValue = upperValue.charCodeAt(0);
  if (asciiUpperValue < asciiA || asciiZ < asciiUpperValue) return;

  validateValue(upperValue);
};

const pressedEnter = () => {};

const pressedBackspace = () => {};

const validateValue = (value) => {};
