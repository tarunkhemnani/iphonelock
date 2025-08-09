// Simple passcode UI behavior. Replace API_URL with your endpoint if needed.
(function(){
  const API_URL = 'https://example.com/api/passcode'; // <- change if needed
  const MAX = 6;
  let digits = [];

  const dots = document.getElementById('pinDots').querySelectorAll('.dot');
  function updateDots(){
    dots.forEach((d,i)=> d.classList.toggle('filled', i < digits.length));
  }

  // keypad clicks
  document.getElementById('keypad').addEventListener('click', (e)=>{
    const k = e.target.closest('.key');
    if(!k) return;
    if(k.id === 'keyBack'){ digits.pop(); updateDots(); return; }
    const v = k.dataset.key;
    if(!v) return;
    if(digits.length >= MAX) return;
    digits.push(v);
    updateDots();
    if(digits.length === MAX) {
      const pin = digits.join('');
      submitPin(pin);
    }
  });

  // keyboard support
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Backspace'){ digits.pop(); updateDots(); return; }
    if(/^[0-9]$/.test(e.key) && digits.length < MAX){ digits.push(e.key); updateDots(); if(digits.length === MAX) submitPin(digits.join('')); }
  });

  // simple submit function
  async function submitPin(pin){
    // small UX delay then clear
    try{
      // optional: send to your API
      await fetch(API_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ passcode: pin })
      });
      // show success briefly (you can change)
      console.log('sent', pin);
    }catch(err){
      console.error('send failed', err);
    } finally {
      // clear after short delay
      setTimeout(()=>{ digits=[]; updateDots(); }, 350);
    }
  }

  // Emergency & Cancel (do nothing by default)
  document.getElementById('emergency').addEventListener('click', ()=> alert('Emergency pressed'));
  document.getElementById('cancel').addEventListener('click', ()=> { digits=[]; updateDots(); });

})();
